import React, { useMemo } from "react";
import { MapPin, Moon, AlertCircle } from "lucide-react";
import { Text } from "@/components/ui/text";
import type { OptimizedExamEvent } from "@/api/main/examOptimizerAPI";
import type { Program } from "@/types";
import type { WeekDayInfo } from "@/utils/semesterWeeks";
import {
	calculateExamTimelineGeometry,
	formatTime5,
} from "@/utils/examTimeframeGrouping";

const DEFAULT_DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const TIME_HOURS = [
	"08:00",
	"09:00",
	"10:00",
	"11:00",
	"12:00",
	"13:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00",
	"18:00",
];

interface ExamCohortTimelineGridProps {
	events: OptimizedExamEvent[];
	weekDayDates?: WeekDayInfo[];
	selectedProgram?: Program;
	selectedProgramId: string;
	selectedLevel: number | "ALL";
	onSelectEvent?: (event: OptimizedExamEvent) => void;
	className?: string;
	programs?: Program[];
	onSelectProgram?: (programId: string) => void;
}

export const ExamCohortTimelineGrid: React.FC<ExamCohortTimelineGridProps> = ({
	events = [],
	weekDayDates = [],
	selectedProgram,
	selectedProgramId,
	selectedLevel,
	onSelectEvent,
	className = "",
	programs = [],
	onSelectProgram,
}) => {
	const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

	// Filter events for the active cohort (selected program + level)
	const cohortEvents = useMemo(() => {
		return events.filter((event) => {
			// Program filter
			if (
				selectedProgramId &&
				selectedProgramId !== "ALL" &&
				event.program_id != null &&
				String(event.program_id) !== String(selectedProgramId)
			) {
				return false;
			}
			// Level filter
			if (selectedLevel !== "ALL" && event.course_level !== selectedLevel) {
				return false;
			}
			return true;
		});
	}, [events, selectedProgramId, selectedLevel]);

	// Map events by day of week or date
	const eventsByDay = useMemo(() => {
		const map = new Map<string, OptimizedExamEvent[]>();

		DEFAULT_DAYS.forEach((day) => map.set(day, []));

		cohortEvents.forEach((event) => {
			// Find matching day in weekDayDates or parse from date
			const dateObj = new Date(`${event.date}T12:00:00`);
			const dayName = dateObj.toLocaleDateString(undefined, {
				weekday: "long",
			});

			// Check if event belongs to this week's dates
			const matchingDayInfo = weekDayDates.find(
				(d) => d.dateStr === event.date,
			);
			const targetDay = matchingDayInfo ? matchingDayInfo.day : dayName;

			if (map.has(targetDay)) {
				map.get(targetDay)!.push(event);
			}
		});

		return map;
	}, [cohortEvents, weekDayDates]);

	// If no program selected at all, prompt the user
	if (!selectedProgram && (!selectedProgramId || selectedProgramId === "ALL")) {
		return (
			<div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-4">
				<div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center">
					<AlertCircle size={22} />
				</div>
				<div className="space-y-1">
					<Text variant="h4" weight="bold" className="text-text-main">
						Select a Program to View Cohort Timeline
					</Text>
					<Text variant="body-sm" color="muted" className="max-w-md mx-auto">
						To prevent parallel examinations from congesting the continuous time
						ruler, please select a specific <strong>Program</strong> and{" "}
						<strong>Level</strong> in the filter bar above, or switch to the{" "}
						<strong>Master Schedule</strong> view.
					</Text>
				</div>
				{programs && programs.length > 0 && onSelectProgram && (
					<div className="pt-2">
						<Text
							variant="caption"
							color="muted"
							weight="medium"
							className="block mb-2"
						>
							Quick Select Program:
						</Text>
						<div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
							{programs.slice(0, 10).map((prog) => (
								<button
									key={prog.id}
									type="button"
									onClick={() => onSelectProgram(String(prog.id))}
									className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-raised hover:bg-primary hover:text-white border border-border transition-all cursor-pointer"
								>
									{prog.name} {prog.code ? `(${prog.code})` : ""}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className={`space-y-2 ${className}`}>
			<div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
				<div className="overflow-x-auto">
					<div className="min-w-[980px] p-4 space-y-2">
						{/* Top Time Ruler Header */}
						<div className="flex items-center">
							{/* Left Day Column Spacer */}
							<div className="w-40 shrink-0 pr-4 text-xs font-bold text-text-muted uppercase tracking-wider">
								Day & Date
							</div>

							{/* Ruler Axis */}
							<div className="flex-1 relative flex justify-between border-b border-border pb-2">
								{TIME_HOURS.map((hour, idx) => (
									<div
										key={hour}
										className={`flex flex-col items-center ${
											idx === 0
												? "items-start"
												: idx === TIME_HOURS.length - 1
													? "items-end"
													: ""
										}`}
									>
										<span className="text-[11px] font-mono font-bold text-text-muted">
											{hour}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Day Rows */}
						<div className="space-y-2 pt-1">
							{DEFAULT_DAYS.map((day, idx) => {
								const dayDateInfo = weekDayDates[idx];
								const isToday = dayDateInfo?.dateStr === todayStr;
								const dayEvents = eventsByDay.get(day) || [];
								const isFriday = day === "Friday";

								return (
									<div
										key={day}
										className={`flex items-stretch rounded-xl border border-border/80 transition-colors ${
											isToday
												? "bg-primary/[0.03] border-primary/40"
												: "bg-surface-raised/40 hover:bg-surface-raised/60"
										}`}
									>
										{/* Day Header Column */}
										<div className="w-40 shrink-0 p-3.5 border-r border-border/70 flex flex-col justify-center">
											<div className="flex items-center gap-1.5">
												<span
													className={`text-xs font-bold uppercase tracking-wider ${
														isToday ? "text-primary" : "text-text-main"
													}`}
												>
													{day}
												</span>
												{isToday && (
													<span className="text-[9px] bg-primary text-white px-1.5 py-0.2 rounded-full font-bold">
														Today
													</span>
												)}
											</div>
											{dayDateInfo && (
												<span className="text-[11px] text-text-muted mt-0.5 font-medium">
													{dayDateInfo.formattedDate}
												</span>
											)}
											<span className="text-[10px] text-text-muted/70 mt-1">
												{dayEvents.length}{" "}
												{dayEvents.length === 1 ? "exam" : "exams"}
											</span>
										</div>

										{/* Horizontal Time Track */}
										<div className="flex-1 relative min-h-[92px] p-2 flex items-center">
											{/* Vertical Hour Guidelines */}
											<div className="absolute inset-0 flex justify-between pointer-events-none px-0">
												{TIME_HOURS.map((hour, hIdx) => (
													<div
														key={hour}
														className={`w-px h-full ${
															hIdx === 0 || hIdx === TIME_HOURS.length - 1
																? "border-transparent"
																: "border-r border-dashed border-border/30"
														}`}
													/>
												))}
											</div>

											{/* Friday Jummat Prayer Blackout Window (12:00 to 14:00 = 40% to 60%) */}
											{isFriday && (
												<div
													style={{ left: "40%", width: "20%" }}
													className="absolute top-0 bottom-0 bg-amber-500/[0.07] border-x border-amber-500/25 pointer-events-none flex flex-col items-center justify-center text-amber-500/70"
												>
													<Moon size={13} className="mb-0.5" />
													<span className="text-[10px] font-bold tracking-wider uppercase text-center">
														Jummat Prayer
													</span>
													<span className="text-[9px] font-mono">
														12:00 – 14:00
													</span>
												</div>
											)}

											{/* Scheduled Exam Blocks */}
											{dayEvents.length > 0 ? (
												dayEvents.map((event) => {
													const { leftPercent, widthPercent } =
														calculateExamTimelineGeometry(
															event.start_time,
															event.duration_minutes,
														);

													const isCbt = event.exam_type === "cbt";
													const isPractical =
														event.exam_type === "lab_practical";

													const cardColor = isCbt
														? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
														: isPractical
															? "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
															: "border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20";

													return (
														<div
															key={`${event.course_id}-${event.start_time}`}
															onClick={() => onSelectEvent?.(event)}
															style={{
																left: `${leftPercent}%`,
																width: `${widthPercent}%`,
															}}
															className={`absolute h-4/5 my-auto top-0 bottom-0 rounded-xl border p-2.5 transition-all cursor-pointer shadow-xs z-10 flex flex-col justify-between overflow-hidden group ${cardColor}`}
														>
															{/* Top Header: Code & Time */}
															<div className="flex items-center justify-between gap-1">
																<span className="font-bold font-mono text-xs text-text-main group-hover:text-primary transition-colors truncate">
																	{event.course_code}
																</span>
																<span className="text-[10px] font-mono font-semibold shrink-0 text-text-main/80">
																	{formatTime5(event.start_time)}–
																	{formatTime5(event.end_time)}
																</span>
															</div>

															{/* Middle: Title */}
															<p className="text-[11px] font-medium text-text-main/90 line-clamp-1">
																{event.course_title}
															</p>

															{/* Bottom: Venues & Type Pill */}
															<div className="flex items-center justify-between gap-1 text-[10px] text-text-muted pt-1 border-t border-border/40">
																<div className="flex items-center gap-1 truncate text-text-main/80">
																	<MapPin
																		size={9}
																		className="shrink-0 text-primary"
																	/>
																	<span className="truncate">
																		{event.venues
																			.map((v) => v.venue_name)
																			.join(", ")}
																	</span>
																</div>

																<span className="shrink-0 font-bold uppercase text-[9px] px-1 py-0.2 rounded bg-surface/50 border border-border/50">
																	{event.exam_type.replace("_", " ")}
																</span>
															</div>
														</div>
													);
												})
											) : (
												<div className="w-full text-center text-[11px] text-text-muted/40 font-medium select-none pointer-events-none">
													No examinations scheduled on this day
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
