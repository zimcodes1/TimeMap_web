import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import AuthSplitLayout from "@/components/layouts/AuthSplitLayout";
import LoginView from "@/pages/auth/LoginView";

export const loginSchema = z.object({
	email: z.string().min(1, "Email is required").email("Enter a valid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export default function Login() {
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
			<LoginView onSubmit={onSubmit} isLoading={isLoading} />
		</FormProvider>
	);
}
