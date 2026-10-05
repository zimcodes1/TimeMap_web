import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { toast } from "sonner";
import type { AcademicSession } from "@/types";

interface EditAcademicSessionModalProps {
	isOpen: boolean;
	onClose: () => void;
	session: AcademicSession | null;
	onSubmit: (
		id: string,
		data: {
			label: string;
			start_date: string;
			end_date: string;
			max_semesters: number;
			is_current: boolean;
		},
	) => void;
	isPending?: boolean;
}

export default function EditAcademicSessionModal({
	isOpen,
	onClose,
	session,
	onSubmit,
	isPending = false,
}: EditAcademicSessionModalProps) {
	const [label, setLabel] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [maxSemesters, setMaxSemesters] = useState(2);
	const [isCurrent, setIsCurrent] = useState(false);

	useEffect(() => {
		if (session) {
			setLabel(session.label || "");
			setStartDate(session.startDate || "");
			setEndDate(session.endDate || "");
			setMaxSemesters(session.maxSemesters || 2);
			setIsCurrent(Boolean(session.isCurrent));
		}
	}, [session]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!session) return;

		if (!label.trim()) {
			toast.error("Please provide a session label (e.g., 2026/2027).");
			return;
		}

		if (!startDate || !endDate) {
			toast.error("Session start and end dates are required.");
			return;
		}

		if (startDate >= endDate) {
			toast.error("Session start date must be strictly before end date.");
			return;
		}

		if (session.semesters && session.semesters.length > maxSemesters) {
			toast.error(
				`Cannot set max semesters to ${maxSemesters} because this session already contains ${session.semesters.length} semesters.`,
			);
			return;
		}

		onSubmit(session.id, {
			label: label.trim(),
			start_date: startDate,
			end_date: endDate,
			max_semesters: maxSemesters,
			is_current: isCurrent,
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Edit Academic Session"
			description="Update academic session dates, semester capacity, and status."
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
						{isPending ? "Saving..." : "Save Changes"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						Session Label
					</Text>
					<Input
						placeholder="e.g. 2026/2027"
						value={label}
						onChange={(e) => setLabel(e.target.value)}
						required
					/>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Session Start Date
						</Text>
						<Input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							required
						/>
					</div>
					<div>
						<Text variant="caption" className="font-semibold mb-1 block">
							Session End Date
						</Text>
						<Input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							required
						/>
					</div>
				</div>

				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						Semesters in this Session
					</Text>
					<Select
						value={String(maxSemesters)}
						onChange={(e) => setMaxSemesters(Number(e.target.value))}
						options={[
							{ value: "1", label: "1 Semester" },
							{ value: "2", label: "2 Semesters (Standard: First & Second)" },
							{ value: "3", label: "3 Semesters (Trimester: First, Second & Third)" },
							{ value: "4", label: "4 Semesters (Quarter System)" },
						]}
					/>
					<Text variant="caption" color="muted" className="mt-1 block">
						Controls the allowed semester names (First, Second, Third...) and total capacity.
					</Text>
				</div>

				<div className="flex items-center gap-2 pt-1">
					<input
						type="checkbox"
						id="editIsCurrentSession"
						checked={isCurrent}
						onChange={(e) => setIsCurrent(e.target.checked)}
						className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
					/>
					<label
						htmlFor="editIsCurrentSession"
						className="text-sm font-medium text-text-main cursor-pointer select-none"
					>
						Mark as Current Active Session
					</label>
				</div>
			</form>
		</Modal>
	);
}
