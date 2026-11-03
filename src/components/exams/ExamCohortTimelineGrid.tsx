import React, { useMemo, useState } from "react";
import {
	MapPin,
	Calendar,
	Clock,
	AlertCircle,
	Users,
	BookOpen,
} from "lucide-react";
import { Text } from "@/components/ui/text";
import { WeekNavigator } from "@/components/schedules/WeekNavigator";
import type { OptimizedExamEvent } from "@/api/main/examOptimizerAPI";
import type { Program } from "@/types";
import {
	type WeekDayInfo,
	getMondayOfWeek,
	getTotalWeeks,
	getWeekRange,
	getWeekDayDates,
	formatDateToYYYYMMDD,
} from "@/utils/semesterWeeks";
import { formatTime5 } from "@/utils/examTimeframeGrouping";

function formatDisplayDate(dateStr: string): string {
	if (!dateStr) return "";
	const [year, month, day] = dateStr.split("-").map(Number);
	if (!year || !month || !day) return dateStr;
	const d = new Date(year, month - 1, day);
	return d.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export interface ExamCohortTimelineGridProps {
	events: OptimizedExamEvent[];
	weekDayDates?: WeekDayInfo[];
	selectedProgram?: Program;
	selectedProgramId: string;
	selectedLevel: number | "ALL";
	onSelectEvent?: (event: OptimizedExamEvent) => void;
	className?: string;
	programs?: Program[];
	onSelectProgram?: (programId: string) => void;
	// Optional external week navigation controls
	currentWeek?: number;
	totalWeeks?: number;
	onPreviousWeek?: () => void;
	onNextWeek?: () => void;
	onResetToCurrentWeek?: () => void;
	isCurrentWeekActive?: boolean;
	weekRangeLabel?: string;
}

export const ExamCohortTimelineGrid: React.FC<ExamCohortTimelineGridProps> = ({
	events = [],
	weekDayDates: externalWeekDayDates,
	selectedProgram,
	selectedProgramId,
	selectedLevel,
	onSelectEvent,
	className = "",
	programs: _programs = [],
	onSelectProgram: _onSelectProgram,
	currentWeek: controlledWeek,
	totalWeeks: controlledTotalWeeks,
	onPreviousWeek: controlledOnPrevious,
	onNextWeek: controlledOnNext,
	onResetToCurrentWeek,
	isCurrentWeekActive: controlledIsCurrentWeekActive,
	weekRangeLabel: controlledRangeLabel,
}) => {
	const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
	const [internalWeek, setInternalWeek] = useState(1);

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

	// Compute internal week timeline if parent does not provide controlled week props
	const internalTimeline = useMemo(() => {
		if (
			controlledWeek != null &&
			externalWeekDayDates &&
			externalWeekDayDates.length > 0
		) {
			return null;
		}

		// Find earliest and latest dates from available events
		const dates = events
			.map((e) => e.date)
			.filter(Boolean)
			.sort();

		const minDateStr = dates[0] || todayStr;
		const maxDateStr = dates[dates.length - 1] || minDateStr;

		const startMonday = getMondayOfWeek(new Date(`${minDateStr}T00:00:00`));
		const startMondayStr = formatDateToYYYYMMDD(startMonday);
		const calcTotalWeeks = getTotalWeeks(startMondayStr, maxDateStr, 4);

		const activeInternalWeek = Math.min(
			Math.max(1, internalWeek),
			calcTotalWeeks,
		);
		const range = getWeekRange(startMondayStr, activeInternalWeek);
		const dayDates = getWeekDayDates(range.startDate);

		return {
			totalWeeks: calcTotalWeeks,
			currentWeek: activeInternalWeek,
			weekRange: range,
			weekDayDates: dayDates,
		};
	}, [controlledWeek, externalWeekDayDates, events, todayStr, internalWeek]);

	const activeWeek = controlledWeek ?? internalTimeline?.currentWeek ?? 1;
	const activeTotalWeeks =
		controlledTotalWeeks ?? internalTimeline?.totalWeeks ?? 1;
	const activeRangeLabel =
		controlledRangeLabel ?? internalTimeline?.weekRange?.rangeLabel;
	const activeWeekDayDates =
		externalWeekDayDates ?? internalTimeline?.weekDayDates ?? [];
	const isCurrentActive = controlledIsCurrentWeekActive ?? activeWeek === 1;

	const handlePrevious = () => {
		if (controlledOnPrevious) {
			controlledOnPrevious();
		} else {
			setInternalWeek((w) => Math.max(1, w - 1));
		}
	};

	const handleNext = () => {
		if (controlledOnNext) {
			controlledOnNext();
		} else {
			setInternalWeek((w) => Math.min(activeTotalWeeks, w + 1));
		}
	};

	// Map events for the active week by exact date string
	const eventsByDate = useMemo(() => {
		const map = new Map<string, OptimizedExamEvent[]>();

		activeWeekDayDates.forEach((d) => map.set(d.dateStr, []));

		cohortEvents.forEach((event) => {
			if (map.has(event.date)) {
				map.get(event.date)!.push(event);
			}
		});

		// Sort events within each day by start_time
		map.forEach((evList) => {
			evList.sort((a, b) => a.start_time.localeCompare(b.start_time));
		});

		return map;
	}, [cohortEvents, activeWeekDayDates]);

	// Prompt user to select program if none chosen
	if (!selectedProgram && (!selectedProgramId || selectedProgramId === "ALL")) {
		return (
			<div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-4">
				<div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center">
					<AlertCircle size={22} />
				</div>
				<div className="space-y-1">
					<Text
						variant="h4"
						weight="bold"
						className="text-text-main text-center"
					>
						Select a Program to View Cohort Timetable
					</Text>
					<Text
						variant="body-sm"
						color="muted"
						className="max-w-md mx-auto text-center"
					>
						Please choose a specific <strong>Program</strong> in the filter bar
						above to inspect its dedicated examination schedule week by week.
					</Text>
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Top Weekly Navigation Control Bar */}
			<WeekNavigator
				currentWeek={activeWeek}
				totalWeeks={activeTotalWeeks}
				onPrevious={handlePrevious}
				onNext={handleNext}
				onResetToCurrent={onResetToCurrentWeek}
				isCurrentWeekActive={isCurrentActive}
				dateRangeLabel={activeRangeLabel}
			/>

			{/* Main Weekly Timetable Table */}
			<div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs divide-y divide-border">
				{activeWeekDayDates.length > 0 ? (
					activeWeekDayDates.map((dayInfo) => {
						const isToday = dayInfo.dateStr === todayStr;
						const dayEvents = eventsByDate.get(dayInfo.dateStr) || [];
						const hasExams = dayEvents.length > 0;

						return (
							<div
								key={dayInfo.dateStr}
								className={`flex flex-col lg:flex-row items-stretch transition-colors ${
									isToday ? "bg-primary/[0.02]" : "hover:bg-surface-raised/30"
								}`}
							>
								{/* Left Column: Day & Exact Date */}
								<div className="w-full lg:w-56 shrink-0 p-4 border-b lg:border-b-0 lg:border-r border-border/80 flex flex-col justify-between bg-surface-raised/20">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span
												className={`text-sm font-bold uppercase tracking-wider ${
													isToday ? "text-primary" : "text-text-main"
												}`}
											>
												{dayInfo.day}
											</span>
											{isToday && (
												<span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">
													Today
												</span>
											)}
										</div>
										<div className="text-xs font-mono font-medium text-text-muted flex items-center gap-1.5">
											<Calendar size={13} className="text-text-muted/70" />
											<span>{formatDisplayDate(dayInfo.dateStr)}</span>
										</div>
									</div>

									<div className="pt-2">
										<span
											className={`text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block ${
												hasExams
													? "bg-primary/10 text-primary border border-primary/20"
													: "text-text-muted/60 bg-surface border border-border"
											}`}
										>
											{hasExams
												? `${dayEvents.length} ${dayEvents.length === 1 ? "examination" : "examinations"}`
												: "No examinations"}
										</span>
									</div>
								</div>

								{/* Right Column: Natural Card Flow (Takes all space needed) */}
								<div className="flex-1 p-4">
									{hasExams ? (
										<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
											{dayEvents.map((event) => {
												const isCbt = event.exam_type === "cbt";
												const isPractical = event.exam_type === "lab_practical";

												const badgeColor = isCbt
													? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
													: isPractical
														? "border-purple-500/40 bg-purple-500/10 text-purple-400"
														: "border-blue-500/40 bg-blue-500/10 text-blue-400";

												const totalStudents = event.student_count;
												const durationLabel =
													isCbt && event.duration_per_student_minutes
														? `${event.duration_per_student_minutes}m / student`
														: event.duration_minutes >= 60
															? `${Math.round(event.duration_minutes / 60)}h (${event.duration_minutes}m)`
															: `${event.duration_minutes}m`;

												return (
													<div
														key={`${event.course_id}-${event.start_time}`}
														onClick={() => onSelectEvent?.(event)}
														className="rounded-xl border border-border bg-surface-raised p-4 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3 group"
													>
														{/* Card Header: Code, Level, Mode */}
														<div className="space-y-1">
															<div className="flex items-center justify-between gap-2">
																<div className="flex items-center gap-1.5 flex-wrap">
																	<span className="font-mono font-bold text-sm text-text-main group-hover:text-primary transition-colors">
																		{event.course_code}
																	</span>
																	<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted">
																		{event.course_level}L
																	</span>
																</div>

																<span
																	className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${badgeColor}`}
																>
																	{event.exam_type.replace("_", " ")}
																</span>
															</div>

															{/* Course Title */}
															<p className="text-xs font-semibold text-text-main leading-snug line-clamp-2">
																{event.course_title}
															</p>
														</div>

														{/* Time and Duration */}
														<div className="flex items-center justify-between text-xs font-mono font-medium text-text-muted bg-surface/70 px-2.5 py-1.5 rounded-lg border border-border/60">
															<div className="flex items-center gap-1.5 text-text-main font-semibold">
																<Clock size={13} className="text-primary" />
																<span>
																	{formatTime5(event.start_time)} –{" "}
																	{formatTime5(event.end_time)}
																</span>
															</div>
															<span className="text-[10px] text-text-muted/90 font-sans">
																{durationLabel}
															</span>
														</div>

														{/* Venues Allocation */}
														<div className="space-y-1.5 pt-1 border-t border-border/60 text-xs text-text-muted">
															<div className="flex items-center gap-1.5 font-semibold text-text-main/90">
																<MapPin
																	size={13}
																	className="text-primary shrink-0"
																/>
																<span className="truncate">
																	{event.venues
																		.map((v) => v.venue_name)
																		.join(", ") || "Unassigned"}
																</span>
															</div>

															<div className="flex items-center justify-between text-[11px] text-text-muted">
																<div className="flex items-center gap-1">
																	<Users
																		size={12}
																		className="text-text-muted/70"
																	/>
																	<span>{totalStudents} candidates</span>
																</div>
																{isCbt && event.venues[0]?.turns && (
																	<span className="font-mono text-[10px] font-bold text-emerald-400">
																		{event.venues[0].turns}{" "}
																		{event.venues[0].turns === 1
																			? "turn"
																			: "turns"}
																	</span>
																)}
															</div>
														</div>
													</div>
												);
											})}
										</div>
									) : (
										<div className="py-8 text-center text-xs text-text-muted/50 font-medium select-none flex items-center justify-center gap-2">
											<BookOpen size={16} className="text-text-muted/30" />
											<span>
												No examinations scheduled on this day for this cohort.
											</span>
										</div>
									)}
								</div>
							</div>
						);
					})
				) : (
					<div className="p-12 text-center text-xs text-text-muted">
						No date information available for the current week timeframe.
					</div>
				)}
			</div>
		</div>
	);
};
