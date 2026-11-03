import React, { useState, useMemo } from "react";
import { Calendar, Clock, Users, MapPin, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
	groupAllExamsByDate,
	formatTime5,
} from "@/utils/examTimeframeGrouping";
import { ExamMasterFilterBar } from "./ExamMasterFilterBar";

interface ExamMasterScheduleViewProps {
	events: OptimizedExamEvent[];
	selectedLevel?: number | "ALL";
	onSelectLevel?: (lvl: number | "ALL") => void;
	programs?: Program[];
	onSelectEvent?: (event: OptimizedExamEvent) => void;
	// Weekly timeline navigation
	currentWeek?: number;
	totalWeeks?: number;
	onPreviousWeek?: () => void;
	onNextWeek?: () => void;
	onResetToCurrentWeek?: () => void;
	isCurrentWeekActive?: boolean;
	weekRangeLabel?: string;
	weekDayDates?: WeekDayInfo[];
}

export const ExamMasterScheduleView: React.FC<ExamMasterScheduleViewProps> = ({
	events = [],
	selectedLevel: controlledLevel,
	onSelectLevel: controlledOnSelectLevel,
	programs = [],
	onSelectEvent,
	currentWeek: controlledWeek,
	totalWeeks,
	onPreviousWeek,
	onNextWeek,
	onResetToCurrentWeek,
	isCurrentWeekActive,
	weekRangeLabel,
	weekDayDates: externalWeekDayDates,
}) => {
	const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
	const [internalWeek, setInternalWeek] = useState(1);
	const [internalLevel, setInternalLevel] = useState<number | "ALL">("ALL");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedExamType, setSelectedExamType] = useState<string>("ALL");

	// Active level filter (uncontrolled defaults to "ALL" to show all levels)
	const activeLevel = controlledLevel !== undefined ? controlledLevel : internalLevel;
	const handleSelectLevel = controlledOnSelectLevel || setInternalLevel;

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
			week: activeInternalWeek,
			totalWeeks: calcTotalWeeks,
			weekDayDates: dayDates,
			rangeLabel: range.rangeLabel,
		};
	}, [
		controlledWeek,
		externalWeekDayDates,
		events,
		internalWeek,
		todayStr,
	]);

	const activeWeek = controlledWeek ?? internalTimeline?.week ?? 1;
	const activeTotalWeeks = totalWeeks ?? internalTimeline?.totalWeeks ?? 1;
	const activeWeekDayDates =
		externalWeekDayDates && externalWeekDayDates.length > 0
			? externalWeekDayDates
			: internalTimeline?.weekDayDates || [];
	const activeRangeLabel =
		weekRangeLabel || internalTimeline?.rangeLabel || "";
	const isCurrentActive =
		isCurrentWeekActive ?? (activeWeek === 1);

	const handlePrevious =
		onPreviousWeek || (() => setInternalWeek((w) => Math.max(1, w - 1)));
	const handleNext =
		onNextWeek ||
		(() => setInternalWeek((w) => Math.min(activeTotalWeeks, w + 1)));
	const handleReset =
		onResetToCurrentWeek || (() => setInternalWeek(1));

	// Filter events across all weeks by level, exam type, and search query
	const filteredAllEvents = useMemo(() => {
		return events.filter((event) => {
			// Level filter
			if (activeLevel !== "ALL" && event.course_level !== activeLevel) {
				return false;
			}
			// Exam Type filter
			if (selectedExamType !== "ALL" && event.exam_type !== selectedExamType) {
				return false;
			}
			// Search query (code, title, or program name)
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchesCode = event.course_code.toLowerCase().includes(q);
				const matchesTitle = event.course_title.toLowerCase().includes(q);
				const matchesProg = event.program_name?.toLowerCase().includes(q);
				if (!matchesCode && !matchesTitle && !matchesProg) {
					return false;
				}
			}
			return true;
		});
	}, [events, activeLevel, selectedExamType, searchQuery]);

	// Filter down to the active week
	const weekEvents = useMemo(() => {
		if (activeWeekDayDates.length === 0) return filteredAllEvents;
		const weekDatesSet = new Set(activeWeekDayDates.map((d) => d.dateStr));
		const firstDate = activeWeekDayDates[0]?.dateStr;
		const lastDate = activeWeekDayDates[activeWeekDayDates.length - 1]?.dateStr;

		return filteredAllEvents.filter((event) => {
			if (!event.date) return false;
			if (weekDatesSet.has(event.date)) return true;
			if (firstDate && lastDate && event.date >= firstDate && event.date <= lastDate) {
				return true;
			}
			return false;
		});
	}, [filteredAllEvents, activeWeekDayDates]);

	// Group the week's events chronologically by date and cluster into timeframe boxes
	const dateGroups = useMemo(() => {
		return groupAllExamsByDate(weekEvents);
	}, [weekEvents]);

	return (
		<div className="space-y-4">
			{/* Master Filter Bar (Independent of cohort filters) */}
			<ExamMasterFilterBar
				selectedLevel={activeLevel}
				onSelectLevel={handleSelectLevel}
				programs={programs}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				selectedExamType={selectedExamType}
				onSelectExamType={setSelectedExamType}
				totalExamsCount={events.length}
				filteredExamsCount={weekEvents.length}
			/>

			{/* Weekly Navigation Controls */}
			<WeekNavigator
				currentWeek={activeWeek}
				totalWeeks={activeTotalWeeks}
				onPrevious={handlePrevious}
				onNext={handleNext}
				onResetToCurrent={handleReset}
				isCurrentWeekActive={isCurrentActive}
				dateRangeLabel={activeRangeLabel}
			/>

			{/* Date Rows for the Active Week */}
			{dateGroups.length > 0 ? (
				<div className="space-y-4">
					{dateGroups.map((dateGroup) => (
						<div
							key={dateGroup.dateStr}
							className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs hover:border-border/80 transition-all"
						>
							{/* Date Row Header */}
							<div className="p-4 bg-surface-raised/70 border-b border-border flex flex-wrap items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
										<CalendarDays size={18} />
									</div>
									<div>
										<div className="flex items-center gap-2 flex-wrap">
											<Text
												variant="h4"
												weight="bold"
												className="text-text-main"
											>
												{dateGroup.dayName}
											</Text>
											<span className="text-sm font-semibold text-text-muted">
												• {dateGroup.formattedDate}
											</span>
										</div>
										<Text variant="caption" color="muted">
											{dateGroup.totalExams}{" "}
											{dateGroup.totalExams === 1
												? "Examination"
												: "Examinations"}{" "}
											scheduled across {dateGroup.timeframeGroups.length}{" "}
											session{" "}
											{dateGroup.timeframeGroups.length === 1
												? "timeframe"
												: "timeframes"}
										</Text>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Badge variant="secondary" className="text-xs px-2.5 py-1">
										{dateGroup.totalCandidates} Total Candidates
									</Badge>
								</div>
							</div>

							{/* Timeframe Session Boxes */}
							<div className="p-4 space-y-3.5">
								{dateGroup.timeframeGroups.map((group) => {
									const groupCandidates = group.events.reduce(
										(sum, e) => sum + (e.student_count || 0),
										0,
									);

									return (
										<div
											key={group.id}
											className="rounded-xl border border-border/80 bg-surface-raised/40 p-4 space-y-3"
										>
											{/* Timeframe Box Header */}
											<div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-border/50">
												<div className="flex items-center gap-2">
													<div className="flex items-center gap-1.5 text-xs font-bold text-primary font-mono bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
														<Clock size={13} />
														<span>{group.label}</span>
													</div>
													<span className="text-xs text-text-muted font-medium">
														({group.events.length}{" "}
														{group.events.length === 1 ? "course" : "courses"})
													</span>
												</div>

												<div className="flex items-center gap-2 text-xs text-text-muted">
													<Users size={12} className="text-text-muted" />
													<span>{groupCandidates} Candidates</span>
												</div>
											</div>

											{/* Courses List Inside This Timeframe Box */}
											<div className="divide-y divide-border/40">
												{group.events.map((event) => {
													const isCbt = event.exam_type === "cbt";
													const isPractical =
														event.exam_type === "lab_practical";

													const typeBadgeClass = isCbt
														? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
														: isPractical
															? "bg-purple-500/10 text-purple-400 border-purple-500/30"
															: "bg-blue-500/10 text-blue-400 border-blue-500/30";

													return (
														<div
															key={`${event.course_id}-${event.date}-${event.start_time}`}
															onClick={() => onSelectEvent?.(event)}
															className="py-2.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3 group cursor-pointer hover:bg-surface-raised/60 -mx-2 px-2 rounded-lg transition-colors"
														>
															{/* Course & Timing Info */}
															<div className="flex items-start gap-3 min-w-[260px]">
																{/* Level Indicator */}
																<div className="w-11 text-center shrink-0 pt-0.5">
																	<span className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-surface-raised border border-border text-text-muted">
																		{event.course_level}L
																	</span>
																</div>

																<div className="space-y-0.5">
																	<div className="flex items-center gap-2 flex-wrap">
																		<span className="font-bold text-xs font-mono text-text-main group-hover:text-primary transition-colors">
																			{event.course_code}
																		</span>
																		<span className="text-xs font-semibold text-text-main line-clamp-1">
																			{event.course_title}
																		</span>
																	</div>

																	{/* Timestamp & Duration */}
																	<div className="flex items-center gap-2 text-[11px] text-text-muted flex-wrap">
																		<span className="font-mono font-medium text-text-main/80">
																			{formatTime5(event.start_time)} –{" "}
																			{formatTime5(event.end_time)}
																		</span>
																		<span>•</span>
																		<span>{event.duration_minutes} mins</span>
																		{event.program_name && (
																			<>
																				<span>•</span>
																				<span className="truncate max-w-[180px]">
																					{event.program_name}
																				</span>
																			</>
																		)}
																	</div>
																</div>
															</div>

															{/* Venues & Badges */}
															<div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto pl-14 md:pl-0">
																{/* Venues Pill */}
																<div className="flex items-center gap-1.5 text-xs text-text-muted bg-surface border border-border/80 px-2.5 py-1 rounded-lg">
																	<MapPin
																		size={11}
																		className="text-primary shrink-0"
																	/>
																	<span className="font-medium text-text-main truncate max-w-[200px]">
																		{event.venues
																			.map((v) => v.venue_name)
																			.join(", ")}
																	</span>
																	<span className="text-[10px] text-text-muted shrink-0">
																		({event.student_count} seats)
																	</span>
																</div>

																{/* Exam Type Badge */}
																<span
																	className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${typeBadgeClass}`}
																>
																	{event.exam_type.replace("_", " ")}
																</span>

																{/* Joined Badge */}
																{event.joined_courses &&
																	event.joined_courses.length > 0 && (
																		<span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
																			Joined: {event.joined_courses.join(", ")}
																		</span>
																	)}
															</div>
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-3">
					<div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border mx-auto flex items-center justify-center text-text-muted">
						<Calendar size={22} />
					</div>
					<div className="space-y-1">
						<Text
							variant="h4"
							weight="bold"
							className="text-text-main text-center"
						>
							No Examinations Scheduled for Week {activeWeek}
						</Text>
						<Text variant="body-sm" color="muted" className="text-center">
							{activeRangeLabel ? (
								<>No examinations scheduled during <strong>{activeRangeLabel}</strong>.</>
							) : (
								"No examinations have been scheduled for this week in the current scope."
							)}
						</Text>
					</div>
					{activeLevel !== "ALL" && (
						<button
							type="button"
							onClick={() => handleSelectLevel("ALL")}
							className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
						>
							Show All Levels
						</button>
					)}
				</div>
			)}
		</div>
	);
};
