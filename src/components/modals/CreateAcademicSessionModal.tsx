import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { School } from "@/types";

interface CreateAcademicSessionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		school: string;
		label: string;
		start_date: string;
		end_date: string;
		is_current: boolean;
	}) => void;
	schools: School[];
	defaultSchoolId?: string;
	isPending?: boolean;
}

export default function CreateAcademicSessionModal({
	isOpen,
	onClose,
	onSubmit,
	schools,
	defaultSchoolId,
	isPending = false,
}: CreateAcademicSessionModalProps) {
	const [schoolId, setSchoolId] = useState(defaultSchoolId || "");
	const [label, setLabel] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [isCurrent, setIsCurrent] = useState(false);

	useEffect(() => {
		if (defaultSchoolId) {
			setSchoolId(defaultSchoolId);
		} else if (schools.length > 0 && !schoolId) {
			setSchoolId(schools[0].id);
		}
	}, [schools, defaultSchoolId, schoolId]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const activeSchoolId = schoolId || schools[0]?.id || "";
		if (!label.trim() || !startDate || !endDate || !activeSchoolId) return;
		onSubmit({
			school: activeSchoolId,
			label: label.trim(),
			start_date: startDate,
			end_date: endDate,
			is_current: isCurrent,
		});
	};

	const handleClose = () => {
		setLabel("");
		setStartDate("");
		setEndDate("");
		setIsCurrent(false);
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Create Academic Session"
			description="Define an academic session year for your school (e.g., 2025/2026)."
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
						{isPending ? "Creating..." : "Create Session"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						School
					</Text>
					<Select
						value={schoolId || (schools[0]?.id ?? "")}
						onChange={(e) => setSchoolId(e.target.value)}
						options={schools.map((s) => ({
							value: s.id,
							label: `${s.name} (${s.code})`,
						}))}
						disabled={schools.length <= 1}
					/>
				</div>

				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						Session Label
					</Text>
					<Input
						placeholder="e.g. 2025/2026"
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

				<div className="flex items-center gap-2 pt-1">
					<input
						type="checkbox"
						id="isCurrentSession"
						checked={isCurrent}
						onChange={(e) => setIsCurrent(e.target.checked)}
						className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
					/>
					<label
						htmlFor="isCurrentSession"
						className="text-sm font-medium text-text-main cursor-pointer"
					>
						Mark as Current Session
					</label>
				</div>
			</form>
		</Modal>
	);
}
