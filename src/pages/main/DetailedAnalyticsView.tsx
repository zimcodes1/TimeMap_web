import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Users,
	BookOpen,
	Layers,
	LineChart as LineChartIcon,
	Building2,
	RotateCcw,
	Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
	HoldRateAnalytics,
	HoldRateBreakdownItem,
	Faculty,
	Department,
	Program,
	Semester,
} from "@/types";
import FacultyTotalsTable from "@/components/analytics/FacultyTotalsTable";
import LecturerHoldRateTable from "@/components/analytics/LecturerHoldRateTable";
import CourseHoldRateTable from "@/components/analytics/CourseHoldRateTable";
import ProgramHoldRateTable from "@/components/analytics/ProgramHoldRateTable";
import DepartmentTotalsTable from "@/components/analytics/DepartmentTotalsTable";
import HoldRateLineChart from "@/components/dashboard/HoldRateLineChart";

interface DetailedAnalyticsViewProps {
	adminLevel?: string;
	activeSemester?: Semester;
	currentWeekLabel?: string;

	faculties: Faculty[];
	selectedFacultyId: string;
	onFacultyChange: (id: string) => void;

	departments: Department[];
	selectedDepartmentId: string;
	onDepartmentChange: (id: string) => void;

	programs: Program[];
	selectedProgramId: string;
	onProgramChange: (id: string) => void;

	selectedLevel: string;
	onLevelChange: (lvl: string) => void;
	maxLevel?: number;

	// Analytics data
	summaryHoldRate?: HoldRateAnalytics;
	facultiesBreakdown?: HoldRateBreakdownItem[];
	facultiesLoading?: boolean;
	lecturersBreakdown: HoldRateBreakdownItem[];
	lecturersLoading: boolean;
	coursesBreakdown: HoldRateBreakdownItem[];
	coursesLoading: boolean;
	programsBreakdown: HoldRateBreakdownItem[];
	programsLoading: boolean;
	departmentsBreakdown: HoldRateBreakdownItem[];
	departmentsLoading: boolean;
	weeklyBreakdown?: HoldRateAnalytics;
	weeklyLoading: boolean;

	onResetFilters: () => void;
}

export default function DetailedAnalyticsView({
	adminLevel,
	activeSemester,
	currentWeekLabel,
	faculties,
	selectedFacultyId,
	onFacultyChange,
	departments,
	selectedDepartmentId,
	onDepartmentChange,
	programs,
	selectedProgramId,
	onProgramChange,
	selectedLevel,
	onLevelChange,
	maxLevel,
	summaryHoldRate,
	facultiesBreakdown = [],
	facultiesLoading = false,
	lecturersBreakdown,
	lecturersLoading,
	coursesBreakdown,
	coursesLoading,
	programsBreakdown,
	programsLoading,
	departmentsBreakdown,
	departmentsLoading,
	weeklyBreakdown,
	weeklyLoading,
	onResetFilters,
}: DetailedAnalyticsViewProps) {
	const isDeptAdmin = adminLevel === "department";
	const isFacultyAdmin = adminLevel === "faculty";
	const isSchoolOrSuperuser =
		adminLevel === "school" || adminLevel === "university" || !adminLevel;

	const validTabs = useMemo(() => {
		if (isSchoolOrSuperuser) return ["faculties", "trends"];
		if (isFacultyAdmin) return ["departments", "trends"];
		return ["lecturers", "courses", "programs", "trends"];
	}, [isSchoolOrSuperuser, isFacultyAdmin]);

	const [activeTab, setActiveTab] = useState<string>(
		isSchoolOrSuperuser
			? "faculties"
			: isFacultyAdmin
				? "departments"
				: "lecturers",
	);

	const currentTab = validTabs.includes(activeTab) ? activeTab : validTabs[0];

	const levelOptions = useMemo(() => {
		const effectiveMax = maxLevel && maxLevel >= 100 ? maxLevel : 500;
		const options = [{ label: "All Levels", value: "" }];
		for (let lvl = 100; lvl <= effectiveMax; lvl += 100) {
			options.push({ label: `${lvl} Level`, value: String(lvl) });
		}
		return options;
	}, [maxLevel]);

	const activeDept = departments.find(
		(d) => String(d.id) === String(selectedDepartmentId),
	);
	const activeFaculty = faculties.find(
		(f) => String(f.id) === String(selectedFacultyId),
	);

	const overallRate = summaryHoldRate?.summary?.holdRatePercentage ?? 0;
	const heldCount = summaryHoldRate?.summary?.heldCount ?? 0;
	const notHeldCount = summaryHoldRate?.summary?.notHeldCount ?? 0;
	const unreportedCount = summaryHoldRate?.summary?.unreportedCount ?? 0;
	const totalSessions = summaryHoldRate?.summary?.totalSessions ?? 0;

	return (
		<div className="space-y-6">
			{/* Top Bar with Back Button */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex flex-col items-start gap-3">
					<Link to={"/dashboard" as any}>
						<Button
							variant="outline"
							size="sm"
							className="rounded-xl flex items-center gap-1.5 h-9"
						>
							<ArrowLeft size={16} />
							<span>Back to Dashboard</span>
						</Button>
					</Link>
					<div>
						<Text variant="h3" weight="bold" className="text-text-main">
							Detailed Academic Analytics
						</Text>
						<Text variant="body-sm" color="muted">
							Comprehensive lecture delivery audit, lecturer accountability, and
							compliance tracking.
						</Text>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{activeSemester && (
						<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border text-xs">
							<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
							<span className="font-semibold text-text-main">
								{activeSemester.sessionLabel
									? `${activeSemester.sessionLabel} • `
									: ""}
								{activeSemester.name === "first"
									? "1st Semester"
									: "2nd Semester"}
							</span>
						</div>
					)}
					{currentWeekLabel && (
						<Badge
							variant="success"
							className="text-xs flex items-center gap-1 py-0.5 px-2.5 font-medium ml-1"
						>
							<Calendar size={12} className="inline mb-1 mr-1" />
							<span>{currentWeekLabel}</span>
						</Badge>
					)}
				</div>
			</div>

			{/* Executive Summary Stat Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
				<Card className="p-3.5 space-y-1 border-l-4 border-l-primary">
					<Text variant="overline" className="text-[10px] text-text-muted">
						Overall Hold Rate
					</Text>
					<div className="flex items-baseline justify-between">
						<Text variant="h4" weight="bold" className="text-primary">
							{overallRate}%
						</Text>
						<Badge
							variant={
								overallRate >= 75
									? "success"
									: overallRate >= 50
										? "warning"
										: "danger"
							}
							className="text-[10px] py-0 px-1.5"
						>
							{overallRate >= 75 ? "Optimal" : "Review"}
						</Badge>
					</div>
				</Card>

				<Card className="p-3.5 space-y-1 border-l-4 border-l-blue-500">
					<Text variant="overline" className="text-[10px] text-text-muted">
						Total Scheduled Sessions
					</Text>
					<Text variant="h4" weight="bold" className="text-text-main">
						{totalSessions}
					</Text>
				</Card>

				<Card className="p-3.5 space-y-1 border-l-4 border-l-emerald-500">
					<Text variant="overline" className="text-[10px] text-text-muted">
						Successfully Held
					</Text>
					<Text variant="h4" weight="bold" className="text-emerald-400">
						{heldCount}
					</Text>
				</Card>

				<Card className="p-3.5 space-y-1 border-l-4 border-l-rose-500">
					<Text variant="overline" className="text-[10px] text-text-muted">
						Not Held / Missed
					</Text>
					<Text variant="h4" weight="bold" className="text-rose-400">
						{notHeldCount}
					</Text>
				</Card>

				<Card className="p-3.5 space-y-1 border-l-4 border-l-amber-500">
					<Text variant="overline" className="text-[10px] text-text-muted">
						Unreported Sessions
					</Text>
					<Text variant="h4" weight="bold" className="text-amber-400">
						{unreportedCount}
					</Text>
				</Card>
			</div>

			{/* Filter Toolbar */}
			<div className="bg-surface/80 border border-border/80 rounded-2xl p-4 shadow-sm backdrop-blur-md space-y-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
							Analytics Scope:
						</span>
						{isDeptAdmin && activeDept && (
							<Badge variant="default" className="text-xs font-semibold">
								{activeDept.code} - {activeDept.name}
							</Badge>
						)}
						{isFacultyAdmin && (
							<Badge variant="info" className="text-xs font-semibold">
								Faculty Scope
							</Badge>
						)}
						{isSchoolOrSuperuser && (
							<Badge variant="outline" className="text-xs font-semibold">
								School Scope
							</Badge>
						)}
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onResetFilters}
						className="text-xs text-text-muted hover:text-text-main h-8 px-2 flex items-center gap-1.5"
					>
						<RotateCcw size={12} />
						<span>Reset Scope</span>
					</Button>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
					{isSchoolOrSuperuser && (
						<div className="space-y-1">
							<label className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
								<Building2 size={12} />
								<span>Faculty</span>
							</label>
							<select
								value={selectedFacultyId}
								onChange={(e) => onFacultyChange(e.target.value)}
								className="w-full text-xs bg-surface-raised border border-border rounded-xl px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
							>
								{faculties.map((f) => (
									<option key={f.id} value={f.id}>
										{f.name}
									</option>
								))}
							</select>
						</div>
					)}

					{isFacultyAdmin && (
						<div className="space-y-1">
							<label className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
								<Building2 size={12} />
								<span>Department</span>
							</label>
							<select
								value={selectedDepartmentId}
								onChange={(e) => onDepartmentChange(e.target.value)}
								className="w-full text-xs bg-surface-raised border border-border rounded-xl px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
							>
								{departments.map((d) => (
									<option key={d.id} value={d.id}>
										{d.code} - {d.name}
									</option>
								))}
							</select>
						</div>
					)}

					{isDeptAdmin && (
						<div className="space-y-1">
							<label className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
								<Layers size={12} />
								<span>Program</span>
							</label>
							<select
								value={selectedProgramId}
								onChange={(e) => onProgramChange(e.target.value)}
								className="w-full text-xs bg-surface-raised border border-border rounded-xl px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
							>
								<option value="">All Programs ({programs.length})</option>
								{programs.map((p) => (
									<option key={p.id} value={p.id}>
										{p.name} ({p.code})
									</option>
								))}
							</select>
						</div>
					)}

					{!isSchoolOrSuperuser && (
						<div className="space-y-1">
							<label className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
								<Layers size={12} />
								<span>Level</span>
							</label>
							<select
								value={selectedLevel}
								onChange={(e) => onLevelChange(e.target.value)}
								className="w-full text-xs bg-surface-raised border border-border rounded-xl px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
							>
								{levelOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="flex border-b border-border gap-2">
				{isSchoolOrSuperuser && (
					<button
						type="button"
						onClick={() => setActiveTab("faculties")}
						className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
							currentTab === "faculties"
								? "border-primary text-primary"
								: "border-transparent text-text-muted hover:text-text-main"
						}`}
					>
						<Building2 size={14} />
						<span>Faculty Totals</span>
					</button>
				)}

				{isFacultyAdmin && (
					<button
						type="button"
						onClick={() => setActiveTab("departments")}
						className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
							currentTab === "departments"
								? "border-primary text-primary"
								: "border-transparent text-text-muted hover:text-text-main"
						}`}
					>
						<Building2 size={14} />
						<span>Department Totals</span>
					</button>
				)}

				{isDeptAdmin && (
					<>
						<button
							type="button"
							onClick={() => setActiveTab("lecturers")}
							className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
								currentTab === "lecturers"
									? "border-primary text-primary"
									: "border-transparent text-text-muted hover:text-text-main"
							}`}
						>
							<Users size={14} />
							<span>Lecturer Hold Rates</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab("courses")}
							className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
								currentTab === "courses"
									? "border-primary text-primary"
									: "border-transparent text-text-muted hover:text-text-main"
							}`}
						>
							<BookOpen size={14} />
							<span>Courses Breakdown</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab("programs")}
							className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
								currentTab === "programs"
									? "border-primary text-primary"
									: "border-transparent text-text-muted hover:text-text-main"
							}`}
						>
							<Layers size={14} />
							<span>Programs Breakdown</span>
						</button>
					</>
				)}

				<button
					type="button"
					onClick={() => setActiveTab("trends")}
					className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
						currentTab === "trends"
							? "border-primary text-primary"
							: "border-transparent text-text-muted hover:text-text-main"
					}`}
				>
					<LineChartIcon size={14} />
					<span>Weekly Progression</span>
				</button>
			</div>

			{/* Tab Contents */}
			{currentTab === "faculties" && isSchoolOrSuperuser && (
				<FacultyTotalsTable
					faculties={facultiesBreakdown}
					isLoading={facultiesLoading}
					onSelectFaculty={(facId) => {
						onFacultyChange(facId);
						setActiveTab("trends");
					}}
				/>
			)}

			{currentTab === "departments" && isFacultyAdmin && (
				<DepartmentTotalsTable
					departments={departmentsBreakdown}
					isLoading={departmentsLoading}
					facultyName={activeFaculty ? activeFaculty.name : undefined}
					actionLabel="View Trend"
					onSelectDepartment={(deptId) => {
						onDepartmentChange(deptId);
						setActiveTab("trends");
					}}
				/>
			)}

			{currentTab === "lecturers" && isDeptAdmin && (
				<LecturerHoldRateTable
					lecturers={lecturersBreakdown}
					isLoading={lecturersLoading}
					departmentName={activeDept ? activeDept.name : undefined}
				/>
			)}

			{currentTab === "courses" && isDeptAdmin && (
				<CourseHoldRateTable
					courses={coursesBreakdown}
					isLoading={coursesLoading}
				/>
			)}

			{currentTab === "programs" && isDeptAdmin && (
				<ProgramHoldRateTable
					programs={programsBreakdown}
					isLoading={programsLoading}
				/>
			)}

			{currentTab === "trends" && (
				<HoldRateLineChart
					holdRate={weeklyBreakdown}
					isLoading={weeklyLoading}
				/>
			)}
		</div>
	);
}
