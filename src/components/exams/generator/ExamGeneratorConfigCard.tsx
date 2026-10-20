import React, { useMemo } from "react";
import {
	Sparkles,
	Calendar,
	ShieldCheck,
	ShieldAlert,
	AlertCircle,
	ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Select } from "@/components/ui/select";
import type { Semester, School, Faculty, Department } from "@/types";
import type { ExamOptimizerResult } from "@/api/main/examOptimizerAPI";
import { Link } from "@tanstack/react-router";

interface ExamGeneratorConfigCardProps {
	semesters: Semester[];
	selectedSemesterId: string;
	onSemesterChange: (id: string) => void;
	selectedSemester?: Semester | null;
	scopeType: "school" | "faculty" | "department";
	onScopeTypeChange: (type: "school" | "faculty" | "department") => void;
	scopeId: string;
	onScopeIdChange: (id: string) => void;
	schools: School[];
	faculties: Faculty[];
	departments: Department[];
	canOptimize: boolean;
	isGenerating: boolean;
	onGenerate: () => void;
	isSchoolAdmin: boolean;
	isFacultyAdmin: boolean;
	isDeptAdmin: boolean;
	existingRunForScope?: ExamOptimizerResult | null;
	className?: string;
}

export const ExamGeneratorConfigCard: React.FC<
	ExamGeneratorConfigCardProps
> = ({
	semesters,
	selectedSemesterId,
	onSemesterChange,
	selectedSemester,
	scopeType,
	onScopeTypeChange,
	scopeId,
	onScopeIdChange,
	schools = [],
	faculties = [],
	departments = [],
	canOptimize,
	isGenerating,
	onGenerate,
	isSchoolAdmin,
	isFacultyAdmin,
	isDeptAdmin,
	existingRunForScope,
	className = "",
}) => {
	// Build target scope options based on scopeType
	const targetOptions = useMemo(() => {
		if (scopeType === "school") {
			return schools.map((s) => ({
				value: String(s.id),
				label: s.name ? `${s.name} (${s.code || "SCH"})` : `School #${s.id}`,
			}));
		}
		if (scopeType === "faculty") {
			return faculties.map((f) => ({
				value: String(f.id),
				label: f.name ? `${f.name} (${f.code || "FAC"})` : `Faculty #${f.id}`,
			}));
		}
		return departments.map((d) => ({
			value: String(d.id),
			label: d.name ? `${d.name} (${d.code || "DEP"})` : `Department #${d.id}`,
		}));
	}, [scopeType, schools, faculties, departments]);

	// Allowed scope type choices for this user
	const scopeTypeOptions = useMemo(() => {
		if (isSchoolAdmin) {
			return [
				{ value: "school", label: "School Wide (Entire School)" },
				{ value: "faculty", label: "Faculty Level" },
				{ value: "department", label: "Department Level" },
			];
		}
		if (isFacultyAdmin) {
			return [
				{ value: "faculty", label: "Faculty Level" },
				{ value: "department", label: "Department Level" },
			];
		}
		return [{ value: "department", label: "Department Level" }];
	}, [isSchoolAdmin, isFacultyAdmin]);

	const isExamPeriodSet = Boolean(
		selectedSemester?.examStartDate && selectedSemester?.examEndDate,
	);

	const canTrigger =
		canOptimize && isExamPeriodSet && Boolean(scopeId) && !isGenerating;

	return (
		<div
			className={`rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6 ${className}`}
		>
			<div>
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
						<Sparkles size={18} />
					</div>
					<div>
						<Text variant="h4" weight="bold" className="text-text-main">
							Exam Optimization Parameters
						</Text>
						<Text variant="caption" color="muted">
							Configure target academic scope and semester to generate an
							optimal examination timetable.
						</Text>
					</div>
				</div>
			</div>

			{/* Form Controls */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Semester Select */}
				<div>
					<Select
						label="Target Academic Semester"
						value={selectedSemesterId}
						onChange={(e) => onSemesterChange(e.target.value)}
						options={semesters.map((s) => ({
							value: String(s.id),
							label: `${s.displayName || s.name}${s.isActive ? " (Active)" : ""}`,
						}))}
					/>
				</div>

				{/* Scope Type Select */}
				<div>
					<Select
						label="Optimization Scope Level"
						value={scopeType}
						onChange={(e) => {
							const newType = e.target.value as
								"school" | "faculty" | "department";
							onScopeTypeChange(newType);
							onScopeIdChange("");
						}}
						options={scopeTypeOptions}
						disabled={isDeptAdmin}
					/>
				</div>

				{/* Target Unit Select */}
				<div>
					<Select
						label={`${scopeType.charAt(0).toUpperCase() + scopeType.slice(1)} Target`}
						value={scopeId}
						onChange={(e) => onScopeIdChange(e.target.value)}
						options={targetOptions}
						disabled={isDeptAdmin && targetOptions.length <= 1}
					/>
				</div>
			</div>

			{/* Exam Period & Calendar Info */}
			<div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<Calendar size={15} className="text-primary" />
						<span className="text-xs font-bold text-text-main">
							Semester Examination Window:
						</span>
					</div>

					{isExamPeriodSet ? (
						<div className="flex items-center gap-2">
							<span className="text-xs font-mono font-semibold text-primary">
								{selectedSemester?.examStartDate} →{" "}
								{selectedSemester?.examEndDate}
							</span>
							<Badge variant="success" className="text-[10px] py-0 px-2">
								Period Configured
							</Badge>
						</div>
					) : (
						<Badge variant="warning" className="text-[10px] py-0 px-2">
							Exam Period Not Set
						</Badge>
					)}
				</div>

				{!isExamPeriodSet && (
					<div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<AlertCircle size={14} className="shrink-0 text-amber-400" />
							<span>
								The exam period must be defined before running the optimizer.
							</span>
						</div>
						<Link
							to="/exams"
							className="text-primary hover:underline font-bold text-xs inline-flex items-center gap-1 shrink-0"
						>
							Go to Exams to set period <ArrowRight size={12} />
						</Link>
					</div>
				)}
			</div>

			{/* Permission Status */}
			<div className="flex flex-wrap items-center justify-between gap-3 pt-1">
				<div className="flex items-center gap-2">
					{canOptimize ? (
						<div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
							<ShieldCheck size={15} className="text-emerald-500" />
							<span>Authorized to generate exam timetables for this scope</span>
						</div>
					) : (
						<div className="flex items-center gap-1.5 text-xs text-danger font-medium">
							<ShieldAlert size={15} className="text-danger" />
							<span>Administrative permission required for selected scope</span>
						</div>
					)}
				</div>

				{/* Existing Run Badge / Shortcut */}
				{existingRunForScope && (
					<Link
						to="/exams/generator/$runId"
						params={{ runId: String(existingRunForScope.run_id) }}
						className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
					>
						<span>
							Active {existingRunForScope.status} run exists (
							{existingRunForScope.events.length} courses)
						</span>
						<ArrowRight size={12} />
					</Link>
				)}
			</div>

			{/* Action Trigger */}
			<div className="pt-2 flex justify-start">
				<Button
					variant="primary"
					onClick={onGenerate}
					disabled={!canTrigger}
					className="h-11 px-6 gap-2 text-sm font-semibold shadow-md cursor-pointer"
				>
					<Sparkles size={16} />
					<span>
						{isGenerating
							? "Optimizing Exam Schedule…"
							: "Generate Draft Timetable"}
					</span>
				</Button>
			</div>
		</div>
	);
};
