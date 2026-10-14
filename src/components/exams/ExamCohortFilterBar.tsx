import React, { useMemo } from "react";
import { Building2, Layers, GraduationCap, BookOpen } from "lucide-react";
import { Select } from "@/components/ui/select";
import type { Faculty, Department, Program, User } from "@/types";
import { getAvailableLevelsForProgram } from "@/utils/examTimeframeGrouping";

interface ExamCohortFilterBarProps {
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
	className?: string;
}

export const ExamCohortFilterBar: React.FC<ExamCohortFilterBarProps> = ({
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
	className = "",
}) => {
	const isSchoolAdmin =
		currentUser?.role === "admin" &&
		(currentUser?.adminLevel === "school" || currentUser?.adminLevel === "system");
	const isFacultyAdmin =
		currentUser?.role === "admin" && currentUser?.adminLevel === "faculty";

	// Filter departments belonging to selected faculty
	const filteredDepartments = useMemo(() => {
		if (!selectedFacultyId) return departments;
		return departments.filter(
			(d) => String(d.facultyId) === String(selectedFacultyId),
		);
	}, [departments, selectedFacultyId]);

	// Filter programs belonging to selected department
	const filteredPrograms = useMemo(() => {
		if (!selectedDepartmentId || selectedDepartmentId === "ALL") return programs;
		return programs.filter(
			(p) => String(p.departmentId) === String(selectedDepartmentId),
		);
	}, [programs, selectedDepartmentId]);

	// Identify currently active program object
	const activeProgram = useMemo(() => {
		return programs.find((p) => String(p.id) === String(selectedProgramId));
	}, [programs, selectedProgramId]);

	// Derive available levels dynamically from the selected program (or fallback)
	const availableLevels = useMemo(() => {
		return getAvailableLevelsForProgram(activeProgram);
	}, [activeProgram]);

	return (
		<div
			className={`p-3.5 bg-surface border border-border rounded-2xl shadow-xs space-y-3 ${className}`}
		>
			{/* Faculty selector for school admin */}
			{isSchoolAdmin && faculties.length > 0 && (
				<div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border/50">
					<div className="flex items-center gap-1 text-xs font-bold text-text-muted mr-1.5">
						<Building2 size={13} className="text-primary" />
						<span>Faculty:</span>
					</div>
					<div className="flex flex-wrap gap-1.5">
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
									className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
										isSelected
											? "bg-primary text-white border-primary shadow-xs"
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

			{/* Department, Program, and Level Row */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-2.5">
					{/* Department Dropdown for School and Faculty Admins */}
					{(isSchoolAdmin || isFacultyAdmin) && filteredDepartments.length > 0 && (
						<div className="flex items-center gap-1.5 min-w-[200px]">
							<Layers size={13} className="text-text-muted shrink-0" />
							<Select
								value={selectedDepartmentId || "ALL"}
								onChange={(e) => onSelectDepartment(e.target.value)}
								options={[
									{ value: "ALL", label: "All Departments" },
									...filteredDepartments.map((d) => ({
										value: String(d.id),
										label: `${d.name} (${d.code})`,
									})),
								]}
							/>
						</div>
					)}

					{/* Program Dropdown */}
					{filteredPrograms.length > 0 && (
						<div className="flex items-center gap-1.5 min-w-[220px]">
							<GraduationCap size={14} className="text-primary shrink-0" />
							<Select
								value={selectedProgramId || "ALL"}
								onChange={(e) => onSelectProgram(e.target.value)}
								options={[
									{ value: "ALL", label: "Select Program (Cohort Timeline)" },
									...filteredPrograms.map((p) => ({
										value: String(p.id),
										label: `${p.name} (${p.code})`,
									})),
								]}
							/>
						</div>
					)}
				</div>

				{/* Level Selector Pills */}
				<div className="flex flex-wrap items-center gap-1.5">
					<span className="text-xs font-bold text-text-muted mr-1">Level:</span>
					<div className="flex items-center gap-1 bg-surface-raised border border-border p-1 rounded-xl">
						{availableLevels.map((lvl) => {
							const isSelected = selectedLevel === lvl;
							return (
								<button
									key={lvl}
									type="button"
									onClick={() => onSelectLevel(lvl)}
									className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
										isSelected
											? "bg-primary text-white shadow-xs"
											: "text-text-muted hover:text-text-main hover:bg-surface-hover"
									}`}
								>
									{lvl}L
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Active Cohort Banner indicator */}
			<div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border/50">
				<div className="flex items-center gap-1.5">
					<BookOpen size={12} className="text-primary" />
					{activeProgram ? (
						<span>
							Viewing Cohort: <strong className="text-text-main font-semibold">{activeProgram.name}</strong> ({activeProgram.code}) •{" "}
							<strong className="text-primary font-semibold">{selectedLevel !== "ALL" ? `${selectedLevel} Level` : "All Levels"}</strong>
						</span>
					) : (
						<span className="text-amber-500 font-medium">
							Please select a specific Program above to display its clean, uncongested examination timeline.
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

