import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { TabSwitcher } from "@/components/ui/tabs";
import {
	Plus,
	LayoutGrid,
	List,
	RefreshCw,
	CalendarOff,
	Sparkles,
	ShieldCheck,
	Lock,
} from "lucide-react";
import type {
	TimetableEntry,
	LectureSession,
	Program,
	Semester,
	Faculty,
	GenerationConflictReport,
} from "@/types";
import type { WeekRange, WeekDayInfo } from "@/utils/semesterWeeks";
import { TimetableAcademicGrid } from "@/components/schedules/TimetableAcademicGrid";
import { TimetableListView } from "@/components/schedules/TimetableListView";
import { TimetableTitle } from "@/components/schedules/TimetableTitle";
import { WeekNavigator } from "@/components/schedules/WeekNavigator";
import {
	DepartmentLoopBar,
	type DepartmentOption,
} from "@/components/schedules/generator/DepartmentLoopBar";
import { FacultySubFilterBar } from "@/components/schedules/generator/FacultySubFilterBar";
import { RunProgramLevelFilterBar } from "@/components/schedules/generator/RunProgramLevelFilterBar";

interface SchedulesViewProps {
	entries: TimetableEntry[] | undefined;
	entriesLoading?: boolean;
	sessions: LectureSession[] | undefined;
	sessionsLoading?: boolean;
	isRefetching?: boolean;
	// Scope Hierarchy
	faculties?: Faculty[];
	selectedFacultyId?: string;
	onSelectFaculty?: (facId: string) => void;
	departments?: DepartmentOption[];
	selectedDepartmentId: string | number;
	onSelectDepartment: (deptId: string | number) => void;
	departmentPrograms?: Program[];
	selectedProgramId: string | number;
	onSelectProgram: (programId: string | number) => void;
	selectedLevel: number;
	onSelectLevel: (level: number) => void;
	searchQuery?: string;
	onSearchChange?: (query: string) => void;
	// Week & Semester
	currentWeek: number;
	totalWeeks: number;
	onPreviousWeek: () => void;
	onNextWeek: () => void;
	onResetToCurrentWeek: () => void;
	isCurrentWeekActive: boolean;
	weekRange: WeekRange;
	weekDayDates: WeekDayInfo[];
	activeSemester?: Semester;
	// Conflicts & Diagnostics
	conflictReport?: GenerationConflictReport;
	// Action Handlers
	onManualRefresh: () => void;
	onOpenScheduleEntry: (
		defaultDay?: string,
		defaultSlot?: { start: string; end: string },
	) => void;
	onShiftSessionTrigger: (session: LectureSession) => void;
	onOpenPermissions?: () => void;
	onOpenGenerator?: () => void;
	onOpenHistory?: () => void;
	canGenerate?: boolean;
	canConfigurePermissions?: boolean;
	// Scope Admin Levels
	isDeptAdmin?: boolean;
	isFacultyAdmin?: boolean;
	isSchoolAdmin?: boolean;
	isSuperuser?: boolean;
	scopeLabel?: { title: string; subtitle?: string; level: string };
}

export default function SchedulesView({
	entries,
	entriesLoading = false,
	sessions,
	sessionsLoading = false,
	isRefetching = false,
	faculties = [],
	selectedFacultyId = "",
	onSelectFaculty,
	departments = [],
	selectedDepartmentId,
	onSelectDepartment,
	departmentPrograms = [],
	selectedProgramId,
	onSelectProgram,
	selectedLevel,
	onSelectLevel,
	searchQuery = "",
	onSearchChange = () => {},
	currentWeek,
	totalWeeks,
	onPreviousWeek,
	onNextWeek,
	onResetToCurrentWeek,
	isCurrentWeekActive,
	weekRange,
	weekDayDates,
	activeSemester,
	conflictReport,
	onManualRefresh,
	onOpenScheduleEntry,
	onShiftSessionTrigger,
	onOpenPermissions,
	onOpenGenerator: _onOpenGenerator,
	onOpenHistory: _onOpenHistory,
	canGenerate = false,
	canConfigurePermissions = false,
	isDeptAdmin = false,
	isFacultyAdmin: _isFacultyAdmin = false,
	isSchoolAdmin = false,
	isSuperuser = false,
	scopeLabel,
}: SchedulesViewProps) {
	// Main view modes: List and Grid are the primary tabs
	const [activeTab, setActiveTab] = useState<"grid" | "list">("grid");

	const today = new Date();
	const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	// Find active department and program display name
	const activeDept = useMemo(() => {
		return departments.find(
			(d) => String(d.id) === String(selectedDepartmentId),
		);
	}, [departments, selectedDepartmentId]);

	const activeProg = useMemo(() => {
		if (selectedProgramId === "ALL") return null;
		return departmentPrograms.find(
			(p) => String(p.id) === String(selectedProgramId),
		);
	}, [departmentPrograms, selectedProgramId]);

	const cohortDisplayName = activeProg
		? activeProg.name
		: activeDept
			? `Department of ${activeDept.name}`
			: "Department Timetable";

	return (
		<div className="space-y-6">
			{/* Top Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<Text variant="h3" weight="bold" className="text-text-main">
						Lecture Timetables
					</Text>
					<Text variant="body-sm" color="muted">
						Weekly academic schedule per department, program and level with
						Conflict Detection & automated scheduling integration.
					</Text>
				</div>

				<div className="flex flex-wrap justify-end items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onManualRefresh}
						disabled={isRefetching}
						className="h-9 gap-1.5 text-xs cursor-pointer"
					>
						<RefreshCw
							size={13}
							className={isRefetching ? "animate-spin text-primary" : ""}
						/>
						<span>{isRefetching ? "Refreshing..." : "Refresh"}</span>
					</Button>

					{canConfigurePermissions && onOpenPermissions && (
						<Button
							variant="outline"
							size="sm"
							onClick={onOpenPermissions}
							className="h-9 gap-1.5 text-xs cursor-pointer"
						>
							<ShieldCheck size={14} />
							<span>Scope Policy</span>
						</Button>
					)}

					{canGenerate && (
						<Link to="/schedules/generator">
							<Button
								variant="primary"
								size="sm"
								className="h-9 gap-1.5 text-xs cursor-pointer shadow-sm"
							>
								<Sparkles size={14} />
								<span>Generate Timetable</span>
							</Button>
						</Link>
					)}

					<Button
						variant={canGenerate ? "outline" : "primary"}
						size="sm"
						onClick={() => onOpenScheduleEntry()}
						className="h-9 gap-1.5 text-xs cursor-pointer"
					>
						<Plus size={15} />
						<span>Schedule Lecture</span>
					</Button>
				</div>
			</div>

			{/* Warning if no active semester configured */}
			{!activeSemester && (
				<div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-3">
					<CalendarOff size={20} className="shrink-0 text-amber-400" />
					<div className="text-xs">
						<span className="font-bold">No active semester detected.</span>{" "}
						Please configure and activate a semester in Sessions & Semesters to
						enable week-based schedule tracking.
					</div>
				</div>
			)}

			{/* 1. School Admin / Superuser Faculty Sub-Filter */}
			{(isSchoolAdmin || isSuperuser) &&
				faculties.length > 1 &&
				onSelectFaculty && (
					<FacultySubFilterBar
						faculties={faculties}
						selectedFacultyId={selectedFacultyId}
						onSelectFaculty={onSelectFaculty}
						schoolName={scopeLabel?.title}
					/>
				)}

			{/* 2. Department Loop Navigation Bar */}
			{departments.length > 0 ? (
				<DepartmentLoopBar
					departments={departments}
					selectedDepartmentId={selectedDepartmentId}
					onSelectDepartment={onSelectDepartment}
					isDeptAdmin={isDeptAdmin}
					adminLevel={isDeptAdmin ? "department" : undefined}
				/>
			) : (
				<div className="p-6 text-center border border-dashed border-border rounded-2xl bg-surface-raised/30 space-y-2">
					<Lock size={22} className="mx-auto text-text-muted" />
					<div className="text-xs font-bold text-text-main">
						No Accessible Departments in Scope
					</div>
					<p className="text-[11px] text-text-muted max-w-md mx-auto">
						{isDeptAdmin
							? "You only have permission to view your assigned department."
							: "No departments matching your active scope filter were found."}
					</p>
				</div>
			)}

			{/* 3. Program, Level & Search Filter Bar (strictly individual degree program) */}
			{departments.length > 0 && (
				<RunProgramLevelFilterBar
					programs={departmentPrograms}
					selectedProgramId={selectedProgramId}
					onSelectProgram={onSelectProgram}
					selectedLevel={selectedLevel}
					onSelectLevel={onSelectLevel}
					searchQuery={searchQuery}
					onSearchChange={onSearchChange}
					allowAllPrograms={false}
				/>
			)}

			{/* Bold Top-Center Timetable Title */}
			<TimetableTitle
				programName={cohortDisplayName}
				level={selectedLevel}
				weekNumber={currentWeek}
				totalWeeks={totalWeeks}
				dateRangeLabel={weekRange.rangeLabel}
				semesterName={activeSemester?.displayName || activeSemester?.name}
				isCurrentWeek={isCurrentWeekActive}
			/>

			{/* Main Tabs: Grid View & List View */}
			<div className="flex justify-center">
				<TabSwitcher<"grid" | "list">
					tabs={[
						{
							id: "grid",
							label: "Grid View",
							icon: LayoutGrid,
							count: entries?.length,
						},
						{
							id: "list",
							label: "List View",
							icon: List,
							count: sessions?.length,
						},
					]}
					activeTab={activeTab}
					onChange={(tab) => setActiveTab(tab)}
				/>
			</div>

			{/* Content Rendering */}
			{activeTab === "grid" ? (
				entriesLoading ? (
					<div className="h-72 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted text-xs animate-pulse">
						Loading timetable grid...
					</div>
				) : (
					<TimetableAcademicGrid
						entries={entries || []}
						selectedDepartmentId={selectedDepartmentId}
						selectedProgramId={selectedProgramId}
						selectedLevel={selectedLevel}
						searchQuery={searchQuery}
						conflictReport={conflictReport}
						weekDayDates={weekDayDates}
						onOpenCreateEntry={(defaultDay, defaultSlot) =>
							onOpenScheduleEntry(
								defaultDay,
								defaultSlot
									? { start: defaultSlot.start, end: defaultSlot.end }
									: undefined,
							)
						}
					/>
				)
			) : sessionsLoading ? (
				<div className="h-72 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted text-xs animate-pulse">
					Loading weekly lecture sessions...
				</div>
			) : (
				<TimetableListView
					sessions={sessions || []}
					weekDayDates={weekDayDates}
					todayStr={todayStr}
					onShiftSessionTrigger={onShiftSessionTrigger}
				/>
			)}

			{/* Bottom Next/Previous Week Controls */}
			<WeekNavigator
				currentWeek={currentWeek}
				totalWeeks={totalWeeks}
				onPrevious={onPreviousWeek}
				onNext={onNextWeek}
				onResetToCurrent={onResetToCurrentWeek}
				isCurrentWeekActive={isCurrentWeekActive}
				dateRangeLabel={weekRange.rangeLabel}
			/>
		</div>
	);
}
