import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import Logo from "@/components/elements/logo";
import type { LoginSchema } from "@/app/auth/ForgotPassword";
import { Link } from "@tanstack/react-router";

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.4, ease: "easeOut" as const, delay },
});

interface ForgotPasswordView {
	onSubmit: () => void;
	isLoading: boolean;
}

export default function ForgotPasswordView({
	onSubmit,
	isLoading,
}: ForgotPasswordView) {
	const {
		formState: { errors },
	} = useFormContext<LoginSchema>();

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
						Forgot Your Password?
					</Text>
					<Text variant="body" color="muted">
						Provide your email or Staff ID to get a reset code.
					</Text>
				</motion.div>

				{/* Form */}
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<motion.div {...fadeUp(0.1)}>
						<FormField<LoginSchema> name="email">
							{(field) => (
								<Input
									{...field}
									label="Email or Staff ID"
									type="text"
									placeholder="example@gmail.com"
									leftIcon={<Mail size={15} />}
									error={errors.email?.message}
									autoComplete="email"
								/>
							)}
						</FormField>
					</motion.div>
					<motion.div
						{...fadeUp(0.2)}
						className="flex justify-end"
					></motion.div>

					<motion.div {...fadeUp(0.25)}>
						<Button type="submit" fullWidth size="lg" isLoading={isLoading}>
							Send Code
						</Button>
					</motion.div>
				</form>

				{/* Footer */}
				<motion.div {...fadeUp(0.3)} className="text-center">
					<Text variant="body-sm" color="muted">
						Remember Password?{" "}
						<Link
							to="/login"
							className="text-primary hover:text-primary-hover transition-colors font-medium cursor-pointer"
						>
							Login to your account
						</Link>
					</Text>
				</motion.div>
			</div>
		</div>
	);
}
