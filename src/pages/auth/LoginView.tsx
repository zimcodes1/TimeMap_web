import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import Logo from "@/components/elements/logo";
import type { LoginSchema } from "@/app/auth/Login";

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.4, ease: "easeOut" as const, delay },
});

interface LoginViewProps {
	onSubmit: () => void;
	isLoading: boolean;
}

export default function LoginView({ onSubmit, isLoading }: LoginViewProps) {
	const {
		formState: { errors },
	} = useFormContext<LoginSchema>();
	const [showPassword, setShowPassword] = useState(false);

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
						Welcome back
					</Text>
					<Text variant="body" color="muted">
						Sign in to your TimeMap account
					</Text>
				</motion.div>

				{/* Form */}
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<motion.div {...fadeUp(0.1)}>
						<FormField<LoginSchema> name="email">
							{(field) => (
								<Input
									{...field}
									label="NSUK ID"
									type="text"
									placeholder="FT22ABC0123"
									leftIcon={<Mail size={15} />}
									error={errors.email?.message}
									autoComplete="email"
								/>
							)}
						</FormField>
					</motion.div>

					<motion.div {...fadeUp(0.15)}>
						<FormField<LoginSchema> name="password">
							{(field) => (
								<Input
									{...field}
									label="Password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									leftIcon={<Lock size={15} />}
									rightIcon={
										<button
											type="button"
											onClick={() => setShowPassword((p) => !p)}
											className="text-text-subtle hover:text-text-muted transition-colors cursor-pointer"
										>
											{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
										</button>
									}
									error={errors.password?.message}
									autoComplete="current-password"
								/>
							)}
						</FormField>
					</motion.div>

					<motion.div {...fadeUp(0.2)} className="flex justify-end">
						<button
							type="button"
							className="text-xs text-primary hover:text-primary-hover transition-colors font-medium cursor-pointer"
						>
							Forgot password?
						</button>
					</motion.div>

					<motion.div {...fadeUp(0.25)}>
						<Button type="submit" fullWidth size="lg" isLoading={isLoading}>
							Sign in
						</Button>
					</motion.div>
				</form>

				{/* Footer */}
				<motion.div {...fadeUp(0.3)} className="text-center">
					<Text variant="body-sm" color="muted">
						Don't have an account?{" "}
						<span className="text-primary hover:text-primary-hover transition-colors font-medium cursor-pointer">
							Contact your administrator
						</span>
					</Text>
				</motion.div>
			</div>
		</div>
	);
}
