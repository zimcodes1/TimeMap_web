import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarClock, Repeat, BookOpen } from "lucide-react";
import apiClient from "@/api/apiClient";
import { mapRawVenueToVenue } from "@/api/main/venuesAPI";
import { TimeSlotPicker } from "@/components/schedules/TimeSlotPicker";
import type { Course, Venue, Semester } from "@/types";

interface ScheduleEntryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		entry_type: "lecture" | "exam";
		title: string;
		course?: string;
		course_code?: string;
		venue: string;
		venue_name?: string;
		day_of_week: string;
		start_time: string;
		end_time: string;
		recurrence_rule?: string;
		recurrence_start_date?: string;
		recurrence_end_date?: string;
		semester?: string;
		target_program?: string;
		target_level?: number;
		is_recurring?: boolean;
	}) => void;
	courses?: Course[];
	venues?: Venue[];
	activeSemester?: Semester | null;
	defaultEntryType?: "lecture" | "exam" | string;
	defaultDay?: string;
	defaultDate?: string;
	defaultStartTime?: string;
	defaultEndTime?: string;
	isSlotClick?: boolean;
	userDepartmentId?: string | number;
	userFacultyId?: string | number;
	userSchoolId?: string | number;
	programId?: string | number;
	programName?: string;
	level?: number | string;
	isPending?: boolean;
}

export default function ScheduleEntryModal({
	isOpen,
	onClose,
	onSubmit,
	courses = [],
	venues = [],
	activeSemester,
	defaultEntryType = "lecture",
	defaultDay,
	defaultDate,
	defaultStartTime,
	defaultEndTime,
	isSlotClick = false,
	userDepartmentId,
	userFacultyId: _userFacultyId,
	userSchoolId: _userSchoolId,
	programId,
	programName,
	level,
	isPending = false,
}: ScheduleEntryModalProps) {
	const isExam = defaultEntryType === "exam";
	const [courseId, setCourseId] = useState<string>("");
	const [venueId, setVenueId] = useState<string>("");
	const [dayOfWeek, setDayOfWeek] = useState<string>(defaultDay || "Monday");
	const [startTime, setStartTime] = useState<string>(
		defaultStartTime || "08:00:00",
	);
	const [endTime, setEndTime] = useState<string>(defaultEndTime || "10:00:00");
	const [isRecurring, setIsRecurring] = useState<boolean>(!isSlotClick);

	const [allowedVenues, setAllowedVenues] = useState<Venue[]>([]);
	const [isLoadingVenues, setIsLoadingVenues] = useState<boolean>(false);

	// Filter courses strictly for the displayed program and level
	const filteredCourses = useMemo(() => {
		if (!courses || courses.length === 0) return [];

		return courses.filter((c) => {
			// 1. LEVEL FILTER: Course level must match the target timetable level so an admin doesn't schedule e.g. a 200L lecture on a 100L timetable
			if (level !== undefined && level !== null && String(level) !== "") {
				if (Number(c.level) !== Number(level)) {
					return false;
				}
			}

			// 2. PROGRAM / DEPARTMENT FILTER:
			// If programId is provided, the course must either:
			//   a) Be explicitly targeted to this program (c.targetProgramId === programId)
			//   b) Or have general program scope / no specific target program and belong to this department or higher scope (faculty/school)
			if (
				programId &&
				String(programId) !== "ALL" &&
				String(programId).trim() !== ""
			) {
				if (
					c.targetProgramId &&
					String(c.targetProgramId) !== String(programId)
				) {
					return false;
				}

				if (userDepartmentId) {
					if (
						c.owningLevel === "department" &&
						c.departmentId &&
						String(c.departmentId) !== String(userDepartmentId)
					) {
						return false;
					}
				}
			} else if (userDepartmentId) {
				if (
					c.owningLevel === "department" &&
					c.departmentId &&
					String(c.departmentId) !== String(userDepartmentId)
				) {
					return false;
				}
			}

			return true;
		});
	}, [courses, level, programId, userDepartmentId]);

	// Synchronize defaults on open or prop change
	useEffect(() => {
		if (isOpen) {
			setDayOfWeek(defaultDay || "Monday");
			setStartTime(defaultStartTime || "08:00:00");
			setEndTime(defaultEndTime || "10:00:00");
			setIsRecurring(!isSlotClick);
		}
	}, [
		isOpen,
		defaultDay,
		defaultStartTime,
		defaultEndTime,
		isSlotClick,
	]);

	// Auto-select first filtered course when modal opens or filteredCourses changes
	useEffect(() => {
		if (isOpen) {
			if (filteredCourses.length > 0) {
				const exists = filteredCourses.some(
					(c) => String(c.id) === String(courseId),
				);
				if (!exists || !courseId) {
					setCourseId(String(filteredCourses[0].id));
				}
			} else {
				setCourseId("");
			}
		}
	}, [isOpen, filteredCourses, courseId]);

	// Resolve allowed venues based on selected course
	useEffect(() => {
		if (!isOpen) return;

		if (!courseId) {
			setAllowedVenues([]);
			return;
		}

		let isCurrent = true;
		setIsLoadingVenues(true);

		apiClient
			.get<any[]>("/venues/venues/", {
				params: { course: courseId },
			})
			.then((res) => {
				if (!isCurrent) return;
				const list = Array.isArray(res.data)
					? res.data
					: (res.data as any)?.results || [];
				const mapped = list.map(mapRawVenueToVenue);
				setAllowedVenues(mapped.length > 0 ? mapped : venues);
				setIsLoadingVenues(false);
			})
			.catch(() => {
				if (!isCurrent) return;
				// Fallback to course-level filtering if API call fails
				const courseObj = courses.find(
					(c) => String(c.id) === String(courseId),
				);
				const filtered = venues.filter((v) => {
					if (v.owningLevel === "school") return true;
					if (
						v.owningLevel === "faculty" &&
						courseObj?.owningFaculty &&
						String(v.owningFacultyId) === String(courseObj.owningFaculty)
					) {
						return true;
					}
					if (
						v.owningLevel === "department" &&
						courseObj?.departmentId &&
						String(v.owningDepartmentId) === String(courseObj.departmentId)
					) {
						return true;
					}
					return false;
				});
				setAllowedVenues(filtered.length > 0 ? filtered : venues);
				setIsLoadingVenues(false);
			});

		return () => {
			isCurrent = false;
		};
	}, [isOpen, courseId, courses, venues]);

	// Auto-select first allowed venue if current selection is invalid
	useEffect(() => {
		if (allowedVenues.length > 0) {
			const exists = allowedVenues.some(
				(v) => String(v.id) === String(venueId),
			);
			if (!exists) {
				setVenueId(String(allowedVenues[0].id));
			}
		} else {
			setVenueId("");
		}
	}, [allowedVenues, venueId]);

	const selectedCourse = filteredCourses.find(
		(c) => String(c.id) === String(courseId),
	);
	const selectedVenue = allowedVenues.find(
		(v) => String(v.id) === String(venueId),
	);

	const handleSlotSelect = (start: string, end: string) => {
		setStartTime(start);
		setEndTime(end);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!courseId) {
			toast.error("Please select a course for the lecture.");
			return;
		}
		if (!venueId) {
			toast.error("Please select a venue.");
			return;
		}
		if (!startTime || !endTime) {
			toast.error("Please select an available time slot.");
			return;
		}

		const derivedTitle = isExam
			? `${selectedCourse?.code || "Course"} Examination`
			: `${selectedCourse?.code || "Course"} Lecture`;

		const dayCodeMap: Record<string, string> = {
			Monday: "MO",
			Tuesday: "TU",
			Wednesday: "WE",
			Thursday: "TH",
			Friday: "FR",
			Saturday: "SA",
		};
		const dayCode = dayCodeMap[dayOfWeek] || "MO";

		const recurrenceRule = isRecurring
			? `FREQ=WEEKLY;BYDAY=${dayCode}`
			: undefined;
		const recurrenceStartDate = isRecurring
			? activeSemester?.lectureStartDate || activeSemester?.startDate
			: defaultDate || new Date().toISOString().split("T")[0];
		const recurrenceEndDate = isRecurring
			? activeSemester?.lectureEndDate || activeSemester?.endDate
			: recurrenceStartDate;

		onSubmit({
			entry_type: isExam ? "exam" : "lecture",
			title: derivedTitle,
			course: courseId,
			course_code: selectedCourse?.code,
			venue: venueId,
			venue_name: selectedVenue?.name,
			day_of_week: dayOfWeek,
			start_time: startTime,
			end_time: endTime,
			recurrence_rule: recurrenceRule,
			recurrence_start_date: recurrenceStartDate,
			recurrence_end_date: recurrenceEndDate,
			semester: activeSemester?.id,
			target_program: programId ? String(programId) : undefined,
			target_level: level ? Number(level) : undefined,
			is_recurring: isRecurring,
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				isExam
					? isSlotClick
						? "Schedule Exam for Slot"
						: "Schedule Examination"
					: isSlotClick
						? "Schedule Lecture for Slot"
						: "Schedule Lecture"
			}
			description={
				isExam
					? isSlotClick
						? `Assign an exam session to ${defaultDay || "this slot"}.`
						: "Create an exam timetable entry. Automatically evaluates venue availability."
					: isSlotClick
						? `Assign a lecture session to ${defaultDay || "this slot"}.`
						: "Create a recurring timetable entry. Automatically evaluates venue and lecturer availability."
			}
			size="lg"
			footer={
				<div className="flex items-center justify-end gap-2.5 w-full">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={isPending}
						className="cursor-pointer text-xs"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={handleSubmit}
						disabled={isPending || !courseId || !venueId || !startTime || !endTime}
						className="cursor-pointer text-xs gap-1.5"
					>
						{isPending ? (
							<div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							""
						)}
						<span>
							{isRecurring ? "Submit Recurring Schedule" : "Schedule Session"}
						</span>
					</Button>
				</div>
			}
		>
			<form
				onSubmit={handleSubmit}
				className="space-y-4 max-h-[75vh] overflow-y-auto pr-1"
			>
				{/* 1. Program & Level Target Cohort Banner */}
				{(programName || level) && (
					<div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<BookOpen className="text-primary w-4 h-4 shrink-0" />
							<div>
								<span className="text-xs font-bold text-text-main block">
									{programName ? programName : "Degree Program"}
									{level ? ` · ${level} Level` : ""}
								</span>
								<span className="text-[11px] text-text-muted">
									Course options are filtered strictly for this {level ? `${level}L ` : ""}program timetable.
								</span>
							</div>
						</div>
						<Badge
							variant="primary"
							className="text-[10px] uppercase font-semibold"
						>
							{level ? `${level}L Cohort` : "Cohort"}
						</Badge>
					</div>
				)}

				{/* 2. Slot Click vs Recurring Pattern Banner */}
				{isSlotClick ? (
					<div className="p-3.5 bg-surface-raised border border-border rounded-xl flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<CalendarClock className="text-primary w-5 h-5 shrink-0" />
							<div>
								<Text
									variant="caption"
									className="font-bold text-text-main block"
								>
									Schedule for {defaultDay}
									{defaultDate ? ` (${defaultDate})` : ""}
								</Text>
								<Text
									variant="caption"
									className="text-primary font-medium text-xs"
								>
									Time Slot: {defaultStartTime?.slice(0, 5)} -{" "}
									{defaultEndTime?.slice(0, 5)}
								</Text>
							</div>
						</div>
						<Badge
							variant="secondary"
							className="text-[10px] uppercase font-semibold"
						>
							One-Time Slot
						</Badge>
					</div>
				) : (
					<div className="flex items-center justify-between p-2.5 bg-surface-raised rounded-xl border border-border">
						<div className="flex items-center gap-2">
							<Repeat size={15} className="text-primary" />
							<div>
								<span className="text-xs font-semibold text-text-main block">
									Weekly Recurring Pattern
								</span>
								<span className="text-[10px] text-text-muted">
									Applies across the semester lecture period (
									{activeSemester?.lectureStartDate || "Start"} to{" "}
									{activeSemester?.lectureEndDate || "End"})
								</span>
							</div>
						</div>
						<Badge variant="secondary" className="text-[10px]">
							Recurring Timetable
						</Badge>
					</div>
				)}

				{/* 3. Entry Type (Disabled indicator) & Day of Week */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Entry Type
						</Text>
						<div className="relative">
							<input
								type="text"
								value={isExam ? "Examination Session" : "Lecture Session"}
								disabled
								readOnly
								className="w-full h-10 px-3 rounded-xl bg-surface-raised/40 border border-border text-xs text-text-muted cursor-not-allowed select-none font-medium"
							/>
							<div className="absolute right-2.5 top-1/2 -translate-y-1/2">
								<Badge
									variant="secondary"
									className="text-[10px] bg-primary/15 text-primary border-primary/20"
								>
									{isExam ? "Exam Only" : "Lecture Only"}
								</Badge>
							</div>
						</div>
					</div>

					{/* Day of Week / Assigned Slot info */}
					{!isSlotClick ? (
						<div>
							<Text variant="caption" className="font-semibold mb-1 block">
								Day of Week
							</Text>
							<Select
								value={dayOfWeek}
								onChange={(e) => setDayOfWeek(e.target.value)}
								options={[
									{ value: "Monday", label: "Monday" },
									{ value: "Tuesday", label: "Tuesday" },
									{ value: "Wednesday", label: "Wednesday" },
									{ value: "Thursday", label: "Thursday" },
									{ value: "Friday", label: "Friday" },
								]}
							/>
						</div>
					) : (
						<div>
							<Text variant="caption" className="font-semibold mb-1 block">
								Slot Day & Time
							</Text>
							<input
								type="text"
								value={`${defaultDay} (${defaultStartTime?.slice(0, 5)} - ${defaultEndTime?.slice(0, 5)})`}
								disabled
								readOnly
								className="w-full h-10 px-3 rounded-xl bg-surface-raised/40 border border-border text-xs text-text-muted cursor-not-allowed select-none font-medium"
							/>
						</div>
					)}
				</div>

				{/* 4. Course Selection (Filtered strictly for program-level) */}
				<div>
					<div className="flex items-center justify-between mb-1">
						<Text variant="caption" className="font-semibold block">
							Course {level ? `(${level}L)` : ""}
						</Text>
						{selectedCourse && (
							<span className="text-[10px] text-text-muted">
								Level: {selectedCourse.level}L ·{" "}
								{selectedCourse.creditUnits || 3} Units
							</span>
						)}
					</div>
					{filteredCourses.length === 0 ? (
						<div className="p-3 rounded-xl border border-warning/30 bg-warning/10 text-warning text-xs space-y-1">
							<p className="font-semibold">
								No {level ? `${level}L ` : ""}courses found for {programName || "this program"}
							</p>
							<p className="text-[11px] opacity-80">
								Courses must be registered or configured for {programName || "this program"} at {level}L before lectures can be scheduled.
							</p>
						</div>
					) : (
						<Select
							value={courseId}
							onChange={(e) => setCourseId(e.target.value)}
							options={filteredCourses.map((c) => ({
								value: c.id,
								label: `${c.code} - ${c.title} (${c.level}L)`,
							}))}
						/>
					)}
				</div>

				{/* 5. Venue Selection (Resolved according to course allowed scope) */}
				<div>
					<div className="flex items-center justify-between mb-1">
						<Text variant="caption" className="font-semibold block">
							Venue (Course Allowed Scope)
						</Text>
						{isLoadingVenues && (
							<span className="text-[10px] text-primary flex items-center gap-1">
								<div className="w-2.5 h-2.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
								Resolving allowed venues...
							</span>
						)}
					</div>
					<Select
						value={venueId}
						onChange={(e) => setVenueId(e.target.value)}
						options={allowedVenues.map((v) => ({
							value: v.id,
							label: `${v.name} (Cap: ${v.capacity}${v.owningLevel ? ` · ${v.owningLevel}` : ""})`,
						}))}
					/>
				</div>

				{/* 6. Time Slot Picker (When not in slot click mode) */}
				{!isSlotClick && (
					<div className="pt-2">
						<TimeSlotPicker
							venueId={venueId}
							dayOfWeek={dayOfWeek}
							isEvent={false}
							selectedStartTime={startTime}
							selectedEndTime={endTime}
							onSelectSlot={handleSlotSelect}
						/>
					</div>
				)}
			</form>
		</Modal>
	);
}
