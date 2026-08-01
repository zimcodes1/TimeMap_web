import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";
import { dummyLoggedInUser } from "@/constants/dummy";
import ResetPasswordView from "@/pages/auth/ResetPasswordView";

export const resetPasswordSchema = z
	.object({
		username: z.string().min(3, "Username must be at least 3 characters"),
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
	const navigate = useNavigate();

	const methods = useForm<ResetPasswordSchema>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { username: "", newPassword: "", confirmPassword: "" },
	});

	const onSubmit = methods.handleSubmit(async (data) => {
		setIsLoading(true);
		try {
			console.log("Reset password payload:", {
				staffId: dummyLoggedInUser.staffId,
				...data,
			});
			// TODO: wire up reset password API call here
			toast.success("Password reset successfully");
			navigate({ to: "/login" });
		} finally {
			setIsLoading(false);
		}
	});

	return (
		<FormProvider {...methods}>
			<ResetPasswordView
				onSubmit={onSubmit}
				isLoading={isLoading}
				user={dummyLoggedInUser}
			/>
		</FormProvider>
	);
}
