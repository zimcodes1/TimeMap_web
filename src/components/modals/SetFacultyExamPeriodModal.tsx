import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import type { Semester, FacultyExamPeriod } from "@/types";
import { toast } from "sonner";

interface SetFacultyExamPeriodModalProps {
	isOpen: boolean;
	onClose: () => void;
	semester: Semester | null;
	facultyId: string;
	facultyName: string;
	currentPeriod?: FacultyExamPeriod | null;
	onSubmit: (data: { start_date: string; end_date: string }) => void;
	onResetToSchool?: () => void;
	isPending?: boolean;
}

export default function SetFacultyExamPeriodModal({
	isOpen,
	onClose,
	semester,
	facultyId: _facultyId,
	facultyName,
	currentPeriod,
	onSubmit,
	onResetToSchool,
	isPending = false,
}: SetFacultyExamPeriodModalProps) {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	useEffect(() => {
		if (currentPeriod) {
			setStartDate(currentPeriod.startDate || "");
			setEndDate(currentPeriod.endDate || "");
		} else if (semester?.examStartDate && semester?.examEndDate) {
			setStartDate(semester.examStartDate);
			setEndDate(semester.examEndDate);
		} else {
			setStartDate("");
			setEndDate("");
		}
	}, [currentPeriod, semester, isOpen]);

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
			start_date: startDate,
			end_date: endDate,
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Set Faculty Exam Period"
			description={`Customize the examination schedule dates for ${facultyName || "your faculty"}.`}
			footer={
				<div className="flex items-center justify-between w-full">
					{currentPeriod && onResetToSchool ? (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onResetToSchool}
							disabled={isPending}
							className="text-danger border-danger/30 hover:bg-danger/10 text-xs cursor-pointer"
						>
							Reset to School Period
						</Button>
					) : (
						<div />
					)}
					<div className="flex items-center gap-2">
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
							{isPending ? "Saving..." : "Save Faculty Period"}
						</Button>
					</div>
				</div>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				{semester && (
					<div className="p-3 bg-surface-raised border border-border rounded-xl text-xs space-y-1">
						<div className="flex justify-between">
							<span className="text-text-muted">Semester:</span>
							<span className="font-semibold text-text-main">
								{semester.displayName || semester.name} ({semester.startDate} to {semester.endDate})
							</span>
						</div>
						{semester.examStartDate && (
							<div className="flex justify-between">
								<span className="text-text-muted">School Default Exam Period:</span>
								<span className="font-semibold text-text-main">
									{semester.examStartDate} to {semester.examEndDate}
								</span>
							</div>
						)}
					</div>
				)}

				<div className="grid grid-cols-2 gap-3">
					<div>
						<Text variant="caption" className="text-text-muted mb-1 block">
							Faculty Exam Start <span className="text-danger">*</span>
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
							Faculty Exam End <span className="text-danger">*</span>
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
			</form>
		</Modal>
	);
}
