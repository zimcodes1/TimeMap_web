import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { ShieldCheck, AlertCircle } from "lucide-react";
import type { Semester } from "@/types";
import { toast } from "sonner";

interface SetExamPeriodModalProps {
	isOpen: boolean;
	onClose: () => void;
	semester: Semester | null;
	currentAllowFacultyExamPeriod?: boolean;
	onSubmit: (data: {
		exam_start_date: string;
		exam_end_date: string;
		allow_faculty_exam_period?: boolean;
	}) => void;
	isPending?: boolean;
}

export default function SetExamPeriodModal({
	isOpen,
	onClose,
	semester,
	currentAllowFacultyExamPeriod = false,
	onSubmit,
	isPending = false,
}: SetExamPeriodModalProps) {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [allowFacultyOverride, setAllowFacultyOverride] = useState(
		currentAllowFacultyExamPeriod,
	);

	useEffect(() => {
		if (semester) {
			setStartDate(semester.examStartDate || "");
			setEndDate(semester.examEndDate || "");
		}
		setAllowFacultyOverride(currentAllowFacultyExamPeriod);
	}, [semester, currentAllowFacultyExamPeriod, isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!startDate || !endDate) {
			toast.error("Please provide both exam start and end dates.");
			return;
		}

		if (startDate >= endDate) {
			toast.error("Exam start date must be before end date.");
			return;
		}

		if (semester?.startDate && startDate < semester.startDate) {
			toast.error("Exam start date cannot be before the semester start date.");
			return;
		}

		if (semester?.endDate && endDate > semester.endDate) {
			toast.error("Exam end date cannot be after the semester end date.");
			return;
		}

		onSubmit({
			exam_start_date: startDate,
			exam_end_date: endDate,
			allow_faculty_exam_period: allowFacultyOverride,
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Configure Examination Period"
			description={`Define the official school-wide examination period for ${semester?.displayName || semester?.name || "the semester"}.`}
			footer={
				<>
					<Button
						variant="outline"
						onClick={onClose}
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
						{isPending ? "Saving..." : "Save Exam Period"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				{semester && (
					<div className="p-3 bg-surface-raised border border-border rounded-xl text-xs flex items-center justify-between">
						<div>
							<span className="text-text-muted">Semester Span:</span>{" "}
							<span className="font-semibold text-text-main">
								{semester.startDate} to {semester.endDate}
							</span>
						</div>
						{semester.lectureEndDate && (
							<div>
								<span className="text-text-muted">Lectures End:</span>{" "}
								<span className="font-semibold text-text-main">
									{semester.lectureEndDate}
								</span>
							</div>
						)}
					</div>
				)}

				<div className="grid grid-cols-2 gap-3">
					<div>
						<Text variant="caption" className="text-text-muted mb-1 block">
							Exam Period Start <span className="text-danger">*</span>
						</Text>
						<Input
							type="date"
							value={startDate}
							min={semester?.lectureEndDate || semester?.startDate}
							max={semester?.endDate}
							onChange={(e) => setStartDate(e.target.value)}
							required
						/>
					</div>
					<div>
						<Text variant="caption" className="text-text-muted mb-1 block">
							Exam Period End <span className="text-danger">*</span>
						</Text>
						<Input
							type="date"
							value={endDate}
							min={startDate || semester?.startDate}
							max={semester?.endDate}
							onChange={(e) => setEndDate(e.target.value)}
							required
						/>
					</div>
				</div>

				<div className="p-4 bg-surface-raised border border-border rounded-xl space-y-3">
					<div className="flex items-start gap-3">
						<input
							type="checkbox"
							id="allowFacultyExamToggle"
							checked={allowFacultyOverride}
							onChange={(e) => setAllowFacultyOverride(e.target.checked)}
							className="mt-0.5 w-4 h-4 rounded text-primary border-border focus:ring-primary"
						/>
						<label
							htmlFor="allowFacultyExamToggle"
							className="text-xs text-text-main cursor-pointer space-y-1 block"
						>
							<div className="font-bold flex items-center gap-1.5 text-text-main">
								<ShieldCheck size={14} className="text-primary" />
								<span>Allow Faculty Administrators to set their own exam periods</span>
							</div>
							<p className="text-text-muted text-[11px] leading-relaxed">
								When enabled, faculty administrators can independently specify examination
								dates for their faculty. When revoked, faculty periods are overwritten and
								revert to the school schedule.
							</p>
						</label>
					</div>

					{!allowFacultyOverride && currentAllowFacultyExamPeriod && (
						<div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
							<AlertCircle size={14} className="shrink-0 text-amber-400" />
							<span>
								Revoking this permission will reset all custom faculty exam periods back to
								this school-wide period.
							</span>
						</div>
					)}
				</div>
			</form>
		</Modal>
	);
}
