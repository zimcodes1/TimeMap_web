import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import ResetPasswordView from "@/pages/auth/ResetPasswordView";
import { useAuth } from "@/hooks/useAuth";

// eslint-disable-next-line react-refresh/only-export-components
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, resetPassword, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const methods = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      await resetPassword(data.newPassword);
      toast.success("Password reset successfully!");
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const errorObj = err as {
        response?: {
          data?: {
            detail?: string;
            new_password?: string[];
          };
        };
      };
      const errorMsg =
        errorObj?.response?.data?.detail ||
        errorObj?.response?.data?.new_password?.[0] ||
        "Failed to reset password. Please ensure your new password meets complexity rules.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  });

  if (authLoading || !user) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <ResetPasswordView
        onSubmit={onSubmit}
        isLoading={isLoading}
        user={user}
      />
    </FormProvider>
  );
}
