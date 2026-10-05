import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { AcademicSession, Semester } from "@/types";
import { toast } from "sonner";

interface CreateSemesterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		session: string;
		name: "first" | "second" | "third" | "fourth" | string;
		start_date: string;
		end_date: string;
		duration_type: "weeks" | "months" | "fixed";
		duration_value?: number;
		lecture_start_date: string;
		lecture_end_date: string;
		exam_start_date?: string;
		exam_end_date?: string;
		is_active: boolean;
	}) => void;
	sessions: AcademicSession[];
	existingSemesters?: Semester[];
	defaultSessionId?: string;
	isPending?: boolean;
}

export default function CreateSemesterModal({
	isOpen,
	onClose,
	onSubmit,
	sessions,
	existingSemesters,
	defaultSessionId,
	isPending = false,
}: CreateSemesterModalProps) {
	const [sessionId, setSessionId] = useState(defaultSessionId || "");
	const [name, setName] = useState<string>("first");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [durationType, setDurationType] = useState<
		"weeks" | "months" | "fixed"
	>("weeks");
	const [durationValue, setDurationValue] = useState("16");
	const [lectureStartDate, setLectureStartDate] = useState("");
	const [lectureEndDate, setLectureEndDate] = useState("");
	const [examStartDate, setExamStartDate] = useState("");
	const [examEndDate, setExamEndDate] = useState("");
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		if (isOpen) {
			if (defaultSessionId) {
				setSessionId(defaultSessionId);
			} else if (sessions.length > 0 && !sessionId) {
				setSessionId(sessions[0].id);
			}
		}
	}, [isOpen, defaultSessionId, sessions, sessionId]);

	// Find the currently selected session
	const activeSessionId = sessionId || defaultSessionId || sessions[0]?.id || "";
	const selectedSession = useMemo(() => {
		return (
			sessions.find((s) => String(s.id) === String(activeSessionId)) ||
			sessions[0]
		);
	}, [sessions, activeSessionId]);

	// Find existing semesters for this session
	const sessionExistingSemesters = useMemo(() => {
		if (!selectedSession) return [];
		if (existingSemesters && existingSemesters.length > 0) {
			return existingSemesters.filter(
				(sem) => String(sem.sessionId) === String(selectedSession.id),
			);
		}
		return selectedSession.semesters || [];
	}, [selectedSession, existingSemesters]);

	const existingSemesterNames = useMemo(() => {
		return new Set(sessionExistingSemesters.map((s) => s.name.toLowerCase()));
	}, [sessionExistingSemesters]);

	// Total allowed semesters for this session (from maxSemesters configuration)
	const maxSemesters = selectedSession?.maxSemesters ?? 2;

	// Full list of possible semester options
	const ALL_SEMESTER_OPTIONS = useMemo(
		() => [
			{ value: "first", label: "First Semester", order: 1 },
			{ value: "second", label: "Second Semester", order: 2 },
			{ value: "third", label: "Third Semester", order: 3 },
			{ value: "fourth", label: "Fourth Semester", order: 4 },
		],
		[],
	);

	// Slice based on maxSemesters
	const sessionAllowedOptions = useMemo(() => {
		const cap = Math.min(Math.max(maxSemesters, 1), ALL_SEMESTER_OPTIONS.length);
		return ALL_SEMESTER_OPTIONS.slice(0, cap);
	}, [ALL_SEMESTER_OPTIONS, maxSemesters]);

	// Only remaining semesters should be displayed on the semester selection
	const remainingSemesterOptions = useMemo(() => {
		return sessionAllowedOptions.filter(
			(opt) => !existingSemesterNames.has(opt.value.toLowerCase()),
		);
	}, [sessionAllowedOptions, existingSemesterNames]);

	const isSessionFull = remainingSemesterOptions.length === 0;

	// When remainingSemesterOptions changes, auto-select the first available remaining option
	useEffect(() => {
		if (remainingSemesterOptions.length > 0) {
			if (!remainingSemesterOptions.some((opt) => opt.value === name)) {
				setName(remainingSemesterOptions[0].value);
			}
		}
	}, [remainingSemesterOptions, name]);

	// Auto-compute end_date when start_date or duration changes
	useEffect(() => {
		if (!startDate) return;
		if (durationType === "weeks" && durationValue) {
			const start = new Date(startDate);
			const weeks = parseInt(durationValue, 10);
			if (!isNaN(weeks) && weeks > 0) {
				const computed = new Date(start);
				computed.setDate(computed.getDate() + weeks * 7);
				setEndDate(computed.toISOString().split("T")[0]);
			}
		} else if (durationType === "months" && durationValue) {
			const start = new Date(startDate);
			const months = parseInt(durationValue, 10);
			if (!isNaN(months) && months > 0) {
				const computed = new Date(start);
				computed.setMonth(computed.getMonth() + months);
				setEndDate(computed.toISOString().split("T")[0]);
			}
		}
	}, [startDate, durationType, durationValue]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const finalSessionId = sessionId || sessions[0]?.id || "";
		if (isSessionFull) {
			toast.error(
				`All ${maxSemesters} semesters have already been created for this session.`,
			);
			return;
		}

		if (
			!finalSessionId ||
			!startDate ||
			!endDate ||
			!lectureStartDate ||
			!lectureEndDate
		) {
			toast.error(
				"Please fill in all required fields including the lecture start and end dates.",
			);
			return;
		}

		if (lectureStartDate >= lectureEndDate) {
			toast.error("Lecture start date must be before lecture end date.");
			return;
		}

		if (lectureStartDate < startDate) {
			toast.error("Lecture start date cannot be before semester start date.");
			return;
		}

		if (lectureEndDate > endDate) {
			toast.error("Lecture end date cannot be after semester end date.");
			return;
		}

		if (examStartDate && examEndDate) {
			if (examStartDate >= examEndDate) {
				toast.error("Exam start date must be before exam end date.");
				return;
			}
			if (examStartDate < startDate || examEndDate > endDate) {
				toast.error("Exam period dates must fall within the semester timeline.");
				return;
			}
		}

		onSubmit({
			session: finalSessionId,
			name,
			start_date: startDate,
			end_date: endDate,
			duration_type: durationType,
			duration_value:
				durationType !== "fixed" ? Number(durationValue) : undefined,
			lecture_start_date: lectureStartDate,
			lecture_end_date: lectureEndDate,
			exam_start_date: examStartDate || undefined,
			exam_end_date: examEndDate || undefined,
			is_active: isActive,
		});
	};

	const handleClose = () => {
		setName("first");
		setStartDate("");
		setEndDate("");
		setDurationType("weeks");
		setDurationValue("16");
		setLectureStartDate("");
		setLectureEndDate("");
		setExamStartDate("");
		setExamEndDate("");
		setIsActive(false);
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Create Semester"
			description="Define a new semester, its teaching calendar, and exam period."
			footer={
				<>
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={isPending}
						className="cursor-pointer"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleSubmit}
						disabled={isPending || isSessionFull}
						className="cursor-pointer"
					>
						{isPending
							? "Creating..."
							: isSessionFull
								? "Session Full"
								: "Create Semester"}
					</Button>
				</>
			}
		>
			<form
				onSubmit={handleSubmit}
				className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
			>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Academic Session
						</Text>
						<Select
							value={sessionId || (sessions[0]?.id ?? "")}
							onChange={(e) => setSessionId(e.target.value)}
							options={sessions.map((s) => ({
								value: s.id,
								label: `${s.label} (${s.schoolCode || s.schoolName || "School"})`,
							}))}
							disabled={sessions.length <= 1}
						/>
					</div>

					<div>
						<div className="flex items-center justify-between mb-1">
							<Text variant="caption" className="font-semibold block">
								Semester
							</Text>
							{selectedSession && (
								<span className="text-[10px] text-text-muted">
									{sessionExistingSemesters.length}/{maxSemesters} configured
								</span>
							)}
						</div>
						{isSessionFull ? (
							<div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
								All {maxSemesters} semesters have already been created for {selectedSession?.label}.
							</div>
						) : (
							<Select
								value={name}
								onChange={(e) => setName(e.target.value)}
								options={remainingSemesterOptions.map((opt) => ({
									value: opt.value,
									label: opt.label,
								}))}
							/>
						)}
					</div>
				</div>

				{/* Duration Configuration */}
				<div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
					<Text
						variant="caption"
						weight="bold"
						className="text-text-main block"
					>
						Duration & Teaching Period
					</Text>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<Text variant="caption" className="text-text-muted mb-1 block">
								Duration Mode
							</Text>
							<Select
								value={durationType}
								onChange={(e) =>
									setDurationType(
										e.target.value as "weeks" | "months" | "fixed",
									)
								}
								options={[
									{ value: "weeks", label: "Weeks" },
									{ value: "months", label: "Months" },
									{ value: "fixed", label: "Fixed End Date" },
								]}
							/>
						</div>

						{durationType !== "fixed" && (
							<div>
								<Text variant="caption" className="text-text-muted mb-1 block">
									Number of {durationType === "weeks" ? "Weeks" : "Months"}
								</Text>
								<Input
									type="number"
									min="1"
									max={durationType === "weeks" ? "52" : "12"}
									value={durationValue}
									onChange={(e) => setDurationValue(e.target.value)}
									required
								/>
							</div>
						)}
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<Text variant="caption" className="text-text-muted mb-1 block">
								Semester Start Date
							</Text>
							<Input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								required
							/>
						</div>
						<div>
							<Text variant="caption" className="text-text-muted mb-1 block">
								Semester End Date
							</Text>
							<Input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								disabled={durationType !== "fixed"}
								required
							/>
						</div>
					</div>
				</div>

				{/* Teaching Period (Required) */}
				<div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
					<div className="flex items-center justify-between">
						<Text
							variant="caption"
							weight="bold"
							className="text-primary block"
						>
							Teaching Period (Lectures)
						</Text>
						<span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
							Required for Timetabling
						</span>
					</div>
					<Text variant="caption" color="muted" className="block -mt-1 text-[11px]">
						Set the strict dates when lectures occur. Lectures will only be scheduled within this window.
					</Text>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<Text variant="caption" className="text-text-muted mb-1 block">
								Lecture Start Date *
							</Text>
							<Input
								type="date"
								value={lectureStartDate}
								onChange={(e) => setLectureStartDate(e.target.value)}
								min={startDate}
								max={endDate || undefined}
								required
							/>
						</div>
						<div>
							<Text variant="caption" className="text-text-muted mb-1 block">
								Lecture End Date *
							</Text>
							<Input
								type="date"
								value={lectureEndDate}
								onChange={(e) => setLectureEndDate(e.target.value)}
								min={lectureStartDate || startDate}
								max={endDate || undefined}
								required
							/>
						</div>
					</div>
				</div>

				{/* Optional Exam Period */}
				<div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
					<Text
						variant="caption"
						weight="bold"
						className="text-text-main block"
					>
						Examination Period (Optional)
					</Text>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<Text variant="caption" className="text-text-muted mb-1 block">
								Exam Start Date
							</Text>
							<Input
								type="date"
								value={examStartDate}
								onChange={(e) => setExamStartDate(e.target.value)}
								min={startDate}
								max={endDate || undefined}
							/>
						</div>
						<div>
							<Text variant="caption" className="text-text-muted mb-1 block">
								Exam End Date
							</Text>
							<Input
								type="date"
								value={examEndDate}
								onChange={(e) => setExamEndDate(e.target.value)}
								min={examStartDate || startDate}
								max={endDate || undefined}
							/>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2 pt-1">
					<input
						type="checkbox"
						id="isActiveSemester"
						checked={isActive}
						onChange={(e) => setIsActive(e.target.checked)}
						className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
					/>
					<label
						htmlFor="isActiveSemester"
						className="text-sm font-medium text-text-main cursor-pointer select-none"
					>
						Set as Active Semester for this School
					</label>
				</div>
			</form>
		</Modal>
	);
}
