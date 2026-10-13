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
import { ExamScopeFilterBar } from "@/components/exams/ExamScopeFilterBar";
import { ExamPeriodBanner } from "@/components/exams/ExamPeriodBanner";
import { WeekNavigator } from "@/components/schedules/WeekNavigator";
import { ExamOptimizerWeek } from "@/components/exams/ExamOptimizerWeek";
import type { OptimizedExamEvent } from "@/api/main/examOptimizerAPI";
import { Link } from "@tanstack/react-router";

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
	optimizedEvents: OptimizedExamEvent[];
	optimizerDiagnostics?: { scheduled?: number; unscheduled?: Array<{ course_code: string; reason: string }> };
	canViewOptimizedTimetable: boolean;
	canOptimize: boolean;
}

export default function ExamsView({
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
	activeSemester,
	onManualRefresh,
	onOpenExamSitting,
	onOpenSetSchoolExamPeriod,
	onOpenSetFacultyExamPeriod,
	optimizedEvents = [],
	optimizerDiagnostics,
	canViewOptimizedTimetable,
	canOptimize,
}: ExamsViewProps) {
	const [activeTab, setActiveTab] = useState<"grid" | "list">("grid");

	const isSchoolAdmin =
		currentUser?.role === "admin" &&
		(currentUser?.adminLevel === "school" ||
			currentUser?.adminLevel === "system");
	const isFacultyAdmin =
		currentUser?.role === "admin" && currentUser?.adminLevel === "faculty";
	const isDeptAdmin =
		currentUser?.role === "admin" && currentUser?.adminLevel === "department";
	const canOpenExamGenerator = isSchoolAdmin || canOptimize;

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
					{canOpenExamGenerator && <Link to="/exams/generator"><Button variant="primary" size="sm" className="h-9 gap-1.5 text-xs">Generate / inspect timetable</Button></Link>}
					{canViewOptimizedTimetable && <Button
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
					</Button>}

					{canViewOptimizedTimetable && <Button
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
					</Button>}

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
					<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
						<div className="text-sm text-text-muted">{optimizerDiagnostics ? `${optimizerDiagnostics.scheduled || 0} scheduled · ${optimizerDiagnostics.unscheduled?.length || 0} need attention` : "No optimizer run has been published for this scope."}</div>
					</div>
					{!!optimizerDiagnostics?.unscheduled?.length && <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm"><div className="mb-2 font-semibold text-amber-600">Courses needing attention</div><ul className="space-y-1 text-xs text-text-muted">{optimizerDiagnostics.unscheduled.map((item) => <li key={item.course_code}><span className="font-medium">{item.course_code}:</span> {item.reason}</li>)}</ul></div>}
					{!canViewOptimizedTimetable ? <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-muted">Exam timetable access is limited to the assigned faculty or department exam officer. A department or faculty admin can manage it when no exam officer is assigned.</div> : null}

					{/* View Tabs: Grid View & List View */}
					<div className="flex justify-center">
						<TabSwitcher<"grid" | "list">
							tabs={[
								{
									id: "grid",
								label: "Weekly exam view",
									icon: LayoutGrid,
								},
								{
									id: "list",
									label: "All exam events",
									icon: List,
									count: sessions?.length,
								},
							]}
							activeTab={activeTab}
							onChange={(tab) => setActiveTab(tab)}
						/>
					</div>

					{/* Timetable Content */}
					{canViewOptimizedTimetable && activeTab === "grid" ? (
						entriesLoading ? (
							<div className="h-72 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted text-xs animate-pulse">
								Loading examination timetable grid...
							</div>
						) : (
							<ExamOptimizerWeek events={optimizedEvents} weekStart={weekRange.startStr} weekEnd={weekRange.endStr} level={selectedLevel} programId={selectedProgramId} departmentId={selectedDepartmentId} />
						)
					) : canViewOptimizedTimetable && sessionsLoading ? (
						<div className="h-72 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted text-xs animate-pulse">
							Loading examination sessions list...
						</div>
					) : canViewOptimizedTimetable ? (
							<ExamOptimizerWeek events={optimizedEvents} weekStart={effectiveExamPeriod?.effectiveStartDate || weekRange.startStr} weekEnd={effectiveExamPeriod?.effectiveEndDate || weekRange.endStr} level={selectedLevel} programId={selectedProgramId} />
					) : null}

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
