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
	FileText,
	RotateCw,
} from "lucide-react";
import type { Program, TimetableGenerationRun } from "@/types";
import { GenerationMetricsCards } from "@/components/schedules/generator/GenerationMetricsCards";
import { ConflictDiagnosticsPanel } from "@/components/schedules/generator/ConflictDiagnosticsPanel";
import {
	DepartmentLoopBar,
	type DepartmentOption,
} from "@/components/schedules/generator/DepartmentLoopBar";
import { RunProgramLevelFilterBar } from "@/components/schedules/generator/RunProgramLevelFilterBar";
import { RunTimetableAcademicGrid } from "@/components/schedules/generator/RunTimetableAcademicGrid";

interface ScheduleRunInspectionViewProps {
	run: TimetableGenerationRun | null;
	isLoading: boolean;
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
}

export default function ScheduleRunInspectionView({
	run,
	isLoading,
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

	const isOptimal = run.resultStatus === "optimal";
	const isFeasible = run.resultStatus === "feasible";
	const hardConflicts = run.hardConflictsCount;
	const assignments = run.assignmentsPayload || [];

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

						<Badge
							variant={isOptimal || isFeasible ? "success" : "warning"}
							className="text-[11px] font-bold uppercase tracking-wider"
						>
							{isOptimal
								? "Optimal Solution"
								: isFeasible
									? "Feasible Schedule"
									: "Best Available"}
						</Badge>

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
						onClick={onPublish}
						disabled={run.isPublished || isPublishing}
						className="h-9 gap-1.5 text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
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
							count: assignments.length,
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
							count: assignments.length,
						},
					]}
					activeTab={activeTab}
					onChange={onTabChange}
				/>
			</div>

			{/* TAB 1: WEEKLY TIMETABLE GRID */}
			{activeTab === "grid" && (
				<div className="space-y-4">
					{/* Department Loop Navigation Bar */}
					{departments.length > 0 && (
						<DepartmentLoopBar
							departments={departments}
							selectedDepartmentId={selectedDepartmentId}
							onSelectDepartment={onSelectDepartment}
						/>
					)}

					{/* Program and Level Filter Bar */}
					<RunProgramLevelFilterBar
						programs={departmentPrograms}
						selectedProgramId={selectedProgramId}
						onSelectProgram={onSelectProgram}
						selectedLevel={selectedLevel}
						onSelectLevel={onSelectLevel}
						searchQuery={searchQuery}
						onSearchChange={onSearchChange}
					/>

					{/* Academic Weekly Grid */}
					<RunTimetableAcademicGrid
						assignments={assignments}
						selectedDepartmentId={selectedDepartmentId}
						selectedProgramId={selectedProgramId}
						selectedLevel={selectedLevel}
						searchQuery={searchQuery}
					/>
				</div>
			)}

			{/* TAB 2: CONSTRAINT DIAGNOSTICS */}
			{activeTab === "diagnostics" && (
				<div className="space-y-4">
					<ConflictDiagnosticsPanel run={run} />
				</div>
			)}

			{/* TAB 3: ALL SCHEDULED OCCURRENCES TABLE */}
			{activeTab === "table" && (
				<div className="border border-border rounded-2xl bg-surface overflow-hidden shadow-xs">
					<div className="p-4 border-b border-border flex items-center justify-between">
						<div>
							<h3 className="text-sm font-bold text-text-main flex items-center gap-2">
								<FileText size={16} className="text-primary" />
								<span>All Generated Timetable Occurrences</span>
							</h3>
							<p className="text-xs text-text-muted">
								Full master list of all {assignments.length} scheduled lecture
								assignments in this run.
							</p>
						</div>
					</div>

					<div className="overflow-x-auto max-h-[600px] overflow-y-auto">
						<table className="w-full text-xs text-left border-collapse">
							<thead className="sticky top-0 bg-surface-raised border-b border-border z-10 text-text-muted font-bold uppercase tracking-wider">
								<tr>
									<th className="p-3">Course</th>
									<th className="p-3">Department</th>
									<th className="p-3">Level</th>
									<th className="p-3">Day & Time</th>
									<th className="p-3">Venue</th>
									<th className="p-3">Lecturers</th>
									<th className="p-3">Students</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{assignments.map((a, idx) => (
									<tr
										key={`${a.occurrence_id || a.course_code}-${idx}`}
										className="hover:bg-surface-raised/40 transition-colors"
									>
										<td className="p-3">
											<div className="font-extrabold text-primary">
												{a.course_code}
											</div>
											<div className="text-[11px] text-text-muted truncate max-w-xs">
												{a.course_title}
											</div>
										</td>
										<td className="p-3 text-text-muted">
											{a.department_name || `Dept #${a.department_id || "—"}`}
										</td>
										<td className="p-3 font-semibold text-text-main">
											{a.level ? `${a.level}L` : "—"}
										</td>
										<td className="p-3">
											<div className="font-semibold text-text-main">
												{a.day_name || a.day}
											</div>
											<div className="text-[11px] font-mono text-text-muted">
												{a.start_time?.slice(0, 5)} - {a.end_time?.slice(0, 5)}
											</div>
										</td>
										<td className="p-3 font-medium text-text-main">
											{a.venue_name}
										</td>
										<td className="p-3 text-text-muted">
											{a.lecturers && a.lecturers.length > 0
												? a.lecturers.join(", ")
												: "—"}
										</td>
										<td className="p-3 font-mono text-text-main">
											{a.expected_students || 50}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
