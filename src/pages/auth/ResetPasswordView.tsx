import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import Logo from "@/components/elements/logo";
import { Link } from "@tanstack/react-router";
import type { ResetPasswordSchema } from "@/app/auth/ResetPassword";
import type { User as UserType } from "@/types";

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.4, ease: "easeOut" as const, delay },
});

interface ResetPasswordViewProps {
	onSubmit: () => void;
	isLoading: boolean;
	user: UserType;
}

export default function ResetPasswordView({
	onSubmit,
	isLoading,
	user,
}: ResetPasswordViewProps) {
	const {
		formState: { errors },
	} = useFormContext<ResetPasswordSchema>();
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	return (
		<div className="w-full h-full flex flex-col justify-center items-center px-8 py-12">
			<div className="w-full max-w-sm flex flex-col gap-6">
				{/* Mobile-only logo */}
				<motion.div
					{...fadeUp(0)}
					className="flex items-center gap-2 md:hidden mb-2"
				>
					<Logo color="#10b981" size={22} />
					<Text className="text-text-main font-semibold text-sm">
						NSUK TimeMap
					</Text>
				</motion.div>

				{/* Header */}
				<motion.div {...fadeUp(0.05)} className="flex flex-col gap-1">
					<Text variant="h3" className="text-text-main">
						Reset Password
					</Text>
					<Text variant="body" color="muted">
						Set a new password for your account.
					</Text>
				</motion.div>

				{/* Staff ID display */}
				<motion.div
					{...fadeUp(0.08)}
					className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3"
				>
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-muted">
						<User size={15} className="text-primary" />
					</div>
					<div className="flex flex-col">
						<Text variant="body-sm" color="muted">
							Staff ID
						</Text>
						<Text variant="body" weight="semibold">
							{user.staffId ?? "—"}
						</Text>
					</div>
				</motion.div>

				{/* Form */}
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<motion.div {...fadeUp(0.1)}>
						<FormField<ResetPasswordSchema> name="username">
							{(field) => (
								<Input
									{...field}
									label="Username"
									type="text"
									placeholder="Choose a username"
									leftIcon={<User size={15} />}
									error={errors.username?.message}
									autoComplete="username"
								/>
							)}
						</FormField>
					</motion.div>

					<motion.div {...fadeUp(0.15)}>
						<FormField<ResetPasswordSchema> name="newPassword">
							{(field) => (
								<Input
									{...field}
									label="New Password"
									type={showNew ? "text" : "password"}
									placeholder="••••••••"
									leftIcon={<Lock size={15} />}
									rightIcon={
										<button
											type="button"
											onClick={() => setShowNew((p) => !p)}
											className="text-text-subtle hover:text-text-muted transition-colors cursor-pointer"
										>
											{showNew ? <EyeOff size={15} /> : <Eye size={15} />}
										</button>
									}
									error={errors.newPassword?.message}
									autoComplete="new-password"
								/>
							)}
						</FormField>
					</motion.div>

					<motion.div {...fadeUp(0.2)}>
						<FormField<ResetPasswordSchema> name="confirmPassword">
							{(field) => (
								<Input
									{...field}
									label="Confirm Password"
									type={showConfirm ? "text" : "password"}
									placeholder="••••••••"
									leftIcon={<Lock size={15} />}
									rightIcon={
										<button
											type="button"
											onClick={() => setShowConfirm((p) => !p)}
											className="text-text-subtle hover:text-text-muted transition-colors cursor-pointer"
										>
											{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
										</button>
									}
									error={errors.confirmPassword?.message}
									autoComplete="new-password"
								/>
							)}
						</FormField>
					</motion.div>

					<motion.div {...fadeUp(0.25)}>
						<Button type="submit" fullWidth size="lg" isLoading={isLoading}>
							Reset Password
						</Button>
					</motion.div>
				</form>

				{/* Footer */}
				<motion.div {...fadeUp(0.3)} className="text-center">
					<Text variant="body-sm" color="muted">
						Not your account?{" "}
						<Link
							to="/login"
							className="text-primary hover:text-primary-hover transition-colors font-medium cursor-pointer"
						>
							Back to login
						</Link>
					</Text>
				</motion.div>
			</div>
		</div>
	);
}
