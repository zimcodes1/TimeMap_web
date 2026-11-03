import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import {
	CheckCircle2,
	AlertTriangle,
	XCircle,
	Clock,
	Zap,
	Users,
	Building2,
	Calendar,
	Layers,
	UploadCloud,
	Check,
} from "lucide-react";
import type { TimetableGenerationRun } from "@/types";
import { publishGenerationRun } from "@/api/main/generationAPI";
import { toast } from "sonner";

interface GenerationReportModalProps {
	isOpen: boolean;
	onClose: () => void;
	run: TimetableGenerationRun | null;
	onPublishSuccess: () => void;
}

export function GenerationReportModal({
	isOpen,
	onClose,
	run,
	onPublishSuccess,
}: GenerationReportModalProps) {
	const [activeConflictTab, setActiveConflictTab] = useState<
		| "all"
		| "student"
		| "lecturer"
		| "venue"
		| "daily"
		| "day_repeat"
		| "capacity"
	>("all");
	const [isPublishing, setIsPublishing] = useState(false);
	const [publishConfirmed, setPublishConfirmed] = useState(false);

	if (!run) return null;

	const handlePublish = async () => {
		if (!publishConfirmed) {
			setPublishConfirmed(true);
			return;
		}

		setIsPublishing(true);
		try {
			const result = await publishGenerationRun(run.id);
			toast.success(
				`Timetable published! ${result.entries_created} recurring entries created, ${result.sessions_materialized} lecture sessions materialized across semester weeks.`,
			);
			setPublishConfirmed(false);
			onPublishSuccess();
			onClose();
		} catch (err: any) {
			const errorMsg =
				err?.response?.data?.error ||
				err?.message ||
				"Failed to publish timetable.";
			toast.error(errorMsg);
		} finally {
			setIsPublishing(false);
		}
	};

	const getStatusBadge = () => {
		if (run.resultStatus === "optimal") {
			return (
				<Badge variant="success" icon={<CheckCircle2 size={13} />}>
					Optimal (0 Conflicts)
				</Badge>
			);
		}
		if (run.resultStatus === "feasible") {
			return (
				<Badge variant="info" icon={<CheckCircle2 size={13} />}>
					Feasible
				</Badge>
			);
		}
		if (run.resultStatus === "best_available") {
			return (
				<Badge variant="warning" icon={<AlertTriangle size={13} />}>
					Best Available ({run.hardConflictsCount} Conflicts)
				</Badge>
			);
		}
		return (
			<Badge variant="danger" icon={<XCircle size={13} />}>
				Failed
			</Badge>
		);
	};

	const cr = run.conflictReport || {};
	const studentConflicts = cr.student_conflicts || [];
	const lecturerConflicts = cr.lecturer_conflicts || [];
	const venueConflicts = cr.venue_conflicts || [];
	const dailyLimitViolations = cr.daily_limit_violations || [];
	const occurrenceDayViolations = cr.occurrence_day_violations || [];
	const capacityViolations = cr.capacity_violations || [];

	const totalConflicts =
		run.hardConflictsCount +
		(capacityViolations.length > 0 ? capacityViolations.length : 0);

	const metrics = run.generationMetrics || {};
	const elapsedSeconds =
		typeof metrics.elapsed_seconds === "number"
			? metrics.elapsed_seconds.toFixed(2)
			: "0.00";
	const generationsRun = metrics.generations_run || 0;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-4">
					<div className="flex items-center gap-2">
						<span className="font-bold text-base text-text-main">
							Timetable Generation Diagnostics
						</span>
						{getStatusBadge()}
					</div>
					{run.isPublished && (
						<Badge variant="success" size="sm" icon={<Check size={12} />}>
							Live & Published
						</Badge>
					)}
				</div>
			}
			description={`Scope: ${run.scopeName || run.scopeType.toUpperCase()} | Semester: ${run.semesterName || run.semesterId} | Run ID: ${run.id.slice(0, 8)}`}
			size="xl"
		>
			<div className="space-y-4 pt-1 max-h-[75vh] overflow-y-auto pr-1">
				{/* Top Metric Cards */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="flex items-center justify-between text-text-muted">
							<span className="text-[11px]">Hard Conflicts</span>
							<AlertTriangle
								size={14}
								className={
									run.hardConflictsCount === 0
										? "text-success"
										: "text-amber-400"
								}
							/>
						</div>
						<p
							className={`text-xl font-extrabold ${
								run.hardConflictsCount === 0 ? "text-success" : "text-amber-400"
							}`}
						>
							{run.hardConflictsCount}
						</p>
					</div>

					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="flex items-center justify-between text-text-muted">
							<span className="text-[11px]">Fitness Score</span>
							<Zap size={14} className="text-primary" />
						</div>
						<p className="text-xl font-extrabold text-primary">
							{(run.fitnessScore * 100).toFixed(1)}%
						</p>
					</div>

					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="flex items-center justify-between text-text-muted">
							<span className="text-[11px]">Generations</span>
							<Layers size={14} className="text-text-muted" />
						</div>
						<p className="text-xl font-extrabold text-text-main">
							{generationsRun}
						</p>
					</div>

					<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
						<div className="flex items-center justify-between text-text-muted">
							<span className="text-[11px]">Execution Time</span>
							<Clock size={14} className="text-text-muted" />
						</div>
						<p className="text-xl font-extrabold text-text-main">
							{elapsedSeconds}s
						</p>
					</div>
				</div>

				{/* Detailed Violation Counts Pill Bar */}
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
					<div className="p-2 rounded-lg bg-surface border border-border flex items-center justify-between">
						<div className="flex items-center gap-1.5 text-text-muted">
							<Users size={13} />
							<span>Student Clashes:</span>
						</div>
						<span
							className={`font-bold ${
								run.studentConflictsCount > 0 ? "text-danger" : "text-text-main"
							}`}
						>
							{run.studentConflictsCount}
						</span>
					</div>

					<div className="p-2 rounded-lg bg-surface border border-border flex items-center justify-between">
						<div className="flex items-center gap-1.5 text-text-muted">
							<Users size={13} />
							<span>Lecturer Clashes:</span>
						</div>
						<span
							className={`font-bold ${
								run.lecturerConflictsCount > 0
									? "text-danger"
									: "text-text-main"
							}`}
						>
							{run.lecturerConflictsCount}
						</span>
					</div>

					<div className="p-2 rounded-lg bg-surface border border-border flex items-center justify-between">
						<div className="flex items-center gap-1.5 text-text-muted">
							<Building2 size={13} />
							<span>Venue Double-Bookings:</span>
						</div>
						<span
							className={`font-bold ${
								run.venueConflictsCount > 0 ? "text-danger" : "text-text-main"
							}`}
						>
							{run.venueConflictsCount}
						</span>
					</div>

					<div className="p-2 rounded-lg bg-surface border border-border flex items-center justify-between">
						<div className="flex items-center gap-1.5 text-text-muted">
							<Calendar size={13} />
							<span>Daily Limit (&gt;3/day):</span>
						</div>
						<span
							className={`font-bold ${
								run.dailyLimitViolationsCount > 0
									? "text-amber-400"
									: "text-text-main"
							}`}
						>
							{run.dailyLimitViolationsCount}
						</span>
					</div>

					<div className="p-2 rounded-lg bg-surface border border-border flex items-center justify-between">
						<div className="flex items-center gap-1.5 text-text-muted">
							<Layers size={13} />
							<span>Same-Day Repeats:</span>
						</div>
						<span
							className={`font-bold ${
								run.occurrenceDayViolationsCount > 0
									? "text-amber-400"
									: "text-text-main"
							}`}
						>
							{run.occurrenceDayViolationsCount}
						</span>
					</div>

					<div className="p-2 rounded-lg bg-surface border border-border flex items-center justify-between">
						<div className="flex items-center gap-1.5 text-text-muted">
							<Building2 size={13} />
							<span>Capacity Penalty:</span>
						</div>
						<span
							className={`font-bold ${
								run.capacityPenalty > 0 ? "text-amber-400" : "text-text-main"
							}`}
						>
							{run.capacityPenalty}
						</span>
					</div>
				</div>

				{/* Conflict Diagnostics List */}
				<div className="space-y-2 pt-2 border-t border-border">
					<div className="flex items-center justify-between">
						<Text variant="caption" weight="bold" className="text-text-main">
							Conflict Report Diagnostics ({totalConflicts} Issues)
						</Text>
					</div>

					{/* Sub-filter tabs */}
					<div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
						<button
							type="button"
							onClick={() => setActiveConflictTab("all")}
							className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
								activeConflictTab === "all"
									? "bg-primary/20 text-primary font-semibold"
									: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted"
							}`}
						>
							All ({totalConflicts})
						</button>
						{studentConflicts.length > 0 && (
							<button
								type="button"
								onClick={() => setActiveConflictTab("student")}
								className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
									activeConflictTab === "student"
										? "bg-danger/20 text-danger font-semibold"
										: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted"
								}`}
							>
								Students ({studentConflicts.length})
							</button>
						)}
						{lecturerConflicts.length > 0 && (
							<button
								type="button"
								onClick={() => setActiveConflictTab("lecturer")}
								className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
									activeConflictTab === "lecturer"
										? "bg-danger/20 text-danger font-semibold"
										: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted"
								}`}
							>
								Lecturers ({lecturerConflicts.length})
							</button>
						)}
						{venueConflicts.length > 0 && (
							<button
								type="button"
								onClick={() => setActiveConflictTab("venue")}
								className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
									activeConflictTab === "venue"
										? "bg-danger/20 text-danger font-semibold"
										: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted"
								}`}
							>
								Venues ({venueConflicts.length})
							</button>
						)}
						{dailyLimitViolations.length > 0 && (
							<button
								type="button"
								onClick={() => setActiveConflictTab("daily")}
								className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
									activeConflictTab === "daily"
										? "bg-amber-500/20 text-amber-400 font-semibold"
										: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted"
								}`}
							>
								Daily Limits ({dailyLimitViolations.length})
							</button>
						)}
						{occurrenceDayViolations.length > 0 && (
							<button
								type="button"
								onClick={() => setActiveConflictTab("day_repeat")}
								className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
									activeConflictTab === "day_repeat"
										? "bg-amber-500/20 text-amber-400 font-semibold"
										: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted"
								}`}
							>
								Repeats ({occurrenceDayViolations.length})
							</button>
						)}
						{capacityViolations.length > 0 && (
							<button
								type="button"
								onClick={() => setActiveConflictTab("capacity")}
								className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
									activeConflictTab === "capacity"
										? "bg-blue-500/20 text-blue-400 font-semibold"
										: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted"
								}`}
							>
								Capacity ({capacityViolations.length})
							</button>
						)}
					</div>

					{/* List of Conflicts */}
					<div className="max-h-56 overflow-y-auto space-y-2 border border-border rounded-xl p-2.5 bg-surface">
						{totalConflicts === 0 ? (
							<div className="py-6 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-1.5">
								<CheckCircle2 size={24} className="text-success" />
								<span className="font-semibold text-text-main">
									Clean schedule! Zero conflicts detected.
								</span>
								<span>
									All cohorts, lecturers, and venues are fully compatible.
								</span>
							</div>
						) : (
							<>
								{(activeConflictTab === "all" ||
									activeConflictTab === "student") &&
									studentConflicts.map((c, idx) => (
										<div
											key={`student-${idx}`}
											className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-xs space-y-1"
										>
											<div className="flex items-center justify-between text-danger font-semibold">
												<span>Student Cohort Clash</span>
												<span>
													{c.slot?.day} {c.slot?.start_time} -{" "}
													{c.slot?.end_time}
												</span>
											</div>
											<p className="text-text-main">{c.description}</p>
										</div>
									))}

								{(activeConflictTab === "all" ||
									activeConflictTab === "lecturer") &&
									lecturerConflicts.map((c, idx) => (
										<div
											key={`lecturer-${idx}`}
											className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-xs space-y-1"
										>
											<div className="flex items-center justify-between text-danger font-semibold">
												<span>Lecturer Double-Booking</span>
												<span>
													{c.slot?.day} {c.slot?.start_time} -{" "}
													{c.slot?.end_time}
												</span>
											</div>
											<p className="text-text-main">{c.description}</p>
										</div>
									))}

								{(activeConflictTab === "all" ||
									activeConflictTab === "venue") &&
									venueConflicts.map((c, idx) => (
										<div
											key={`venue-${idx}`}
											className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-xs space-y-1"
										>
											<div className="flex items-center justify-between text-danger font-semibold">
												<span>Venue Double-Booking</span>
												<span>
													{c.slot?.day} {c.slot?.start_time} -{" "}
													{c.slot?.end_time}
												</span>
											</div>
											<p className="text-text-main">{c.description}</p>
										</div>
									))}

								{(activeConflictTab === "all" ||
									activeConflictTab === "daily") &&
									dailyLimitViolations.map((c, idx) => (
										<div
											key={`daily-${idx}`}
											className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1"
										>
											<div className="flex items-center justify-between text-amber-400 font-semibold">
												<span>Daily Limit Exceeded (&gt;3 Lectures)</span>
												<span>{c.day}</span>
											</div>
											<p className="text-text-main">{c.description}</p>
										</div>
									))}

								{(activeConflictTab === "all" ||
									activeConflictTab === "day_repeat") &&
									occurrenceDayViolations.map((c, idx) => (
										<div
											key={`rep-${idx}`}
											className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1"
										>
											<div className="flex items-center justify-between text-amber-400 font-semibold">
												<span>Same-Day Occurrence Repeat</span>
												<span>{c.day}</span>
											</div>
											<p className="text-text-main">{c.description}</p>
										</div>
									))}

								{(activeConflictTab === "all" ||
									activeConflictTab === "capacity") &&
									capacityViolations.map((c, idx) => (
										<div
											key={`cap-${idx}`}
											className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs space-y-1"
										>
											<div className="flex items-center justify-between text-blue-400 font-semibold">
												<span>Venue Capacity Deficit</span>
												<span>Deficit: {c.deficit} seats</span>
											</div>
											<p className="text-text-main">{c.description}</p>
										</div>
									))}
							</>
						)}
					</div>
				</div>

				{/* Confirmation Warning when publishing with conflicts */}
				{publishConfirmed && (
					<div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
						<p className="font-bold flex items-center gap-1.5">
							<AlertTriangle size={15} />
							Confirm Timetable Publication
						</p>
						<p className="text-text-muted leading-relaxed">
							Publishing will replace existing live timetable entries for this
							semester and materialize all lecture sessions. Any future changes
							will need to go through the discrepancy request workflow.
						</p>
					</div>
				)}

				{/* Footer Actions */}
				<div className="flex items-center justify-between pt-3 border-t border-border">
					<Button
						variant="outline"
						type="button"
						onClick={onClose}
						className="cursor-pointer text-xs h-9"
					>
						Close
					</Button>

					<div className="flex items-center gap-2">
						{publishConfirmed && (
							<Button
								variant="outline"
								type="button"
								onClick={() => setPublishConfirmed(false)}
								disabled={isPublishing}
								className="cursor-pointer text-xs h-9"
							>
								Back
							</Button>
						)}

						{run.isPublished ? (
							<Button
								variant="outline"
								disabled
								className="cursor-not-allowed text-xs h-9 gap-1.5 text-success border-success/30"
							>
								<Check size={14} />
								<span>Already Published</span>
							</Button>
						) : (
							<Button
								variant={publishConfirmed ? "primary" : "primary"}
								type="button"
								onClick={handlePublish}
								disabled={isPublishing}
								className="cursor-pointer text-xs h-9 gap-1.5"
							>
								<UploadCloud size={14} />
								<span>
									{isPublishing
										? "Publishing to Live Timetable..."
										: publishConfirmed
											? "Confirm & Publish Timetable"
											: "Publish to Live Timetable"}
								</span>
							</Button>
						)}
					</div>
				</div>
			</div>
		</Modal>
	);
}
