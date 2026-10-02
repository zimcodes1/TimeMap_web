import React from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Users,
	AlertTriangle,
	CheckCircle2,
	Building2,
} from "lucide-react";
import type { CapacityDeficitAnalytics } from "@/types";

interface VenueCapacityDeficitCardProps {
	data?: CapacityDeficitAnalytics;
	isLoading?: boolean;
}

export const VenueCapacityDeficitCard: React.FC<VenueCapacityDeficitCardProps> = ({
	data,
	isLoading = false,
}) => {
	if (isLoading) {
		return (
			<Card className="p-5 space-y-4 border-l-4 border-l-muted">
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-48" />
					<Skeleton className="h-6 w-24 rounded-full" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
					<Skeleton className="h-16 w-full rounded-xl" />
					<Skeleton className="h-16 w-full rounded-xl" />
					<Skeleton className="h-16 w-full rounded-xl" />
				</div>
				<Skeleton className="h-12 w-full rounded-xl" />
			</Card>
		);
	}

	// Each admin EXCEPT system admin should see this card
	if (!data || !data.is_applicable) {
		return null;
	}

	const isOptimal = data.status_variant === "success" || data.average_deficit === 0;
	const isModerate = data.status_variant === "warning";

	const borderAccent = isOptimal
		? "border-l-emerald-500"
		: isModerate
			? "border-l-amber-500"
			: "border-l-rose-500";

	const badgeVariant: "success" | "warning" | "danger" = isOptimal
		? "success"
		: isModerate
			? "warning"
			: "danger";

	const badgeLabel = isOptimal
		? "Optimal Capacity"
		: isModerate
			? "Moderate Deficit"
			: "Critical Overcrowding";

	const calloutBg = isOptimal
		? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
		: isModerate
			? "bg-amber-500/10 border-amber-500/30 text-amber-200"
			: "bg-rose-500/10 border-rose-500/30 text-rose-200";

	const CalloutIcon = isOptimal ? CheckCircle2 : AlertTriangle;

	return (
		<Card className={`p-5 space-y-4 border-l-4 ${borderAccent} transition-all duration-200 shadow-sm`}>
			{/* Top Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center border border-border">
						<Users size={16} className={isOptimal ? "text-emerald-500" : isModerate ? "text-amber-500" : "text-rose-500"} />
					</div>
					<div>
						<Text variant="body-sm" weight="bold" className="text-text-main text-base">
							Average Venue Capacity Deficit
						</Text>
						<Text variant="caption" color="muted" className="text-xs">
							Cohort enrollment vs. assigned venue seating capacity across {data.scope_name || "scope"}
						</Text>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{data.scope_name && (
						<Badge variant="secondary" size="sm" className="font-medium text-xs">
							<Building2 size={12} className="mr-1" />
							{data.scope_name}
						</Badge>
					)}
					<Badge variant={badgeVariant} size="sm" className="font-semibold text-xs">
						{badgeLabel}
					</Badge>
				</div>
			</div>

			{/* 3 Metric Pills */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				{/* Avg Deficit */}
				<div className="p-3.5 rounded-xl bg-surface-raised/80 border border-border space-y-1">
					<Text variant="overline" className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
						Average Seat Deficit
					</Text>
					<div className="flex items-baseline gap-1.5">
						<Text variant="h3" weight="bold" className={isOptimal ? "text-emerald-500" : isModerate ? "text-amber-500" : "text-rose-500"}>
							{data.average_deficit ?? 0}
						</Text>
						<Text variant="caption" color="muted" className="text-xs font-medium">
							seats / session
						</Text>
					</div>
				</div>

				{/* Peak Deficit */}
				<div className="p-3.5 rounded-xl bg-surface-raised/80 border border-border space-y-1">
					<Text variant="overline" className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
						Peak Shortfall
					</Text>
					<div className="flex items-baseline gap-1.5">
						<Text variant="h3" weight="bold" className="text-text-main">
							{data.peak_deficit ?? 0}
						</Text>
						<Text variant="caption" color="muted" className="text-xs font-medium">
							seats max deficit
						</Text>
					</div>
				</div>

				{/* Overcrowded Rate */}
				<div className="p-3.5 rounded-xl bg-surface-raised/80 border border-border space-y-1">
					<Text variant="overline" className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
						Overcrowded Sessions
					</Text>
					<div className="flex items-baseline gap-1.5">
						<Text variant="h3" weight="bold" className="text-text-main">
							{data.overcrowded_sessions_count ?? 0}
						</Text>
						<Text variant="caption" color="muted" className="text-xs font-medium">
							of {data.total_sessions_analyzed ?? 0} ({data.overcrowding_percentage ?? 0}%)
						</Text>
					</div>
				</div>
			</div>

			{/* Case-Aware Remark Callout */}
			{data.case_aware_remark && (
				<div className={`flex items-start gap-3 p-3.5 rounded-xl border ${calloutBg}`}>
					<CalloutIcon size={18} className="shrink-0 mt-0.5" />
					<div className="flex-1">
						<Text variant="body-sm" className="font-semibold text-xs leading-relaxed text-inherit">
							{data.case_aware_remark}
						</Text>
					</div>
				</div>
			)}
		</Card>
	);
};

export default VenueCapacityDeficitCard;
