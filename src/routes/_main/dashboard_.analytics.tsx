import { createFileRoute } from "@tanstack/react-router";
import DetailedAnalyticsContainer from "@/app/main/DetailedAnalytics";

export const Route = createFileRoute("/_main/dashboard_/analytics")({
	component: DetailedAnalyticsContainer,
	beforeLoad: () => {
		document.title = "Detailed Analytics | NSUK TimeMap";
	},
});
