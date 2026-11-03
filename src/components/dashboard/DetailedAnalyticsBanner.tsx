import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Users, BookOpen, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

interface DetailedAnalyticsBannerProps {
	adminLevel?: string;
}

export default function DetailedAnalyticsBanner({
	adminLevel,
}: DetailedAnalyticsBannerProps) {
	const isDeptAdmin = adminLevel === "department";

	return (
		<Card className="p-6 bg-gradient-to-r from-primary/10 via-surface to-surface-raised border border-primary/20 relative overflow-hidden">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
				<div className="space-y-2 max-w-2xl">
					<div className="flex items-center gap-2">
						<span className="p-2 rounded-xl bg-primary/20 text-primary">
							<BarChart3 size={20} />
						</span>
						<Text variant="h5" weight="bold" className="text-text-main">
							Detailed Academic Analytics & Performance
						</Text>
					</div>
					<Text variant="body-sm" color="muted" className="leading-relaxed">
						{isDeptAdmin
							? "Access in-depth reporting metrics: inspect individual lecturer hold rates, course-level completion records, program breakdowns, and weekly delivery trends for your department."
							: "Access institutional intelligence: analyze faculty & department totals, lecturer hold rate rankings, course compliance, and cross-departmental venue utilization."}
					</Text>

					<div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-text-muted">
						<span className="flex items-center gap-1.5">
							<Users size={14} className="text-primary" />
							Lecturer Hold Rates
						</span>
						<span className="flex items-center gap-1.5">
							<BookOpen size={14} className="text-blue-500" />
							Course Compliance
						</span>
						<span className="flex items-center gap-1.5">
							<Layers size={14} className="text-amber-500" />
							Program Breakdowns
						</span>
					</div>
				</div>

				<Link to={"/dashboard/analytics" as any}>
					<Button className="flex items-center gap-2 whitespace-nowrap shadow-md shadow-primary/20">
						<span>Open Detailed Analytics</span>
						<ArrowRight size={16} />
					</Button>
				</Link>
			</div>
		</Card>
	);
}
