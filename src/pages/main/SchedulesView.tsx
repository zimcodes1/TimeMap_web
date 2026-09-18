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
} from "lucide-react";
import type {
	TimetableEntry,
	LectureSession,
	Program,
	Semester,
} from "@/types";
import type { WeekRange, WeekDayInfo } from "@/utils/semesterWeeks";
import { TimetableAcademicGrid } from "@/components/schedules/TimetableAcademicGrid";
import { TimetableListView } from "@/components/schedules/TimetableListView";
import { TimetableTitle } from "@/components/schedules/TimetableTitle";
import { WeekNavigator } from "@/components/schedules/WeekNavigator";
import { TimetableFilterBar } from "@/components/schedules/TimetableFilterBar";

interface SchedulesViewProps {
	entries: TimetableEntry[] | undefined;
	entriesLoading?: boolean;
	sessions: LectureSession[] | undefined;
	sessionsLoading?: boolean;
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
	onOpenScheduleEntry: (
		defaultDay?: string,
		defaultSlot?: { start: string; end: string },
	) => void;
	onShiftSessionTrigger: (session: LectureSession) => void;
	onOpenGenerator?: () => void;
	onOpenHistory?: () => void;
	onOpenPermissions?: () => void;
	canGenerate?: boolean;
	canConfigurePermissions?: boolean;
}

export default function SchedulesView({
	entries,
	entriesLoading = false,
	sessions,
	sessionsLoading = false,
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
	onOpenScheduleEntry,
	onShiftSessionTrigger,
	onOpenPermissions,
	canGenerate = false,
	canConfigurePermissions = false,
}: SchedulesViewProps) {
	// Main view modes: List and Grid are the primary tabs
	const [activeTab, setActiveTab] = useState<"list" | "grid">("grid");

	const today = new Date();
	const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	// Find active program name
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
						Lecture Timetables
					</Text>
					<Text variant="body-sm" color="muted">
						Weekly academic schedule per program and level with Conflict
						Detection & automated scheduling integration.
					</Text>
				</div>

				<div className="flex flex-wrap items-center gap-2">
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
				semesterName={activeSemester?.displayName || activeSemester?.name}
			/>

			{/* Main Tabs: List View & Grid View */}
			<div className="flex justify-center">
				<TabSwitcher<"grid" | "list">
					tabs={[
						{
							id: "grid",
							label: "Grid View",
							icon: LayoutGrid,
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
						selectedProgramId={selectedProgramId}
						selectedLevel={selectedLevel}
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
