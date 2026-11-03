import React from "react";
import {
	CheckCircle2,
	AlertTriangle,
	ShieldCheck,
	ShieldAlert,
	Building2,
	Cpu,
	Users,
	Clock,
} from "lucide-react";

interface ExamRunMetricsCardsProps {
	metrics?: Record<string, any>;
	diagnostics?: {
		scheduled?: number;
		joined_sessions?: number;
		unscheduled?: Array<{ course_code: string; reason: string }>;
		validation?: { valid: boolean; errors: Array<{ course_code: string; reason: string }> };
		student_workload?: {
			maximum_exams_per_student_per_week?: number;
			students_over_three_exams_per_week?: number;
			average_exams_per_student_week?: number;
			maximum_exams_per_student_per_day?: number;
		};
	};
	eventsCount?: number;
	className?: string;
}

export const ExamRunMetricsCards: React.FC<ExamRunMetricsCardsProps> = ({
	metrics = {},
	diagnostics,
	eventsCount = 0,
	className = "",
}) => {
	const scheduled = metrics.courses_scheduled ?? eventsCount;
	const unscheduledCount = diagnostics?.unscheduled?.length ?? (metrics.courses_unscheduled || 0);
	const totalCourses = metrics.courses_total ?? (scheduled + unscheduledCount);
	const isAllScheduled = unscheduledCount === 0;

	const hardConflicts = Number(metrics.hard_conflicts || 0);
	const isValid = diagnostics?.validation?.valid ?? (hardConflicts === 0);

	const venueUtil = Number(metrics.average_venue_utilization || 0);
	const venuesUsed = metrics.venues_used ?? 0;
	const allocationsCount = metrics.venue_allocations ?? 0;

	const cbtTurns = metrics.cbt_turns ?? 0;
	const joinedCount = diagnostics?.joined_sessions ?? metrics.joined_sessions ?? 0;

	const maxPerDay = diagnostics?.student_workload?.maximum_exams_per_student_per_day ?? metrics.maximum_exams_per_student_per_day ?? 1;
	const maxPerWeek = diagnostics?.student_workload?.maximum_exams_per_student_per_week ?? metrics.maximum_exams_per_student_per_week ?? 2;

	const runtimeSeconds = Number(metrics.runtime_seconds || 0);
	const activeDays = metrics.active_exam_days ?? 0;

	return (
		<div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 ${className}`}>
			{/* Card 1: Scheduling Coverage */}
			<div className="p-4 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
				<div className="flex items-center justify-between text-xs text-text-muted">
					<span className="font-medium">Coverage</span>
					{isAllScheduled ? (
						<CheckCircle2 size={14} className="text-emerald-400" />
					) : (
						<AlertTriangle size={14} className="text-amber-400" />
					)}
				</div>
				<div className="text-xl font-bold font-mono text-text-main">
					{scheduled} <span className="text-xs text-text-muted font-normal">/ {totalCourses}</span>
				</div>
				<div className={`text-[11px] font-medium ${isAllScheduled ? "text-emerald-400" : "text-amber-400"}`}>
					{isAllScheduled ? "100% Scheduled" : `${unscheduledCount} unscheduled`}
				</div>
			</div>

			{/* Card 2: Constraints & Invariants */}
			<div className="p-4 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
				<div className="flex items-center justify-between text-xs text-text-muted">
					<span className="font-medium">Invariants</span>
					{isValid ? (
						<ShieldCheck size={14} className="text-emerald-400" />
					) : (
						<ShieldAlert size={14} className="text-danger" />
					)}
				</div>
				<div className={`text-xl font-bold font-mono ${isValid ? "text-text-main" : "text-danger"}`}>
					{hardConflicts === 0 ? "0 Clashes" : `${hardConflicts} Clashes`}
				</div>
				<div className={`text-[11px] font-medium ${isValid ? "text-emerald-400" : "text-danger"}`}>
					{isValid ? "Validation Passed" : "Invariants Violated"}
				</div>
			</div>

			{/* Card 3: Venue Utilization */}
			<div className="p-4 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
				<div className="flex items-center justify-between text-xs text-text-muted">
					<span className="font-medium">Venues</span>
					<Building2 size={14} className="text-primary" />
				</div>
				<div className="text-xl font-bold font-mono text-text-main">
					{(venueUtil * 100).toFixed(1)}%
				</div>
				<div className="text-[11px] text-text-muted font-medium">
					{venuesUsed} used · {allocationsCount} sittings
				</div>
			</div>

			{/* Card 4: CBT & Shifts */}
			<div className="p-4 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
				<div className="flex items-center justify-between text-xs text-text-muted">
					<span className="font-medium">CBT & Turns</span>
					<Cpu size={14} className="text-primary" />
				</div>
				<div className="text-xl font-bold font-mono text-text-main">
					{cbtTurns} <span className="text-xs text-text-muted font-normal">turns</span>
				</div>
				<div className="text-[11px] text-text-muted font-medium">
					{joinedCount} joined sessions
				</div>
			</div>

			{/* Card 5: Student Workload */}
			<div className="p-4 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
				<div className="flex items-center justify-between text-xs text-text-muted">
					<span className="font-medium">Workload</span>
					<Users size={14} className="text-primary" />
				</div>
				<div className="text-xl font-bold font-mono text-text-main">
					≤ {maxPerDay}/day
				</div>
				<div className="text-[11px] text-text-muted font-medium">
					≤ {maxPerWeek}/week max load
				</div>
			</div>

			{/* Card 6: Solver Runtime */}
			<div className="p-4 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
				<div className="flex items-center justify-between text-xs text-text-muted">
					<span className="font-medium">Execution</span>
					<Clock size={14} className="text-primary" />
				</div>
				<div className="text-xl font-bold font-mono text-text-main">
					{runtimeSeconds.toFixed(2)}s
				</div>
				<div className="text-[11px] text-text-muted font-medium">
					{activeDays} exam calendar days
				</div>
			</div>
		</div>
	);
};
