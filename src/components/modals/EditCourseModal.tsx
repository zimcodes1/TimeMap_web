import { useState, useEffect, useMemo } from "react";
import { Modal } from "../ui/modal";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import type { Course, Department, Program, Semester, User } from "@/types";

interface EditCourseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (id: string, updated: Partial<Course>) => void;
	course: Course | null;
	departments: Department[];
	programs?: Program[];
	semesters?: Semester[];
	lecturers: User[];
}

export default function EditCourseModal({
	isOpen,
	onClose,
	onSubmit,
	course,
	departments,
	programs = [],
	semesters = [],
	lecturers,
}: EditCourseModalProps) {
	const [code, setCode] = useState("");
	const [title, setTitle] = useState("");
	const [level, setLevel] = useState<number>(300);
	const [semesterId, setSemesterId] = useState("");
	const [programScope, setProgramScope] = useState<"general" | "program">(
		"general",
	);
	const [targetProgramId, setTargetProgramId] = useState("");
	const [departmentId, setDepartmentId] = useState("");
	const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>([]);

	useEffect(() => {
		if (course) {
			setCode(course.code || "");
			setTitle(course.title || "");
			setLevel(course.level || 300);
			setSemesterId(course.semesterId || "");
			setProgramScope(course.programScope || "general");
			setTargetProgramId(course.targetProgramId || "");
			setDepartmentId(course.departmentId || "");
			setSelectedLecturerIds((course.lecturers || []).map((l) => l.id));
		}
	}, [course]);

	const availablePrograms = useMemo(() => {
		if (!departmentId) return [];
		return programs.filter(
			(p) => String(p.departmentId) === String(departmentId),
		);
	}, [programs, departmentId]);

	const toggleLecturer = (id: string) => {
		setSelectedLecturerIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (course && code && title) {
			const assignedLecturers = lecturers.filter((l) =>
				selectedLecturerIds.includes(l.id),
			);
			const targetDept = departments.find((d) => d.id === departmentId);
			const targetProg = availablePrograms.find(
				(p) => p.id === targetProgramId,
			);

			onSubmit(course.id, {
				code: code.trim().toUpperCase(),
				title: title.trim(),
				level,
				semesterId: semesterId || undefined,
				programScope:
					course.owningLevel === "department" ? programScope : "general",
				targetProgramId:
					course.owningLevel === "department" && programScope === "program"
						? targetProgramId
						: undefined,
				targetProgramName: targetProg?.name,
				departmentId,
				departmentName: targetDept?.name,
				lecturers: assignedLecturers,
			});
			onClose();
		}
	};

	if (!course) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Edit Course — ${course.code}`}
		>
			<form
				onSubmit={handleSubmit}
				className="space-y-4 max-h-[75vh] overflow-y-auto pr-1"
			>
				<Text variant="body-sm" color="muted">
					Update academic course catalog details and assigned teaching staff.
				</Text>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="space-y-1">
						<label className="text-xs font-semibold text-text-main">
							Course Code
						</label>
						<Input
							value={code}
							onChange={(e) => setCode(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-1">
						<label className="text-xs font-semibold text-text-main">
							Course Title
						</label>
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="space-y-1">
						<label className="text-xs font-semibold text-text-main">
							Academic Level
						</label>
						<Select
							value={level}
							onChange={(e) => setLevel(Number(e.target.value))}
							options={[
								{ value: 100, label: "100 Level" },
								{ value: 200, label: "200 Level" },
								{ value: 300, label: "300 Level" },
								{ value: 400, label: "400 Level" },
								{ value: 500, label: "500 Level" },
								{ value: 600, label: "600 Level" },
							]}
						/>
					</div>

					<div className="space-y-1">
						<label className="text-xs font-semibold text-text-main">
							Semester
						</label>
						<Select
							value={semesterId}
							onChange={(e) => setSemesterId(e.target.value)}
							options={[
								{ value: "", label: "No semester assigned" },
								...semesters.map((s) => ({
									value: s.id,
									label: `${s.displayName || (s.name === "first" ? "First Semester" : "Second Semester")}${s.isActive ? " (Active)" : ""}`,
								})),
							]}
						/>
					</div>
				</div>

				{/* Program Scoping for Department Courses */}
				{course.owningLevel === "department" &&
					availablePrograms.length > 0 && (
						<div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
							<Text
								variant="caption"
								weight="bold"
								className="text-text-main block"
							>
								Program Scoping
							</Text>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="text-xs text-text-muted mb-1 block">
										Scope
									</label>
									<Select
										value={programScope}
										onChange={(e) =>
											setProgramScope(e.target.value as "general" | "program")
										}
										options={[
											{ value: "general", label: "General (All Programs)" },
											{ value: "program", label: "Program-Specific" },
										]}
									/>
								</div>
								{programScope === "program" && (
									<div>
										<label className="text-xs text-text-muted mb-1 block">
											Target Program
										</label>
										<Select
											value={
												targetProgramId || (availablePrograms[0]?.id ?? "")
											}
											onChange={(e) => setTargetProgramId(e.target.value)}
											options={availablePrograms.map((p) => ({
												value: p.id,
												label: `${p.name} (${p.code})`,
											}))}
										/>
									</div>
								)}
							</div>
						</div>
					)}

				{/* Lecturers Selection */}
				<div className="space-y-2 pt-2 border-t border-border">
					<label className="text-xs font-semibold text-text-main block">
						Assign Teaching Staff ({selectedLecturerIds.length} Selected)
					</label>
					<div className="max-h-36 overflow-y-auto space-y-1.5 border border-border rounded-xl p-2 bg-surface">
						{lecturers.length === 0 ? (
							<Text
								variant="caption"
								color="muted"
								className="p-2 block text-center"
							>
								No lecturers found.
							</Text>
						) : (
							lecturers.map((lec) => {
								const isSelected = selectedLecturerIds.includes(lec.id);
								return (
									<button
										key={lec.id}
										type="button"
										onClick={() => toggleLecturer(lec.id)}
										className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
											isSelected
												? "bg-primary/10 border border-primary/20 text-primary font-semibold"
												: "bg-surface-raised hover:bg-surface-raised/80 text-text-main border border-border"
										}`}
									>
										<span>{lec.name}</span>
										<span className="text-[10px] font-bold">
											{isSelected ? "Assigned" : "Assign"}
										</span>
									</button>
								);
							})
						)}
					</div>
				</div>

				<div className="flex justify-end gap-2 pt-3 border-t border-border">
					<Button
						variant="outline"
						onClick={onClose}
						type="button"
						className="cursor-pointer"
					>
						Cancel
					</Button>
					<Button variant="primary" type="submit" className="cursor-pointer">
						Save Changes
					</Button>
				</div>
			</form>
		</Modal>
	);
}
