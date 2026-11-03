import type {
	GeneratedAssignment,
	GenerationConflictReport,
} from "@/types";
import type { AssociatedConflict } from "./ScheduleConflictDetailModal";

/**
 * Resolves all hard and soft conflicts associated with a specific lecture assignment
 * by cross-referencing the assignment against the generation run conflict report
 * and any concurrent cell assignments.
 */
export function resolveAssignmentConflicts(
	a: GeneratedAssignment,
	conflictReport?: GenerationConflictReport,
	cellAssignments: GeneratedAssignment[] = [],
): AssociatedConflict[] {
	const list: AssociatedConflict[] = [];
	const cr = conflictReport || {};
	const details = cr.details || {};

	// A. Slot collision in the current cohort timetable
	if (cellAssignments.length > 1) {
		const otherCourses = cellAssignments
			.filter(
				(other) =>
					(other.occurrence_id || other.course_code) !==
					(a.occurrence_id || a.course_code),
			)
			.map((other) => other.course_code);

		if (otherCourses.length > 0) {
			list.push({
				category: "overlap",
				severity: "hard",
				title: "Cohort Slot Double-Booking",
				description: `Multiple courses (${otherCourses.join(", ")}) are scheduled simultaneously in this same time slot for this degree cohort.`,
			});
		}
	}

	// B. Student Cohort Clashes
	const studentConflicts = (details.student_conflicts ||
		cr.student_conflicts ||
		[]) as any[];
	for (const c of studentConflicts) {
		const matchesOcc =
			(c.occurrence_a && String(c.occurrence_a) === String(a.occurrence_id)) ||
			(c.occurrence_b && String(c.occurrence_b) === String(a.occurrence_id));
		const matchesCourse =
			(c.course_a === a.course_code || c.course_b === a.course_code) &&
			(c.slot?.includes(a.day_name) || c.slot?.includes(a.day) || !c.slot);

		if (matchesOcc || matchesCourse) {
			const collidingCourse =
				c.course_a === a.course_code ? c.course_b : c.course_a;
			list.push({
				category: "student",
				severity: "hard",
				title: "Student Cohort Clash",
				description: `Shares student groups with ${collidingCourse || "another course"} scheduled at the exact same time (${c.slot || "slot"}).`,
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

	// C. Lecturer Double-Bookings
	const lecturerConflicts = (details.lecturer_conflicts ||
		cr.lecturer_conflicts ||
		[]) as any[];
	for (const c of lecturerConflicts) {
		const matchesOcc =
			(c.occurrence_a && String(c.occurrence_a) === String(a.occurrence_id)) ||
			(c.occurrence_b && String(c.occurrence_b) === String(a.occurrence_id));
		const matchesCourse =
			(c.course_a === a.course_code || c.course_b === a.course_code) &&
			(c.slot?.includes(a.day_name) || c.slot?.includes(a.day) || !c.slot);

		if (matchesOcc || matchesCourse) {
			const collidingCourse =
				c.course_a === a.course_code ? c.course_b : c.course_a;
			list.push({
				category: "lecturer",
				severity: "hard",
				title: "Lecturer Double-Booked",
				description: `Lecturer ${c.lecturer_name || "assigned staff"} is double-booked to teach ${collidingCourse || "another course"} at the same time.`,
				details: {
					Lecturer: c.lecturer_name,
					CollidingCourse: collidingCourse,
					Slot: c.slot,
				},
			});
		}
	}

	// D. Venue Double-Bookings
	const venueConflicts = (details.venue_conflicts ||
		cr.venue_conflicts ||
		[]) as any[];
	for (const c of venueConflicts) {
		const matchesOcc =
			(c.occurrence_a && String(c.occurrence_a) === String(a.occurrence_id)) ||
			(c.occurrence_b && String(c.occurrence_b) === String(a.occurrence_id));
		const matchesVenueSlot =
			a.venue_id &&
			String(c.venue_id) === String(a.venue_id) &&
			(c.slot?.includes(a.day_name) || c.slot?.includes(a.day) || !c.slot);

		if (matchesOcc || matchesVenueSlot) {
			const collidingCourse =
				c.course_a === a.course_code ? c.course_b : c.course_a;
			list.push({
				category: "venue",
				severity: "hard",
				title: "Venue Double-Booked",
				description: `Venue ${c.venue_name || a.venue_name} is simultaneously occupied by ${collidingCourse || "another lecture"}.`,
				details: {
					Venue: c.venue_name || a.venue_name,
					CollidingCourse: collidingCourse,
					Slot: c.slot,
				},
			});
		}
	}

	// E. Daily Limit Violations
	const dailyLimitViolations = (details.daily_limit_violations ||
		cr.daily_limit_violations ||
		[]) as any[];
	for (const c of dailyLimitViolations) {
		const dayMatches =
			c.day?.toLowerCase() === a.day_name?.toLowerCase() ||
			c.day?.toUpperCase() === a.day?.toUpperCase();
		const courseMatches =
			Array.isArray(c.courses) && c.courses.includes(a.course_code);

		if (dayMatches && courseMatches) {
			list.push({
				category: "daily",
				severity: "hard",
				title: "Daily Lecture Limit Exceeded",
				description: `Cohort ${c.student_group || "students"} has ${c.scheduled_count} lectures scheduled on ${c.day}, exceeding the daily maximum (${c.max_allowed || 3}).`,
				details: {
					Cohort: c.student_group,
					Day: c.day,
					ScheduledCount: c.scheduled_count,
					Limit: c.max_allowed || 3,
				},
			});
		}
	}

	// F. Same-Day Course Occurrence Repeats
	const repeatViolations = (details.occurrence_day_violations ||
		cr.occurrence_day_violations ||
		[]) as any[];
	for (const c of repeatViolations) {
		const courseMatches =
			c.course === a.course_code || c.course_code === a.course_code;
		const occMatches =
			Array.isArray(c.occurrences) &&
			c.occurrences.some((occ: any) => String(occ) === String(a.occurrence_id));
		const dayMatches =
			c.day?.toLowerCase() === a.day_name?.toLowerCase() ||
			c.day?.toUpperCase() === a.day?.toUpperCase();

		if ((courseMatches || occMatches) && dayMatches) {
			list.push({
				category: "repeat",
				severity: "hard",
				title: "Same-Day Course Repeat",
				description: `Multiple occurrences of ${a.course_code} are scheduled on ${c.day}. Distinct lecture days are required.`,
				details: {
					Course: a.course_code,
					Day: c.day,
				},
			});
		}
	}

	// G. Capacity Overflows / Deficits (Soft Constraint)
	const capacityViolations = (details.capacity_overflows ||
		details.capacity_violations ||
		cr.capacity_violations ||
		cr.capacity_overflows ||
		[]) as any[];
	for (const c of capacityViolations) {
		const occMatches =
			c.occurrence && String(c.occurrence) === String(a.occurrence_id);
		const courseMatches =
			(c.course === a.course_code || c.course_code === a.course_code) &&
			(c.slot?.includes(a.day_name) ||
				c.slot?.includes(a.day) ||
				c.venue_name === a.venue_name);

		if (occMatches || courseMatches) {
			list.push({
				category: "capacity",
				severity: "soft",
				title: "Room Capacity Deficit",
				description: `Assigned venue ${c.venue_name || a.venue_name} has capacity ${c.venue_capacity || c.capacity || "—"}, but ${c.expected_students || a.expected_students} students are expected (-${c.overflow || c.deficit || "—"} seats).`,
				details: {
					Venue: c.venue_name || a.venue_name,
					Capacity: c.venue_capacity || c.capacity,
					ExpectedStudents: c.expected_students || a.expected_students,
					Shortage: `${c.overflow || c.deficit} seats`,
				},
			});
		}
	}

	return list;
}
