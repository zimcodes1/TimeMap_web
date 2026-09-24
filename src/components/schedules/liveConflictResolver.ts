import type {
	TimetableEntry,
	GenerationConflictReport,
} from "@/types";
import type { AssociatedConflict } from "@/components/schedules/generator/ScheduleConflictDetailModal";

/**
 * Checks if two time ranges [startA, endA] and [startB, endB] overlap.
 */
function isTimeOverlapping(
	startA: string,
	endA: string,
	startB: string,
	endB: string,
): boolean {
	const norm = (t: string) => {
		if (!t) return "00:00:00";
		const parts = t.split(":");
		if (parts.length === 2) return `${t}:00`;
		return t;
	};
	return norm(startA) < norm(endB) && norm(endA) > norm(startB);
}

/**
 * Resolves all hard and soft timetable conflicts for a live TimetableEntry.
 * Cross-references other concurrent live entries and optional generation conflict report.
 */
export function resolveLiveEntryConflicts(
	entry: TimetableEntry,
	allEntries: TimetableEntry[] = [],
	conflictReport?: GenerationConflictReport,
): AssociatedConflict[] {
	const conflicts: AssociatedConflict[] = [];
	const entryDay = (entry.dayOfWeek || "").toLowerCase();

	// 1. Direct Backend / Database flag
	if (entry.hasConflict) {
		conflicts.push({
			category: "overlap",
			severity: "hard",
			title: "Schedule Conflict Flagged",
			description:
				entry.conflictReason ||
				"This timetable entry was flagged with a scheduling conflict in the database.",
		});
	}

	// 2. Cross-reference concurrent live entries
	for (const other of allEntries) {
		if (String(other.id) === String(entry.id)) continue;

		const otherDay = (other.dayOfWeek || "").toLowerCase();
		if (entryDay !== otherDay) continue;

		if (!isTimeOverlapping(entry.startTime, entry.endTime, other.startTime, other.endTime)) {
			continue;
		}

		// A. Venue Double-Booking
		const sameVenue =
			(entry.venueId && other.venueId && String(entry.venueId) === String(other.venueId)) ||
			(entry.venueName && other.venueName && entry.venueName.toLowerCase() === other.venueName.toLowerCase());

		if (sameVenue) {
			conflicts.push({
				category: "venue",
				severity: "hard",
				title: "Venue Double-Booking",
				description: `Venue "${entry.venueName}" is concurrently assigned to ${other.courseCode} (${other.startTime?.slice(0, 5)} - ${other.endTime?.slice(0, 5)}).`,
				details: {
					Venue: entry.venueName,
					ConflictingCourse: other.courseCode,
					Time: `${other.startTime?.slice(0, 5)} - ${other.endTime?.slice(0, 5)}`,
				},
			});
		}

		// B. Lecturer Double-Booking
		const entryLecturers = (entry.lecturers && entry.lecturers.length > 0)
			? entry.lecturers
			: entry.lecturerName ? [entry.lecturerName] : [];
		const otherLecturers = (other.lecturers && other.lecturers.length > 0)
			? other.lecturers
			: other.lecturerName ? [other.lecturerName] : [];

		const commonLecturer = entryLecturers.find((lec) =>
			lec !== "Assigned Lecturer" &&
			otherLecturers.some((oLec) => oLec.toLowerCase() === lec.toLowerCase())
		);

		if (commonLecturer) {
			conflicts.push({
				category: "lecturer",
				severity: "hard",
				title: "Lecturer Double-Booked",
				description: `Lecturer "${commonLecturer}" is scheduled to teach ${other.courseCode} simultaneously (${other.startTime?.slice(0, 5)} - ${other.endTime?.slice(0, 5)}).`,
				details: {
					Lecturer: commonLecturer,
					ConflictingCourse: other.courseCode,
					Time: `${other.startTime?.slice(0, 5)} - ${other.endTime?.slice(0, 5)}`,
				},
			});
		}

		// C. Student Cohort Double-Booking
		const sameLevel = entry.courseLevel && other.courseLevel && entry.courseLevel === other.courseLevel;
		if (sameLevel) {
			const sameTargetProgram =
				entry.targetProgramId &&
				other.targetProgramId &&
				String(entry.targetProgramId) === String(other.targetProgramId);

			const isGeneralClash =
				entry.programScope === "general" || other.programScope === "general";

			if (sameTargetProgram || isGeneralClash) {
				conflicts.push({
					category: "student",
					severity: "hard",
					title: "Student Cohort Clash",
					description: `Students in this cohort (${entry.courseLevel}L ${entry.targetProgramName || "Cohort"}) are scheduled for both ${entry.courseCode} and ${other.courseCode} at the same time.`,
					details: {
						Level: `${entry.courseLevel}L`,
						Program: entry.targetProgramName || other.targetProgramName || "Degree Cohort",
						ConflictingCourse: other.courseCode,
						Time: `${other.startTime?.slice(0, 5)} - ${other.endTime?.slice(0, 5)}`,
					},
				});
			}
		}
	}

	// 3. Room Capacity Shortfall (Soft Conflict)
	if (
		entry.expectedStudents &&
		entry.venueCapacity &&
		entry.expectedStudents > entry.venueCapacity
	) {
		const overflow = entry.expectedStudents - entry.venueCapacity;
		conflicts.push({
			category: "capacity",
			severity: "soft",
			title: "Venue Capacity Deficit",
			description: `Allocated venue capacity (${entry.venueCapacity}) is smaller than expected cohort enrolment (${entry.expectedStudents}), resulting in ${overflow} student deficit.`,
			details: {
				Venue: entry.venueName,
				Capacity: entry.venueCapacity,
				ExpectedStudents: entry.expectedStudents,
				Overflow: overflow,
			},
		});
	}

	// 4. Cross-reference Generation Conflict Report (if provided)
	if (conflictReport) {
		const details = conflictReport.details || {};

		// Student conflicts
		const studentConflicts = (details.student_conflicts ||
			conflictReport.student_conflicts ||
			[]) as any[];
		for (const c of studentConflicts) {
			if (c.course_a === entry.courseCode || c.course_b === entry.courseCode) {
				const collidingCourse = c.course_a === entry.courseCode ? c.course_b : c.course_a;
				const alreadyReported = conflicts.some(
					(x) => x.category === "student" && x.details?.ConflictingCourse === collidingCourse
				);
				if (!alreadyReported) {
					conflicts.push({
						category: "student",
						severity: "hard",
						title: "Optimizer Student Clash",
						description: `Shares student cohort with ${collidingCourse || "another course"} at slot ${c.slot || "slot"}.`,
						details: {
							CollidingCourse: collidingCourse,
							Slot: c.slot,
							SharedGroups: Array.isArray(c.shared_groups)
								? c.shared_groups.join(", ")
								: c.shared_groups,
						},
					});
				}
			}
		}

		// Lecturer conflicts
		const lecturerConflicts = (details.lecturer_conflicts ||
			conflictReport.lecturer_conflicts ||
			[]) as any[];
		for (const c of lecturerConflicts) {
			if (c.course_a === entry.courseCode || c.course_b === entry.courseCode) {
				const collidingCourse = c.course_a === entry.courseCode ? c.course_b : c.course_a;
				const alreadyReported = conflicts.some(
					(x) => x.category === "lecturer" && x.details?.ConflictingCourse === collidingCourse
				);
				if (!alreadyReported) {
					conflicts.push({
						category: "lecturer",
						severity: "hard",
						title: "Optimizer Lecturer Double-Booking",
						description: `Staff member ${c.lecturer_name || "Assigned Lecturer"} is double-booked with ${collidingCourse || "another course"}.`,
						details: {
							Lecturer: c.lecturer_name,
							CollidingCourse: collidingCourse,
							Slot: c.slot,
						},
					});
				}
			}
		}

		// Venue conflicts
		const venueConflicts = (details.venue_conflicts ||
			conflictReport.venue_conflicts ||
			[]) as any[];
		for (const c of venueConflicts) {
			if (c.course_a === entry.courseCode || c.course_b === entry.courseCode) {
				const collidingCourse = c.course_a === entry.courseCode ? c.course_b : c.course_a;
				const alreadyReported = conflicts.some(
					(x) => x.category === "venue" && x.details?.ConflictingCourse === collidingCourse
				);
				if (!alreadyReported) {
					conflicts.push({
						category: "venue",
						severity: "hard",
						title: "Optimizer Venue Clash",
						description: `Venue ${c.venue_name || entry.venueName} double-booked with ${collidingCourse || "another course"}.`,
						details: {
							Venue: c.venue_name || entry.venueName,
							CollidingCourse: collidingCourse,
							Slot: c.slot,
						},
					});
				}
			}
		}
	}

	return conflicts;
}

