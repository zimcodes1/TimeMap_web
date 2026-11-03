import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	UploadCloud,
	CheckCircle2,
	AlertTriangle,
	CalendarDays,
	LayoutGrid,
	ShieldCheck,
	List as ListIcon,
	RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/ui/tabs";
import type { Faculty, Department, Program, User } from "@/types";
import type { WeekDayInfo } from "@/utils/semesterWeeks";
import type {
	ExamOptimizerResult,
	OptimizedExamEvent,
} from "@/api/main/examOptimizerAPI";
import { ExamRunMetricsCards } from "@/components/exams/inspection/ExamRunMetricsCards";
import { ExamDiagnosticsPanel } from "@/components/exams/inspection/ExamDiagnosticsPanel";
import { ExamAllEventsTable } from "@/components/exams/inspection/ExamAllEventsTable";
import { ExamPublishConfirmModal } from "@/components/exams/inspection/ExamPublishConfirmModal";
import { ExamMasterScheduleView } from "@/components/exams/ExamMasterScheduleView";
import { ExamCohortTimelineGrid } from "@/components/exams/ExamCohortTimelineGrid";
import { ExamCohortFilterBar } from "@/components/exams/ExamCohortFilterBar";
import { ExamEventDetailModal } from "@/components/exams/ExamEventDetailModal";

interface ExamOptimizerRunInspectionViewProps {
	run: ExamOptimizerResult | null;
	isLoading: boolean;
	canManage: boolean;
	isApproving: boolean;
	onApprove: () => void;
	isPublishing: boolean;
	onPublish: () => void;
	onRefetch?: () => void;
	faculties: Faculty[];
	selectedFacultyId: string;
	onSelectFaculty: (facId: string) => void;
	departments: Department[];
	selectedDepartmentId: string;
	onSelectDepartment: (deptId: string) => void;
	programs: Program[];
	selectedProgramId: string;
	onSelectProgram: (progId: string) => void;
	selectedLevel: number | "ALL";
	onSelectLevel: (lvl: number | "ALL") => void;
	activeTab: "master" | "cohort" | "diagnostics" | "table";
	onTabChange: (tab: "master" | "cohort" | "diagnostics" | "table") => void;
	currentUser: User | null;
	weekDayDates?: WeekDayInfo[];
	existingPublishedInfo?: {
		hasExisting: boolean;
		runId?: string;
		eventsCount?: number;
		sourceScopeType?: string;
	} | null;
}

export default function ExamOptimizerRunInspectionView({
	run,
	isLoading,
	canManage,
	isApproving,
	onApprove,
	isPublishing,
	onPublish,
	onRefetch,
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
	activeTab,
	onTabChange,
	currentUser,
	weekDayDates,
	existingPublishedInfo,
}: ExamOptimizerRunInspectionViewProps) {
	const [selectedDetailEvent, setSelectedDetailEvent] =
		useState<OptimizedExamEvent | null>(null);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

	if (isLoading) {
		return (
			<div className="space-y-6 max-w-7xl mx-auto py-8">
				<div className="h-10 w-64 bg-surface rounded-xl animate-pulse" />
				<div className="h-28 bg-surface rounded-2xl animate-pulse" />
				<div className="h-96 bg-surface rounded-2xl animate-pulse" />
			</div>
		);
	}

	if (!run) {
		return (
			<div className="max-w-md mx-auto py-16 text-center space-y-4">
				<AlertTriangle size={36} className="text-amber-400 mx-auto" />
				<h3 className="font-bold text-base text-text-main">
					Exam Optimizer Run Not Found
				</h3>
				<p className="text-xs text-text-muted">
					The requested exam timetable run could not be found or you may not have
					permission to view it.
				</p>
				<Link to="/exams/generator">
					<Button variant="primary" size="sm" className="gap-1.5 cursor-pointer">
						<ArrowLeft size={14} />
						<span>Return to Exam Generator</span>
					</Button>
				</Link>
			</div>
		);
	}

	const hardConflicts = Number(run.metrics?.hard_conflicts || 0);
	const validationErrors = run.diagnostics?.validation?.errors?.length || 0;
	const events = run.events || [];

	// Find the selected program object
	const selectedProgram = programs.find(
		(p) => String(p.id) === String(selectedProgramId),
	);

	return (
		<div className="space-y-6 max-w-7xl mx-auto pb-12">
			{/* Breadcrumb Navigation & Top Action Bar */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-xs text-text-muted">
						<Link
							to="/exams"
							className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
						>
							<ArrowLeft size={12} />
							<span>Exams</span>
						</Link>
						<span>/</span>
						<Link
							to="/exams/generator"
							className="hover:text-primary transition-colors cursor-pointer"
						>
							Generator
						</Link>
						<span>/</span>
						<span className="text-text-main font-mono text-[11px]">
							Run #{String(run.run_id).slice(0, 8)}
						</span>
					</div>

					<div className="flex flex-wrap items-center gap-2.5 pt-1">
						<h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
							{run.scope_name || `${run.scope_type} Scope`} Exam Timetable
						</h1>

						<Badge
							variant={
								run.status === "published"
									? "success"
									: run.status === "approved"
										? "info"
										: "warning"
							}
							className="text-[11px] font-semibold uppercase tracking-wide"
						>
							{run.status === "published"
								? "Published Live"
								: run.status === "approved"
									? "Approved"
									: "Draft Solution"}
						</Badge>

						{run.semester_id && (
							<Badge
								variant="outline"
								className="text-[11px] font-medium text-text-muted"
							>
								Semester #{run.semester_id}
							</Badge>
						)}
					</div>

					{/* Metadata audit line */}
					<div className="text-xs text-text-muted flex flex-wrap items-center gap-2 pt-0.5">
						<span>
							Generated {run.created_at ? new Date(run.created_at).toLocaleString() : ""}
							{run.created_by_name ? ` by ${run.created_by_name}` : ""}
						</span>
						{run.approved_at && (
							<>
								<span>·</span>
								<span>
									Approved {new Date(run.approved_at).toLocaleString()}
									{run.approved_by_name ? ` by ${run.approved_by_name}` : ""}
								</span>
							</>
						)}
						{run.published_at && (
							<>
								<span>·</span>
								<span>
									Published {new Date(run.published_at).toLocaleString()}
									{run.published_by_name ? ` by ${run.published_by_name}` : ""}
								</span>
							</>
						)}
					</div>
				</div>

				{/* Header Actions */}
				<div className="flex items-center gap-2">
					{onRefetch && (
						<Button
							variant="outline"
							size="sm"
							onClick={onRefetch}
							className="h-9 gap-1.5 text-xs cursor-pointer"
							title="Refresh run data"
						>
							<RotateCw size={13} />
							<span>Refresh</span>
						</Button>
					)}

					<Link to="/exams/generator">
						<Button
							variant="outline"
							size="sm"
							className="h-9 gap-1.5 text-xs cursor-pointer"
						>
							<ArrowLeft size={14} />
							<span>Back to Generator</span>
						</Button>
					</Link>

					{/* Status Workflow Actions */}
					{canManage && run.status === "draft" && (
						<Button
							variant="outline"
							size="sm"
							onClick={onApprove}
							disabled={isApproving}
							className="h-9 gap-1.5 text-xs font-semibold cursor-pointer border-primary/50 text-primary hover:bg-primary/10"
						>
							<CheckCircle2 size={14} />
							<span>{isApproving ? "Approving..." : "Approve Timetable"}</span>
						</Button>
					)}

					{canManage && run.status === "approved" && (
						<Button
							variant="primary"
							size="sm"
							onClick={() => setIsPublishModalOpen(true)}
							disabled={isPublishing}
							className="h-9 gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
						>
							<UploadCloud size={14} className={isPublishing ? "animate-bounce" : ""} />
							<span>{isPublishing ? "Publishing..." : "Publish to Live"}</span>
						</Button>
					)}

					{run.status === "published" && (
						<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
							<CheckCircle2 size={14} />
							<span>Live Schedule</span>
						</div>
					)}
				</div>
			</div>

			{/* Executive Metrics Overview Bar */}
			<ExamRunMetricsCards
				metrics={run.metrics}
				diagnostics={run.diagnostics}
				eventsCount={events.length}
			/>

			{/* Main Content Tabs */}
			<div className="flex justify-center">
				<TabSwitcher<"master" | "cohort" | "diagnostics" | "table">
					tabs={[
						{
							id: "master",
							label: "Master Schedule",
							icon: CalendarDays,
							count: events.length,
						},
						{
							id: "cohort",
							label: "Cohort Timeline",
							icon: LayoutGrid,
							count: events.length,
						},
						{
							id: "diagnostics",
							label: "Diagnostics & Invariants",
							icon: hardConflicts === 0 && validationErrors === 0 ? ShieldCheck : AlertTriangle,
							count: hardConflicts + validationErrors > 0 ? hardConflicts + validationErrors : undefined,
						},
						{
							id: "table",
							label: "All Exams Ledger",
							icon: ListIcon,
							count: events.length,
						},
					]}
					activeTab={activeTab}
					onChange={onTabChange}
				/>
			</div>

			{/* TAB 1: MASTER SCHEDULE (Timeline box clusters by day) */}
			{activeTab === "master" && (
				<ExamMasterScheduleView
					events={events}
					programs={programs}
					onSelectEvent={(ev) => setSelectedDetailEvent(ev)}
					weekDayDates={weekDayDates}
				/>
			)}

			{/* TAB 2: COHORT TIMELINE (Week/day grid for specific program/level) */}
			{activeTab === "cohort" && (
				<div className="space-y-4">
					<ExamCohortFilterBar
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

					<ExamCohortTimelineGrid
						events={events}
						weekDayDates={weekDayDates}
						selectedProgram={selectedProgram}
						selectedProgramId={selectedProgramId}
						selectedLevel={selectedLevel}
						programs={programs}
						onSelectProgram={onSelectProgram}
						onSelectEvent={(ev) => setSelectedDetailEvent(ev)}
					/>
				</div>
			)}

			{/* TAB 3: DIAGNOSTICS & INVARIANTS */}
			{activeTab === "diagnostics" && (
				<ExamDiagnosticsPanel diagnostics={run.diagnostics} metrics={run.metrics} />
			)}

			{/* TAB 4: ALL EXAMS LEDGER TABLE */}
			{activeTab === "table" && (
				<ExamAllEventsTable
					events={events}
					programs={programs}
					runId={run.run_id}
					onSelectEvent={(ev) => setSelectedDetailEvent(ev)}
				/>
			)}

			{/* Event Detail Modal */}
			<ExamEventDetailModal
				isOpen={Boolean(selectedDetailEvent)}
				onClose={() => setSelectedDetailEvent(null)}
				event={selectedDetailEvent}
			/>

			{/* Publish Confirmation Modal */}
			<ExamPublishConfirmModal
				isOpen={isPublishModalOpen}
				onClose={() => setIsPublishModalOpen(false)}
				onConfirm={() => {
					onPublish();
					setIsPublishModalOpen(false);
				}}
				run={run}
				isPublishing={isPublishing}
				existingPublishedInfo={existingPublishedInfo}
			/>
		</div>
	);
}
