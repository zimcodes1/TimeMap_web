import { createFileRoute } from "@tanstack/react-router";
import AuthSplitLayout from "@/components/layouts/AuthSplitLayout";

export const Route = createFileRoute("/_auth")({
	component: AuthSplitLayout,
});
