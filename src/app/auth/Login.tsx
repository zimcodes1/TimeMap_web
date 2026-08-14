import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import LoginView from "@/pages/auth/LoginView";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// eslint-disable-next-line react-refresh/only-export-components
export const loginSchema = z.object({
  id: z.string().min(1, "Identifier (Staff ID / Matric Number) is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, requiresPasswordReset, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (requiresPasswordReset) {
        navigate({ to: "/reset-password" });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [authLoading, isAuthenticated, requiresPasswordReset, navigate]);

  const methods = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { id: "", password: "" },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      const res = await login({
        identifier: data.id.trim(),
        password: data.password,
      });
      if (res.user.role === "admin") {
        toast.success("Login successful");
        if (res.requires_password_reset || res.user.requires_password_reset) {
          navigate({ to: "/reset-password" });
        } else {
          navigate({ to: "/dashboard" });
        }
      }
      else {
        toast.error("Invalid admin credentials");
        localStorage.clear()
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: {
          data?: {
            detail?: string;
            non_field_errors?: string[];
          };
        };
      };
      const errorMsg =
        errorObj?.response?.data?.detail ||
        errorObj?.response?.data?.non_field_errors?.[0] ||
        "Invalid login credentials. Please check your Staff ID and password.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  });

  if (authLoading) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <LoginView onSubmit={onSubmit} isLoading={isLoading} />
    </FormProvider>
  );
}
