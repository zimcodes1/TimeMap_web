import { BarChart3, GraduationCap, Layers3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { Department, Faculty, School, User } from "@/types";
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
}
interface Props {
	user: User | null;
	counts: DepartmentStudentCount[];
	analytics?: StudentCountAnalytics;
	departments: Department[];
	faculties: Faculty[];
	schools: School[];
	filters: Filters;
	onFiltersChange: (filters: Filters) => void;
	onSave: (level: number, count: number) => Promise<void>;
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
	const ownCounts = counts.filter(
		(item) => item.departmentId === ownDepartmentId,
	);
	const ownDepartment = departments.find((item) => item.id === ownDepartmentId);
	const dimensions = analytics?.availableDimensions ?? ["level"];
	const canSeeSchools = dimensions.includes("school");
	const canSeeFaculties = dimensions.includes("faculty");
	const canSeeDepartments = dimensions.includes("department");
	const canFilterSchools = adminLevel === "university";
	const canFilterFaculties = adminLevel === "school";
	const canFilterDepartments = adminLevel === "faculty";
	const change = (key: keyof Filters, value: string) => {
		const next = { ...filters, [key]: value };
		if (key === "schoolId") {
			next.facultyId = "";
			next.departmentId = "";
		} else if (key === "facultyId") {
			next.departmentId = "";
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
					maxLevel={ownDepartment?.maxLevel || ownDepartment?.max_level || 400}
					countsByLevel={
						new Map(ownCounts.map((item) => [item.level, item.count]))
					}
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
					<Select
						label="Academic level"
						value={filters.level}
						onChange={(event) => change("level", event.target.value)}
						options={[
							{ value: "", label: "All levels" },
							...[100, 200, 300, 400, 500, 600].map((level) => ({
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
}: {
	icon: React.ReactNode;
	label: string;
	value: number;
}) {
	return (
		<Card>
			<CardContent className="flex items-center gap-4 p-5">
				<div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
				<div>
					<p className="text-sm text-text-muted">{label}</p>
					<p className="text-2xl font-bold text-text-main">
						{value.toLocaleString()}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
