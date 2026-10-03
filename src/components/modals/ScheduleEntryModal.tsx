import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { Course, Venue, SessionType, Semester, Program } from "@/types";

interface ScheduleEntryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: Record<string, unknown>) => void;
	courses?: Course[];
	venues?: Venue[];
	semesters?: Semester[];
	programs?: Program[];
	defaultEntryType?: SessionType;
	defaultDay?: string;
	defaultDate?: string;
	defaultStartTime?: string;
	defaultEndTime?: string;
}

export default function ScheduleEntryModal({
	isOpen,
	onClose,
	onSubmit,
	courses = [],
	venues = [],
	semesters = [],
	programs = [],
	defaultEntryType = "lecture",
	defaultDay,
	defaultDate,
	defaultStartTime,
	defaultEndTime,
}: ScheduleEntryModalProps) {
	const [entryType, setEntryType] = useState<SessionType>(defaultEntryType);
	const [title, setTitle] = useState("");
	const [courseId, setCourseId] = useState<string>(courses[0]?.id || "");
	const [venueId, setVenueId] = useState<string>(venues[0]?.id || "");
	const [dayOfWeek, setDayOfWeek] = useState(defaultDay || "Monday");
	const [startTime, setStartTime] = useState(defaultStartTime || "08:00:00");
	const [endTime, setEndTime] = useState(defaultEndTime || "10:00:00");
	const [recurrenceRule] = useState("weekly");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [examDate, setExamDate] = useState(defaultDate || "");
	const [semesterId, setSemesterId] = useState("");
	const [targetProgramId, setTargetProgramId] = useState("");

	useEffect(() => {
		if (defaultEntryType) setEntryType(defaultEntryType);
		if (defaultDay) setDayOfWeek(defaultDay);
		if (defaultDate) setExamDate(defaultDate);
		if (defaultStartTime) setStartTime(defaultStartTime);
		if (defaultEndTime) setEndTime(defaultEndTime);
	}, [defaultEntryType, defaultDay, defaultDate, defaultStartTime, defaultEndTime]);

	const selectedSemester = semesters.find((s) => s.id === semesterId);

	useEffect(() => {
		if (!semesterId && semesters.length > 0) {
			const active = semesters.find((s) => s.isActive);
			const targetSem = active || semesters[0];
			setSemesterId(targetSem.id);
			if (entryType === "lecture") {
				setStartDate(targetSem.lectureStartDate || targetSem.startDate || "");
				setEndDate(targetSem.lectureEndDate || targetSem.endDate || "");
			} else if (entryType === "exam") {
				if (targetSem.examStartDate) {
					setExamDate((prev) => prev || targetSem.examStartDate || "");
				}
			}
		} else if (selectedSemester) {
			if (entryType === "lecture") {
				setStartDate(selectedSemester.lectureStartDate || selectedSemester.startDate || "");
				setEndDate(selectedSemester.lectureEndDate || selectedSemester.endDate || "");
			} else if (entryType === "exam" && !examDate && selectedSemester.examStartDate) {
				setExamDate(selectedSemester.examStartDate);
			}
		}
	}, [semesters, semesterId, entryType, selectedSemester, examDate]);

	useEffect(() => {
		if (courseId) {
			const selected = courses.find((c) => c.id === courseId);
			if (selected?.semesterId) setSemesterId(selected.semesterId);
			if (selected?.targetProgramId)
				setTargetProgramId(selected.targetProgramId);
		}
	}, [courseId, courses]);

	const handleExamDateChange = (val: string) => {
		setExamDate(val);
		if (val) {
			const dt = new Date(`${val}T00:00:00`);
			const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			const dName = days[dt.getDay()];
			if (dName) setDayOfWeek(dName);
		}
	};

	const hasExamPeriod = Boolean(selectedSemester?.examStartDate && selectedSemester?.examEndDate);
	const isExamBlocked = entryType === "exam" && !hasExamPeriod;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isExamBlocked) return;
		const selectedCourse = courses.find((c) => c.id === courseId);
		const selectedVenue = venues.find((v) => v.id === venueId);

		const effectiveStartDate = entryType === "exam" ? (examDate || startDate) : startDate;
		const effectiveEndDate = entryType === "exam" ? (examDate || endDate) : endDate;

		onSubmit({
			entry_type: entryType,
			title: title || `${selectedCourse?.code || "Session"} ${entryType}`,
			course: courseId,
			course_code: selectedCourse?.code,
			venue: venueId,
			venue_name: selectedVenue?.name,
			day_of_week: dayOfWeek,
			start_time: startTime,
			end_time: endTime,
			recurrence_rule: entryType === "lecture" ? recurrenceRule : undefined,
			recurrence_start_date: effectiveStartDate || undefined,
			recurrence_end_date: effectiveEndDate || undefined,
			semester: semesterId || undefined,
			target_program: targetProgramId || undefined,
		});
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Create Timetable Entry"
			description="Schedule a lecture, exam, or campus event. Automatically evaluates venue and lecturer conflicts."
			size="xl"
			footer={
				<>
					<Button
						variant="outline"
						onClick={onClose}
						className="cursor-pointer"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleSubmit}
						disabled={isExamBlocked}
						className="cursor-pointer"
					>
						Submit Schedule Entry
					</Button>
				</>
			}
		>
			<form
				onSubmit={handleSubmit}
				className="space-y-4 max-h-[75vh] overflow-y-auto pr-1"
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Entry Type
						</Text>
						<Select
							value={entryType}
							onChange={(e) => setEntryType(e.target.value as SessionType)}
							options={[
								{ value: "lecture", label: "Lecture Session" },
								{ value: "exam", label: "Exam Sitting" },
								{ value: "event", label: "Department Event" },
							]}
						/>
					</div>
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Entry Title (Optional)
						</Text>
						<Input
							placeholder="e.g. CSC301 Weekly Lecture"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Semester
						</Text>
						<Select
							value={semesterId}
							onChange={(e) => setSemesterId(e.target.value)}
							options={semesters.map((s) => ({
								value: s.id,
								label: `${s.displayName || (s.name === "first" ? "First Semester" : "Second Semester")}${s.isActive ? " (Active)" : ""}`,
							}))}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Course
						</Text>
						<Select
							value={courseId || (courses[0]?.id ?? "")}
							onChange={(e) => setCourseId(e.target.value)}
							options={courses.map((c) => ({
								value: c.id,
								label: `${c.code} - ${c.title} (${c.level}L)`,
							}))}
						/>
					</div>
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Venue
						</Text>
						<Select
							value={venueId || (venues[0]?.id ?? "")}
							onChange={(e) => setVenueId(e.target.value)}
							options={venues.map((v) => ({
								value: v.id,
								label: `${v.name} (Cap: ${v.capacity})`,
							}))}
						/>
					</div>
				</div>

				{programs.length > 0 && (
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Target Program
						</Text>
						<Select
							value={targetProgramId}
							onChange={(e) => setTargetProgramId(e.target.value)}
							options={[
								{ value: "", label: "General / All Programs in Department" },
								...programs.map((p) => ({
									value: p.id,
									label: `${p.name} (${p.code})`,
								})),
							]}
						/>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
								{ value: "Saturday", label: "Saturday" },
							]}
						/>
					</div>
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Start Time
						</Text>
						<Input
							type="time"
							value={startTime.slice(0, 5)}
							onChange={(e) => setStartTime(`${e.target.value}:00`)}
							required
						/>
					</div>
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							End Time
						</Text>
						<Input
							type="time"
							value={endTime.slice(0, 5)}
							onChange={(e) => setEndTime(`${e.target.value}:00`)}
							required
						/>
					</div>
				</div>

				{entryType === "lecture" && (
					<div className="p-3 bg-surface-raised rounded-xl border border-border space-y-3">
						<div className="flex items-center justify-between">
							<Text variant="caption" className="font-bold text-text-main block">
								Lecture Teaching Period
							</Text>
							<span className="text-[10px] text-text-muted">
								Sessions will only be materialized within this period
							</span>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<Text variant="caption" className="text-xs mb-1 block">
									Lecture Start Date
								</Text>
								<Input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>
							<div>
								<Text variant="caption" className="text-xs mb-1 block">
									Lecture End Date
								</Text>
								<Input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</div>
						</div>
					</div>
				)}

				{entryType === "exam" && (
					<div className="p-3 bg-surface-raised rounded-xl border border-border space-y-3">
						<div className="flex items-center justify-between">
							<Text variant="caption" className="font-bold text-text-main block">
								Exam Sitting Schedule
							</Text>
							{hasExamPeriod ? (
								<span className="text-[10px] text-primary font-medium">
									Exam Period: {selectedSemester?.examStartDate} to {selectedSemester?.examEndDate}
								</span>
							) : (
								<span className="text-[10px] text-danger font-semibold">
									No Exam Period Defined
								</span>
							)}
						</div>

						{isExamBlocked ? (
							<div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
								An examination period must be defined for this semester before exams can be scheduled. Please contact your school or faculty administrator.
							</div>
						) : (
							<div>
								<Text variant="caption" className="text-xs mb-1 block">
									Exam Sitting Date <span className="text-danger">*</span>
								</Text>
								<Input
									type="date"
									value={examDate}
									min={selectedSemester?.examStartDate}
									max={selectedSemester?.examEndDate}
									onChange={(e) => handleExamDateChange(e.target.value)}
									required
								/>
								<span className="text-[11px] text-text-muted mt-1 block">
									Selected day of week: {dayOfWeek}
								</span>
							</div>
						)}
					</div>
				)}
			</form>
		</Modal>
	);
}
