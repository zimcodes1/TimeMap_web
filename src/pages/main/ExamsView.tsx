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
	Plus,
} from "lucide-react";
import type {
	TimetableEntry,
	LectureSession,
	ExamSitting,
	Program,
	Semester,
} from "@/types";
import type { WeekRange, WeekDayInfo } from "@/utils/semesterWeeks";
import { TimetableAcademicGrid } from "@/components/schedules/TimetableAcademicGrid";
import { TimetableListView } from "@/components/schedules/TimetableListView";
import { TimetableTitle } from "@/components/schedules/TimetableTitle";
import { WeekNavigator } from "@/components/schedules/WeekNavigator";
import { TimetableFilterBar } from "@/components/schedules/TimetableFilterBar";

interface ExamsViewProps {
	entries: TimetableEntry[] | undefined;
	entriesLoading?: boolean;
	sessions: LectureSession[] | undefined;
	sessionsLoading?: boolean;
	examSittings: ExamSitting[] | undefined;
	examSittingsLoading?: boolean;
	isRefetching?: boolean;
	programs?: Program[];
	selectedProgramId: string;
	onSelectProgram: (programId: string) => void;
	selectedLevel: number;
	onSelectLevel: (level: number) => void;
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
		defaultSlot?: { start: string; end: string },
	) => void;
	onOpenExamSitting: () => void;
	onShiftSessionTrigger: (session: LectureSession) => void;
}

export default function ExamsView({
	entries,
	entriesLoading = false,
	sessions,
	sessionsLoading = false,
	examSittings,
	examSittingsLoading = false,
	isRefetching = false,
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
}: ExamsViewProps) {
	const [activeTab, setActiveTab] = useState<"grid" | "list">("grid");

	const today = new Date();
	const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	const currentProgram = useMemo(() => {
		return programs.find((p) => p.id === selectedProgramId) || programs[0];
	}, [programs, selectedProgramId]);

	const programDisplayName = currentProgram?.name || "Department";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<Text variant="h3" weight="bold" className="text-text-main">
						Exam Timetables
					</Text>
					<Text variant="body-sm" color="muted">
						Weekly examination schedule, candidate sittings, and invigilator
						allocation.
					</Text>
				</div>

				<div className="flex items-center gap-2">
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
						className="h-9 gap-1.5 text-xs cursor-pointer"
					>
						<UserCheck size={14} />
						<span>Assign Invigilators</span>
					</Button>

					<Button
						variant="primary"
						size="sm"
						onClick={() => onOpenCreateExamEntry()}
						className="h-9 gap-1.5 text-xs cursor-pointer"
					>
						<Plus size={15} />
						<span>Schedule Exam</span>
					</Button>
				</div>
			</div>

			{/* Warning if no active semester configured */}
			{!activeSemester && (
				<div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-3">
					<CalendarOff size={20} className="shrink-0 text-amber-400" />
					<div className="text-xs">
						<span className="font-bold">No active semester detected.</span>{" "}
						Please configure and activate a semester to enable examination week
						tracking.
					</div>
				</div>
			)}

			{/* Program and Level Filter Bar */}
			<TimetableFilterBar
				programs={programs}
				selectedProgramId={selectedProgramId}
				onSelectProgram={onSelectProgram}
				selectedLevel={selectedLevel}
				onSelectLevel={onSelectLevel}
			/>

			{/* Bold Top-Center Timetable Title */}
			<TimetableTitle
				programName={programDisplayName}
				level={selectedLevel}
				weekNumber={currentWeek}
				totalWeeks={totalWeeks}
				dateRangeLabel={weekRange.rangeLabel}
				isExam={true}
				semesterName={activeSemester?.displayName || activeSemester?.name}
			/>

			{/* Main Tabs: Grid View & List View */}
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

			{/* Content Rendering */}
			{activeTab === "grid" ? (
				entriesLoading ? (
					<div className="h-72 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted text-xs animate-pulse">
						Loading exam timetable grid...
					</div>
				) : (
					<TimetableAcademicGrid
						entries={entries || []}
						selectedProgramId={selectedProgramId}
						selectedLevel={selectedLevel}
						weekDayDates={weekDayDates}
						onOpenCreateEntry={(defaultDay, defaultSlot) =>
							onOpenCreateExamEntry(
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
					Loading exam sessions...
				</div>
			) : (
				<TimetableListView
					sessions={sessions || []}
					weekDayDates={weekDayDates}
					todayStr={todayStr}
					onShiftSessionTrigger={onShiftSessionTrigger}
					isExam={true}
				/>
			)}

			{/* Bottom Next/Previous Controls */}
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
