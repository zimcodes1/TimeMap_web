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
	GraduationCap,
	XCircle,
	Ban,
	Edit,
} from "lucide-react";
import type { TimetableEntry, LectureSession } from "@/types";
import type { AssociatedConflict } from "@/components/schedules/generator/ScheduleConflictDetailModal";

interface LiveEntryDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	entry?: TimetableEntry | null;
	session?: LectureSession | null;
	conflicts?: AssociatedConflict[];
	isPast?: boolean;
	date?: string;
	canShift?: boolean;
	onShiftClick?: () => void;
}

export function LiveEntryDetailModal({
	isOpen,
	onClose,
	entry,
	session,
	conflicts = [],
	isPast,
	date,
	canShift,
	onShiftClick,
}: LiveEntryDetailModalProps) {
	if (!entry && !session) return null;

	// Extract unified attributes across entry and session
	const courseCode = session?.courseCode || entry?.courseCode || "";
	const courseTitle = session?.courseTitle || entry?.courseTitle || "";
	const courseLevel = session?.courseLevel || entry?.courseLevel;
	const courseType = session?.courseType || entry?.courseType || "";
	const isPractical = (courseType || "").toLowerCase() === "practical";

	const venueName =
		session?.venueName || entry?.venueName || "Unassigned Venue";
	const venueCapacity = session?.venueCapacity || entry?.venueCapacity;

	const dayOfWeek = session?.dayOfWeek || entry?.dayOfWeek || "";
	const dateStr = session?.date || date || "";
	const startTime = session?.startTime || entry?.startTime || "";
	const endTime = session?.endTime || entry?.endTime || "";

	const cohortName =
		session?.programName ||
		entry?.targetProgramName ||
		entry?.departmentName ||
		"All Programs";
	const expectedStudents = entry?.expectedStudents;

	const lecturersList =
		session?.lecturers && session.lecturers.length > 0
			? session.lecturers
			: entry?.lecturers && entry.lecturers.length > 0
				? entry.lecturers
				: session?.lecturerName
					? [session.lecturerName]
					: entry?.lecturerName
						? [entry.lecturerName]
						: [];

	// Conflict determination
	const hasHardConflicts =
		conflicts.some((c) => c.severity === "hard") ||
		Boolean(session?.hasConflict);
	const hasConflicts = conflicts.length > 0 || Boolean(session?.hasConflict);

	// Past determination
	const now = new Date();
	const todayDateStr = `${now.getFullYear()}-${String(
		now.getMonth() + 1,
	).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
		now.getMinutes(),
	).padStart(2, "0")}:00`;

	const calculatedIsPast = Boolean(
		isPast !== undefined
			? isPast
			: dateStr
				? dateStr < todayDateStr ||
					(dateStr === todayDateStr &&
						Boolean(endTime && endTime < currentTimeStr))
				: false,
	);

	const reportStatus = session?.reportStatus;
	const sessionStatus = session?.status;
	const isHeld = reportStatus === "held" || sessionStatus === "held";
	const isNotHeld = reportStatus === "not_held" || sessionStatus === "not_held";
	const isCancelled = sessionStatus === "cancelled";
	const isShifted = sessionStatus === "shifted";

	// Shift eligibility: past sessions can NEVER be shifted
	const isShiftAllowed =
		!calculatedIsPast && canShift !== false && Boolean(onShiftClick);

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
									: calculatedIsPast
										? "bg-surface-raised border border-border text-text-muted"
										: "bg-emerald-500/20 border border-primary/10 text-primary"
						}`}
					>
						{hasHardConflicts ? (
							<ShieldAlert size={20} />
						) : hasConflicts ? (
							<AlertTriangle size={20} />
						) : calculatedIsPast ? (
							<Clock size={20} />
						) : (
							<CheckCircle2 size={20} />
						)}
					</div>
					<div>
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-base font-extrabold text-text-main">
								{courseCode}
							</span>
							{isPractical && (
								<Badge
									variant="secondary"
									className="text-[10px] py-0 px-1.5 bg-amber-500/5 text-amber-300 border-amber-500/30"
								>
									Lab / Practical
								</Badge>
							)}
							{courseLevel && (
								<Badge variant="outline" className="text-[10px] py-0 px-1.5">
									{courseLevel} Level
								</Badge>
							)}
							{calculatedIsPast ? (
								<Badge
									variant="outline"
									className="text-[10px] py-0 px-1.5 text-text-subtle border-border/80"
								>
									Past Lecture
								</Badge>
							) : (
								<Badge
									variant={isShifted ? "warning" : "primary"}
									className="text-[10px] py-0 px-1.5"
								>
									{isShifted ? "Shifted" : "Upcoming"}
								</Badge>
							)}
							{calculatedIsPast && isHeld && (
								<span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
									<CheckCircle2 size={10} /> Held
								</span>
							)}
							{calculatedIsPast && isNotHeld && (
								<span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
									<XCircle size={10} /> Not Held
								</span>
							)}
							{calculatedIsPast && isCancelled && (
								<span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
									<Ban size={10} /> Cancelled
								</span>
							)}
							{calculatedIsPast && !isHeld && !isNotHeld && !isCancelled && (
								<span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
									Unreported
								</span>
							)}
						</div>
						<div className="text-xs text-text-muted font-normal mt-0.5 line-clamp-1">
							{courseTitle}
						</div>
					</div>
				</div>
			}
			description={
				calculatedIsPast
					? "Past lecture schedule details and attendance reporting record."
					: "Detailed live lecture schedule details and conflict diagnostics."
			}
			footer={
				<div className="flex items-center justify-between w-full">
					{calculatedIsPast ? (
						<span className="text-[11px] text-text-subtle italic">
							Past lectures cannot be shifted.
						</span>
					) : (
						<div>
							{isShiftAllowed && (
								<Button
									variant="primary"
									size="sm"
									onClick={() => {
										onClose();
										onShiftClick?.();
									}}
									className="cursor-pointer text-xs gap-1.5"
								>
									<Edit size={12} />
									Shift / Reschedule
								</Button>
							)}
						</div>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						className="cursor-pointer text-xs"
					>
						Close
					</Button>
				</div>
			}
		>
			<div className="space-y-4 pt-1">
				{/* Past Lecture Banner */}
				{calculatedIsPast && (
					<div className="p-3.5 rounded-xl border bg-surface-raised/40 border-border/70 flex items-start gap-3">
						<Clock size={18} className="text-text-muted shrink-0 mt-0.5" />
						<div className="space-y-1 text-xs">
							<div className="font-bold text-text-main flex items-center gap-2">
								<span>Past Lecture Occurrence</span>
								{dateStr && (
									<span className="text-[10px] font-mono text-text-subtle font-normal">
										({dateStr})
									</span>
								)}
							</div>
							<p className="text-[11px] text-text-muted leading-relaxed">
								This lecture took place on{" "}
								<strong className="text-text-main font-semibold">
									{dayOfWeek || "scheduled day"}
									{dateStr ? ` (${dateStr})` : ""}
								</strong>{" "}
								from {startTime?.slice(0, 5)} to {endTime?.slice(0, 5)}.
							</p>
							<div className="pt-0.5 text-[11px] font-medium text-amber-400/90">
								Past lectures cannot be shifted or rescheduled.
							</div>
						</div>
					</div>
				)}

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
									? `Hard Constraint Conflict Detected (${
											conflicts.length || 1
										} issue)`
									: `Soft Constraint Notice (${conflicts.length || 1} issue)`}
							</div>
							<p className="text-[11px] text-text-muted leading-relaxed">
								{hasHardConflicts
									? "This live lecture schedule conflicts with another assignment or exceeds room constraints. Review diagnostics below."
									: "This lecture schedule has capacity or soft allocation notices."}
							</p>
						</div>
					</div>
				) : !calculatedIsPast ? (
					<div className="p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20 flex items-center gap-3">
						<CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
						<div>
							<div className="text-xs font-bold text-text-main">
								Optimal Schedule - No Conflicts
							</div>
							<p className="text-[11px] text-text-muted">
								This lecture satisfies all time, venue, lecturer, and cohort
								constraints.
							</p>
						</div>
					</div>
				) : null}

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

							{conflicts.length === 0 && session?.conflictReason && (
								<div className="p-3 rounded-xl border text-xs space-y-1 bg-red-500/5 border-red-500/30 text-text-main">
									<div className="flex items-center gap-1.5 font-bold text-red-400">
										<Badge
											variant="danger"
											className="text-[9px] py-0 px-1 font-mono uppercase"
										>
											COLLISION
										</Badge>
										<span>Schedule Conflict</span>
									</div>
									<p className="text-[11px] text-text-muted leading-relaxed">
										{session.conflictReason}
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Lecture Details Grid */}
				<div className="space-y-2 pt-1">
					<div className="text-xs font-bold uppercase tracking-wider text-text-muted">
						Lecture Schedule Details
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
						{/* Slot */}
						<div className="p-2.5 rounded-xl bg-surface-raised border border-border space-y-1">
							<div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium">
								<Clock size={13} className="text-primary" />
								<span>Time & Day</span>
							</div>
							<div className="font-bold text-text-main flex items-center gap-1.5">
								<span>{dayOfWeek || "Weekly Lecture"}</span>
								{dateStr && (
									<span className="text-[10px] font-mono text-text-subtle">
										({dateStr})
									</span>
								)}
							</div>
							<div className="text-[11px] text-text-muted font-mono">
								{startTime?.slice(0, 5)} - {endTime?.slice(0, 5)}
							</div>
						</div>

						{/* Venue */}
						<div className="p-2.5 rounded-xl bg-surface-raised border border-border space-y-1">
							<div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium">
								<Building2 size={13} className="text-primary" />
								<span>Venue Allocation</span>
							</div>
							<div className="font-bold text-text-main truncate">
								{venueName}
							</div>
							<div className="text-[11px] text-text-muted flex items-center gap-1">
								<Maximize2 size={11} />
								<span>
									Capacity:{" "}
									{venueCapacity ? `${venueCapacity} seats` : "Standard Room"}
								</span>
							</div>
						</div>

						{/* Lecturers */}
						<div className="p-2.5 rounded-xl bg-surface-raised border border-border space-y-1">
							<div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium">
								<User size={13} className="text-primary" />
								<span>Assigned Lecturer(s)</span>
							</div>
							<div className="font-bold text-text-main truncate">
								{lecturersList.length > 0
									? lecturersList.join(", ")
									: "No Lecturer Assigned"}
							</div>
							<div className="text-[11px] text-text-muted">
								Staff allocation count: {lecturersList.length}
							</div>
						</div>

						{/* Cohort & Department */}
						<div className="p-2.5 rounded-xl bg-surface-raised border border-border space-y-1">
							<div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium">
								<GraduationCap size={13} className="text-primary" />
								<span>Degree Cohort</span>
							</div>
							<div className="font-bold text-text-main truncate">
								{cohortName}
							</div>
							<div className="text-[11px] text-text-muted flex items-center gap-1">
								<Users size={11} />
								<span>
									Level: {courseLevel ? `${courseLevel}L` : "All"}
									{expectedStudents ? ` • ${expectedStudents} students` : ""}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}
