import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { Department } from "@/types";

interface CreateProgramModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		departmentId: string;
		name: string;
		code: string;
		maxLevel: number;
	}) => void;
	departments: Department[];
	defaultDepartmentId?: string;
	isPending?: boolean;
}

export default function CreateProgramModal({
	isOpen,
	onClose,
	onSubmit,
	departments,
	defaultDepartmentId,
	isPending = false,
}: CreateProgramModalProps) {
	const [departmentId, setDepartmentId] = useState(defaultDepartmentId || "");
	const [name, setName] = useState("");
	const [code, setCode] = useState("");
	const [maxLevel, setMaxLevel] = useState("400");

	useEffect(() => {
		if (defaultDepartmentId) {
			setDepartmentId(defaultDepartmentId);
		} else if (departments.length > 0 && !departmentId) {
			setDepartmentId(departments[0].id);
		}
	}, [departments, defaultDepartmentId, departmentId]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const activeDeptId = departmentId || departments[0]?.id || "";
		if (!name.trim() || !code.trim() || !activeDeptId) return;
		onSubmit({
			departmentId: activeDeptId,
			name: name.trim(),
			code: code.trim().toUpperCase(),
			maxLevel: Number(maxLevel) || 400,
		});
	};

	const handleClose = () => {
		setName("");
		setCode("");
		setMaxLevel("400");
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Add New Program"
			description="Create a specialized academic program under a department (e.g., Cyber Security, Software Engineering)."
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
						{isPending ? "Creating..." : "Create Program"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						Department
					</Text>
					<Select
						value={departmentId || (departments[0]?.id ?? "")}
						onChange={(e) => setDepartmentId(e.target.value)}
						options={departments.map((d) => ({
							value: d.id,
							label: `${d.name} (${d.code})`,
						}))}
						disabled={departments.length <= 1}
					/>
				</div>
				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						Program Name
					</Text>
					<Input
						placeholder="e.g. Cyber Security"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</div>
				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						Program Code
					</Text>
					<Input
						placeholder="e.g. CYB"
						value={code}
						onChange={(e) => setCode(e.target.value)}
						required
					/>
				</div>
				<div>
					<Text variant="caption" className="font-semibold mb-1 block">
						Maximum Academic Level
					</Text>
					<Select
						value={maxLevel}
						onChange={(e) => setMaxLevel(e.target.value)}
						options={[
							{ value: "100", label: "100 Level (1 Year)" },
							{ value: "200", label: "200 Level (2 Years)" },
							{ value: "300", label: "300 Level (3 Years)" },
							{ value: "400", label: "400 Level (4 Years)" },
							{ value: "500", label: "500 Level (5 Years)" },
							{ value: "600", label: "600 Level (6 Years)" },
						]}
					/>
				</div>
			</form>
		</Modal>
	);
}
