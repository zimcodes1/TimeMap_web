import { useState, useMemo } from "react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/ui/tabs";
import {
	UserCheck,
	LayoutGrid,
	List,
	RefreshCw,
	Plus,
	CalendarOff,
} from "lucide-react";
import type {
	TimetableEntry,
	LectureSession,
	ExamSitting,
	Program,
	Department,
	Faculty,
	Semester,
	User,
	EffectiveExamPeriod,
} from "@/types";
import type { WeekRange, WeekDayInfo } from "@/utils/semesterWeeks";
import { ExamWeeklyGrid } from "@/components/exams/ExamWeeklyGrid";
import { ExamScopeFilterBar } from "@/components/exams/ExamScopeFilterBar";
import { ExamPeriodBanner } from "@/components/exams/ExamPeriodBanner";
import { TimetableListView } from "@/components/schedules/TimetableListView";
import { WeekNavigator } from "@/components/schedules/WeekNavigator";

interface ExamsViewProps {
	entries: TimetableEntry[] | undefined;
	entriesLoading?: boolean;
	sessions: LectureSession[] | undefined;
	sessionsLoading?: boolean;
	examSittings: ExamSitting[] | undefined;
	examSittingsLoading?: boolean;
	isRefetching?: boolean;
	currentUser?: User | null;
	effectiveExamPeriod?: EffectiveExamPeriod | null;
	faculties?: Faculty[];
	selectedFacultyId: string;
	onSelectFaculty: (facultyId: string) => void;
	departments?: Department[];
	selectedDepartmentId: string;
	onSelectDepartment: (deptId: string) => void;
	programs?: Program[];
	selectedProgramId: string;
	onSelectProgram: (programId: string) => void;
	selectedLevel: number | "ALL";
	onSelectLevel: (level: number | "ALL") => void;
	currentWeek: number;
	totalWeeks: number;
	onPreviousWeek: () => void;
	onNextWeek: () => void;
	onResetToCurrentWeek: () => void;
	isCurrentWeekActive: boolean;
	weekRange: WeekRange;
	weekDayDates: WeekDayInfo[];
	activeSemester?: Semester;
	onManualRefresh: () => void;
	onOpenCreateExamEntry: (
		defaultDay?: string,
		defaultDate?: string,
		defaultSlot?: { start: string; end: string },
	) => void;
	onOpenExamSitting: () => void;
	onShiftSessionTrigger: (session: LectureSession) => void;
	onOpenSetSchoolExamPeriod?: () => void;
	onOpenSetFacultyExamPeriod?: () => void;
}

export default function ExamsView({
	entries = [],
	entriesLoading = false,
	sessions = [],
	sessionsLoading = false,
	examSittings = [],
	examSittingsLoading = false,
	isRefetching = false,
	currentUser,
	effectiveExamPeriod,
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
	currentWeek,
	totalWeeks,
	onPreviousWeek,
	onNextWeek,
	onResetToCurrentWeek,
	isCurrentWeekActive,
	weekRange,
	weekDayDates,
	activeSemester,
	onManualRefresh,
	onOpenCreateExamEntry,
	onOpenExamSitting,
	onShiftSessionTrigger,
	onOpenSetSchoolExamPeriod,
	onOpenSetFacultyExamPeriod,
}: ExamsViewProps) {
	const [activeTab, setActiveTab] = useState<"grid" | "list">("grid");

	const today = new Date();
	const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	const isSchoolAdmin =
		currentUser?.role === "admin" &&
		(currentUser?.adminLevel === "school" ||
			currentUser?.adminLevel === "system");
	const isFacultyAdmin =
		currentUser?.role === "admin" && currentUser?.adminLevel === "faculty";
	const isDeptAdmin =
		currentUser?.role === "admin" && currentUser?.adminLevel === "department";

	const currentFaculty =
		faculties.find((f) => String(f.id) === String(selectedFacultyId)) ||
		faculties[0];
	const currentDept = departments.find(
		(d) => String(d.id) === String(selectedDepartmentId),
	);
	const currentProgram = programs.find(
		(p) => String(p.id) === String(selectedProgramId),
	);

	// Compute scope header display text
	const scopeTitle = useMemo(() => {
		if (isSchoolAdmin) {
			const facName = currentFaculty
				? `${currentFaculty.name} (${currentFaculty.code})`
				: "Faculty";
			if (
				selectedDepartmentId &&
				selectedDepartmentId !== "ALL" &&
				currentDept
			) {
				return `${currentDept.name} • ${currentFaculty?.code || "Faculty"}`;
			}
			return facName;
		}
		if (isFacultyAdmin) {
			const facName =
				currentUser?.facultyName || currentFaculty?.name || "Faculty";
			if (
				selectedDepartmentId &&
				selectedDepartmentId !== "ALL" &&
				currentDept
			) {
				return `${currentDept.name} Department`;
			}
			return `Entire ${facName}`;
		}
		if (isDeptAdmin) {
			const deptName = currentUser?.departmentName || "Department";
			if (selectedProgramId && selectedProgramId !== "ALL" && currentProgram) {
				return `${currentProgram.name} (${currentProgram.code})`;
			}
			return `${deptName} (All Programs)`;
		}
		return "Examination Timetable";
	}, [
		isSchoolAdmin,
		isFacultyAdmin,
		isDeptAdmin,
		currentFaculty,
		currentDept,
		currentProgram,
		selectedDepartmentId,
		selectedProgramId,
		currentUser,
	]);

	const isExamPeriodDefined = Boolean(effectiveExamPeriod?.isSet);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<Text variant="h3" weight="bold" className="text-text-main">
							Exam Timetables
						</Text>
						{activeSemester && (
							<Badge variant="secondary" className="text-xs">
								{activeSemester.displayName || activeSemester.name}
							</Badge>
						)}
					</div>
					<Text variant="body-sm" color="muted">
						Comprehensive examination schedules across faculties and departments
						with invigilation tracking.
					</Text>
				</div>

				<div className="flex items-center justify-end gap-2 flex-wrap">
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

					<Button
						variant="outline"
						size="sm"
						onClick={onOpenExamSitting}
						disabled={examSittingsLoading || !isExamPeriodDefined}
						className="h-9 gap-1.5 text-xs cursor-pointer"
					>
						<UserCheck size={14} />
						<span>Assign Invigilators</span>
						{examSittings && examSittings.length > 0 && (
							<Badge variant="primary" className="ml-1 text-[10px] py-0 px-1.5">
								{examSittings.length}
							</Badge>
						)}
					</Button>

					<Button
						variant="primary"
						size="sm"
						onClick={() => onOpenCreateExamEntry()}
						disabled={!isExamPeriodDefined}
						className="h-9 gap-1.5 text-xs cursor-pointer"
					>
						<Plus size={15} />
						<span>Schedule Exam</span>
					</Button>
				</div>
			</div>

			{/* Semester Warning (if no active semester at all) */}
			{!activeSemester && (
				<div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-3">
					<CalendarOff size={20} className="shrink-0 text-amber-500" />
					<div className="text-xs">
						<span className="font-bold">No active semester detected.</span>{" "}
						Please configure and activate a semester in the Academic Calendar
						page to enable examination management.
					</div>
				</div>
			)}

			{/* Context-aware Exam Period Banner Explainer */}
			<ExamPeriodBanner
				effectivePeriod={effectiveExamPeriod}
				currentUser={currentUser}
				onOpenSetSchoolExamPeriod={onOpenSetSchoolExamPeriod || (() => {})}
				onOpenSetFacultyExamPeriod={onOpenSetFacultyExamPeriod || (() => {})}
			/>

			{activeSemester && (
				<>
					{/* Scope Filter Bar (Role Based) */}
					<ExamScopeFilterBar
						currentUser={currentUser}
						faculties={faculties}
						selectedFacultyId={selectedFacultyId}
						onSelectFaculty={onSelectFaculty}
						departments={departments}
						selectedDepartmentId={selectedDepartmentId}
						onSelectDepartment={onSelectDepartment}
						programs={programs}
						selectedProgramId={selectedProgramId}
						onSelectProgram={onSelectProgram}
						selectedLevel={selectedLevel}
						onSelectLevel={onSelectLevel}
					/>

					{/* Centered Exam Timetable Title Banner */}
					<div className="text-center py-2 space-y-1 bg-surface-raised/40 border border-border/60 rounded-2xl p-4">
						<div className="flex items-center justify-center gap-2 flex-wrap">
							<Text variant="h4" weight="bold" className="text-text-main">
								{scopeTitle}: Week {currentWeek}
							</Text>
							{selectedLevel !== "ALL" && (
								<Badge variant="primary" className="text-xs py-0.5">
									{selectedLevel}L
								</Badge>
							)}
						</div>
						<div className="flex items-center justify-center gap-2 text-xs text-text-muted flex-wrap">
							<span className="font-medium">{weekRange.rangeLabel}</span>
							<span>•</span>
							<span>
								Week {currentWeek} of {totalWeeks}
							</span>
							{effectiveExamPeriod?.source &&
								effectiveExamPeriod.source !== "none" && (
									<>
										<span>•</span>
										<span className="text-primary font-semibold">
											{effectiveExamPeriod.source === "faculty"
												? "Faculty Schedule"
												: "School Schedule"}
										</span>
									</>
								)}
						</div>
					</div>

					{/* View Tabs: Grid View & List View */}
					<div className="flex justify-center">
						<TabSwitcher<"grid" | "list">
							tabs={[
								{
									id: "grid",
									label: "Exam Grid View",
									icon: LayoutGrid,
								},
								{
									id: "list",
									label: "Exam List View",
									icon: List,
									count: sessions?.length,
								},
							]}
							activeTab={activeTab}
							onChange={(tab) => setActiveTab(tab)}
						/>
					</div>

					{/* Timetable Content */}
					{activeTab === "grid" ? (
						entriesLoading ? (
							<div className="h-72 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted text-xs animate-pulse">
								Loading examination timetable grid...
							</div>
						) : (
							<ExamWeeklyGrid
								entries={entries}
								sessions={sessions}
								examSittings={examSittings}
								weekDayDates={weekDayDates}
								isSchedulingDisabled={!isExamPeriodDefined}
								onOpenCreateExam={(defaultDay, defaultDate, defaultSlot) =>
									onOpenCreateExamEntry(defaultDay, defaultDate, defaultSlot)
								}
							/>
						)
					) : sessionsLoading ? (
						<div className="h-72 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted text-xs animate-pulse">
							Loading examination sessions list...
						</div>
					) : (
						<TimetableListView
							sessions={sessions}
							weekDayDates={weekDayDates}
							todayStr={todayStr}
							onShiftSessionTrigger={onShiftSessionTrigger}
							isExam={true}
						/>
					)}

					{/* Bottom Week Navigation */}
					<WeekNavigator
						currentWeek={currentWeek}
						totalWeeks={totalWeeks}
						onPrevious={onPreviousWeek}
						onNext={onNextWeek}
						onResetToCurrent={onResetToCurrentWeek}
						isCurrentWeekActive={isCurrentWeekActive}
						dateRangeLabel={weekRange.rangeLabel}
					/>
				</>
			)}
		</div>
	);
}
