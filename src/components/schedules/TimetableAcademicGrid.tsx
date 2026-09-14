import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, MapPin, User } from "lucide-react";
import type { TimetableEntry } from "@/types";
import type { WeekDayInfo } from "@/utils/semesterWeeks";

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
	selectedProgramId?: string;
	selectedLevel?: number;
	weekDayDates?: WeekDayInfo[];
	onOpenCreateEntry?: (defaultDay?: string, defaultSlot?: TimeSlot) => void;
}

export function TimetableAcademicGrid({
	entries,
	selectedProgramId,
	selectedLevel,
	weekDayDates,
	onOpenCreateEntry,
}: TimetableAcademicGridProps) {
	// Filter entries strictly by selectedProgramId and selectedLevel
	const displayedEntries = useMemo(() => {
		return entries.filter((entry) => {
			if (
				selectedProgramId &&
				entry.targetProgramId &&
				entry.targetProgramId !== selectedProgramId
			) {
				return false;
			}
			if (
				selectedLevel &&
				entry.courseLevel &&
				entry.courseLevel !== selectedLevel
			) {
				return false;
			}
			return true;
		});
	}, [entries, selectedProgramId, selectedLevel]);

	// Helper to test if entry overlaps a 2-hour slot
	const isOverlapping = (
		entryStart: string,
		entryEnd: string,
		slotStart: string,
		slotEnd: string,
	) => {
		const norm = (t: string) => (t.length === 5 ? `${t}:00` : t);
		return norm(entryStart) < norm(slotEnd) && norm(entryEnd) > norm(slotStart);
	};

	// Build rows using weekDayDates if provided
	const rowDays = useMemo(() => {
		if (weekDayDates && weekDayDates.length > 0) {
			return weekDayDates.map((item) => ({
				dayName: item.day,
				label: item.dayWithDate,
				dateStr: item.dateStr,
			}));
		}
		return DEFAULT_DAYS.map((d) => ({
			dayName: d,
			label: d,
			dateStr: "",
		}));
	}, [weekDayDates]);

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
									className="p-3.5 text-xs font-bold text-center text-text-main border-r border-border last:border-r-0 min-w-[155px]"
								>
									{slot.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rowDays.map(({ dayName, label }) => (
							<tr
								key={dayName}
								className="border-b border-border last:border-b-0 hover:bg-surface-raised/30 transition-colors"
							>
								<td className="p-3.5 font-bold text-xs text-text-main border-r border-border bg-surface-raised/40 align-top">
									<div className="text-text-main font-bold whitespace-nowrap">
										{label}
									</div>
								</td>
								{TIME_SLOTS.map((slot) => {
									const matchingEntries = displayedEntries.filter(
										(e) =>
											e.dayOfWeek === dayName &&
											isOverlapping(
												e.startTime,
												e.endTime,
												slot.start,
												slot.end,
											),
									);

									return (
										<td
											key={slot.id}
											className="p-2 border-r border-border last:border-r-0 align-top h-28"
										>
											{matchingEntries.length > 0 ? (
												<div className="space-y-1.5 h-full">
													{matchingEntries.map((entry) => (
														<div
															key={entry.id}
															className={`p-2 rounded-xl text-xs space-y-1 border transition-all ${
																entry.hasConflict
																	? "bg-red-500/10 border-red-500/30 text-red-400"
																	: "bg-primary/10 border-primary/20 text-text-main shadow-2xs"
															}`}
														>
															<div className="flex items-center justify-between gap-1">
																<span className="font-extrabold text-primary">
																	{entry.courseCode}
																</span>
																{entry.hasConflict && (
																	<AlertTriangle
																		size={13}
																		className="text-red-400 shrink-0"
																	/>
																)}
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
													))}
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
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
