import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	Sparkles,
	History,
	ShieldAlert,
	CheckCircle2,
	AlertTriangle,
	Eye,
	UploadCloud,
	Cpu,
	Check,
} from "lucide-react";
import type {
	Semester,
	School,
	Faculty,
	Department,
	TimetableGenerationRun,
} from "@/types";
import { GeneratorConfigCard } from "@/components/schedules/generator/GeneratorConfigCard";
import { GenerationMetricsCards } from "@/components/schedules/generator/GenerationMetricsCards";
import { ConflictDiagnosticsPanel } from "@/components/schedules/generator/ConflictDiagnosticsPanel";
import { TimetableInspectionModal } from "@/components/schedules/generator/TimetableInspectionModal";

interface ScheduleGeneratorViewProps {
	semesters: Semester[];
	semesterId: string;
	onSemesterChange: (id: string) => void;
	scopeType: "school" | "faculty" | "department";
	onScopeTypeChange: (type: "school" | "faculty" | "department") => void;
	scopeId: string;
	onScopeIdChange: (id: string) => void;
	schools: School[];
	faculties: Faculty[];
	departments: Department[];
	populationSize: number;
	onPopulationSizeChange: (val: number) => void;
	maxGenerations: number;
	onMaxGenerationsChange: (val: number) => void;
	mutationRate: number;
	onMutationRateChange: (val: number) => void;
	stagnationLimit: number;
	onStagnationLimitChange: (val: number) => void;
	isGenerating: boolean;
	onSubmit: (e: React.FormEvent) => void;
	activeRun: TimetableGenerationRun | null;
	onPublishRun: (runId: string) => void;
	isPublishing: boolean;
	onOpenHistory: () => void;
	onOpenPermissions?: () => void;
	isSuperuser: boolean;
	isSchoolAdmin: boolean;
	hasPermission: boolean;
	permissionNotice?: string | null;
	scopeLabel?: string;
}

export default function ScheduleGeneratorView({
	semesters,
	semesterId,
	onSemesterChange,
	scopeType,
	onScopeTypeChange,
	scopeId,
	onScopeIdChange,
	schools,
	faculties,
	departments,
	populationSize,
	onPopulationSizeChange,
	maxGenerations,
	onMaxGenerationsChange,
	mutationRate,
	onMutationRateChange,
	stagnationLimit,
	onStagnationLimitChange,
	isGenerating,
	onSubmit,
	activeRun,
	onPublishRun,
	isPublishing,
	onOpenHistory,
	onOpenPermissions,
	isSuperuser,
	isSchoolAdmin,
	hasPermission,
	permissionNotice,
	scopeLabel,
}: ScheduleGeneratorViewProps) {
	const [isInspectionOpen, setIsInspectionOpen] = useState(false);
	const [publishConfirm, setPublishConfirm] = useState(false);

	const handlePublish = () => {
		if (!activeRun) return;
		if (!publishConfirm) {
			setPublishConfirm(true);
			return;
		}
		onPublishRun(activeRun.id);
		setPublishConfirm(false);
	};

	const getStatusBadge = (run: TimetableGenerationRun) => {
		if (run.resultStatus === "optimal") {
			return (
				<Badge variant="success" icon={<CheckCircle2 size={13} />}>
					Optimal (0 Conflicts)
				</Badge>
			);
		}
		if (run.resultStatus === "feasible") {
			return (
				<Badge variant="info" icon={<CheckCircle2 size={13} />}>
					Feasible (0 Hard Conflicts)
				</Badge>
			);
		}
		if (run.resultStatus === "best_available") {
			return (
				<Badge variant="warning" icon={<AlertTriangle size={13} />}>
					Best Available ({run.hardConflictsCount} Conflicts)
				</Badge>
			);
		}
		return <Badge variant="danger">Failed</Badge>;
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Breadcrumb & Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<Link
						to="/schedules"
						className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors mb-1 cursor-pointer"
					>
						<ArrowLeft size={14} />
						<span>Back to Timetables</span>
					</Link>
					<div className="flex items-center gap-2.5">
						<h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
							Automated Timetable Generator
						</h1>
					</div>
					<p className="text-xs text-text-muted max-w-2xl">
						Genetic Algorithm schedule engine: optimizes course session
						allocations across 24 academic slots to achieve clash-free lecture
						timetables.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onOpenHistory}
						className="cursor-pointer gap-1.5 text-xs h-9"
					>
						<History size={14} />
						<span>Run History</span>
					</Button>

					{isSuperuser && onOpenPermissions && (
						<Button
							variant="outline"
							size="sm"
							onClick={onOpenPermissions}
							className="cursor-pointer gap-1.5 text-xs h-9"
						>
							<ShieldAlert size={14} />
							<span>Permissions</span>
						</Button>
					)}
				</div>
			</div>

			{/* Main Grid: Left Config, Right Results */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				{/* Left Column: Generator Configuration Card */}
				<div className="lg:col-span-4 xl:col-span-4 sticky top-6">
					<GeneratorConfigCard
						semesters={semesters}
						semesterId={semesterId}
						onSemesterChange={onSemesterChange}
						scopeType={scopeType}
						onScopeTypeChange={onScopeTypeChange}
						scopeId={scopeId}
						onScopeIdChange={onScopeIdChange}
						schools={schools}
						faculties={faculties}
						departments={departments}
						populationSize={populationSize}
						onPopulationSizeChange={onPopulationSizeChange}
						maxGenerations={maxGenerations}
						onMaxGenerationsChange={onMaxGenerationsChange}
						mutationRate={mutationRate}
						onMutationRateChange={onMutationRateChange}
						stagnationLimit={stagnationLimit}
						onStagnationLimitChange={onStagnationLimitChange}
						isGenerating={isGenerating}
						onSubmit={onSubmit}
						hasPermission={hasPermission}
						permissionNotice={permissionNotice}
						isSchoolAdmin={isSchoolAdmin}
						isSuperuser={isSuperuser}
						scopeLabel={scopeLabel}
					/>
				</div>

				{/* Right Column: Generation Status, Metrics & Inspection */}
				<div className="lg:col-span-8 xl:col-span-8 space-y-5">
					{isGenerating ? (
						/* Live Execution State Banner */
						<div className="p-6 rounded-2xl bg-surface border border-primary/30 shadow-sm space-y-4 animate-pulse">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
									<Cpu size={22} className="animate-spin" />
								</div>
								<div>
									<h3 className="font-bold text-base text-text-main">
										Genetic Algorithm Scheduler Running...
									</h3>
									<p className="text-xs text-text-muted">
										Evaluating candidate timetables across 24 academic weekly
										slots
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-muted pt-2 border-t border-border">
								<div className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-primary" />
									<span>Student cohort clashes: evaluating no-overlaps</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-primary" />
									<span>
										Lecturer allocations: checking zero double-bookings
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-primary" />
									<span>Room constraints: verifying venue conflicts</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-primary" />
									<span>Pacing: max 3 lectures/day per cohort</span>
								</div>
							</div>
						</div>
					) : activeRun ? (
						/* Active Run Results */
						<div className="space-y-5">
							{/* Top Action Bar */}
							<div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div className="flex items-center gap-2.5">
									{getStatusBadge(activeRun)}
									<span className="text-xs text-text-muted font-medium">
										Run ID:{" "}
										<strong className="text-text-main font-mono">
											#{activeRun.id.slice(0, 8)}
										</strong>
									</span>
									{activeRun.isPublished && (
										<Badge
											variant="success"
											size="sm"
											icon={<Check size={12} />}
										>
											Published to Live
										</Badge>
									)}
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setIsInspectionOpen(true)}
										className="cursor-pointer gap-1.5 text-xs h-9 font-semibold hover:border-primary/50"
									>
										<Eye size={14} />
										<span>Inspect Full Timetable</span>
									</Button>

									{!activeRun.isPublished && (
										<Button
											variant={publishConfirm ? "danger" : "primary"}
											size="sm"
											onClick={handlePublish}
											disabled={isPublishing}
											className="cursor-pointer gap-1.5 text-xs h-9 font-semibold"
										>
											<UploadCloud size={14} />
											<span>
												{isPublishing
													? "Publishing..."
													: publishConfirm
														? "Confirm Publish to Live?"
														: "Publish Timetable"}
											</span>
										</Button>
									)}
								</div>
							</div>

							{/* Top Key Metrics Cards */}
							<GenerationMetricsCards run={activeRun} />

							{/* Detailed Conflict Diagnostics Panel */}
							<ConflictDiagnosticsPanel run={activeRun} />
						</div>
					) : (
						/* Empty State / Standby */
						<div className="p-12 text-center rounded-2xl bg-surface border border-dashed border-border space-y-4">
							<div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
								<Sparkles size={24} />
							</div>
							<div className="space-y-1 max-w-md mx-auto">
								<h3 className="font-bold text-base text-text-main">
									Ready to Generate Weekly Schedule
								</h3>
								<p className="text-xs text-text-muted leading-relaxed">
									Select your target academic semester and scope on the left
									panel, adjust hyperparameters if desired, and click{" "}
									<strong>Execute Genetic Scheduler</strong>.
								</p>
							</div>

							<div className="pt-2 text-xs text-text-subtle">
								Generated timetables can be thoroughly inspected in the
								interactive grid and reviewed for conflicts before publishing
								live.
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Full Timetable Inspection Modal */}
			<TimetableInspectionModal
				isOpen={isInspectionOpen}
				onClose={() => setIsInspectionOpen(false)}
				run={activeRun}
			/>
		</div>
	);
}
