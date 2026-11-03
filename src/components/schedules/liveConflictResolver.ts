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
 * Normalizes course code for fuzzy matching (e.g. COS-111 -> COS111).
 */
function normalizeCode(code?: string): string {
	if (!code) return "";
	return code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

/**
 * Resolves all hard and soft timetable conflicts for a live TimetableEntry.
 * Cross-references other concurrent live entries, cell entries, and optional generation conflict report.
 */
export function resolveLiveEntryConflicts(
	entry: TimetableEntry,
	allEntries: TimetableEntry[] = [],
	conflictReport?: GenerationConflictReport,
	cellEntries: TimetableEntry[] = [],
): AssociatedConflict[] {
	const conflicts: AssociatedConflict[] = [];
	const entryDay = (entry.dayOfWeek || "").toLowerCase();
	const entryCodeNorm = normalizeCode(entry.courseCode);

	// 1. Direct Backend / Database flag (calculated from global database clashes)
	if (entry.hasConflict) {
		const isLec = entry.conflictReason?.toLowerCase().includes("lecturer");
		const isVenue = entry.conflictReason?.toLowerCase().includes("venue");
		conflicts.push({
			category: isLec ? "lecturer" : isVenue ? "venue" : "overlap",
			severity: "hard",
			title: isLec
				? "Lecturer Double-Booked"
				: isVenue
					? "Venue Double-Booking"
					: "Hard Schedule Conflict",
			description:
				entry.conflictReason ||
				"This timetable entry was flagged with a hard scheduling conflict in the database.",
			details: {
				Diagnostics: entry.conflictReason || "Hard timetable constraint violation",
			},
		});
	}

	// 2. Cell / Slot collision in the current cohort view
	if (cellEntries.length > 1) {
		const otherCourses = cellEntries
			.filter((other) => String(other.id) !== String(entry.id))
			.map((other) => other.courseCode);

		if (otherCourses.length > 0) {
			conflicts.push({
				category: "overlap",
				severity: "hard",
				title: "Cohort Slot Double-Booking",
				description: `Multiple courses (${otherCourses.join(", ")}) are scheduled simultaneously in this same time slot for this degree cohort.`,
				details: {
					CollidingCourses: otherCourses.join(", "),
					Slot: `${entry.startTime?.slice(0, 5)} - ${entry.endTime?.slice(0, 5)}`,
				},
			});
		}
	}

	// 3. Cross-reference concurrent live entries in the loaded view
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
			const alreadyReported = conflicts.some(
				(c) => c.category === "venue" && c.details?.ConflictingCourse === other.courseCode
			);
			if (!alreadyReported) {
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
			const alreadyReported = conflicts.some(
				(c) => c.category === "lecturer" && c.details?.ConflictingCourse === other.courseCode
			);
			if (!alreadyReported) {
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
		}

		// C. Student Cohort Double-Booking
		const sameLevel = entry.courseLevel && other.courseLevel && entry.courseLevel === other.courseLevel;
		if (sameLevel && cellEntries.length <= 1) {
			const alreadyReported = conflicts.some(
				(c) => c.category === "student" && c.details?.ConflictingCourse === other.courseCode
			);
			if (!alreadyReported) {
				conflicts.push({
					category: "student",
					severity: "hard",
					title: "Student Cohort Clash",
					description: `Students in this cohort (${entry.courseLevel}L) are scheduled for both ${entry.courseCode} and ${other.courseCode} at the same time.`,
					details: {
						Level: `${entry.courseLevel}L`,
						ConflictingCourse: other.courseCode,
						Time: `${other.startTime?.slice(0, 5)} - ${other.endTime?.slice(0, 5)}`,
					},
				});
			}
		}
	}

	// 4. Room Capacity Shortfall (Soft Conflict)
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
			description: `Allocated venue capacity (${entry.venueCapacity}) is smaller than expected cohort enrolment (${entry.expectedStudents}), resulting in a deficit of ${overflow} seats.`,
			details: {
				Venue: entry.venueName,
				Capacity: entry.venueCapacity,
				ExpectedStudents: entry.expectedStudents,
				Deficit: overflow,
			},
		});
	}

	// 5. Cross-reference Generation Conflict Report (from published run)
	if (conflictReport) {
		const details = conflictReport.details || {};

		// Student clashes
		const studentConflicts = (details.student_conflicts ||
			conflictReport.student_conflicts ||
			[]) as any[];
		for (const c of studentConflicts) {
			const cNormA = normalizeCode(c.course_a);
			const cNormB = normalizeCode(c.course_b);
			if (cNormA === entryCodeNorm || cNormB === entryCodeNorm) {
				const collidingCourse = cNormA === entryCodeNorm ? c.course_b : c.course_a;
				const alreadyReported = conflicts.some(
					(x) => x.category === "student" && normalizeCode(x.details?.ConflictingCourse as string) === normalizeCode(collidingCourse)
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

		// Lecturer clashes
		const lecturerConflicts = (details.lecturer_conflicts ||
			conflictReport.lecturer_conflicts ||
			[]) as any[];
		for (const c of lecturerConflicts) {
			const cNormA = normalizeCode(c.course_a);
			const cNormB = normalizeCode(c.course_b);
			if (cNormA === entryCodeNorm || cNormB === entryCodeNorm) {
				const collidingCourse = cNormA === entryCodeNorm ? c.course_b : c.course_a;
				const alreadyReported = conflicts.some(
					(x) => x.category === "lecturer" && normalizeCode(x.details?.ConflictingCourse as string) === normalizeCode(collidingCourse)
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

		// Venue clashes
		const venueConflicts = (details.venue_conflicts ||
			conflictReport.venue_conflicts ||
			[]) as any[];
		for (const c of venueConflicts) {
			const cNormA = normalizeCode(c.course_a);
			const cNormB = normalizeCode(c.course_b);
			if (cNormA === entryCodeNorm || cNormB === entryCodeNorm) {
				const collidingCourse = cNormA === entryCodeNorm ? c.course_b : c.course_a;
				const alreadyReported = conflicts.some(
					(x) => x.category === "venue" && normalizeCode(x.details?.ConflictingCourse as string) === normalizeCode(collidingCourse)
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
