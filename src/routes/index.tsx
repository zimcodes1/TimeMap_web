import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/elements/logo";
import LandingPage from "@/pages/LandingPage";

export const Route = createFileRoute("/")({
	component: IndexRoute,
});

function IndexRoute() {
	const { user, isAuthenticated, isLoading, requiresPasswordReset } = useAuth();

	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="animate-pulse">
						<Logo color="#10b981" size={40} />
					</div>
					<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			</div>
		);
	}

	if (isAuthenticated && user) {
		if (requiresPasswordReset) {
			return <Navigate to="/reset-password" replace />;
		}
		return <Navigate to="/dashboard" replace />;
	}

	return <LandingPage />;
}
