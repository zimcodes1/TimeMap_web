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
	defaultDay?: string;
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
	defaultDay,
	defaultStartTime,
	defaultEndTime,
}: ScheduleEntryModalProps) {
	const [entryType, setEntryType] = useState<SessionType>("lecture");
	const [title, setTitle] = useState("");
	const [courseId, setCourseId] = useState<string>(courses[0]?.id || "");
	const [venueId, setVenueId] = useState<string>(venues[0]?.id || "");
	const [dayOfWeek, setDayOfWeek] = useState(defaultDay || "Monday");
	const [startTime, setStartTime] = useState(defaultStartTime || "08:00:00");
	const [endTime, setEndTime] = useState(defaultEndTime || "10:00:00");
	const [recurrenceRule] = useState("weekly");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [semesterId, setSemesterId] = useState("");
	const [targetProgramId, setTargetProgramId] = useState("");

	useEffect(() => {
		if (defaultDay) setDayOfWeek(defaultDay);
		if (defaultStartTime) setStartTime(defaultStartTime);
		if (defaultEndTime) setEndTime(defaultEndTime);
	}, [defaultDay, defaultStartTime, defaultEndTime]);

	useEffect(() => {
		if (!semesterId && semesters.length > 0) {
			const active = semesters.find((s) => s.isActive);
			const targetSem = active || semesters[0];
			setSemesterId(targetSem.id);
			if (targetSem.startDate) setStartDate(targetSem.startDate);
			if (targetSem.endDate) setEndDate(targetSem.endDate);
		}
	}, [semesters, semesterId]);

	useEffect(() => {
		if (courseId) {
			const selected = courses.find((c) => c.id === courseId);
			if (selected?.semesterId) setSemesterId(selected.semesterId);
			if (selected?.targetProgramId)
				setTargetProgramId(selected.targetProgramId);
		}
	}, [courseId, courses]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const selectedCourse = courses.find((c) => c.id === courseId);
		const selectedVenue = venues.find((v) => v.id === venueId);

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
			recurrence_rule: recurrenceRule,
			recurrence_start_date: startDate || undefined,
			recurrence_end_date: endDate || undefined,
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
						<Text variant="caption" className="font-bold text-text-main block">
							Lecture Recurrence Schedule
						</Text>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<Text variant="caption" className="text-xs mb-1 block">
									Semester Start Date
								</Text>
								<Input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>
							<div>
								<Text variant="caption" className="text-xs mb-1 block">
									Semester End Date
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
			</form>
		</Modal>
	);
}
