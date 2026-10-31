import {
	Cpu,
	CheckCircle2,
	Clock,
	Sparkles,
	AlertCircle,
	Layers,
} from "lucide-react";
import type { GenerationProgressEvent } from "@/types";

interface GenerationProgressCardProps {
	progress: GenerationProgressEvent | null;
	scopeType?: "school" | "faculty" | "department";
	compact?: boolean;
}

export function GenerationProgressCard({
	progress,
	scopeType = "school",
	compact = false,
}: GenerationProgressCardProps) {
	const percent = Math.min(100, Math.max(0, progress?.percent ?? 5));
	const faculties = progress?.faculties || [];
	const message = progress?.message || "Preparing timetable optimization...";
	const occurrencesPlaced = progress?.occurrencesPlaced ?? 0;
	const isSchoolScope = scopeType === "school" || faculties.length > 0;

	return (
		<div
			className={`rounded-2xl border border-primary/30 bg-surface shadow-sm overflow-hidden transition-all duration-300 ${
				compact ? "p-4 space-y-3" : "p-6 space-y-5"
			}`}
		>
			{/* Header with Title and Live Percentage */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<div
						className={`rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 ${
							compact ? "w-8 h-8" : "w-10 h-10"
						}`}
					>
						<Cpu
							size={compact ? 18 : 22}
							className="animate-spin text-primary"
						/>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
								{isSchoolScope ? "Decomposed Batch Scheduler" : "GA Optimizer"}
							</span>
							{progress?.step != null && progress?.totalSteps != null && (
								<span className="text-[11px] text-text-muted font-medium">
									Phase {progress.step} of {progress.totalSteps}
								</span>
							)}
						</div>
						<h3
							className={`font-bold text-text-main mt-0.5 ${
								compact ? "text-sm" : "text-base"
							}`}
						>
							{progress?.facultyName
								? `Generating for ${progress.facultyName}...`
								: isSchoolScope
									? "School-Wide Timetable Optimization Running..."
									: "Genetic Algorithm Scheduler Running..."}
						</h3>
					</div>
				</div>

				{/* Percentage counter badge */}
				<div className="text-right shrink-0">
					<div className="text-xl font-black text-primary tabular-nums">
						{percent}%
					</div>
					<div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
						Progress
					</div>
				</div>
			</div>

			{/* Animated Progress Bar */}
			<div className="space-y-1.5">
				<div className="w-full h-2.5 bg-surface-raised rounded-full overflow-hidden border border-border">
					<div
						className="h-full bg-linear-to-r from-primary to-primary-light transition-all duration-500 rounded-full relative"
						style={{ width: `${percent}%` }}
					>
						<div className="absolute inset-0 bg-white/20 animate-pulse" />
					</div>
				</div>
				<div className="flex items-center justify-between text-[11px] text-text-muted">
					<span className="truncate pr-2 font-medium text-text-main">
						{message}
					</span>
					{occurrencesPlaced > 0 && (
						<span className="shrink-0 tabular-nums text-primary font-semibold">
							{occurrencesPlaced} sessions scheduled
						</span>
					)}
				</div>
			</div>

			{/* Faculty Breakdown Checklist for School-Wide Decomposed Generation */}
			{isSchoolScope && faculties.length > 0 && (
				<div className="space-y-2 pt-2 border-t border-border">
					<div className="flex items-center justify-between text-xs text-text-muted">
						<span className="font-semibold text-text-main flex items-center gap-1.5">
							<Layers size={13} className="text-primary" />
							Faculty Sequence (Ranked by Student Population)
						</span>
						<span className="text-[11px]">
							{faculties.filter((f) => f.status === "completed").length} of{" "}
							{faculties.length} completed
						</span>
					</div>

					<div
						className={`grid gap-1.5 overflow-y-auto pr-1 ${
							compact
								? "max-h-40 grid-cols-1"
								: "max-h-60 grid-cols-1 sm:grid-cols-2"
						}`}
					>
						{faculties.map((f, i) => {
							const isDone = f.status === "completed";
							const isRunning = f.status === "running";
							const isFailed = f.status === "failed";

							return (
								<div
									key={f.id}
									className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors ${
										isRunning
											? "bg-primary/10 border border-primary/30 text-primary font-semibold shadow-xs"
											: isDone
												? "bg-surface-raised border border-border text-text-main"
												: isFailed
													? "bg-danger-surface border border-danger/20 text-danger"
													: "bg-surface-raised/50 border border-border/50 text-text-muted"
									}`}
								>
									<div className="flex items-center gap-2 truncate">
										{isDone ? (
											<CheckCircle2
												size={14}
												className="text-emerald-500 shrink-0"
											/>
										) : isRunning ? (
											<div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
										) : isFailed ? (
											<AlertCircle size={14} className="text-danger shrink-0" />
										) : (
											<Clock
												size={14}
												className="text-text-muted/60 shrink-0"
											/>
										)}

										<span className="truncate">
											<span className="font-bold mr-1.5 text-text-muted">
												{i + 1}.
											</span>
											{f.name}
										</span>
									</div>

									<div className="shrink-0 text-[10px] tabular-nums">
										{isDone && f.occurrencesCount != null ? (
											<span className="text-emerald-600 dark:text-emerald-400 font-semibold">
												{f.occurrencesCount} sessions
											</span>
										) : isRunning ? (
											<span className="animate-pulse text-primary font-bold">
												Solving...
											</span>
										) : (
											<span className="text-text-muted">
												Pop: {f.population.toLocaleString()}
											</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Sub-features checked banner */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-text-muted pt-2 border-t border-border">
				<div className="flex items-center gap-1.5">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
					<span>Zero cohort clashes & lecturer conflicts</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
					<span>Multi-session courses spread across days</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
					<span>Inter-faculty shared hall conflict avoidance</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
					<span>Cohort daily pacing limit enforced</span>
				</div>
			</div>
		</div>
	);
}
