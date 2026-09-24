import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	UploadCloud,
	AlertTriangle,
	CheckCircle2,
	Calendar,
	Building2,
	Layers,
	ShieldAlert,
	Loader2,
} from "lucide-react";
import type { TimetableGenerationRun } from "@/types";

interface PublishConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	run: TimetableGenerationRun | null;
	isPublishing: boolean;
	scopeLabel?: string;
}

export function PublishConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	run,
	isPublishing,
	scopeLabel,
}: PublishConfirmModalProps) {
	if (!run) return null;

	const hardConflicts = run.hardConflictsCount ?? 0;
	const hasHardConflicts = hardConflicts > 0;
	const occurrencesCount =
		run.conflictReport?.occurrences_scheduled ||
		run.generationMetrics?.occurrences_total ||
		run.assignmentsPayload?.length ||
		"—";
	const qualityPercentage = (
		(run.fitnessScore ?? 0) > 1
			? run.fitnessScore
			: (run.fitnessScore ?? 0) * 100
	).toFixed(1);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="md"
			title={
				<div className="flex items-center gap-2.5">
					<div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
						<UploadCloud size={20} />
					</div>
					<div>
						<h3 className="text-base font-bold text-text-main leading-tight">
							Publish Timetable to Live Schedule
						</h3>
						<p className="text-xs text-text-muted">
							Run #{run.id.slice(0, 8)} • Official Publication
						</p>
					</div>
				</div>
			}
		>
			<div className="space-y-4 pt-1">
				{/* Warning / Informer Banner */}
				<div
					className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
						hasHardConflicts
							? "bg-red-500/10 border-red-500/30 text-red-200"
							: "bg-primary/10 border-primary/20 text-text-main"
					}`}
				>
					<div className="flex items-center gap-2 font-semibold">
						{hasHardConflicts ? (
							<>
								<ShieldAlert size={16} className="text-red-400 shrink-0" />
								<span className="text-red-400">
									Warning: Unresolved Hard Conflicts ({hardConflicts})
								</span>
							</>
						) : (
							<>
								<CheckCircle2 size={16} className="text-primary shrink-0" />
								<span className="text-primary">Ready to Materialize</span>
							</>
						)}
					</div>
					<p className="text-[11px] text-text-muted leading-relaxed">
						{hasHardConflicts
							? "This schedule contains hard constraint conflicts. Publishing now will expose colliding lecture slots to students and lecturers."
							: "Publishing will materialize recurring lecture sessions into the official university calendar. Any previously published schedule in this scope will be overwritten."}
					</p>
				</div>

				{/* Run Metadata Grid */}
				<div className="grid grid-cols-2 gap-2 text-xs">
					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="flex items-center gap-1.5 text-text-muted text-[11px]">
							<Calendar size={13} className="text-primary" />
							<span>Semester</span>
						</div>
						<div className="font-semibold text-text-main truncate">
							{run.semesterName || `Semester #${run.semesterId}`}
						</div>
					</div>

					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="flex items-center gap-1.5 text-text-muted text-[11px]">
							<Building2 size={13} className="text-primary" />
							<span>Target Scope</span>
						</div>
						<div className="font-semibold text-text-main truncate">
							{scopeLabel || run.scopeName || run.scopeType}
						</div>
					</div>

					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="flex items-center gap-1.5 text-text-muted text-[11px]">
							<Layers size={13} className="text-primary" />
							<span>Scheduled Occurrences</span>
						</div>
						<div className="font-semibold text-text-main font-mono">
							{occurrencesCount} lectures
						</div>
					</div>

					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="flex items-center gap-1.5 text-text-muted text-[11px]">
							<AlertTriangle
								size={13}
								className={
									hasHardConflicts ? "text-red-400" : "text-emerald-400"
								}
							/>
							<span>Conflict Status</span>
						</div>
						<div>
							{hasHardConflicts ? (
								<Badge
									variant="danger"
									className="text-[10px] py-0 px-1.5 bg-red-500/20 text-red-400 border-red-500/30"
								>
									{hardConflicts} Hard Conflicts
								</Badge>
							) : (
								<Badge
									variant="success"
									className="text-[10px] py-0 px-1.5 bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
								>
									0 Conflicts ({qualityPercentage}%)
								</Badge>
							)}
						</div>
					</div>
				</div>

				{/* Overwrite Confirmation Notice */}
				<div className="p-3 rounded-xl bg-surface-raised/60 border border-border text-[11px] text-text-muted leading-relaxed">
					<strong className="text-text-main">Overwrite Policy:</strong> Any
					previously published timetable for this scope will be automatically
					demoted from active status. Live lecture sessions and timetable
					entries will reflect this generated run.
				</div>

				{/* Modal Actions */}
				<div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={isPublishing}
						className="cursor-pointer text-xs h-9 px-4"
					>
						Cancel
					</Button>
					<Button
						variant={hasHardConflicts ? "danger" : "primary"}
						size="sm"
						onClick={onConfirm}
						disabled={isPublishing}
						className="cursor-pointer text-xs h-9 px-4 font-semibold gap-1.5 shadow-sm"
					>
						{isPublishing ? (
							<>
								<Loader2 size={13} className="animate-spin" />
								<span>Publishing to Live...</span>
							</>
						) : (
							<>
								<UploadCloud size={14} />
								<span>
									{hasHardConflicts
										? "Publish Despite Conflicts"
										: "Confirm & Publish"}
								</span>
							</>
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
