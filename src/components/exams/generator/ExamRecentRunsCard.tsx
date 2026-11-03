import React from "react";
import { Link } from "@tanstack/react-router";
import { History, ArrowRight, Clock, Eye, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import type { ExamOptimizerResult } from "@/api/main/examOptimizerAPI";

interface ExamRecentRunsCardProps {
	runs: ExamOptimizerResult[];
	isLoading?: boolean;
	onOpenHistory: () => void;
	className?: string;
}

export const ExamRecentRunsCard: React.FC<ExamRecentRunsCardProps> = ({
	runs = [],
	isLoading = false,
	onOpenHistory,
	className = "",
}) => {
	const recentRuns = runs.slice(0, 5);

	const getStatusBadge = (status?: string) => {
		if (status === "published") {
			return (
				<Badge
					variant="success"
					className="text-[10px] py-0.5 px-2 font-bold uppercase"
				>
					Published
				</Badge>
			);
		}
		if (status === "approved") {
			return (
				<Badge
					variant="info"
					className="text-[10px] py-0.5 px-2 font-bold uppercase"
				>
					Approved
				</Badge>
			);
		}
		return (
			<Badge
				variant="warning"
				className="text-[10px] py-0.5 px-2 font-bold uppercase"
			>
				Draft
			</Badge>
		);
	};

	return (
		<div
			className={`rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4 ${className}`}
		>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-surface-raised border border-border text-text-muted">
						<History size={17} />
					</div>
					<div>
						<Text variant="h4" weight="bold" className="text-text-main">
							Recent Optimization Runs
						</Text>
						<Text variant="caption" color="muted">
							Inspect allocations, approve drafts, or publish schedules to live.
						</Text>
					</div>
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={onOpenHistory}
					className="h-8 gap-1.5 text-xs cursor-pointer shrink-0"
				>
					<span>View Full History</span>
					<ArrowRight size={13} />
				</Button>
			</div>

			{isLoading ? (
				<div className="py-12 text-center text-xs text-text-muted animate-pulse">
					Loading recent exam generation runs...
				</div>
			) : recentRuns.length === 0 ? (
				<div className="py-10 text-center space-y-2">
					<div className="w-10 h-10 rounded-2xl bg-surface-raised border border-border text-text-muted mx-auto flex items-center justify-center">
						<CalendarDays size={18} />
					</div>
					<Text variant="caption" color="muted">
						No exam timetable runs generated yet for this semester.
					</Text>
					<br />
					<Text variant="caption" color="muted">
						Configure your target scope above and click{" "}
						<strong>Generate Draft Timetable</strong>.
					</Text>
				</div>
			) : (
				<div className="divide-y divide-border/60">
					{recentRuns.map((run) => {
						const dateObj = run.created_at ? new Date(run.created_at) : null;
						const formattedDate = dateObj
							? dateObj.toLocaleDateString(undefined, {
									month: "short",
									day: "numeric",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
							: "";

						const scheduledCount = Number(
							run.metrics?.courses_scheduled ?? run.events.length,
						);
						const totalCount = Number(
							run.metrics?.courses_total ??
								scheduledCount + (run.diagnostics?.unscheduled?.length || 0),
						);
						const hardConflicts = Number(run.metrics?.hard_conflicts || 0);

						return (
							<div
								key={String(run.run_id)}
								className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-hover/50 -mx-2 px-2 rounded-xl transition-all"
							>
								{/* Left: Scope, Badges, Metrics */}
								<div className="space-y-1.5">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="font-bold text-sm text-text-main">
											{run.scope_name || `${run.scope_type} #${run.scope_id}`}
										</span>
										<Badge
											variant="outline"
											className="text-[10px] py-0 px-1.5 uppercase font-semibold"
										>
											{run.scope_type}
										</Badge>
										{getStatusBadge(run.status)}
									</div>

									<div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
										<span>
											<strong>{scheduledCount}</strong> / {totalCount} courses
											scheduled
										</span>
										<span>•</span>
										<span
											className={
												hardConflicts === 0
													? "text-emerald-400 font-medium"
													: "text-danger font-medium"
											}
										>
											{hardConflicts === 0
												? "0 Hard Conflicts"
												: `${hardConflicts} Conflicts`}
										</span>
										{run.metrics?.runtime_seconds !== undefined && (
											<>
												<span>•</span>
												<span>
													{Number(run.metrics.runtime_seconds).toFixed(1)}s
													runtime
												</span>
											</>
										)}
										{formattedDate && (
											<>
												<span>•</span>
												<span className="inline-flex items-center gap-1">
													<Clock size={11} /> {formattedDate}
												</span>
											</>
										)}
									</div>
								</div>

								{/* Right: Inspect Action */}
								<div className="shrink-0 flex items-center gap-2">
									<Link
										to="/exams/generator/$runId"
										params={{ runId: String(run.run_id) }}
									>
										<Button
											variant="outline"
											size="sm"
											className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
										>
											<Eye size={13} />
											<span>Inspect Run</span>
										</Button>
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
