import type { OptimizedExamEvent } from "@/api/main/examOptimizerAPI";
import type { Program } from "@/types";

export interface TimeframeSessionGroup {
	id: string;
	label: string;
	startTime: string;
	endTime: string;
	events: OptimizedExamEvent[];
}

export interface DateExamGroup {
	dateStr: string;
	dateObj: Date;
	dayName: string;
	formattedDate: string;
	timeframeGroups: TimeframeSessionGroup[];
	totalExams: number;
	totalCandidates: number;
}

/**
 * Parses time string ("08:00:00" or "08:00") into minutes from midnight.
 */
export function parseMinutesFromMidnight(timeStr: string): number {
	if (!timeStr) return 0;
	const parts = timeStr.split(":");
	const hours = parseInt(parts[0], 10) || 0;
	const minutes = parseInt(parts[1], 10) || 0;
	return hours * 60 + minutes;
}

/**
 * Formats time string to 5-character "HH:MM" (e.g. "08:00:00" -> "08:00").
 */
export function formatTime5(timeStr: string): string {
	if (!timeStr) return "00:00";
	return timeStr.slice(0, 5);
}

/**
 * Computes left and width percentage for an exam card on a 08:00 to 18:00 continuous time ruler.
 * Ruler span = 10 hours = 600 minutes.
 */
export function calculateExamTimelineGeometry(
	startTime: string,
	durationMinutes: number,
): { leftPercent: number; widthPercent: number } {
	const rulerStartMinutes = 8 * 60; // 08:00 = 480 min
	const rulerTotalMinutes = 10 * 60; // 18:00 - 08:00 = 600 min

	const startM = parseMinutesFromMidnight(startTime);
	const durM = Math.max(15, durationMinutes || 60);

	const leftPercent = ((startM - rulerStartMinutes) / rulerTotalMinutes) * 100;
	const widthPercent = (durM / rulerTotalMinutes) * 100;

	// Clamp boundaries within 0% to 100%
	const clampedLeft = Math.max(0, Math.min(100, leftPercent));
	const clampedWidth = Math.max(2, Math.min(100 - clampedLeft, widthPercent));

	return {
		leftPercent: Math.round(clampedLeft * 100) / 100,
		widthPercent: Math.round(clampedWidth * 100) / 100,
	};
}

/**
 * Derives available level options dynamically based on the largest maxLevel
 * among all programs in the active scope (fallback default 400).
 */
export function getAvailableLevelsForPrograms(programs: Program[]): number[] {
	if (!programs || programs.length === 0) {
		return [100, 200, 300, 400];
	}

	const maxLevel = Math.max(
		...programs.map((p) => p.maxLevel || (p as any).max_level || 100),
	);

	const resolvedMax = Math.max(maxLevel, 100);
	const levels: number[] = [];
	for (let lvl = 100; lvl <= resolvedMax; lvl += 100) {
		levels.push(lvl);
	}
	return levels;
}

/**
 * Derives available level options dynamically for a single selected program.
 */
export function getAvailableLevelsForProgram(program?: Program): number[] {
	const maxLevel = program?.maxLevel || (program as any)?.max_level || 400;
	const resolvedMax = Math.max(maxLevel, 100);
	const levels: number[] = [];
	for (let lvl = 100; lvl <= resolvedMax; lvl += 100) {
		levels.push(lvl);
	}
	return levels;
}

/**
 * Clusters courses scheduled on a single date into common timeframe session boxes.
 * Courses starting at the same time or within 30 minutes of each other are grouped
 * into a single unified session container.
 */
export function clusterEventsIntoTimeframes(
	events: OptimizedExamEvent[],
): TimeframeSessionGroup[] {
	if (!events || events.length === 0) return [];

	// Sort events by start_time, then duration, then course code
	const sorted = [...events].sort((a, b) => {
		const cmpTime = a.start_time.localeCompare(b.start_time);
		if (cmpTime !== 0) return cmpTime;
		const cmpDur = a.duration_minutes - b.duration_minutes;
		if (cmpDur !== 0) return cmpDur;
		return a.course_code.localeCompare(b.course_code);
	});

	const groups: TimeframeSessionGroup[] = [];

	for (const event of sorted) {
		const eventStartM = parseMinutesFromMidnight(event.start_time);
		const eventEndM = parseMinutesFromMidnight(event.end_time);

		// Look for an existing group whose start time is within 30 minutes
		const existingGroup = groups.find((g) => {
			const groupStartM = parseMinutesFromMidnight(g.startTime);
			return Math.abs(eventStartM - groupStartM) <= 30;
		});

		if (existingGroup) {
			existingGroup.events.push(event);

			// Expand timeframe boundaries if this event finishes later or starts earlier
			const gStartM = parseMinutesFromMidnight(existingGroup.startTime);
			const gEndM = parseMinutesFromMidnight(existingGroup.endTime);

			if (eventStartM < gStartM) {
				existingGroup.startTime = formatTime5(event.start_time);
			}
			if (eventEndM > gEndM) {
				existingGroup.endTime = formatTime5(event.end_time);
			}

			// Update label to reflect the overall common timeframe window
			existingGroup.label = `${existingGroup.startTime} – ${existingGroup.endTime}`;
		} else {
			const startLabel = formatTime5(event.start_time);
			const endLabel = formatTime5(event.end_time);
			groups.push({
				id: `${startLabel}-${endLabel}`,
				label: `${startLabel} – ${endLabel}`,
				startTime: startLabel,
				endTime: endLabel,
				events: [event],
			});
		}
	}

	return groups;
}

/**
 * Groups all optimized examination events by calendar date and clusters them
 * into timeframe session groups for the Master Schedule view.
 * Skips dates with 0 events.
 */
export function groupAllExamsByDate(
	events: OptimizedExamEvent[],
): DateExamGroup[] {
	if (!events || events.length === 0) return [];

	// Map date string -> list of events
	const dateMap = new Map<string, OptimizedExamEvent[]>();

	for (const event of events) {
		const existing = dateMap.get(event.date);
		if (existing) {
			existing.push(event);
		} else {
			dateMap.set(event.date, [event]);
		}
	}

	// Sort dates chronologically
	const sortedDates = Array.from(dateMap.keys()).sort();

	const dateGroups: DateExamGroup[] = [];

	for (const dateStr of sortedDates) {
		const dateEvents = dateMap.get(dateStr) || [];
		if (dateEvents.length === 0) continue;

		// Safe date parsing
		const dateObj = new Date(`${dateStr}T12:00:00`);
		const dayName = dateObj.toLocaleDateString(undefined, { weekday: "long" });
		const formattedDate = dateObj.toLocaleDateString(undefined, {
			day: "numeric",
			month: "short",
			year: "numeric",
		});

		const timeframeGroups = clusterEventsIntoTimeframes(dateEvents);
		const totalCandidates = dateEvents.reduce(
			(sum, e) => sum + (e.student_count || 0),
			0,
		);

		dateGroups.push({
			dateStr,
			dateObj,
			dayName,
			formattedDate,
			timeframeGroups,
			totalExams: dateEvents.length,
			totalCandidates,
		});
	}

	return dateGroups;
}
