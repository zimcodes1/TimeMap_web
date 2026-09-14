import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { AcademicSession } from "@/types";

interface CreateSemesterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		session: string;
		name: "first" | "second";
		start_date: string;
		end_date: string;
		duration_type: "weeks" | "months" | "fixed";
		duration_value?: number;
		lecture_start_date?: string;
		lecture_end_date?: string;
		exam_start_date?: string;
		exam_end_date?: string;
		is_active: boolean;
	}) => void;
	sessions: AcademicSession[];
	defaultSessionId?: string;
	isPending?: boolean;
}

export default function CreateSemesterModal({
	isOpen,
	onClose,
	onSubmit,
	sessions,
	defaultSessionId,
	isPending = false,
}: CreateSemesterModalProps) {
	const [sessionId, setSessionId] = useState(defaultSessionId || "");
	const [name, setName] = useState<"first" | "second">("first");
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
		if (defaultSessionId) {
			setSessionId(defaultSessionId);
		} else if (sessions.length > 0 && !sessionId) {
			setSessionId(sessions[0].id);
		}
	}, [sessions, defaultSessionId, sessionId]);

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
		const activeSessionId = sessionId || sessions[0]?.id || "";
		if (!activeSessionId || !startDate || !endDate) return;

		onSubmit({
			session: activeSessionId,
			name,
			start_date: startDate,
			end_date: endDate,
			duration_type: durationType,
			duration_value:
				durationType !== "fixed" ? Number(durationValue) : undefined,
			lecture_start_date: lectureStartDate || undefined,
			lecture_end_date: lectureEndDate || undefined,
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
						disabled={isPending}
						className="cursor-pointer"
					>
						{isPending ? "Creating..." : "Create Semester"}
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
						<Text variant="caption" className="font-semibold mb-1 block">
							Semester
						</Text>
						<Select
							value={name}
							onChange={(e) => setName(e.target.value as "first" | "second")}
							options={[
								{ value: "first", label: "First Semester" },
								{ value: "second", label: "Second Semester" },
							]}
						/>
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
						{durationType !== "fixed" ? (
							<div>
								<Text variant="caption" className="text-text-muted mb-1 block">
									Duration ({durationType})
								</Text>
								<Input
									type="number"
									min="1"
									max="52"
									value={durationValue}
									onChange={(e) => setDurationValue(e.target.value)}
									placeholder={`e.g. ${durationType === "weeks" ? "16" : "4"}`}
									required
								/>
							</div>
						) : null}
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
								required
								disabled={durationType !== "fixed"}
							/>
						</div>
					</div>
				</div>

				{/* Lecture Periods */}
				<div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
					<Text
						variant="caption"
						weight="bold"
						className="text-text-main block"
					>
						Lecture Schedule (Optional)
					</Text>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<Text variant="caption" className="text-text-muted mb-1 block">
								Lecture Start Date
							</Text>
							<Input
								type="date"
								value={lectureStartDate}
								onChange={(e) => setLectureStartDate(e.target.value)}
							/>
						</div>
						<div>
							<Text variant="caption" className="text-text-muted mb-1 block">
								Lecture End Date
							</Text>
							<Input
								type="date"
								value={lectureEndDate}
								onChange={(e) => setLectureEndDate(e.target.value)}
							/>
						</div>
					</div>
				</div>

				{/* Exam Periods */}
				<div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
					<Text
						variant="caption"
						weight="bold"
						className="text-text-main block"
					>
						Examinations Schedule (Optional)
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
						className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
					/>
					<label
						htmlFor="isActiveSemester"
						className="text-sm font-medium text-text-main cursor-pointer"
					>
						Set as Active Semester
					</label>
				</div>
			</form>
		</Modal>
	);
}
