import React from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Building2,
	Landmark,
	Layers,
	Network,
	BookOpen,
	Clock,
	AlertTriangle,
	Sparkles,
	CheckCircle2,
	ShieldAlert,
} from "lucide-react";
import type { DashboardStatCard } from "@/types";

interface RoleBasedStatCardsProps {
	cards?: DashboardStatCard[];
	isLoading?: boolean;
	roleLevel?: string;
}

function getCardIcon(id: string) {
	switch (id) {
		case "active_venues":
			return <Building2 size={18} className="text-primary" />;
		case "total_schools":
			return <Landmark size={18} className="text-blue-500" />;
		case "hard_conflicts":
			return <ShieldAlert size={18} className="text-rose-500" />;
		case "quality_score":
			return <Sparkles size={18} className="text-emerald-500" />;
		case "total_faculties":
			return <Layers size={18} className="text-blue-500" />;
		case "total_departments":
			return <Network size={18} className="text-blue-500" />;
		case "hold_rate":
			return <CheckCircle2 size={18} className="text-emerald-500" />;
		case "total_courses":
			return <BookOpen size={18} className="text-blue-500" />;
		case "discrepancy_queue":
			return <Clock size={18} className="text-amber-500" />;
		case "unreported_sessions":
			return <AlertTriangle size={18} className="text-rose-500" />;
		default:
			return <Building2 size={18} className="text-primary" />;
	}
}

function getCardBorderColor(id: string): string {
	switch (id) {
		case "active_venues":
			return "border-l-primary";
		case "total_schools":
		case "total_faculties":
		case "total_departments":
		case "total_courses":
			return "border-l-blue-500";
		case "hard_conflicts":
		case "unreported_sessions":
			return "border-l-rose-500";
		case "quality_score":
		case "hold_rate":
			return "border-l-emerald-500";
		case "discrepancy_queue":
			return "border-l-amber-500";
		default:
			return "border-l-primary";
	}
}

function mapBadgeVariant(
	variant?: "success" | "warning" | "danger" | "neutral",
): "success" | "warning" | "danger" | "secondary" {
	switch (variant) {
		case "success":
			return "success";
		case "warning":
			return "warning";
		case "danger":
			return "danger";
		default:
			return "secondary";
	}
}

export const RoleBasedStatCards: React.FC<RoleBasedStatCardsProps> = ({
	cards = [],
	isLoading = false,
	roleLevel,
}) => {
	const gridCols =
		cards.length === 3
			? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
			: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

	if (isLoading) {
		const placeholderCount = roleLevel === "school" || roleLevel === "faculty" ? 3 : 4;
		return (
			<div className={`grid ${gridCols} gap-4`}>
				{Array.from({ length: placeholderCount }).map((_, i) => (
					<Card key={i} className="p-4 space-y-3 border-l-4 border-l-muted">
						<div className="flex items-center justify-between">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-5 w-5 rounded-full" />
						</div>
						<div className="flex items-baseline justify-between pt-1">
							<Skeleton className="h-8 w-24" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
						<Skeleton className="h-3 w-40" />
					</Card>
				))}
			</div>
		);
	}

	if (!cards || cards.length === 0) {
		return null;
	}

	return (
		<div className={`grid ${gridCols} gap-4`}>
			{cards.map((card) => {
				const borderColor = getCardBorderColor(card.id);
				const icon = getCardIcon(card.id);
				const badgeVariant = mapBadgeVariant(card.badge_variant);

				return (
					<Card
						key={card.id}
						className={`p-4 space-y-2 border-l-4 ${borderColor} transition-all duration-200 hover:shadow-md hover:border-l-primary`}
					>
						<div className="flex items-center justify-between text-text-muted">
							<Text variant="overline" className="text-[11px] tracking-wider uppercase font-semibold">
								{card.title}
							</Text>
							{icon}
						</div>

						<div className="flex items-baseline justify-between gap-2 pt-0.5">
							<div className="flex items-baseline gap-1.5">
								<Text variant="h4" weight="bold" className="text-text-main text-2xl tracking-tight">
									{card.value}
								</Text>
								{card.unit && (
									<Text variant="caption" color="muted" className="text-xs font-medium">
										{card.unit}
									</Text>
								)}
							</div>
							{card.badge && (
								<Badge variant={badgeVariant} size="sm" className="font-semibold shrink-0">
									{card.badge}
								</Badge>
							)}
						</div>

						{card.description && (
							<Text variant="caption" color="muted" className="text-[11px] leading-tight block pt-0.5">
								{card.description}
							</Text>
						)}
					</Card>
				);
			})}
		</div>
	);
};

export default RoleBasedStatCards;
