import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
	UploadCloud,
	AlertTriangle,
	Calendar,
	Building2,
	Layers,
	ShieldCheck,
	Loader2,
} from "lucide-react";
import type { ExamOptimizerResult } from "@/api/main/examOptimizerAPI";

interface ExamPublishConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	run: ExamOptimizerResult | null;
	isPublishing: boolean;
	existingPublishedInfo?: {
		hasExisting: boolean;
		runId?: string;
		eventsCount?: number;
		sourceScopeType?: string;
	} | null;
}

export function ExamPublishConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	run,
	isPublishing,
	existingPublishedInfo,
}: ExamPublishConfirmModalProps) {
	if (!run) return null;

	const scheduledCount = run.metrics?.courses_scheduled ?? run.events?.length ?? 0;
	const totalCourses = run.metrics?.courses_total ?? scheduledCount;
	const hardConflicts = Number(run.metrics?.hard_conflicts || 0);
	const hasConflicts = hardConflicts > 0;
	const activeDays = run.metrics?.active_exam_days ?? 0;
	const hasExisting = Boolean(existingPublishedInfo?.hasExisting);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="md"
			title={
				<div className="flex items-center gap-2.5">
					<div
						className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
							hasExisting
								? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
								: "bg-primary/10 text-primary border border-primary/20"
						}`}
					>
						{hasExisting ? <AlertTriangle size={20} /> : <UploadCloud size={20} />}
					</div>
					<div>
						<h3 className="text-base font-bold text-text-main leading-tight">
							{hasExisting
								? "Overwrite Existing Published Timetable?"
								: "Publish Exam Timetable to Live"}
						</h3>
						<p className="text-xs text-text-muted">
							Run #{String(run.run_id).slice(0, 8)} · {run.scope_name || `${run.scope_type} scope`}
						</p>
					</div>
				</div>
			}
		>
			<div className="space-y-4 pt-1">
				{/* Prominent overwrite warning if an existing timetable is already published for this scope */}
				{hasExisting && (
					<div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5">
						<div className="flex items-center gap-2 font-bold text-amber-400">
							<AlertTriangle size={16} className="text-amber-400 shrink-0" />
							<span>Active Published Timetable Will Be Overwritten</span>
						</div>
						<p className="text-[11px] leading-relaxed text-amber-200/90">
							An active examination timetable (
							{existingPublishedInfo?.runId
								? `Run #${existingPublishedInfo.runId.slice(0, 8)}`
								: "existing schedule"}
							{existingPublishedInfo?.eventsCount != null
								? ` with ${existingPublishedInfo.eventsCount} examinations`
								: ""}
							) is currently live for this scope. Publishing this run will immediately
							overwrite and replace it for all enrolled students, courses, and venues.
						</p>
					</div>
				)}

				{/* Warning banner if conflicts exist */}
				{hasConflicts ? (
					<div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2.5">
						<AlertTriangle size={16} className="shrink-0 mt-0.5" />
						<div>
							<div className="font-bold">Caution: Hard Conflicts Detected</div>
							<div className="text-[11px] opacity-90 mt-0.5">
								This timetable has {hardConflicts} unresolved hard conflict{hardConflicts > 1 ? "s" : ""}.
								Publishing may cause overlapping exam sessions for affected students or venues.
							</div>
						</div>
					</div>
				) : (
					<div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
						<ShieldCheck size={16} className="shrink-0 mt-0.5 text-emerald-400" />
						<div>
							<div className="font-bold text-text-main">Clean Timetable Verification</div>
							<div className="text-[11px] text-text-muted mt-0.5">
								All courses were successfully placed without student clashes or venue contention.
							</div>
						</div>
					</div>
				)}

				{/* Summary Cards */}
				<div className="grid grid-cols-2 gap-2.5 text-xs">
					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="text-[11px] text-text-muted flex items-center gap-1">
							<Layers size={12} className="text-primary" />
							<span>Courses Scheduled</span>
						</div>
						<div className="text-sm font-bold font-mono text-text-main">
							{scheduledCount} <span className="text-xs font-normal text-text-muted">/ {totalCourses}</span>
						</div>
					</div>

					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="text-[11px] text-text-muted flex items-center gap-1">
							<Calendar size={12} className="text-primary" />
							<span>Active Calendar</span>
						</div>
						<div className="text-sm font-bold font-mono text-text-main">
							{activeDays} <span className="text-xs font-normal text-text-muted">Exam Days</span>
						</div>
					</div>
				</div>

				<div className="p-3.5 rounded-xl bg-surface-raised/40 border border-border text-xs text-text-muted space-y-1.5">
					<div className="font-semibold text-text-main flex items-center gap-1.5">
						<Building2 size={13} className="text-primary" />
						<span>What happens upon publishing?</span>
					</div>
					<ul className="list-disc list-inside space-y-1 text-[11px] pl-1">
						<li>This run becomes the active, official timetable for this scope.</li>
						<li>Students and lecturers will immediately see their exam sittings.</li>
						<li>Previous published timetable runs for this scope will be archived.</li>
					</ul>
				</div>

				{/* Footer Actions */}
				<div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={isPublishing}
						className="cursor-pointer text-xs"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={onConfirm}
						disabled={isPublishing}
						className={`gap-2 cursor-pointer text-xs font-semibold ${
							hasExisting
								? "bg-amber-600 hover:bg-amber-500 text-white border-amber-600"
								: ""
						}`}
					>
						{isPublishing ? (
							<>
								<Loader2 size={14} className="animate-spin" />
								<span>
									{hasExisting
										? "Overwriting & Publishing..."
										: "Publishing Timetable..."}
								</span>
							</>
						) : (
							<>
								<UploadCloud size={14} />
								<span>
									{hasExisting
										? "Proceed to Overwrite & Publish"
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
