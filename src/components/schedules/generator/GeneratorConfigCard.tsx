import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Sparkles, Settings2, Cpu, AlertTriangle } from "lucide-react";
import type { Semester, School, Faculty, Department } from "@/types";

interface GeneratorConfigCardProps {
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
	hasPermission: boolean;
	permissionNotice?: string | null;
	isSchoolAdmin: boolean;
	isSuperuser: boolean;
	scopeLabel?: string;
}

export function GeneratorConfigCard({
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
	hasPermission,
	permissionNotice,
	isSchoolAdmin,
	isSuperuser,
	scopeLabel,
}: GeneratorConfigCardProps) {
	const [showAdvanced, setShowAdvanced] = useState(false);

	return (
		<div className="border border-border rounded-2xl bg-surface p-5 space-y-4 shadow-xs">
			<div className="flex items-center gap-2.5 pb-3 border-b border-border">
				<div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
					<Sparkles size={18} />
				</div>
				<div>
					<h3 className="font-bold text-sm text-text-main">
						Generator Configuration
					</h3>
					<p className="text-xs text-text-muted">
						Configure scope and genetic algorithm parameters
					</p>
				</div>
			</div>

			{permissionNotice ? (
				<div className="p-4 rounded-xl bg-danger-surface border border-danger/30 text-danger flex items-start gap-3">
					<AlertTriangle size={18} className="shrink-0 mt-0.5" />
					<div className="space-y-1 text-xs">
						<p className="font-bold">Generation Scope Restricted</p>
						<p className="text-text-muted">{permissionNotice}</p>
					</div>
				</div>
			) : (
				<form onSubmit={onSubmit} className="space-y-4">
					{/* Strict fieldset disabling all inputs during execution */}
					<fieldset
						disabled={isGenerating}
						className="space-y-4 disabled:opacity-60 transition-opacity"
					>
						{/* Target Semester */}
						<div className="space-y-1">
							<Text variant="caption" className="font-semibold block">
								Target Academic Semester
							</Text>
							<Select
								value={semesterId}
								onChange={(e) => onSemesterChange(e.target.value)}
								disabled={isGenerating}
								options={semesters.map((s) => ({
									value: s.id,
									label: `${s.displayName || (s.name === "first" ? "First Semester" : "Second Semester")}${s.isActive ? " (Active)" : ""}`,
								}))}
							/>
						</div>

						{/* Scope Selector for School Admins / Superusers */}
						{isSchoolAdmin || isSuperuser ? (
							<div className="space-y-3">
								<div className="space-y-1">
									<Text variant="caption" className="font-semibold block">
										Generation Scope Level
									</Text>
									<Select
										value={scopeType}
										onChange={(e) =>
											onScopeTypeChange(
												e.target.value as "school" | "faculty" | "department",
											)
										}
										disabled={isGenerating}
										options={[
											{ value: "school", label: "School-Wide (All Programs)" },
											{ value: "faculty", label: "Faculty Scoped" },
											{ value: "department", label: "Department Scoped" },
										]}
									/>
								</div>

								<div className="space-y-1">
									<Text variant="caption" className="font-semibold block">
										{scopeType === "school"
											? "Target School"
											: scopeType === "faculty"
												? "Target Faculty"
												: "Target Department"}
									</Text>

									{scopeType === "school" && (
										<Select
											value={scopeId}
											onChange={(e) => onScopeIdChange(e.target.value)}
											disabled={isGenerating || schools.length <= 1}
											options={schools.map((s) => ({
												value: s.id,
												label: `${s.code} - ${s.name}`,
											}))}
										/>
									)}

									{scopeType === "faculty" && (
										<Select
											value={scopeId}
											onChange={(e) => onScopeIdChange(e.target.value)}
											disabled={isGenerating}
											options={faculties.map((f) => ({
												value: f.id,
												label: `${f.code} - ${f.name}`,
											}))}
										/>
									)}

									{scopeType === "department" && (
										<Select
											value={scopeId}
											onChange={(e) => onScopeIdChange(e.target.value)}
											disabled={isGenerating}
											options={departments.map((d) => ({
												value: d.id,
												label: `${d.code} - ${d.name}`,
											}))}
										/>
									)}
								</div>
							</div>
						) : (
							<div className="p-3 bg-surface-raised border border-border rounded-xl text-xs flex items-center justify-between">
								<span className="text-text-muted">Target Scope:</span>
								<span className="font-semibold text-text-main">
									{scopeLabel || scopeType.toUpperCase()}
								</span>
							</div>
						)}

						{/* Advanced Hyperparameters Accordion */}
						<div className="border border-border rounded-xl p-3 bg-surface-raised/40 space-y-3">
							<button
								type="button"
								onClick={() => setShowAdvanced((prev) => !prev)}
								disabled={isGenerating}
								className="w-full flex items-center justify-between text-xs font-semibold text-text-main cursor-pointer hover:text-primary transition-colors disabled:cursor-not-allowed"
							>
								<div className="flex items-center gap-1.5">
									<Settings2 size={14} className="text-text-muted" />
									<span>Algorithm Hyperparameters (Advanced)</span>
								</div>
								<span className="text-[10px] text-text-muted font-normal">
									{showAdvanced ? "Collapse" : "Expand"}
								</span>
							</button>

							{showAdvanced && (
								<div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
									<div className="space-y-1">
										<label className="text-[11px] text-text-muted block font-medium">
											Population Size
										</label>
										<Input
											type="number"
											min={10}
											max={300}
											value={populationSize}
											onChange={(e) =>
												onPopulationSizeChange(Number(e.target.value))
											}
											disabled={isGenerating}
											className="h-8 text-xs"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-[11px] text-text-muted block font-medium">
											Max Generations
										</label>
										<Input
											type="number"
											min={20}
											max={1000}
											value={maxGenerations}
											onChange={(e) =>
												onMaxGenerationsChange(Number(e.target.value))
											}
											disabled={isGenerating}
											className="h-8 text-xs"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-[11px] text-text-muted block font-medium">
											Mutation Rate
										</label>
										<Input
											type="number"
											step={0.01}
											min={0.01}
											max={1.0}
											value={mutationRate}
											onChange={(e) =>
												onMutationRateChange(Number(e.target.value))
											}
											disabled={isGenerating}
											className="h-8 text-xs"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-[11px] text-text-muted block font-medium">
											Stagnation Limit
										</label>
										<Input
											type="number"
											min={10}
											max={200}
											value={stagnationLimit}
											onChange={(e) =>
												onStagnationLimitChange(Number(e.target.value))
											}
											disabled={isGenerating}
											className="h-8 text-xs"
										/>
									</div>
								</div>
							)}
						</div>
					</fieldset>

					{/* Action Submit Button */}
					<Button
						variant="primary"
						type="submit"
						disabled={isGenerating || !hasPermission}
						className="w-full cursor-pointer gap-2 text-xs h-10 font-semibold"
					>
						{isGenerating ? (
							<>
								<Cpu size={16} className="animate-spin" />
								<span>Optimizing Timetable...</span>
							</>
						) : (
							<>
								<Sparkles size={16} />
								<span>Execute Genetic Scheduler</span>
							</>
						)}
					</Button>
				</form>
			)}
		</div>
	);
}
