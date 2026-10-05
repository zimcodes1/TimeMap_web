import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarClock, Repeat } from "lucide-react";
import apiClient from "@/api/apiClient";
import { mapRawVenueToVenue } from "@/api/main/venuesAPI";
import { TimeSlotPicker } from "@/components/schedules/TimeSlotPicker";
import type { Course, Venue, Semester } from "@/types";

interface ScheduleEntryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		entry_type: "lecture" | "event" | "exam";
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
		is_recurring?: boolean;
	}) => void;
	courses?: Course[];
	venues?: Venue[];
	activeSemester?: Semester | null;
	defaultEntryType?: "lecture" | "event" | "exam";
	defaultDay?: string;
	defaultDate?: string;
	defaultStartTime?: string;
	defaultEndTime?: string;
	isSlotClick?: boolean;
	userDepartmentId?: string | number;
	userFacultyId?: string | number;
	userSchoolId?: string | number;
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
	userFacultyId,
	userSchoolId,
	isPending = false,
}: ScheduleEntryModalProps) {
	const [entryType, setEntryType] = useState<"lecture" | "event" | "exam">(
		defaultEntryType,
	);
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

	// Synchronize defaults on open or prop change
	useEffect(() => {
		if (isOpen) {
			setEntryType(defaultEntryType || "lecture");
			setDayOfWeek(defaultDay || "Monday");
			setStartTime(defaultStartTime || "08:00:00");
			setEndTime(defaultEndTime || "10:00:00");
			setIsRecurring(!isSlotClick);
			if (courses.length > 0 && !courseId) {
				setCourseId(courses[0].id);
			}
		}
	}, [
		isOpen,
		defaultEntryType,
		defaultDay,
		defaultStartTime,
		defaultEndTime,
		isSlotClick,
		courses,
		courseId,
	]);

	// Resolve allowed venues:
	// - For lectures: Backend course-scope API filter (/api/venues/venues/?course=courseId)
	// - For department events: Department venues U Faculty venues without department U School venues
	useEffect(() => {
		if (!isOpen) return;

		if (entryType === "lecture") {
			if (!courseId && courses.length > 0) {
				setCourseId(courses[0].id);
			}

			const targetCourseId = courseId || courses[0]?.id;
			if (!targetCourseId) {
				setAllowedVenues(venues);
				return;
			}

			let isCurrent = true;
			setIsLoadingVenues(true);

			apiClient
				.get<any[]>("/venues/venues/", {
					params: { course: targetCourseId },
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
						(c) => String(c.id) === String(targetCourseId),
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
		} else {
			// Department Event pattern:
			// Department venues U Faculty venues belonging to no particular department U School venues
			const filtered = venues.filter((v) => {
				// 1. Department venues
				if (
					v.owningLevel === "department" &&
					userDepartmentId &&
					String(v.owningDepartmentId) === String(userDepartmentId)
				) {
					return true;
				}
				// 2. Faculty venues belonging to no particular department
				if (
					v.owningLevel === "faculty" &&
					(!v.owningDepartmentId || v.owningDepartmentId === "") &&
					userFacultyId &&
					String(v.owningFacultyId) === String(userFacultyId)
				) {
					return true;
				}
				// 3. School venues
				if (
					v.owningLevel === "school" &&
					userSchoolId &&
					String(v.owningSchoolId) === String(userSchoolId)
				) {
					return true;
				}
				// Fallback if scopes are not specifically set
				if (!userDepartmentId && !userFacultyId) return true;
				return false;
			});

			setAllowedVenues(filtered.length > 0 ? filtered : venues);
			setIsLoadingVenues(false);
		}
	}, [
		isOpen,
		entryType,
		courseId,
		courses,
		venues,
		userDepartmentId,
		userFacultyId,
		userSchoolId,
	]);

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

	const selectedCourse = courses.find((c) => String(c.id) === String(courseId));
	const selectedVenue = allowedVenues.find(
		(v) => String(v.id) === String(venueId),
	);

	const handleSlotSelect = (start: string, end: string) => {
		setStartTime(start);
		setEndTime(end);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!venueId) {
			toast.error("Please select a venue.");
			return;
		}
		if (!startTime || !endTime) {
			toast.error("Please select an available time slot.");
			return;
		}

		const derivedTitle =
			entryType === "event"
				? "Department Event"
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
			entry_type: entryType,
			title: derivedTitle,
			course: entryType === "lecture" ? courseId : undefined,
			course_code: entryType === "lecture" ? selectedCourse?.code : undefined,
			venue: venueId,
			venue_name: selectedVenue?.name,
			day_of_week: dayOfWeek,
			start_time: startTime,
			end_time: endTime,
			recurrence_rule: recurrenceRule,
			recurrence_start_date: recurrenceStartDate,
			recurrence_end_date: recurrenceEndDate,
			semester: activeSemester?.id,
			is_recurring: isRecurring,
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isSlotClick ? "Schedule for Slot" : "Schedule Lecture / Event"}
			description={
				isSlotClick
					? "Assign a single one-time lecture or department event to this slot."
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
						disabled={isPending || !venueId || !startTime || !endTime}
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
				{/* 1. Header Information if opened via Grid Slot Click */}
				{isSlotClick ? (
					<div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
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
							variant="primary"
							className="text-[10px] uppercase font-semibold"
						>
							One-Time Session
						</Badge>
					</div>
				) : (
					/* Pattern Type Indicator when opened from top Schedule Lecture button */
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

				{/* 2. Entry Type Selection */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Entry Type
						</Text>
						<Select
							value={entryType}
							onChange={(e) =>
								setEntryType(e.target.value as "lecture" | "event" | "exam")
							}
							options={[
								{ value: "lecture", label: "Lecture Session" },
								{ value: "event", label: "Department Event" },
								...(entryType === "exam"
									? [{ value: "exam", label: "Exam Sitting" }]
									: []),
							]}
						/>
					</div>

					{/* 3. Day of Week Selection (Only shown when not opened via slot click) */}
					{!isSlotClick && (
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
					)}
				</div>

				{/* 4. Course Selection (For Lectures) */}
				{entryType === "lecture" && (
					<div>
						<div className="flex items-center justify-between mb-1">
							<Text variant="caption" className="font-semibold block">
								Course
							</Text>
							{selectedCourse && (
								<span className="text-[10px] text-text-muted">
									Level: {selectedCourse.level}L ·{" "}
									{selectedCourse.creditUnits || 3} Units
								</span>
							)}
						</div>
						<Select
							value={courseId}
							onChange={(e) => setCourseId(e.target.value)}
							options={courses.map((c) => ({
								value: c.id,
								label: `${c.code} - ${c.title} (${c.level}L)`,
							}))}
						/>
					</div>
				)}

				{/* 5. Venue Selection (Resolved according to course scope or event scope) */}
				<div>
					<div className="flex items-center justify-between mb-1">
						<Text variant="caption" className="font-semibold block">
							Venue{" "}
							{entryType === "lecture"
								? "(Course Allowed Scope)"
								: "(Department Scope)"}
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
							isEvent={entryType === "event"}
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
