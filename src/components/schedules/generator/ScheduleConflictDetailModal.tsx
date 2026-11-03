import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	AlertTriangle,
	Building2,
	User,
	Users,
	Clock,
	ShieldAlert,
	CheckCircle2,
	Maximize2,
} from "lucide-react";
import type { GeneratedAssignment } from "@/types";

export interface AssociatedConflict {
	category:
		| "student"
		| "lecturer"
		| "venue"
		| "daily"
		| "repeat"
		| "capacity"
		| "overlap";
	severity: "hard" | "soft";
	title: string;
	description: string;
	details?: Record<string, unknown>;
}

interface ScheduleConflictDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	assignment: GeneratedAssignment | null;
	conflicts: AssociatedConflict[];
}

export function ScheduleConflictDetailModal({
	isOpen,
	onClose,
	assignment,
	conflicts,
}: ScheduleConflictDetailModalProps) {
	if (!assignment) return null;

	const hasHardConflicts = conflicts.some((c) => c.severity === "hard");
	const hasConflicts = conflicts.length > 0;
	const isPractical =
		(assignment.course_type || "").toLowerCase() === "practical";

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="lg"
			title={
				<div className="flex items-center gap-2.5">
					<div
						className={`p-2 rounded-xl flex items-center justify-center ${
							hasHardConflicts
								? "bg-red-500/10 text-red-400"
								: hasConflicts
									? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
									: "bg-emerald-500/20 border border-primary/10 text-primary"
						}`}
					>
						{hasHardConflicts ? (
							<ShieldAlert size={20} />
						) : hasConflicts ? (
							<AlertTriangle size={20} />
						) : (
							<CheckCircle2 size={20} />
						)}
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-base font-extrabold text-text-main">
								{assignment.course_code}
							</span>
							{isPractical && (
								<Badge
									variant="secondary"
									className="text-[10px] py-0 px-1.5 bg-amber-500/5 text-amber-300 border-amber-500/30"
								>
									Lab / Practical
								</Badge>
							)}
							<Badge variant="primary" className="text-[10px] py-0 px-1.5">
								Occurrence #{assignment.occurrence_index || 1}
							</Badge>
						</div>
						<div className="text-xs text-text-muted font-normal mt-0.5">
							{assignment.course_title}
						</div>
					</div>
				</div>
			}
			description="Detailed schedule diagnostic breakdown and constraint validation results."
			footer={
				<Button
					variant="outline"
					size="sm"
					onClick={onClose}
					className="cursor-pointer text-xs"
				>
					Close
				</Button>
			}
		>
			<div className="space-y-4 pt-1">
				{/* Conflict Status Banner */}
				{hasConflicts ? (
					<div
						className={`p-3.5 rounded-xl border flex items-start gap-3 ${
							hasHardConflicts
								? "bg-red-500/10 border-red-500/30 text-red-300"
								: "bg-amber-500/10 border-amber-500/30 text-amber-300"
						}`}
					>
						<AlertTriangle size={18} className="shrink-0 mt-0.5" />
						<div className="space-y-1">
							<div className="text-xs font-bold text-text-main">
								{hasHardConflicts
									? `Hard Constraint Conflict Detected (${conflicts.length} issue${conflicts.length > 1 ? "s" : ""})`
									: `Soft Constraint Notice (${conflicts.length} issue${conflicts.length > 1 ? "s" : ""})`}
							</div>
							<p className="text-[11px] text-text-muted leading-relaxed">
								{hasHardConflicts
									? "This lecture assignment violates one or more hard timetable constraints. Review the clash diagnostics below."
									: "This lecture assignment has soft room capacity notices that can be adjusted."}
							</p>
						</div>
					</div>
				) : (
					<div className="p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20 flex items-center gap-3">
						<CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
						<div>
							<div className="text-xs font-bold text-text-main">
								No Timetable Conflicts
							</div>
							<p className="text-[11px] text-text-muted">
								This lecture satisfies all hard and soft scheduling constraints.
							</p>
						</div>
					</div>
				)}

				{/* Detailed Conflict Breakdown Cards */}
				{hasConflicts && (
					<div className="space-y-2">
						<div className="text-xs font-bold uppercase tracking-wider text-text-muted">
							Conflict Diagnostics
						</div>
						<div className="space-y-2">
							{conflicts.map((c, idx) => {
								const isHard = c.severity === "hard";
								return (
									<div
										key={`conflict-${idx}`}
										className={`p-3 rounded-xl border text-xs space-y-1.5 ${
											isHard
												? "bg-red-500/5 border-red-500/30 text-text-main"
												: "bg-amber-500/5 border-amber-500/30 text-text-main"
										}`}
									>
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-1.5 font-bold">
												<Badge
													variant={isHard ? "danger" : "warning"}
													className="text-[9px] py-0 px-1 font-mono uppercase"
												>
													{c.category}
												</Badge>
												<span
													className={isHard ? "text-red-400" : "text-amber-400"}
												>
													{c.title}
												</span>
											</div>
											<span className="text-[10px] text-text-subtle font-mono">
												{c.severity.toUpperCase()}
											</span>
										</div>

										<p className="text-[11px] text-text-muted leading-relaxed">
											{c.description}
										</p>

										{c.details && Object.keys(c.details).length > 0 && (
											<div className="flex flex-wrap gap-2 pt-1 border-t border-border/40 text-[10px] text-text-subtle">
												{Object.entries(c.details).map(([key, val]) => (
													<span
														key={key}
														className="bg-surface-raised px-1.5 py-0.5 rounded border border-border"
													>
														<strong>{key}:</strong> {String(val)}
													</span>
												))}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Assignment Metadata Info Box */}
				<div className="space-y-2 pt-1">
					<div className="text-xs font-bold uppercase tracking-wider text-text-muted">
						Lecture Assignment Details
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
						{/* Slot */}
						<div className="p-2.5 rounded-xl bg-surface-raised border border-border space-y-1">
							<div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium">
								<Clock size={13} className="text-primary" />
								<span>Time & Day</span>
							</div>
							<div className="font-bold text-text-main">
								{assignment.day_name || assignment.day}
							</div>
							<div className="text-[11px] text-text-muted font-mono">
								{assignment.start_time?.slice(0, 5)} -{" "}
								{assignment.end_time?.slice(0, 5)} (Period{" "}
								{assignment.period_index || "—"})
							</div>
						</div>

						{/* Venue */}
						<div className="p-2.5 rounded-xl bg-surface-raised border border-border space-y-1">
							<div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium">
								<Building2 size={13} className="text-primary" />
								<span>Venue Allocation</span>
							</div>
							<div className="font-bold text-text-main truncate">
								{assignment.venue_name}
							</div>
							<div className="text-[11px] text-text-muted flex items-center gap-1">
								<Maximize2 size={11} />
								<span>Room ID: #{assignment.venue_id}</span>
							</div>
						</div>

						{/* Lecturers */}
						<div className="p-2.5 rounded-xl bg-surface-raised border border-border space-y-1">
							<div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium">
								<User size={13} className="text-primary" />
								<span>Assigned Lecturer(s)</span>
							</div>
							<div className="font-semibold text-text-main truncate">
								{assignment.lecturers && assignment.lecturers.length > 0
									? assignment.lecturers.join(", ")
									: "Unassigned"}
							</div>
						</div>

						{/* Student Cohorts */}
						<div className="p-2.5 rounded-xl bg-surface-raised border border-border space-y-1">
							<div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium">
								<Users size={13} className="text-primary" />
								<span>Target Cohort</span>
							</div>
							<div className="font-semibold text-text-main truncate">
								{assignment.program_names && assignment.program_names.length > 0
									? assignment.program_names.join(", ")
									: assignment.level
										? `Level ${assignment.level}L`
										: "Cohort"}
							</div>
							<div className="text-[11px] text-text-muted">
								Expected Headcount: {assignment.expected_students || 0} students
							</div>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}
