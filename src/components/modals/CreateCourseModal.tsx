import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type {
	Course,
	Department,
	Faculty,
	School,
	Program,
	Semester,
	User,
	AdminLevel,
} from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface CreateCourseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		data: Partial<Course> & {
			scopeId?: string;
			lecturerIds?: string[];
			semesterId?: string;
			programScope?: "general" | "program";
			targetProgramId?: string;
		},
	) => void;
	departments: Department[];
	faculties?: Faculty[];
	schools?: School[];
	programs?: Program[];
	semesters?: Semester[];
	lecturers: User[];
	initialData?: Course | null;
}

export default function CreateCourseModal({
	isOpen,
	onClose,
	onSubmit,
	departments,
	faculties = [],
	schools = [],
	programs = [],
	semesters = [],
	lecturers,
	initialData,
}: CreateCourseModalProps) {
	const { user } = useAuth();
	const isSchoolAdmin = user?.role === "admin" && user?.adminLevel === "school";
	const isFacultyAdmin =
		user?.role === "admin" && user?.adminLevel === "faculty";
	const isDeptAdmin =
		user?.role === "admin" && user?.adminLevel === "department";
	const isLevelLocked = isSchoolAdmin || isFacultyAdmin || isDeptAdmin;

	const [code, setCode] = useState(initialData?.code || "");
	const [title, setTitle] = useState(initialData?.title || "");
	const [level, setLevel] = useState(initialData?.level || 300);
	const [semesterId, setSemesterId] = useState(initialData?.semesterId || "");
	const [programScope, setProgramScope] = useState<"general" | "program">(
		initialData?.programScope || "general",
	);
	const [targetProgramId, setTargetProgramId] = useState(
		initialData?.targetProgramId || "",
	);
	const [owningLevel, setOwningLevel] = useState<AdminLevel>(
		initialData?.owningLevel ||
			(isSchoolAdmin ? "school" : isFacultyAdmin ? "faculty" : "department"),
	);
	const [scopeId, setScopeId] = useState<string>(
		initialData?.departmentId || "",
	);
	const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>(
		initialData?.lecturers?.map((l) => l.id) || [],
	);

	useEffect(() => {
		if (!semesterId && semesters.length > 0) {
			const active = semesters.find((s) => s.isActive);
			setSemesterId(active ? active.id : semesters[0].id);
		}
	}, [semesters, semesterId]);

	useEffect(() => {
		if (isSchoolAdmin) {
			setOwningLevel("school");
			if (user?.adminScopeId) setScopeId(user.adminScopeId);
			else if (schools.length > 0) setScopeId(schools[0].id);
		} else if (isFacultyAdmin) {
			setOwningLevel("faculty");
			if (user?.adminScopeId) setScopeId(user.adminScopeId);
			else if (faculties.length > 0) setScopeId(faculties[0].id);
		} else if (isDeptAdmin) {
			setOwningLevel("department");
			const dId = user?.adminScopeId || user?.departmentId;
			if (dId) setScopeId(dId);
			else if (departments.length > 0) setScopeId(departments[0].id);
		} else {
			if (owningLevel === "school" && schools.length > 0 && !scopeId) {
				setScopeId(schools[0].id);
			} else if (
				owningLevel === "faculty" &&
				faculties.length > 0 &&
				!scopeId
			) {
				setScopeId(faculties[0].id);
			} else if (
				owningLevel === "department" &&
				departments.length > 0 &&
				!scopeId
			) {
				setScopeId(departments[0].id);
			}
		}
	}, [
		isSchoolAdmin,
		isFacultyAdmin,
		isDeptAdmin,
		owningLevel,
		departments,
		faculties,
		schools,
		scopeId,
		user,
	]);

	const availablePrograms = useMemo(() => {
		if (owningLevel !== "department" || !scopeId) return [];
		return programs.filter((p) => String(p.departmentId) === String(scopeId));
	}, [programs, owningLevel, scopeId]);

	useEffect(() => {
		if (availablePrograms.length > 0 && !targetProgramId) {
			setTargetProgramId(availablePrograms[0].id);
		}
	}, [availablePrograms, targetProgramId]);

	const handleOwningLevelChange = (newLevel: AdminLevel) => {
		if (isLevelLocked) return;
		setOwningLevel(newLevel);
		if (newLevel === "school" && schools.length > 0) {
			setScopeId(schools[0].id);
		} else if (newLevel === "faculty" && faculties.length > 0) {
			setScopeId(faculties[0].id);
		} else if (newLevel === "department" && departments.length > 0) {
			setScopeId(departments[0].id);
		} else {
			setScopeId("");
		}
	};

	const toggleLecturer = (id: string) => {
		setSelectedLecturerIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!code.trim() || !title.trim()) return;
		const activeScopeId =
			scopeId ||
			(owningLevel === "department"
				? departments[0]?.id
				: owningLevel === "faculty"
					? faculties[0]?.id
					: schools[0]?.id) ||
			"";
		const assignedLecturers = lecturers.filter((l) =>
			selectedLecturerIds.includes(l.id),
		);
		const dept = departments.find((d) => d.id === activeScopeId);

		onSubmit({
			code: code.trim().toUpperCase(),
			title: title.trim(),
			level: Number(level),
			semesterId: semesterId || undefined,
			programScope: owningLevel === "department" ? programScope : "general",
			targetProgramId:
				owningLevel === "department" && programScope === "program"
					? targetProgramId
					: undefined,
			departmentId: owningLevel === "department" ? activeScopeId : undefined,
			departmentName: dept?.name,
			owningLevel,
			scopeId: activeScopeId,
			lecturers: assignedLecturers,
			lecturerIds: selectedLecturerIds,
		});
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={initialData ? "Edit Course" : "Create New Course"}
			description="Enter course details, academic semester, and assign teaching staff."
			size="lg"
		>
			<form
				onSubmit={handleSubmit}
				className="space-y-4 max-h-[75vh] overflow-y-auto pr-1"
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="space-y-1">
						<Text variant="caption" className="font-semibold mb-1 block">
							Course Code
						</Text>
						<Input
							placeholder="e.g. CSC 301"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-1">
						<Text variant="caption" className="font-semibold mb-1 block">
							Course Title
						</Text>
						<Input
							placeholder="e.g. Operating Systems & Architecture"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="space-y-1">
						<Text variant="caption" className="font-semibold mb-1 block">
							Academic Level
						</Text>
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
						<Text variant="caption" className="font-semibold mb-1 block">
							Semester
						</Text>
						<Select
							value={semesterId}
							onChange={(e) => setSemesterId(e.target.value)}
							options={semesters.map((s) => ({
								value: s.id,
								label: `${s.displayName || (s.name === "first" ? "First Semester" : "Second Semester")}${s.isActive ? " (Active)" : ""}`,
							}))}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="space-y-1">
						<Text variant="caption" className="font-semibold mb-1 block">
							Owning Scope Level
						</Text>
						<Select
							value={owningLevel}
							onChange={(e) =>
								handleOwningLevelChange(e.target.value as AdminLevel)
							}
							disabled={isLevelLocked}
							options={[
								{ value: "department", label: "Department Owned" },
								{ value: "faculty", label: "Faculty Level" },
								{ value: "school", label: "School Level" },
							]}
						/>
					</div>

					<div className="space-y-1">
						<Text variant="caption" className="font-semibold mb-1 block">
							{owningLevel === "school"
								? "Owning School"
								: owningLevel === "faculty"
									? "Owning Faculty"
									: "Owning Department"}
						</Text>

						{owningLevel === "school" && (
							<Select
								value={scopeId || (schools[0]?.id ?? "")}
								onChange={(e) => setScopeId(e.target.value)}
								disabled={isLevelLocked || schools.length <= 1}
								options={schools.map((s) => ({
									value: s.id,
									label: `${s.code} - ${s.name}`,
								}))}
							/>
						)}

						{owningLevel === "faculty" && (
							<Select
								value={scopeId || (faculties[0]?.id ?? "")}
								onChange={(e) => setScopeId(e.target.value)}
								disabled={isLevelLocked || faculties.length <= 1}
								options={faculties.map((f) => ({
									value: f.id,
									label: `${f.code} - ${f.name}`,
								}))}
							/>
						)}

						{owningLevel === "department" && (
							<Select
								value={scopeId || (departments[0]?.id ?? "")}
								onChange={(e) => setScopeId(e.target.value)}
								disabled={isLevelLocked || departments.length <= 1}
								options={departments.map((d) => ({
									value: d.id,
									label: `${d.code} - ${d.name}`,
								}))}
							/>
						)}
					</div>
				</div>

				{/* Program Scoping for Department Courses */}
				{owningLevel === "department" && availablePrograms.length > 0 && (
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
								<Text variant="caption" className="text-text-muted mb-1 block">
									Scope
								</Text>
								<Select
									value={programScope}
									onChange={(e) =>
										setProgramScope(e.target.value as "general" | "program")
									}
									options={[
										{
											value: "general",
											label: "General (All Programs in Department)",
										},
										{ value: "program", label: "Program-Specific" },
									]}
								/>
							</div>
							{programScope === "program" && (
								<div>
									<Text
										variant="caption"
										className="text-text-muted mb-1 block"
									>
										Target Program
									</Text>
									<Select
										value={targetProgramId || (availablePrograms[0]?.id ?? "")}
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

				{/* Assigned Lecturers Selection */}
				<div className="space-y-2 pt-2 border-t border-border">
					<Text variant="caption" className="font-semibold block">
						Assign Lecturers ({selectedLecturerIds.length} Selected)
					</Text>
					<div className="max-h-36 overflow-y-auto space-y-1.5 border border-border rounded-xl p-2 bg-surface">
						{lecturers.length === 0 ? (
							<Text
								variant="caption"
								color="muted"
								className="p-2 block text-center"
							>
								No lecturers available to assign.
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
										<span>
											{lec.name} ({lec.identifier || lec.email})
										</span>
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
						{initialData ? "Save Changes" : "Create Course"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
