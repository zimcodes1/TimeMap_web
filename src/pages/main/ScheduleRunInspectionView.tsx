import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/ui/tabs";
import {
	ArrowLeft,
	UploadCloud,
	CheckCircle2,
	AlertTriangle,
	LayoutGrid,
	List as ListIcon,
	RotateCw,
	Lock,
} from "lucide-react";
import type {
	Department,
	Faculty,
	GeneratedAssignment,
	Program,
	TimetableGenerationRun,
} from "@/types";
import { GenerationMetricsCards } from "@/components/schedules/generator/GenerationMetricsCards";
import { ConflictDiagnosticsPanel } from "@/components/schedules/generator/ConflictDiagnosticsPanel";
import {
	DepartmentLoopBar,
	type DepartmentOption,
} from "@/components/schedules/generator/DepartmentLoopBar";
import { FacultySubFilterBar } from "@/components/schedules/generator/FacultySubFilterBar";
import { RunProgramLevelFilterBar } from "@/components/schedules/generator/RunProgramLevelFilterBar";
import { RunTimetableAcademicGrid } from "@/components/schedules/generator/RunTimetableAcademicGrid";
import { RunAllOccurrencesTable } from "@/components/schedules/generator/RunAllOccurrencesTable";
import { PublishConfirmModal } from "@/components/schedules/generator/PublishConfirmModal";

interface ScheduleRunInspectionViewProps {
	run: TimetableGenerationRun | null;
	isLoading: boolean;
	faculties: Faculty[];
	selectedFacultyId: string;
	onSelectFaculty: (facId: string) => void;
	departments: DepartmentOption[];
	selectedDepartmentId: string | number;
	onSelectDepartment: (deptId: string | number) => void;
	departmentPrograms: Program[];
	selectedProgramId: string | number;
	onSelectProgram: (progId: string | number) => void;
	selectedLevel: number;
	onSelectLevel: (level: number) => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	activeTab: "grid" | "diagnostics" | "table";
	onTabChange: (tab: "grid" | "diagnostics" | "table") => void;
	isPublishing: boolean;
	onPublish: () => void;
	onRefetch?: () => void;
	// Scope & Admin Permissions
	isDeptAdmin?: boolean;
	isFacultyAdmin?: boolean;
	isSchoolAdmin?: boolean;
	isSuperuser?: boolean;
	scopedDepartmentIds?: string[];
	scopedAssignments?: GeneratedAssignment[];
	scopeLabel?: { title: string; subtitle?: string; level: string };
	allDepartments?: Department[];
	allFaculties?: Faculty[];
	allPrograms?: Program[];
}

export default function ScheduleRunInspectionView({
	run,
	isLoading,
	faculties,
	selectedFacultyId,
	onSelectFaculty,
	departments,
	selectedDepartmentId,
	onSelectDepartment,
	departmentPrograms,
	selectedProgramId,
	onSelectProgram,
	selectedLevel,
	onSelectLevel,
	searchQuery,
	onSearchChange,
	activeTab,
	onTabChange,
	isPublishing,
	onPublish,
	onRefetch,
	isDeptAdmin = false,
	isFacultyAdmin = false,
	isSchoolAdmin = false,
	isSuperuser = false,
	scopedDepartmentIds,
	scopedAssignments,
	scopeLabel,
	allDepartments = [],
	allFaculties = [],
	allPrograms = [],
}: ScheduleRunInspectionViewProps) {
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
					Timetable Generation Run Not Found
				</h3>
				<p className="text-xs text-text-muted">
					The requested timetable run could not be found or you may not have
					permission to view it.
				</p>
				<Link to="/schedules/generator">
					<Button
						variant="primary"
						size="sm"
						className="gap-1.5 cursor-pointer"
					>
						<ArrowLeft size={14} />
						<span>Return to Timetable Generator</span>
					</Button>
				</Link>
			</div>
		);
	}

	const hardConflicts = run.hardConflictsCount;
	const activeAssignments = scopedAssignments || run.assignmentsPayload || [];
	const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

	return (
		<div className="space-y-6 max-w-7xl mx-auto pb-12">
			{/* Breadcrumb Navigation & Top Action Bar */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-xs text-text-muted">
						<Link
							to="/schedules"
							className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
						>
							<ArrowLeft size={12} />
							<span>Schedules</span>
						</Link>
						<span>/</span>
						<Link
							to="/schedules/generator"
							className="hover:text-primary transition-colors cursor-pointer"
						>
							Generator
						</Link>
						<span>/</span>
						<span className="text-text-main font-mono text-[11px]">
							Run #{run.id.slice(0, 8)}
						</span>
					</div>

					<div className="flex flex-wrap items-center gap-2.5 pt-1">
						<h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
							{run.scopeName || "Timetable Inspection"}
						</h1>

						{run.isPublished ? (
							<Badge
								variant="primary"
								className="text-[11px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-xs"
							>
								<CheckCircle2 size={11} />
								<span>Live Published</span>
							</Badge>
						) : (
							<Badge
								variant="outline"
								className="text-[11px] font-semibold text-amber-400 border-amber-500/40 bg-amber-500/10"
							>
								Draft Solution
							</Badge>
						)}
						{run.semesterName && (
							<Badge
								variant="outline"
								className="text-[11px] font-medium text-text-muted"
							>
								{run.semesterName}
							</Badge>
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

					<Link to="/schedules/generator">
						<Button
							variant="outline"
							size="sm"
							className="h-9 gap-1.5 text-xs cursor-pointer"
						>
							<ArrowLeft size={14} />
							<span>Back to Generator</span>
						</Button>
					</Link>

					<Button
						variant="primary"
						size="sm"
						onClick={() => setIsPublishModalOpen(true)}
						disabled={run.isPublished || isPublishing || isDeptAdmin}
						className="h-9 gap-1.5 text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
						title={
							isDeptAdmin
								? "Department admins cannot publish university-wide schedules."
								: ""
						}
					>
						{run.isPublished ? (
							<>
								<CheckCircle2 size={14} />
								<span>Already Live</span>
							</>
						) : (
							<>
								<UploadCloud
									size={14}
									className={isPublishing ? "animate-bounce" : ""}
								/>
								<span>
									{isPublishing ? "Publishing..." : "Publish to Live"}
								</span>
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Generation Metrics Stats Cards */}
			<GenerationMetricsCards run={run} />

			{/* Main Content Tabs: Weekly Grid vs Diagnostics vs Complete Table */}
			<div className="flex justify-center">
				<TabSwitcher<"grid" | "diagnostics" | "table">
					tabs={[
						{
							id: "grid",
							label: "Weekly Timetable Grid",
							icon: LayoutGrid,
							count: activeAssignments.length,
						},
						{
							id: "diagnostics",
							label: "Constraint Diagnostics",
							icon: hardConflicts === 0 ? CheckCircle2 : AlertTriangle,
							count: hardConflicts > 0 ? hardConflicts : undefined,
						},
						{
							id: "table",
							label: "All Scheduled Occurrences",
							icon: ListIcon,
							count: activeAssignments.length,
						},
					]}
					activeTab={activeTab}
					onChange={onTabChange}
				/>
			</div>

			{/* TAB 1: WEEKLY TIMETABLE GRID */}
			{activeTab === "grid" && (
				<div className="space-y-4">
					{/* School Admin Faculty Sub-Filter */}
					{(isSchoolAdmin || isSuperuser) && faculties.length > 1 && (
						<FacultySubFilterBar
							faculties={faculties}
							selectedFacultyId={selectedFacultyId}
							onSelectFaculty={onSelectFaculty}
							schoolName={scopeLabel?.title}
						/>
					)}

					{/* Department Loop Navigation Bar */}
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
									? "You only have permission to view your assigned department. No course assignments for your department are scheduled in this run."
									: "No departments matching your active scope filter are scheduled in this run."}
							</p>
						</div>
					)}

					{/* Program and Level Filter Bar */}
					{departments.length > 0 && (
						<RunProgramLevelFilterBar
							programs={departmentPrograms}
							selectedProgramId={selectedProgramId}
							onSelectProgram={onSelectProgram}
							selectedLevel={selectedLevel}
							onSelectLevel={onSelectLevel}
							searchQuery={searchQuery}
							onSearchChange={onSearchChange}
						/>
					)}

					{/* Academic Weekly Grid */}
					{departments.length > 0 && (
						<RunTimetableAcademicGrid
							assignments={activeAssignments}
							conflictReport={run.conflictReport}
							selectedDepartmentId={selectedDepartmentId}
							selectedProgramId={selectedProgramId}
							selectedLevel={selectedLevel}
							searchQuery={searchQuery}
						/>
					)}
				</div>
			)}

			{/* TAB 2: CONSTRAINT DIAGNOSTICS */}
			{activeTab === "diagnostics" && (
				<div className="space-y-4">
					<ConflictDiagnosticsPanel
						run={run}
						scopedDepartmentIds={scopedDepartmentIds}
						scopeLabel={scopeLabel}
					/>
				</div>
			)}

			{/* TAB 3: ALL SCHEDULED OCCURRENCES TABLE */}
			{activeTab === "table" && (
				<RunAllOccurrencesTable
					assignments={activeAssignments}
					allDepartments={allDepartments}
					allFaculties={allFaculties}
					allPrograms={allPrograms}
					conflictReport={run.conflictReport}
					isDeptAdmin={isDeptAdmin}
					isFacultyAdmin={isFacultyAdmin}
					isSchoolAdmin={isSchoolAdmin}
					isSuperuser={isSuperuser}
					scopeLabel={scopeLabel}
				/>
			)}

			{/* Publish Confirmation Informer Modal */}
			<PublishConfirmModal
				isOpen={isPublishModalOpen}
				onClose={() => setIsPublishModalOpen(false)}
				onConfirm={() => {
					onPublish();
					setIsPublishModalOpen(false);
				}}
				run={run}
				isPublishing={isPublishing}
				scopeLabel={scopeLabel?.title}
			/>
		</div>
	);
}
