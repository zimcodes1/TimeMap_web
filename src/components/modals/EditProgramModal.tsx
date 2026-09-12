import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import type { Program } from "@/types";

interface EditProgramModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		id: string,
		data: { name: string; code: string; maxLevel: number },
	) => void;
	program: Program | null;
	isPending?: boolean;
}

export default function EditProgramModal({
	isOpen,
	onClose,
	onSubmit,
	program,
	isPending = false,
}: EditProgramModalProps) {
	const [name, setName] = useState("");
	const [code, setCode] = useState("");
	const [maxLevel, setMaxLevel] = useState("400");

	useEffect(() => {
		if (program) {
			setName(program.name);
			setCode(program.code);
			setMaxLevel(String(program.maxLevel || 400));
		}
	}, [program]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!program || !name.trim() || !code.trim()) return;
		onSubmit(program.id, {
			name: name.trim(),
			code: code.trim().toUpperCase(),
			maxLevel: Number(maxLevel) || 400,
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Edit Program"
			description={`Update program details for ${program?.name || "the program"}.`}
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
				{program?.isDefault && (
					<div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2">
						<Badge variant="primary" className="text-xs">
							Default Program
						</Badge>
						<Text variant="caption" color="muted">
							This is the default program for{" "}
							{program.departmentName || "this department"}. It cannot be
							deleted.
						</Text>
					</div>
				)}

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
