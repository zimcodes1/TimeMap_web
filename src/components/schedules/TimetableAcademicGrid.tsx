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
import type { TimetableEntry, GenerationConflictReport } from "@/types";
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
	selectedDepartmentId?: string | number;
	selectedProgramId?: string | number;
	selectedLevel?: number;
	searchQuery?: string;
	conflictReport?: GenerationConflictReport;
	weekDayDates?: WeekDayInfo[];
	onOpenCreateEntry?: (defaultDay?: string, defaultSlot?: TimeSlot) => void;
	onSelectEntry?: (
		entry: TimetableEntry,
		conflicts: AssociatedConflict[],
	) => void;
}

export function TimetableAcademicGrid({
	entries,
	selectedDepartmentId,
	selectedProgramId,
	selectedLevel,
	searchQuery = "",
	conflictReport,
	weekDayDates,
	onOpenCreateEntry,
	onSelectEntry,
}: TimetableAcademicGridProps) {
	// Selected entry for modal view
	const [activeModalEntry, setActiveModalEntry] =
		useState<TimetableEntry | null>(null);
	const [activeModalConflicts, setActiveModalConflicts] = useState<
		AssociatedConflict[]
	>([]);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

	const today = new Date();
	const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	// Filter entries by department, program, level, and search query
	const displayedEntries = useMemo(() => {
		return entries.filter((entry) => {
			// Level filter
			if (
				selectedLevel &&
				entry.courseLevel &&
				entry.courseLevel !== selectedLevel
			) {
				return false;
			}

			// Program filter
			if (selectedProgramId && selectedProgramId !== "ALL") {
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
				const matchTitle = entry.courseTitle?.toLowerCase().includes(q);
				const matchVenue = entry.venueName?.toLowerCase().includes(q);
				const matchLecturer = entry.lecturerName?.toLowerCase().includes(q);
				if (!matchCode && !matchTitle && !matchVenue && !matchLecturer) {
					return false;
				}
			}

			return true;
		});
	}, [
		entries,
		selectedDepartmentId,
		selectedProgramId,
		selectedLevel,
		searchQuery,
	]);

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
	) => {
		setActiveModalEntry(entry);
		setActiveModalConflicts(conflicts);
		setIsDetailModalOpen(true);
		onSelectEntry?.(entry, conflicts);
	};

	return (
		<div className="space-y-4">
			{/* Timetable Academic Matrix Table */}
			<div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs scrollbar-thin">
				<table className="w-full border-collapse text-left min-w-[960px]">
					<thead>
						<tr className="border-b border-border bg-surface-raised/60">
							<th className="p-3.5 text-xs font-bold uppercase tracking-wider text-text-muted w-44 border-r border-border">
								Day & Date
							</th>
							{TIME_SLOTS.map((slot) => (
								<th
									key={slot.id}
									className="p-3.5 text-xs font-bold text-center text-text-main border-r border-border last:border-r-0 min-w-[165px]"
								>
									<div className="font-extrabold text-xs">{slot.label}</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rowDays.map(({ dayName, label, isToday }) => {
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
										// Case-insensitive day match + time overlap
										const matchingEntries = displayedEntries.filter(
											(e) =>
												e.dayOfWeek?.toLowerCase() === dayName.toLowerCase() &&
												isOverlapping(
													e.startTime,
													e.endTime,
													slot.start,
													slot.end,
												),
										);

										const isFridayJummat = isFriday && slot.id === "slot-3";

										return (
											<td
												key={slot.id}
												className="p-2 border-r border-border last:border-r-0 align-top min-h-[7rem] h-28"
											>
												{matchingEntries.length > 0 ? (
													<div className="space-y-1.5 h-full">
														{matchingEntries.map((entry) => {
															const conflicts = resolveLiveEntryConflicts(
																entry,
																displayedEntries,
																conflictReport,
																matchingEntries,
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

															return (
																<div
																	key={entry.id}
																	onClick={() =>
																		handleCardClick(entry, conflicts)
																	}
																	className={`p-2.5 rounded-xl text-xs space-y-1 border shadow-2xs transition-all cursor-pointer ${
																		hasHard
																			? "bg-red-500/15 border-red-500/40 hover:border-red-500 hover:bg-red-500/25 ring-1 ring-red-500/40 text-text-main"
																			: hasSoft
																				? "bg-amber-500/15 border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/25 ring-1 ring-amber-500/30 text-text-main"
																				: "bg-primary/10 border-primary/20 hover:border-primary/40 hover:bg-primary/15 text-text-main"
																	}`}
																	title={
																		hasHard
																			? "Hard timetable conflict! Click to inspect diagnostics."
																			: hasSoft
																				? "Capacity or soft notice. Click to inspect details."
																				: "Optimal schedule. Click to inspect details."
																	}
																>
																	<div className="flex items-center justify-between gap-1">
																		<span
																			className={`font-extrabold tracking-tight ${
																				hasHard
																					? "text-red-400"
																					: hasSoft
																						? "text-amber-400"
																						: "text-primary"
																			}`}
																		>
																			{entry.courseCode}
																		</span>
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
																		title={entry.courseTitle}
																	>
																		{entry.courseTitle}
																	</div>

																	<div className="flex items-center gap-1 text-[10px] text-text-muted truncate">
																		<MapPin
																			size={10}
																			className="shrink-0 text-text-subtle"
																		/>
																		<span className="truncate">
																			{entry.venueName}
																		</span>
																	</div>

																	{entry.lecturerName && (
																		<div className="flex items-center gap-1 text-[10px] text-text-muted truncate">
																			<User
																				size={10}
																				className="shrink-0 text-text-subtle"
																			/>
																			<span className="truncate">
																				{entry.lecturerName}
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
																				className="text-[9px] py-0 px-1 truncate max-w-[110px]"
																			>
																				{entry.targetProgramName}
																			</Badge>
																		)}
																	</div>
																</div>
															);
														})}
													</div>
												) : isFridayJummat ? (
													<div className="h-full min-h-[5rem] rounded-xl border border-dashed border-border/60 bg-surface-raised/20 flex flex-col items-center justify-center p-2 text-center">
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
														onClick={() => onOpenCreateEntry?.(dayName, slot)}
														className="w-full h-full min-h-[5rem] rounded-xl border border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center transition-colors cursor-pointer group"
														title={`Schedule entry for ${dayName} ${slot.label}`}
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
				onClose={() => setIsDetailModalOpen(false)}
				entry={activeModalEntry}
				conflicts={activeModalConflicts}
			/>
		</div>
	);
}
