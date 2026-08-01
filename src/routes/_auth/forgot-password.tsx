import { createFileRoute } from "@tanstack/react-router";
import ForgotPassword from "@/app/auth/ForgotPassword";

export const Route = createFileRoute("/_auth/forgot-password")({
	component: ForgotPassword,
});
