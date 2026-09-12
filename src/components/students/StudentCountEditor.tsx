import { useState, useMemo } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Program } from "@/types";
import type { ProgramStudentCount } from "@/api/main/studentCountsAPI";

interface StudentCountEditorProps {
	departmentName: string;
	programs?: Program[];
	counts?: ProgramStudentCount[];
	onSave: (programId: string, level: number, count: number) => Promise<void>;
	saving: boolean;
}

export function StudentCountEditor({
	departmentName,
	programs = [],
	counts = [],
	onSave,
	saving,
}: StudentCountEditorProps) {
	const defaultProgram = programs.find((p) => p.isDefault) || programs[0];
	const [selectedProgramId, setSelectedProgramId] = useState(
		defaultProgram?.id || "",
	);
	const [level, setLevel] = useState("100");

	const activeProgram = useMemo(() => {
		return programs.find((p) => p.id === selectedProgramId) || defaultProgram;
	}, [programs, selectedProgramId, defaultProgram]);

	const maxLevel = activeProgram?.maxLevel || 400;

	const countsByLevel = useMemo(() => {
		const map = new Map<number, number>();
		counts
			.filter(
				(c) =>
					!activeProgram || String(c.programId) === String(activeProgram.id),
			)
			.forEach((c) => map.set(c.level, c.count));
		return map;
	}, [counts, activeProgram]);

	const currentCount = countsByLevel.get(Number(level));
	const [value, setValue] = useState(currentCount?.toString() ?? "");
	const [prevCount, setPrevCount] = useState(currentCount);
	const [prevLevel, setPrevLevel] = useState(level);
	const [prevProgramId, setPrevProgramId] = useState(selectedProgramId);
	const [error, setError] = useState("");
	const [isEditing, setIsEditing] = useState(false);

	if (selectedProgramId !== prevProgramId) {
		setPrevProgramId(selectedProgramId);
		setLevel("100");
		setIsEditing(false);
		setValue(countsByLevel.get(100)?.toString() ?? "");
		setPrevCount(countsByLevel.get(100));
	} else if (level !== prevLevel) {
		setPrevLevel(level);
		setIsEditing(false);
		setValue(currentCount?.toString() ?? "");
		setPrevCount(currentCount);
	} else if (currentCount !== prevCount) {
		setPrevCount(currentCount);
		setValue(currentCount?.toString() ?? "");
	}

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		const count = Number(value);
		if (!Number.isInteger(count) || count < 0) {
			setError("Enter a whole number that is zero or greater.");
			return;
		}
		setError("");
		const targetProgId = activeProgram?.id || selectedProgramId;
		await onSave(targetProgId, Number(level), count);
		setIsEditing(false);
	};

	const levelOptions = Array.from(
		{ length: Math.floor(maxLevel / 100) },
		(_, index) => ({
			value: String((index + 1) * 100),
			label: `${(index + 1) * 100} Level`,
		}),
	);

	const hasExistingTotal = currentCount !== undefined;

	const cancelEdit = () => {
		setValue(currentCount?.toString() ?? "");
		setError("");
		setIsEditing(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Your department’s planning totals</CardTitle>
				<CardDescription>
					Record current student headcounts for {departmentName} per academic
					program and level. Totals are used for venue sizing and timetable
					scheduling.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={submit}
					className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
				>
					{programs.length > 1 && (
						<Select
							label="Academic Program"
							value={selectedProgramId || (defaultProgram?.id ?? "")}
							onChange={(event) => setSelectedProgramId(event.target.value)}
							options={programs.map((p) => ({
								value: p.id,
								label: `${p.name} (${p.code})`,
							}))}
						/>
					)}

					<Select
						label="Academic level"
						value={level}
						onChange={(event) => setLevel(event.target.value)}
						options={levelOptions}
					/>

					<Input
						label="Number of students"
						type="number"
						min="0"
						step="1"
						value={value}
						onChange={(event) => setValue(event.target.value)}
						error={error}
						placeholder="e.g. 120"
						disabled={hasExistingTotal && !isEditing}
					/>

					{hasExistingTotal && !isEditing ? (
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsEditing(true)}
						>
							<Pencil size={15} className="mr-1" />
							Edit total
						</Button>
					) : (
						<div className="flex gap-2">
							<Button type="submit" disabled={saving}>
								{saving ? "Saving…" : "Save total"}
							</Button>
							{hasExistingTotal && (
								<Button
									type="button"
									variant="outline"
									onClick={cancelEdit}
									disabled={saving}
								>
									Cancel
								</Button>
							)}
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
