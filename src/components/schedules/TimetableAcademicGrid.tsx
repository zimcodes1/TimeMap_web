import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Plus,
	AlertTriangle,
	ShieldAlert,
	MapPin,
	User,
	Clock,
} from "lucide-react";
import type {
	TimetableEntry,
	LectureSession,
	GenerationConflictReport,
} from "@/types";
import type { WeekDayInfo } from "@/utils/semesterWeeks";
import { resolveLiveEntryConflicts } from "./liveConflictResolver";
import { LiveEntryDetailModal } from "./LiveEntryDetailModal";
import type { AssociatedConflict } from "@/components/schedules/generator/ScheduleConflictDetailModal";

export interface TimeSlot {
	id: string;
	label: string;
	start: string;
	end: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TIME_SLOTS: TimeSlot[] = [
	{ id: "slot-1", label: "08:00 - 10:00", start: "08:00:00", end: "10:00:00" },
	{ id: "slot-2", label: "10:00 - 12:00", start: "10:00:00", end: "12:00:00" },
	{ id: "slot-3", label: "12:00 - 14:00", start: "12:00:00", end: "14:00:00" },
	{ id: "slot-4", label: "14:00 - 16:00", start: "14:00:00", end: "16:00:00" },
	{ id: "slot-5", label: "16:00 - 18:00", start: "16:00:00", end: "18:00:00" },
];

const DEFAULT_DAYS: Array<
	"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"
> = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TimetableAcademicGridProps {
	entries: TimetableEntry[];
	sessions?: LectureSession[];
	selectedDepartmentId?: string | number;
	selectedProgramId?: string | number;
	selectedLevel?: number;
	searchQuery?: string;
	conflictReport?: GenerationConflictReport;
	weekDayDates?: WeekDayInfo[];
	onOpenCreateEntry?: (
		defaultDay?: string,
		defaultSlot?: TimeSlot,
		defaultDate?: string,
	) => void;
	onSelectEntry?: (
		entry: TimetableEntry,
		conflicts: AssociatedConflict[],
	) => void;
	onShiftSessionTrigger?: (session: LectureSession) => void;
	onCancelSessionTrigger?: (session: LectureSession) => void;
}

export function TimetableAcademicGrid({
	entries,
	sessions = [],
	selectedProgramId,
	selectedLevel,
	searchQuery = "",
	conflictReport,
	weekDayDates,
	onOpenCreateEntry,
	onSelectEntry,
	onShiftSessionTrigger,
	onCancelSessionTrigger,
}: TimetableAcademicGridProps) {
	// Selected entry and session for modal view
	const [activeModalEntry, setActiveModalEntry] =
		useState<TimetableEntry | null>(null);
	const [activeModalSession, setActiveModalSession] =
		useState<LectureSession | null>(null);
	const [activeModalConflicts, setActiveModalConflicts] = useState<
		AssociatedConflict[]
	>([]);
	const [activeModalIsPast, setActiveModalIsPast] = useState(false);
	const [activeModalDate, setActiveModalDate] = useState("");
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

	const now = new Date();
	const todayDateStr = `${now.getFullYear()}-${String(
		now.getMonth() + 1,
	).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
		now.getMinutes(),
	).padStart(2, "0")}:00`;

	// Filter entries by department, program, level, and search query
	const displayedEntries = useMemo(() => {
		return entries.filter((entry) => {
			const isEvent = entry.entryType === "event" || entry.type === "event";

			// Level filter (events are visible to everyone)
			if (
				!isEvent &&
				selectedLevel &&
				entry.courseLevel &&
				entry.courseLevel !== selectedLevel
			) {
				return false;
			}

			// Program filter (events are visible to everyone)
			if (!isEvent && selectedProgramId && selectedProgramId !== "ALL") {
				if (
					entry.targetProgramId &&
					String(entry.targetProgramId) !== String(selectedProgramId)
				) {
					// Exclude if explicitly targeted to another program
					return false;
				}
			}

			// Search query filter
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchCode = entry.courseCode?.toLowerCase().includes(q);
				const matchTitle = (entry.title || entry.courseTitle)
					?.toLowerCase()
					.includes(q);
				const matchVenue = entry.venueName?.toLowerCase().includes(q);
				const matchLecturer = entry.lecturerName?.toLowerCase().includes(q);
				if (!matchCode && !matchTitle && !matchVenue && !matchLecturer) {
					return false;
				}
			}

			return true;
		});
	}, [entries, selectedProgramId, selectedLevel, searchQuery]);

	// Helper to test if entry overlaps a 2-hour slot
	const isOverlapping = (
		entryStart: string,
		entryEnd: string,
		slotStart: string,
		slotEnd: string,
	) => {
		const norm = (t: string) => {
			if (!t) return "00:00:00";
			const parts = t.split(":");
			if (parts.length === 2) return `${t}:00`;
			return t;
		};
		return norm(entryStart) < norm(slotEnd) && norm(entryEnd) > norm(slotStart);
	};

	// Build rows using weekDayDates if provided
	const rowDays = useMemo(() => {
		if (weekDayDates && weekDayDates.length > 0) {
			return weekDayDates.map((item) => ({
				dayName: item.day,
				label: item.dayWithDate,
				dateStr: item.dateStr,
				isToday: item.dateStr === todayDateStr,
			}));
		}
		return DEFAULT_DAYS.map((d) => ({
			dayName: d,
			label: d,
			dateStr: "",
			isToday: false,
		}));
	}, [weekDayDates, todayDateStr]);

	const handleCardClick = (
		entry: TimetableEntry,
		conflicts: AssociatedConflict[],
		isPastLecture: boolean,
		dateStr: string,
		matchingSession?: LectureSession | null,
	) => {
		setActiveModalEntry(entry);
		setActiveModalSession(matchingSession || null);
		setActiveModalConflicts(conflicts);
		setActiveModalIsPast(isPastLecture);
		setActiveModalDate(dateStr);
		setIsDetailModalOpen(true);
		onSelectEntry?.(entry, conflicts);
	};

	return (
		<div className="space-y-4">
			{/* Timetable Academic Matrix Table */}
			<div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs scrollbar-thin">
				<table className="w-full border-collapse text-left min-w-240">
					<thead>
						<tr className="border-b border-border bg-surface-raised/60">
							<th className="p-3.5 text-xs font-bold uppercase tracking-wider text-text-muted w-44 border-r border-border">
								Day & Date
							</th>
							{TIME_SLOTS.map((slot) => (
								<th
									key={slot.id}
									className="p-3.5 text-xs font-bold text-center text-text-main border-r border-border last:border-r-0 min-w-41.25"
								>
									<div className="font-extrabold text-xs">{slot.label}</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rowDays.map(({ dayName, label, dateStr, isToday }) => {
							const isFriday = dayName.toLowerCase() === "friday";

							return (
								<tr
									key={dayName}
									className="border-b border-border last:border-b-0 hover:bg-surface-raised/30 transition-colors"
								>
									<td className="p-3.5 font-bold text-xs text-text-main border-r border-border bg-surface-raised/40 align-top">
										<div className="flex items-center gap-1.5 flex-wrap">
											<span className="text-text-main font-bold whitespace-nowrap">
												{label}
											</span>
											{isToday && (
												<Badge
													variant="primary"
													className="text-[9px] font-bold py-0.2 px-1.5"
												>
													Today
												</Badge>
											)}
										</div>
									</td>
									{TIME_SLOTS.map((slot) => {
										const isFridayJummat = isFriday && slot.id === "slot-3";

										// 1. Sessions on this date in this slot
										const sessionsOnDate = dateStr
											? sessions.filter((s) => s.date === dateStr)
											: [];

										const sessionsInSlot = sessionsOnDate.filter((s) =>
											isOverlapping(
												s.startTime,
												s.endTime,
												slot.start,
												slot.end,
											),
										);

										// 2. Base entries scheduled for this day of the week in this slot
										const templateEntriesInSlot = displayedEntries.filter(
											(e) => {
												if (e.entryType === "event") {
													return (
														Boolean(
															dateStr && e.recurrenceStartDate === dateStr,
														) &&
														isOverlapping(
															e.startTime,
															e.endTime,
															slot.start,
															slot.end,
														)
													);
												}
												return (
													e.dayOfWeek?.toLowerCase() ===
														dayName.toLowerCase() &&
													isOverlapping(
														e.startTime,
														e.endTime,
														slot.start,
														slot.end,
													)
												);
											},
										);

										// Entries whose session on this date was shifted away from this slot
										const entriesShiftedAwayFromSlot = templateEntriesInSlot
											.map((e) => {
												const s = sessionsOnDate.find(
													(sess) =>
														sess.entryId === e.id ||
														sess.timetableEntryId === e.id,
												);
												if (
													s &&
													s.status === "shifted" &&
													!isOverlapping(
														s.startTime,
														s.endTime,
														slot.start,
														slot.end,
													)
												) {
													return { entry: e, session: s };
												}
												return null;
											})
											.filter(
												(
													item,
												): item is {
													entry: TimetableEntry;
													session: LectureSession;
												} => item !== null,
											);

										// Active items to render in this slot
										interface ActiveSlotItem {
											key: string;
											entry: TimetableEntry;
											session: LectureSession | null;
										}

										const activeSlotItems: ActiveSlotItem[] = [];

										// Add sessions in this slot
										sessionsInSlot.forEach((s) => {
											const matchingEntry = displayedEntries.find(
												(e) =>
													e.id === s.entryId || e.id === s.timetableEntryId,
											);
											const entry = matchingEntry || {
												id:
													s.entryId || s.timetableEntryId || `session-${s.id}`,
												entryType: s.entryType || "lecture",
												title: s.courseTitle,
												type: s.entryType || "lecture",
												courseCode: s.courseCode,
												courseTitle: s.courseTitle,
												courseLevel: s.courseLevel,
												courseType: s.courseType,
												departmentId: s.departmentId,
												departmentName: s.departmentName,
												facultyId: s.facultyId,
												facultyName: s.facultyName,
												lecturerName: s.lecturerName,
												lecturers: s.lecturers,
												venueId: s.venueId,
												venueName: s.venueName,
												venueCapacity: s.venueCapacity,
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												dayOfWeek: dayName as any,
												startTime: s.startTime,
												endTime: s.endTime,
												targetProgramName: s.programName,
											};
											activeSlotItems.push({
												key: `session-${s.id}`,
												entry,
												session: s,
											});
										});

										// Add template entries in this slot that don't have a materialized session
										templateEntriesInSlot.forEach((e) => {
											const hasSessionOnDate = sessionsOnDate.some(
												(s) =>
													s.entryId === e.id || s.timetableEntryId === e.id,
											);
											if (!hasSessionOnDate) {
												activeSlotItems.push({
													key: `entry-${e.id}`,
													entry: e,
													session: null,
												});
											}
										});

										const hasAnyContent =
											activeSlotItems.length > 0 ||
											entriesShiftedAwayFromSlot.length > 0;

										return (
											<td
												key={slot.id}
												className="p-2 border-r border-border last:border-r-0 align-top min-h-28 h-28"
											>
												{hasAnyContent ? (
													<div className="space-y-1.5 h-full">
														{/* Active items in this slot */}
														{activeSlotItems.map(
															({ key, entry, session: matchingSession }) => {
																const matchingEntriesForConflicts =
																	activeSlotItems.map((item) => item.entry);
																const conflicts = resolveLiveEntryConflicts(
																	entry,
																	displayedEntries,
																	conflictReport,
																	matchingEntriesForConflicts,
																);
																const hasHard = conflicts.some(
																	(c) => c.severity === "hard",
																);
																const hasSoft = conflicts.some(
																	(c) => c.severity === "soft",
																);
																const isPractical =
																	(entry.courseType || "").toLowerCase() ===
																	"practical";

																const isShifted =
																	matchingSession?.status === "shifted";
																const isEvent =
																	entry.entryType === "event" ||
																	entry.type === "event" ||
																	matchingSession?.entryType === "event";

																// Session date & time for past calculation
																const sessionDate =
																	matchingSession?.date || dateStr;
																const sessionEndTime =
																	matchingSession?.endTime || entry.endTime;
																const isPastLecture =
																	Boolean(sessionDate) &&
																	(sessionDate < todayDateStr ||
																		(sessionDate === todayDateStr &&
																			Boolean(
																				sessionEndTime &&
																				sessionEndTime < currentTimeStr,
																			)));

																return (
																	<div
																		key={key}
																		onClick={() =>
																			handleCardClick(
																				entry,
																				conflicts,
																				isPastLecture,
																				dateStr,
																				matchingSession,
																			)
																		}
																		className={`p-2.5 rounded-xl text-xs space-y-1 border shadow-2xs transition-all cursor-pointer ${
																			isEvent
																				? "bg-purple-500/15 border-purple-500/10 hover:border-purple-500 hover:bg-purple-500/25 text-text-main"
																				: hasHard
																					? "bg-red-500/15 border-red-500/40 hover:border-red-500 hover:bg-red-500/25 ring-1 ring-red-500/40 text-text-main"
																					: hasSoft
																						? "bg-amber-500/15 border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/25 ring-1 ring-amber-500/30 text-text-main"
																						: isShifted
																							? "bg-amber-500/10 border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/20 ring-1 ring-amber-500/30 text-text-main"
																							: isPastLecture
																								? "bg-surface-raised/40 border-border/70 hover:border-border hover:bg-surface-raised/60 text-text-muted opacity-80"
																								: "bg-primary/10 border-primary/20 hover:border-primary/40 hover:bg-primary/15 text-text-main"
																		}`}
																		title={
																			isEvent
																				? `Academic Event: ${entry.title || entry.courseTitle} at ${matchingSession?.venueName || entry.venueName}. Click to inspect details.`
																				: isShifted
																					? `Shifted session: now in ${matchingSession?.venueName || entry.venueName} at ${matchingSession?.startTime?.slice(0, 5)} - ${matchingSession?.endTime?.slice(0, 5)}. Click to inspect details.`
																					: isPastLecture
																						? "Past lecture session (cannot be shifted). Click to view details."
																						: hasHard
																							? "Hard timetable conflict! Click to inspect diagnostics."
																							: hasSoft
																								? "Capacity or soft notice. Click to inspect details."
																								: "Optimal schedule. Click to inspect details."
																		}
																	>
																		<div className="flex items-center justify-between gap-1">
																			<div className="flex items-center gap-1.5 min-w-0">
																				<span
																					className={`font-extrabold tracking-tight truncate ${
																						isEvent
																							? "text-purple-400"
																							: hasHard
																								? "text-red-400"
																								: hasSoft
																									? "text-amber-400"
																									: isShifted
																										? "text-amber-300"
																										: isPastLecture
																											? "text-text-muted"
																											: "text-primary"
																					}`}
																				>
																					{isEvent
																						? entry.title ||
																							entry.courseTitle ||
																							"Event"
																						: entry.courseCode}
																				</span>
																				{isEvent && (
																					<span className="shrink-0 text-[9px] font-semibold px-1 py-0.2 rounded bg-purple-500/20 text-purple-500  border-purple-500/40">
																						Event
																					</span>
																				)}
																				{isShifted && (
																					<span className="shrink-0 text-[9px] font-semibold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
																						Shifted
																					</span>
																				)}
																				{isPastLecture && (
																					<span className="shrink-0 text-[9px] font-semibold px-1 py-0.2 rounded bg-surface-raised text-text-subtle border border-border/60">
																						Past
																					</span>
																				)}
																			</div>
																			{hasHard ? (
																				<ShieldAlert
																					size={13}
																					className="text-red-400 shrink-0"
																				/>
																			) : hasSoft ? (
																				<AlertTriangle
																					size={13}
																					className="text-amber-400 shrink-0"
																				/>
																			) : null}
																		</div>

																		<div
																			className="text-[11px] font-medium text-text-main truncate"
																			title={
																				isEvent
																					? entry.title || entry.courseTitle
																					: entry.courseTitle
																			}
																		>
																			{isEvent
																				? entry.targetProgramName
																					? `${entry.targetProgramName} ${entry.targetLevel ? `• ${entry.targetLevel === 999 || String(entry.targetLevel) === "999" ? "Final Year" : `${entry.targetLevel}L`}` : ""}`
																					: `All Programs • ${entry.targetLevel === 999 || String(entry.targetLevel) === "999" ? "Final Year" : entry.targetLevel ? `${entry.targetLevel}L` : "General"}`
																				: entry.courseTitle}
																		</div>

																		<div className="flex items-center gap-1 text-[10px] text-text-muted truncate">
																			<MapPin
																				size={10}
																				className={`shrink-0 ${isShifted ? "text-amber-400" : "text-text-subtle"}`}
																			/>
																			<span
																				className={`truncate ${isShifted ? "text-amber-300 font-medium" : ""}`}
																			>
																				{matchingSession?.venueName ||
																					entry.venueName}
																			</span>
																		</div>

																		{matchingSession &&
																			(isShifted ||
																				(matchingSession.startTime &&
																					matchingSession.startTime !==
																						entry.startTime)) && (
																				<div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium truncate">
																					<Clock
																						size={10}
																						className="shrink-0"
																					/>
																					<span>
																						{matchingSession.startTime.slice(
																							0,
																							5,
																						)}{" "}
																						-{" "}
																						{matchingSession.endTime.slice(
																							0,
																							5,
																						)}
																					</span>
																				</div>
																			)}
																		{matchingSession?.entryType !== "event" &&
																			(matchingSession?.lecturerName ||
																				entry.lecturerName) && (
																				<div className="flex items-center gap-1 text-[10px] text-text-muted truncate">
																					<User
																						size={10}
																						className="shrink-0 text-text-subtle"
																					/>
																					<span className="truncate">
																						{matchingSession?.lecturerName ||
																							entry.lecturerName}
																					</span>
																				</div>
																			)}

																		<div className="flex items-center gap-1 pt-0.5">
																			{entry.courseLevel && (
																				<span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-surface-raised border border-border text-text-muted">
																					{entry.courseLevel}L
																				</span>
																			)}
																			{isPractical && (
																				<Badge
																					variant="secondary"
																					className="text-[9px] py-0 px-1 bg-amber-500/5 text-amber-300 border-amber-500/30"
																				>
																					Lab
																				</Badge>
																			)}
																			{entry.targetProgramName && (
																				<Badge
																					variant="primary"
																					className="text-[9px] py-0 px-1 truncate max-w-27.5"
																				>
																					{entry.targetProgramName}
																				</Badge>
																			)}
																		</div>
																	</div>
																);
															},
														)}

														{/* Vacated notices for entries shifted to another slot */}
														{entriesShiftedAwayFromSlot.map(
															({
																entry: vacatedEntry,
																session: movedSession,
															}) => (
																<div
																	key={`vacated-${vacatedEntry.id}`}
																	onClick={() =>
																		handleCardClick(
																			vacatedEntry,
																			[],
																			Boolean(
																				dateStr && dateStr < todayDateStr,
																			),
																			dateStr,
																			movedSession,
																		)
																	}
																	className="p-2 rounded-xl text-xs space-y-0.5 border border-dashed border-amber-500/30 bg-surface-raised/20 opacity-80 hover:opacity-100 transition-all cursor-pointer"
																	title={`Shifted to ${movedSession.startTime.slice(0, 5)} - ${movedSession.endTime.slice(0, 5)} at ${movedSession.venueName}. Click to inspect details.`}
																>
																	<div className="flex items-center justify-between gap-1">
																		<span className="font-bold text-text-muted line-through truncate">
																			{vacatedEntry.courseCode}
																		</span>
																		<span className="shrink-0 text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
																			Shifted →{" "}
																			{movedSession.startTime.slice(0, 5)}
																		</span>
																	</div>
																	<div className="text-[10px] text-text-subtle truncate">
																		Now at{" "}
																		{movedSession.venueName || "new venue"}
																	</div>
																</div>
															),
														)}
													</div>
												) : isFridayJummat ? (
													<div className="h-full min-h-20 rounded-xl border border-dashed border-border/60 bg-surface-raised/20 flex flex-col items-center justify-center p-2 text-center">
														<Clock
															size={13}
															className="text-text-muted mb-0.5"
														/>
														<span className="text-[10px] font-semibold text-text-muted">
															Jummat Break
														</span>
														<span className="text-[9px] text-text-subtle">
															12:00 - 14:00
														</span>
													</div>
												) : (
													<button
														type="button"
														onClick={() =>
															onOpenCreateEntry?.(dayName, slot, dateStr)
														}
														className="w-full h-full min-h-20 rounded-xl border border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center transition-colors cursor-pointer group"
														title={`Schedule lecture for ${dayName} ${slot.label}`}
													>
														<Plus
															size={15}
															className="text-text-subtle group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
														/>
													</button>
												)}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Entry Details & Conflict Modal */}
			<LiveEntryDetailModal
				isOpen={isDetailModalOpen}
				onClose={() => {
					setIsDetailModalOpen(false);
					setActiveModalEntry(null);
					setActiveModalSession(null);
				}}
				entry={activeModalEntry}
				session={activeModalSession}
				conflicts={activeModalConflicts}
				isPast={activeModalIsPast}
				date={activeModalDate}
				canShift={
					activeModalSession || activeModalEntry
						? activeModalSession?.canShift !== false && !activeModalIsPast
						: false
				}
				onShiftClick={
					onShiftSessionTrigger
						? () => {
								const targetSession =
									activeModalSession ||
									sessions.find(
										(s) =>
											s.entryId === activeModalEntry?.id ||
											s.timetableEntryId === activeModalEntry?.id,
									);
								if (targetSession) {
									onShiftSessionTrigger(targetSession);
								}
							}
						: undefined
				}
				canCancel={
					activeModalSession || activeModalEntry
						? activeModalSession?.status !== "cancelled" && !activeModalIsPast
						: false
				}
				onCancelClick={
					onCancelSessionTrigger
						? () => {
								const targetSession =
									activeModalSession ||
									sessions.find(
										(s) =>
											s.entryId === activeModalEntry?.id ||
											s.timetableEntryId === activeModalEntry?.id,
									);
								if (targetSession) {
									onCancelSessionTrigger(targetSession);
								}
							}
						: undefined
				}
			/>
		</div>
	);
}
