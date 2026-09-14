import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import {
	History,
	CheckCircle2,
	AlertTriangle,
	XCircle,
	ArrowRight,
	Check,
} from "lucide-react";
import type { TimetableGenerationRun } from "@/types";
import { getGenerationRuns } from "@/api/main/generationAPI";

interface GenerationHistoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	semesterId?: string;
	onSelectRun: (run: TimetableGenerationRun) => void;
}

export function GenerationHistoryModal({
	isOpen,
	onClose,
	semesterId,
	onSelectRun,
}: GenerationHistoryModalProps) {
	const {
		data: runs = [],
		isLoading,
		refetch,
	} = useQuery<TimetableGenerationRun[]>({
		queryKey: ["scheduling", "generationRuns", semesterId],
		queryFn: () => getGenerationRuns({ semester: semesterId }),
		enabled: isOpen,
	});

	const getStatusBadge = (run: TimetableGenerationRun) => {
		if (run.resultStatus === "optimal") {
			return (
				<Badge variant="success" size="sm" icon={<CheckCircle2 size={12} />}>
					Optimal (0)
				</Badge>
			);
		}
		if (run.resultStatus === "feasible") {
			return (
				<Badge variant="info" size="sm" icon={<CheckCircle2 size={12} />}>
					Feasible
				</Badge>
			);
		}
		if (run.resultStatus === "best_available") {
			return (
				<Badge variant="warning" size="sm" icon={<AlertTriangle size={12} />}>
					{run.hardConflictsCount} Conflicts
				</Badge>
			);
		}
		return (
			<Badge variant="danger" size="sm" icon={<XCircle size={12} />}>
				Failed
			</Badge>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				<div className="flex items-center gap-2">
					<History size={18} className="text-primary" />
					<span className="font-bold text-base text-text-main">
						Timetable Generation History
					</span>
				</div>
			}
			description="View past optimizer runs, inspect constraint satisfaction, and publish generated timetables."
			size="lg"
		>
			<div className="space-y-3 pt-1 max-h-[65vh] overflow-y-auto pr-1">
				{isLoading ? (
					<div className="py-12 text-center text-xs text-text-muted animate-pulse">
						Loading past generation runs...
					</div>
				) : runs.length === 0 ? (
					<div className="py-12 text-center text-xs text-text-muted space-y-1">
						<p className="font-semibold text-text-main">
							No generation runs found
						</p>
						<p>
							Run the automated timetable generator to produce your first
							optimized schedule.
						</p>
					</div>
				) : (
					runs.map((run) => {
						const createdAtDate = new Date(run.createdAt);
						const dateStr = createdAtDate.toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						});

						return (
							<div
								key={run.id}
								className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between gap-3 hover:border-border-strong transition-colors"
							>
								<div className="space-y-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-bold text-xs text-text-main truncate">
											{run.scopeName ||
												`${run.scopeType.toUpperCase()} Schedule`}
										</span>
										{getStatusBadge(run)}
										{run.isPublished && (
											<Badge
												variant="success"
												size="sm"
												icon={<Check size={10} />}
											>
												Live
											</Badge>
										)}
									</div>
									<p className="text-[11px] text-text-muted">
										{dateStr} • Fitness: {(run.fitnessScore * 100).toFixed(1)}%
										• Hard Conflicts: {run.hardConflictsCount}
									</p>
								</div>

								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										onClose();
										onSelectRun(run);
									}}
									className="h-8 px-2.5 text-xs gap-1 cursor-pointer shrink-0"
								>
									<span>Diagnostics</span>
									<ArrowRight size={13} />
								</Button>
							</div>
						);
					})
				)}
			</div>

			<div className="flex justify-end pt-3 border-t border-border mt-3">
				<Button
					variant="outline"
					size="sm"
					onClick={onClose}
					className="cursor-pointer text-xs h-8"
				>
					Close
				</Button>
			</div>
		</Modal>
	);
}
