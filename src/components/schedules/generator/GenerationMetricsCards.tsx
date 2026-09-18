import { Badge } from "@/components/ui/badge";
import {
	Zap,
	AlertTriangle,
	CheckCircle2,
	Layers,
	Clock,
	Cpu,
} from "lucide-react";
import type { TimetableGenerationRun } from "@/types";

interface GenerationMetricsCardsProps {
	run: TimetableGenerationRun;
}

export function GenerationMetricsCards({ run }: GenerationMetricsCardsProps) {
	const metrics = run.generationMetrics || {};

	// Formatted execution time
	const runtimeSecs =
		typeof metrics.runtime_seconds === "number"
			? metrics.runtime_seconds
			: typeof metrics.elapsed_seconds === "number"
				? metrics.elapsed_seconds
				: 0;
	const formattedRuntime =
		runtimeSecs > 0 ? `${runtimeSecs.toFixed(2)}s` : "< 0.05s";

	// Formatted fitness / quality score
	const qualityPercentage =
		typeof run.fitnessScore === "number" && run.fitnessScore > 0
			? (run.fitnessScore * 100).toFixed(1)
			: "100.0";

	const generationsRun = metrics.generations_run || 0;
	const occurrencesScheduled =
		run.assignmentsPayload?.length ||
		metrics.occurrences_total ||
		run.conflictReport?.occurrences_scheduled ||
		0;

	const isFeasible = run.hardConflictsCount === 0;

	return (
		<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
			{/* 1. Schedule Quality Score */}
			<div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1.5 shadow-2xs">
				<div className="flex items-center justify-between text-text-muted">
					<span className="text-[11px] font-medium">Quality Score</span>
					<Zap size={14} className="text-amber-400" />
				</div>
				<div className="text-lg font-bold text-text-main flex items-baseline gap-1">
					<span>{qualityPercentage}%</span>
					<span className="text-[10px] text-emerald-400 font-semibold">
						{isFeasible ? "Optimal" : "Penalized"}
					</span>
				</div>
				<p className="text-[10px] text-text-muted truncate">
					Constraint compliance
				</p>
			</div>

			{/* 2. Hard Conflicts */}
			<div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1.5 shadow-2xs">
				<div className="flex items-center justify-between text-text-muted">
					<span className="text-[11px] font-medium">Hard Conflicts</span>
					{isFeasible ? (
						<CheckCircle2 size={14} className="text-emerald-400" />
					) : (
						<AlertTriangle size={14} className="text-danger" />
					)}
				</div>
				<div className="text-lg font-bold text-text-main flex items-baseline gap-1.5">
					<span className={isFeasible ? "text-emerald-400" : "text-danger"}>
						{run.hardConflictsCount}
					</span>
					<Badge variant={isFeasible ? "success" : "warning"} size="sm">
						{isFeasible ? "Zero Clashes" : "Attention"}
					</Badge>
				</div>
				<p className="text-[10px] text-text-muted truncate">
					Double-booking & limit violations
				</p>
			</div>

			{/* 3. Occurrences Scheduled */}
			<div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1.5 shadow-2xs">
				<div className="flex items-center justify-between text-text-muted">
					<span className="text-[11px] font-medium">Occurrences</span>
					<Layers size={14} className="text-primary" />
				</div>
				<div className="text-lg font-bold text-text-main">
					{occurrencesScheduled}
				</div>
				<p className="text-[10px] text-text-muted truncate">
					Sessions placed in 24 slots
				</p>
			</div>

			{/* 4. Execution Time */}
			<div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1.5 shadow-2xs">
				<div className="flex items-center justify-between text-text-muted">
					<span className="text-[11px] font-medium">Execution Time</span>
					<Clock size={14} className="text-blue-400" />
				</div>
				<div className="text-lg font-bold text-text-main font-mono">
					{formattedRuntime}
				</div>
				<p className="text-[10px] text-text-muted truncate">
					Evolutionary search time
				</p>
			</div>

			{/* 5. Generations */}
			<div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1.5 shadow-2xs col-span-2 sm:col-span-1">
				<div className="flex items-center justify-between text-text-muted">
					<span className="text-[11px] font-medium">Generations</span>
					<Cpu size={14} className="text-purple-400" />
				</div>
				<div className="text-lg font-bold text-text-main font-mono">
					{generationsRun}
				</div>
				<p className="text-[10px] text-text-muted truncate">
					Convergence generation
				</p>
			</div>
		</div>
	);
}
