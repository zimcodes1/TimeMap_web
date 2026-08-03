import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import LoginView from "@/pages/auth/LoginView";
import { toast } from "sonner";

export const loginSchema = z.object({
	id: z.string().min(1, "Email or Staff ID is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export default function Login() {
	const [isLoading, setIsLoading] = useState(false);

	const methods = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: { id: "", password: "" },
	});

	const navigate = useNavigate();

	const onSubmit = methods.handleSubmit(async (data) => {
		setIsLoading(true);
		try {
			console.log("Login payload:", data);
			// TODO: wire up auth API call here
			toast.success("Login successful");
			navigate({ to: "/reset-password" });
		} finally {
			setIsLoading(false);
		}
	});

	return (
		<FormProvider {...methods}>
			<LoginView onSubmit={onSubmit} isLoading={isLoading} />
		</FormProvider>
	);
}
