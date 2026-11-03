import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
	MapPin,
	Users,
	Clock,
	Plus,
	AlertTriangle,
	CheckCircle2,
} from "lucide-react";
import type { TimetableEntry, LectureSession, ExamSitting } from "@/types";
import type { WeekDayInfo } from "@/utils/semesterWeeks";

export interface ExamTimeSlot {
	id: string;
	label: string;
	start: string;
	end: string;
}

export const EXAM_TIME_SLOTS: ExamTimeSlot[] = [
	{ id: "slot-1", label: "08:00 - 10:00", start: "08:00:00", end: "10:00:00" },
	{ id: "slot-2", label: "10:00 - 12:00", start: "10:00:00", end: "12:00:00" },
	{ id: "slot-3", label: "12:00 - 14:00", start: "12:00:00", end: "14:00:00" },
	{ id: "slot-4", label: "14:00 - 16:00", start: "14:00:00", end: "16:00:00" },
	{ id: "slot-5", label: "16:00 - 18:00", start: "16:00:00", end: "18:00:00" },
];

const DEFAULT_DAYS: Array<
	"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"
> = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ExamWeeklyGridProps {
	entries: TimetableEntry[];
	sessions?: LectureSession[];
	examSittings?: ExamSitting[];
	weekDayDates?: WeekDayInfo[];
	onOpenCreateExam?: (
		defaultDay?: string,
		defaultDate?: string,
		defaultSlot?: { start: string; end: string },
	) => void;
	onSelectEntry?: (entry: TimetableEntry) => void;
	onOpenAssignInvigilators?: (entry: TimetableEntry) => void;
	isSchedulingDisabled?: boolean;
}

export function ExamWeeklyGrid({
	entries = [],
	sessions = [],
	examSittings = [],
	weekDayDates = [],
	onOpenCreateExam,
	onSelectEntry,
	onOpenAssignInvigilators,
	isSchedulingDisabled = false,
}: ExamWeeklyGridProps) {
	const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

	// Map of timetable entry ID to ExamSitting
	const sittingByEntryId = useMemo(() => {
		const map = new Map<string, ExamSitting>();
		examSittings.forEach((s) => {
			if (s.timetableEntryId) {
				map.set(String(s.timetableEntryId), s);
			}
		});
		return map;
	}, [examSittings]);

	// Match items by Day and Slot
	// Because multiple groups can have exams at the same time and place across weeks
	const getExamsForSlot = (dayName: string, dateStr: string | undefined, slot: ExamTimeSlot) => {
		const matched: Array<{
			id: string;
			entry: TimetableEntry;
			session?: LectureSession;
			sitting?: ExamSitting;
			isClashingVenue?: boolean;
		}> = [];

		const slotStartH = parseInt(slot.start.slice(0, 2), 10);
		const slotEndH = parseInt(slot.end.slice(0, 2), 10);

		// 1. First check materialized dated sessions if present
		if (dateStr && sessions.length > 0) {
			sessions.forEach((sess) => {
				if (sess.date === dateStr) {
					const sH = parseInt(sess.startTime.slice(0, 2), 10);
					if (sH >= slotStartH && sH < slotEndH) {
						const parentEntry = entries.find(
							(e) => String(e.id) === String(sess.entryId || sess.timetableEntryId),
						);
						if (parentEntry) {
							const sitting = sittingByEntryId.get(String(parentEntry.id));
							matched.push({
								id: sess.id,
								entry: parentEntry,
								session: sess,
								sitting,
							});
						}
					}
				}
			});
		}

		// 2. Also match timetable entries that match dayOfWeek or recurrence_start_date
		entries.forEach((ent) => {
			const eH = parseInt(ent.startTime.slice(0, 2), 10);
			if (eH >= slotStartH && eH < slotEndH) {
				// Match either exact date if entry has a specific date
				const matchesDate = dateStr && ent.recurrenceStartDate === dateStr;
				// Or matches day name
				const matchesDay = ent.dayOfWeek?.toLowerCase() === dayName.toLowerCase();

				if (matchesDate || (!ent.recurrenceStartDate && matchesDay)) {
					// Avoid duplicates if session already matched
					const alreadyAdded = matched.some(
						(m) => String(m.entry.id) === String(ent.id),
					);
					if (!alreadyAdded) {
						const sitting = sittingByEntryId.get(String(ent.id));
						matched.push({
							id: ent.id,
							entry: ent,
							sitting,
						});
					}
				}
			}
		});

		// Check for venue sharing in this slot
		const venueCounts = new Map<string, number>();
		matched.forEach((m) => {
			const vName = m.entry.venueName || "Venue";
			venueCounts.set(vName, (venueCounts.get(vName) || 0) + 1);
		});
		matched.forEach((m) => {
			const vName = m.entry.venueName || "Venue";
			if ((venueCounts.get(vName) || 0) > 1) {
				m.isClashingVenue = true;
			}
		});

		return matched;
	};

	return (
		<div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left text-xs min-w-[950px]">
					{/* Header Row: Days and Calendar Dates */}
					<thead>
						<tr className="border-b border-border bg-surface-raised/80">
							<th className="w-28 p-3 text-center font-bold text-text-muted border-r border-border uppercase tracking-wider text-[11px]">
								Time Slot
							</th>
							{DEFAULT_DAYS.map((day, idx) => {
								const dayDate = weekDayDates[idx];
								const isToday = dayDate?.dateStr === todayStr;
								return (
									<th
										key={day}
										className={`p-3 font-semibold border-r border-border last:border-r-0 transition-colors ${
											isToday
												? "bg-primary/10 text-primary"
												: "text-text-main"
										}`}
									>
										<div className="flex flex-col items-center justify-center">
											<span className="font-bold text-xs uppercase tracking-wider">
												{day}
											</span>
											{dayDate && (
												<span
													className={`text-[11px] mt-0.5 font-medium px-2 py-0.5 rounded-full ${
														isToday
															? "bg-primary text-white font-bold"
															: "text-text-muted"
													}`}
												>
													{dayDate.formattedDate}
												</span>
											)}
										</div>
									</th>
								);
							})}
						</tr>
					</thead>

					{/* Body Rows: Time Slots */}
					<tbody className="divide-y divide-border">
						{EXAM_TIME_SLOTS.map((slot) => (
							<tr key={slot.id} className="hover:bg-surface-raised/30 transition-colors">
								{/* Time Column */}
								<td className="p-3 text-center font-semibold text-text-muted border-r border-border bg-surface-raised/40 align-top">
									<div className="flex flex-col items-center justify-center gap-1 sticky top-0">
										<Clock size={13} className="text-text-muted" />
										<span className="text-[11px] font-bold text-text-main">
											{slot.label}
										</span>
									</div>
								</td>

								{/* Days Columns */}
								{DEFAULT_DAYS.map((day, idx) => {
									const dayDate = weekDayDates[idx];
									const slotExams = getExamsForSlot(day, dayDate?.dateStr, slot);
									const isToday = dayDate?.dateStr === todayStr;

									return (
										<td
											key={day}
											className={`p-2 border-r border-border last:border-r-0 align-top transition-colors min-h-[110px] ${
												isToday ? "bg-primary/[0.02]" : ""
											}`}
										>
											<div className="space-y-2 min-h-[90px] flex flex-col justify-between">
												{/* Scheduled Exams in this slot */}
												{slotExams.length > 0 ? (
													<div className="space-y-2">
														{slotExams.map(({ id, entry, sitting, isClashingVenue }) => {
															const hasInvigilators = Boolean(
																sitting && sitting.invigilators && sitting.invigilators.length > 0,
															);
															const invigCount = sitting?.invigilators?.length ?? 0;

															return (
																<div
																	key={id}
																	onClick={() => onSelectEntry?.(entry)}
																	className={`p-2.5 rounded-xl border transition-all cursor-pointer relative group ${
																		isClashingVenue
																			? "bg-amber-500/10 border-amber-500/40 text-amber-200"
																			: "bg-surface-raised/90 border-border hover:border-primary/50 hover:bg-surface-raised"
																	}`}
																>
																	{/* Card Header: Code & Badges */}
																	<div className="flex items-start justify-between gap-1 mb-1">
																		<span className="font-bold text-xs text-text-main group-hover:text-primary transition-colors">
																			{entry.courseCode || entry.title}
																		</span>
																		<div className="flex items-center gap-1 shrink-0">
																			{entry.courseLevel && (
																				<Badge
																					variant="secondary"
																					className="text-[9px] py-0 px-1 font-bold"
																				>
																					{entry.courseLevel}L
																				</Badge>
																			)}
																			{isClashingVenue && (
																				<Badge
																					variant="outline"
																					className="text-[9px] py-0 px-1 border-amber-500/50 text-amber-400 gap-0.5"
																				>
																					<AlertTriangle size={9} />
																					<span>Shared</span>
																				</Badge>
																			)}
																		</div>
																	</div>

																	{/* Course Title */}
																	<p className="text-[11px] text-text-muted line-clamp-1 mb-2 font-medium">
																		{entry.courseTitle || entry.title}
																	</p>

																	{/* Venue & Capacity */}
																	<div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border/40">
																		<div className="flex items-center gap-1 font-semibold text-text-main truncate max-w-[130px]">
																			<MapPin size={10} className="shrink-0 text-primary" />
																			<span className="truncate">{entry.venueName || "Venue TBA"}</span>
																		</div>
																		{entry.venueCapacity && (
																			<span className="shrink-0 text-text-muted">
																				Cap: {entry.venueCapacity}
																			</span>
																		)}
																	</div>

																	{/* Invigilators Status / Action */}
																	<div className="mt-1.5 flex items-center justify-between pt-1 border-t border-border/30">
																		<div className="flex items-center gap-1 text-[10px]">
																			{hasInvigilators ? (
																				<span className="text-emerald-400 flex items-center gap-1 font-medium">
																					<CheckCircle2 size={10} />
																					<span>{invigCount} Invigilator{invigCount > 1 ? "s" : ""}</span>
																				</span>
																			) : (
																				<span className="text-text-muted flex items-center gap-1">
																					<Users size={10} />
																					<span>No invigilators</span>
																				</span>
																			)}
																		</div>

																		{onOpenAssignInvigilators && (
																			<button
																				type="button"
																				onClick={(e) => {
																					e.stopPropagation();
																					onOpenAssignInvigilators(entry);
																				}}
																				className="text-[10px] text-primary hover:underline font-semibold cursor-pointer shrink-0"
																			>
																				Assign
																			</button>
																		)}
																	</div>
																</div>
															);
														})}
													</div>
												) : null}

												{/* Empty Slot Button to Schedule */}
												{!isSchedulingDisabled && onOpenCreateExam && (
													<button
														type="button"
														onClick={() =>
															onOpenCreateExam(
																day,
																dayDate?.dateStr,
																{ start: slot.start, end: slot.end },
															)
														}
														className="w-full py-1 px-2 rounded-lg border border-dashed border-border/60 text-text-muted/60 hover:text-primary hover:border-primary/40 hover:bg-primary/[0.04] transition-all flex items-center justify-center gap-1 text-[10px] cursor-pointer mt-auto"
													>
														<Plus size={10} />
														<span>Schedule</span>
													</button>
												)}
											</div>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
