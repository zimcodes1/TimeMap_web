import { createFileRoute } from "@tanstack/react-router";
import ResetPassword from "@/app/auth/ResetPassword";

export const Route = createFileRoute("/_auth/reset-password")({
	component: ResetPassword,
});
