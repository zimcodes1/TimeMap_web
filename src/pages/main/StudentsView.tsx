import { useMemo } from "react";
import { BarChart3, GraduationCap, Layers3, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { Department, Faculty, School, Program, User } from "@/types";
import type {
	DepartmentStudentCount,
	StudentCountAnalytics,
} from "@/api/main/studentCountsAPI";
import {
	StudentCountBarChart,
	StudentCountPieChart,
} from "@/components/students/StudentCountCharts";
import { StudentCountEditor } from "@/components/students/StudentCountEditor";

interface Filters {
	departmentId: string;
	facultyId: string;
	schoolId: string;
	level: string;
	programId?: string;
}
interface Props {
	user: User | null;
	counts: DepartmentStudentCount[];
	analytics?: StudentCountAnalytics;
	departments: Department[];
	faculties: Faculty[];
	schools: School[];
	programs?: Program[];
	filters: Filters;
	onFiltersChange: (filters: Filters) => void;
	onSave: (programId: string, level: number, count: number) => Promise<void>;
	saving: boolean;
	loading: boolean;
}

export default function StudentsView({
	user,
	counts,
	analytics,
	departments,
	faculties,
	schools,
	programs = [],
	filters,
	onFiltersChange,
	onSave,
	saving,
	loading,
}: Props) {
	const adminLevel = user?.adminLevel || "university";
	const isDepartmentAdmin =
		user?.role === "admin" && adminLevel === "department";
	const ownDepartmentId = user?.adminScopeId || user?.departmentId;

	const scopedPrograms = useMemo(() => {
		if (isDepartmentAdmin && ownDepartmentId) {
			return programs.filter(
				(p) => String(p.departmentId) === String(ownDepartmentId),
			);
		}
		if (filters.departmentId) {
			return programs.filter(
				(p) => String(p.departmentId) === String(filters.departmentId),
			);
		}
		return programs;
	}, [programs, isDepartmentAdmin, ownDepartmentId, filters.departmentId]);

	const ownCounts = useMemo(() => {
		return counts.filter((item) => {
			if (
				ownDepartmentId &&
				String(item.departmentId) === String(ownDepartmentId)
			) {
				return true;
			}
			if (scopedPrograms.some((p) => String(p.id) === String(item.programId))) {
				return true;
			}
			return false;
		});
	}, [counts, ownDepartmentId, scopedPrograms]);

	const dimensions = analytics?.availableDimensions ?? ["level"];
	const canSeeSchools = dimensions.includes("school");
	const canSeeFaculties = dimensions.includes("faculty");
	const canSeeDepartments = dimensions.includes("department");
	const canSeePrograms = dimensions.includes("program") || isDepartmentAdmin;
	const canFilterSchools = adminLevel === "university";
	const canFilterFaculties = adminLevel === "school";
	const canFilterDepartments = adminLevel === "faculty";
	const canFilterPrograms = isDepartmentAdmin || Boolean(filters.departmentId);

	// Calculate programs reporting
	const programsReporting = useMemo(() => {
		if (analytics?.summary.programsReporting !== undefined) {
			return analytics.summary.programsReporting;
		}
		if (scopedPrograms.length === 0) return 0;
		const targetCounts = isDepartmentAdmin ? ownCounts : counts;
		const reportingProgramIds = new Set(
			targetCounts.filter((c) => c.count > 0).map((c) => String(c.programId)),
		);
		return scopedPrograms.filter((p) => reportingProgramIds.has(String(p.id)))
			.length;
	}, [
		analytics?.summary.programsReporting,
		scopedPrograms,
		isDepartmentAdmin,
		ownCounts,
		counts,
	]);

	// Calculate program population distribution for pie chart
	const programData = useMemo(() => {
		if (analytics?.byProgram && analytics.byProgram.length > 0) {
			return analytics.byProgram.map((item) => ({
				name: item.programCode
					? `${item.programName} (${item.programCode})`
					: item.programName,
				value: item.studentCount,
			}));
		}
		const targetCounts = isDepartmentAdmin ? ownCounts : counts;
		return scopedPrograms
			.map((prog) => {
				const total = targetCounts
					.filter((c) => String(c.programId) === String(prog.id))
					.reduce((sum, c) => sum + (c.count || 0), 0);
				return {
					name: `${prog.name} (${prog.code})`,
					value: total,
				};
			})
			.filter((item) => item.value > 0);
	}, [
		analytics?.byProgram,
		scopedPrograms,
		isDepartmentAdmin,
		ownCounts,
		counts,
	]);

	// Dynamic available levels based on selected program or in-scope programs
	const availableLevels = useMemo(() => {
		let maxLvl = 600;
		if (filters.programId) {
			const prog = scopedPrograms.find(
				(p) => String(p.id) === String(filters.programId),
			);
			if (prog?.maxLevel) {
				maxLvl = prog.maxLevel;
			}
		} else if (scopedPrograms.length > 0) {
			const maxInScope = Math.max(
				...scopedPrograms.map((p) => p.maxLevel || 400),
			);
			if (Number.isFinite(maxInScope) && maxInScope > 0) {
				maxLvl = maxInScope;
			}
		}
		const levels: number[] = [];
		for (let lvl = 100; lvl <= maxLvl; lvl += 100) {
			levels.push(lvl);
		}
		return levels;
	}, [filters.programId, scopedPrograms]);

	const change = (key: keyof Filters, value: string) => {
		const next = { ...filters, [key]: value };
		if (key === "schoolId") {
			next.facultyId = "";
			next.departmentId = "";
			next.programId = "";
		} else if (key === "facultyId") {
			next.departmentId = "";
			next.programId = "";
		} else if (key === "departmentId") {
			next.programId = "";
		} else if (key === "programId" && value) {
			const prog = scopedPrograms.find((p) => String(p.id) === String(value));
			if (prog && Number(filters.level) > prog.maxLevel) {
				next.level = "";
			}
		}
		onFiltersChange(next);
	};

	const schoolData =
		analytics?.bySchool.map((item) => ({
			name: item.schoolName,
			value: item.studentCount,
		})) ?? [];
	const departmentData =
		analytics?.byDepartment.map((item) => ({
			name: item.departmentCode,
			value: item.studentCount,
		})) ?? [];
	const facultyData =
		analytics?.byFaculty.map((item) => ({
			name: item.facultyName,
			value: item.studentCount,
		})) ?? [];
	const levelData =
		analytics?.byLevel.map((item) => ({
			name: `${item.level}L`,
			value: item.studentCount,
		})) ?? [];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-text-main">Students</h1>
				<p className="mt-1 text-sm text-text-muted">
					Department population totals for timetable planning and future
					automatic scheduling.
				</p>
			</div>
			{isDepartmentAdmin && ownDepartmentId && (
				<StudentCountEditor
					departmentName={
						user?.adminScopeName ||
						ownCounts[0]?.departmentName ||
						"your department"
					}
					programs={programs.filter(
						(p) => String(p.departmentId) === String(ownDepartmentId),
					)}
					counts={ownCounts}
					onSave={onSave}
					saving={saving}
				/>
			)}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Metric
					icon={<GraduationCap />}
					label="Students in scope"
					value={analytics?.summary.totalStudents ?? 0}
				/>
				<Metric
					icon={<Layers3 />}
					label="Levels reported"
					value={analytics?.summary.levelsReporting ?? 0}
				/>
				{canSeePrograms && (
					<Metric
						icon={<BookOpen />}
						label="Programs reporting"
						value={programsReporting}
						subtitle={
							scopedPrograms.length > 0
								? `${programsReporting} of ${scopedPrograms.length} programs`
								: undefined
						}
					/>
				)}
				{canSeeDepartments && (
					<Metric
						icon={<BarChart3 />}
						label="Departments reporting"
						value={analytics?.summary.departmentsReporting ?? 0}
					/>
				)}
				{canSeeFaculties && (
					<Metric
						icon={<BarChart3 />}
						label="Faculties reporting"
						value={analytics?.summary.facultiesReporting ?? 0}
					/>
				)}
				{canSeeSchools && (
					<Metric
						icon={<BarChart3 />}
						label="Schools reporting"
						value={analytics?.summary.schoolsReporting ?? 0}
					/>
				)}
			</div>
			<Card>
				<CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
					{canFilterSchools && (
						<Select
							label="School"
							value={filters.schoolId}
							onChange={(event) => change("schoolId", event.target.value)}
							options={[
								{ value: "", label: "All schools" },
								...schools.map((item) => ({
									value: item.id,
									label: item.name,
								})),
							]}
						/>
					)}
					{canFilterFaculties && (
						<Select
							label="Faculty"
							value={filters.facultyId}
							onChange={(event) => change("facultyId", event.target.value)}
							options={[
								{ value: "", label: "All faculties" },
								...faculties.map((item) => ({
									value: item.id,
									label: item.name,
								})),
							]}
						/>
					)}
					{canFilterDepartments && (
						<Select
							label="Department"
							value={filters.departmentId}
							onChange={(event) => change("departmentId", event.target.value)}
							options={[
								{ value: "", label: "All departments" },
								...departments.map((item) => ({
									value: item.id,
									label: `${item.name} (${item.code})`,
								})),
							]}
						/>
					)}
					{canFilterPrograms && scopedPrograms.length > 0 && (
						<Select
							label="Program"
							value={filters.programId || ""}
							onChange={(event) => change("programId", event.target.value)}
							options={[
								{ value: "", label: "All programs" },
								...scopedPrograms.map((item: Program) => ({
									value: item.id,
									label: `${item.name} (${item.code})`,
								})),
							]}
						/>
					)}
					<Select
						label="Academic level"
						value={filters.level}
						onChange={(event) => change("level", event.target.value)}
						options={[
							{ value: "", label: "All levels" },
							...availableLevels.map((level) => ({
								value: String(level),
								label: `${level} Level`,
							})),
						]}
					/>
				</CardContent>
			</Card>
			{loading ? (
				<div className="py-16 text-center text-sm text-text-muted">
					Loading student totals…
				</div>
			) : (
				<div className="grid gap-6 xl:grid-cols-2">
					{canSeePrograms && (
						<StudentCountPieChart
							title="Distribution by program"
							description="How the recorded population is distributed across degree programs."
							data={programData}
						/>
					)}
					{canSeeSchools && (
						<StudentCountPieChart
							title="Distribution by school"
							description="How the recorded population is distributed across schools."
							data={schoolData}
						/>
					)}
					{canSeeFaculties && (
						<StudentCountPieChart
							title="Distribution by faculty"
							description="How the recorded population is distributed across faculties."
							data={facultyData}
						/>
					)}
					{canSeeDepartments && (
						<StudentCountBarChart
							title="Students by department"
							description="Recorded totals within your permitted scope."
							data={departmentData}
						/>
					)}
					<StudentCountBarChart
						title="Students by academic level"
						description="Level totals within your permitted scope."
						data={levelData}
					/>
				</div>
			)}
		</div>
	);
}

function Metric({
	icon,
	label,
	value,
	subtitle,
}: {
	icon: React.ReactNode;
	label: string;
	value: number | string;
	subtitle?: string;
}) {
	return (
		<Card>
			<CardContent className="flex items-center gap-4 p-5">
				<div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
				<div>
					<p className="text-sm text-text-muted">{label}</p>
					<p className="text-2xl font-bold text-text-main">
						{typeof value === "number" ? value.toLocaleString() : value}
					</p>
					{subtitle && (
						<p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
