import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import ForgotPasswordView from "@/pages/auth/ForgotPasswordView";

export const loginSchema = z.object({
	email: z.string().min(1, "Email or Staff ID is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export default function ForgotPassword() {
	const [isLoading, setIsLoading] = useState(false);

	const methods = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = methods.handleSubmit(async (data) => {
		setIsLoading(true);
		try {
			console.log("Login payload:", data);
			// TODO: wire up auth API call here
		} finally {
			setIsLoading(false);
		}
	});

	return (
		<FormProvider {...methods}>
			<ForgotPasswordView onSubmit={onSubmit} isLoading={isLoading} />
		</FormProvider>
	);
}
