import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Building2, Layers, GraduationCap } from "lucide-react";
import type { Faculty, Department, Program, User } from "@/types";

const LEVELS = [100, 200, 300, 400, 500, 600];

interface ExamScopeFilterBarProps {
	currentUser?: User | null;
	faculties: Faculty[];
	selectedFacultyId: string;
	onSelectFaculty: (facultyId: string) => void;
	departments: Department[];
	selectedDepartmentId: string;
	onSelectDepartment: (deptId: string) => void;
	programs: Program[];
	selectedProgramId: string;
	onSelectProgram: (programId: string) => void;
	selectedLevel: number | "ALL";
	onSelectLevel: (level: number | "ALL") => void;
}

export function ExamScopeFilterBar({
	currentUser,
	faculties = [],
	selectedFacultyId,
	onSelectFaculty,
	departments = [],
	selectedDepartmentId,
	onSelectDepartment,
	programs = [],
	selectedProgramId,
	onSelectProgram,
	selectedLevel,
	onSelectLevel,
}: ExamScopeFilterBarProps) {
	const isSchoolAdmin =
		currentUser?.role === "admin" &&
		(currentUser?.adminLevel === "school" || currentUser?.adminLevel === "system");
	const isFacultyAdmin =
		currentUser?.role === "admin" && currentUser?.adminLevel === "faculty";
	const isDeptAdmin =
		currentUser?.role === "admin" && currentUser?.adminLevel === "department";

	const currentFaculty = faculties.find((f) => String(f.id) === String(selectedFacultyId)) || faculties[0];

	// Filter departments belonging to selected faculty
	const filteredDepartments = departments.filter((d) => {
		if (!selectedFacultyId) return true;
		return String(d.facultyId) === String(selectedFacultyId);
	});

	// Filter programs belonging to selected department
	const filteredPrograms = programs.filter((p) => {
		if (!selectedDepartmentId || selectedDepartmentId === "ALL") return true;
		return String(p.departmentId) === String(selectedDepartmentId);
	});

	return (
		<div className="p-4 rounded-2xl bg-surface border border-border space-y-4">
			{/* Top Scope Indicator / Faculty Selection */}
			{isSchoolAdmin && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Building2 size={16} className="text-primary" />
							<Text variant="caption" weight="bold" className="text-text-main">
								Select Faculty Examination Timetable:
							</Text>
						</div>
						<span className="text-[11px] text-text-muted">
							School Admin View • Multi-Faculty Examination Mode
						</span>
					</div>

					{/* Faculty Pills */}
					<div className="flex flex-wrap gap-2">
						{faculties.map((fac) => {
							const isSelected = String(fac.id) === String(selectedFacultyId);
							return (
								<button
									key={fac.id}
									type="button"
									onClick={() => {
										onSelectFaculty(String(fac.id));
										onSelectDepartment("ALL");
									}}
									className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
										isSelected
											? "bg-primary text-white border-primary shadow-sm"
											: "bg-surface-raised text-text-muted border-border hover:bg-surface-hover hover:text-text-main"
									}`}
								>
									{fac.name} {fac.code ? `(${fac.code})` : ""}
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Sub-Filters: Departments, Programs, Levels */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 border-t border-border/50">
				{/* Scope Label & Department Filter */}
				<div className="flex flex-wrap items-center gap-3">
					{isFacultyAdmin && (
						<div className="flex items-center gap-2">
							<Building2 size={16} className="text-primary" />
							<Badge variant="primary" className="text-xs px-2.5 py-1 font-semibold">
								{currentUser?.facultyName || currentFaculty?.name || "Faculty Timetable"}
							</Badge>
						</div>
					)}

					{isDeptAdmin && (
						<div className="flex items-center gap-2">
							<Building2 size={16} className="text-primary" />
							<Badge variant="primary" className="text-xs px-2.5 py-1 font-semibold">
								{currentUser?.departmentName || "Department Timetable"}
							</Badge>
						</div>
					)}

					{/* Department Selector (for School and Faculty Admins) */}
					{(isSchoolAdmin || isFacultyAdmin) && filteredDepartments.length > 0 && (
						<div className="flex items-center gap-2 min-w-[220px]">
							<Layers size={14} className="text-text-muted shrink-0" />
							<Select
								value={selectedDepartmentId || "ALL"}
								onChange={(e) => onSelectDepartment(e.target.value)}
								options={[
									{
										value: "ALL",
										label: isSchoolAdmin
											? `All Departments in ${currentFaculty?.code || "Faculty"}`
											: "All Departments in Faculty",
									},
									...filteredDepartments.map((d) => ({
										value: String(d.id),
										label: `${d.name} (${d.code})`,
									})),
								]}
							/>
						</div>
					)}

					{/* Program Selector (for Department Admins or when a specific Dept is selected) */}
					{isDeptAdmin && filteredPrograms.length > 0 && (
						<div className="flex items-center gap-2 min-w-[200px]">
							<GraduationCap size={14} className="text-text-muted shrink-0" />
							<Select
								value={selectedProgramId || "ALL"}
								onChange={(e) => onSelectProgram(e.target.value)}
								options={[
									{ value: "ALL", label: "All Programs in Department" },
									...filteredPrograms.map((p) => ({
										value: String(p.id),
										label: `${p.name} (${p.code})`,
									})),
								]}
							/>
						</div>
					)}
				</div>

				{/* Level Selector (for Department Admin or granular inspection) */}
				{isDeptAdmin && (
					<div className="flex items-center gap-1.5 self-start md:self-auto">
						<span className="text-xs text-text-muted mr-1 font-medium">Level:</span>
						<button
							type="button"
							onClick={() => onSelectLevel("ALL")}
							className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
								selectedLevel === "ALL"
									? "bg-primary text-white border-primary"
									: "bg-surface-raised text-text-muted border-border hover:bg-surface-hover"
							}`}
						>
							All
						</button>
						{LEVELS.map((lvl) => {
							const isSelected = selectedLevel === lvl;
							return (
								<button
									key={lvl}
									type="button"
									onClick={() => onSelectLevel(lvl)}
									className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
										isSelected
											? "bg-primary text-white border-primary"
											: "bg-surface-raised text-text-muted border-border hover:bg-surface-hover"
									}`}
								>
									{lvl}L
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
