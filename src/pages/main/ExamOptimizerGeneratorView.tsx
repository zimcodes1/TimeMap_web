import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import type { Semester, School, Faculty, Department } from "@/types";
import type { ExamOptimizerResult } from "@/api/main/examOptimizerAPI";
import { ExamGeneratorConfigCard } from "@/components/exams/generator/ExamGeneratorConfigCard";
import { ExamRecentRunsCard } from "@/components/exams/generator/ExamRecentRunsCard";
import { ExamGenerationHistoryModal } from "@/components/exams/generator/ExamGenerationHistoryModal";

interface ExamOptimizerGeneratorViewProps {
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
	runs: ExamOptimizerResult[];
	isRunsLoading: boolean;
	existingRunForScope?: ExamOptimizerResult | null;
	isHistoryOpen: boolean;
	onOpenHistory: () => void;
	onCloseHistory: () => void;
}

export const ExamOptimizerGeneratorView: React.FC<ExamOptimizerGeneratorViewProps> = ({
	semesters,
	selectedSemesterId,
	onSemesterChange,
	selectedSemester,
	scopeType,
	onScopeTypeChange,
	scopeId,
	onScopeIdChange,
	schools,
	faculties,
	departments,
	canOptimize,
	isGenerating,
	onGenerate,
	isSchoolAdmin,
	isFacultyAdmin,
	isDeptAdmin,
	runs,
	isRunsLoading,
	existingRunForScope,
	isHistoryOpen,
	onOpenHistory,
	onCloseHistory,
}) => {
	return (
		<div className="mx-auto max-w-6xl space-y-6 pb-12">
			{/* Breadcrumb Navigation */}
			<div className="flex items-center justify-between">
				<Link
					to="/exams"
					className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors"
				>
					<ArrowLeft size={14} />
					<span>Back to Exam Timetables</span>
				</Link>

				<Button
					variant="outline"
					size="sm"
					onClick={onOpenHistory}
					className="h-8 gap-1.5 text-xs cursor-pointer"
				>
					<History size={13} />
					<span>Generation History ({runs.length})</span>
				</Button>
			</div>

			{/* Top Header */}
			<header className="space-y-1">
				<div className="flex items-center gap-2">
					<Text variant="h3" weight="bold" className="text-text-main">
						Exam Timetable Generator
					</Text>
					{selectedSemester && (
						<Badge variant="secondary" className="text-xs">
							{selectedSemester.displayName || selectedSemester.name}
						</Badge>
					)}
				</div>
				<Text variant="body-sm" color="muted">
					Generate an optimized, conflict-free examination draft for your scope, audit allocations and constraint reports, then approve and publish it to students and invigilators.
				</Text>
			</header>

			{/* Generation Configuration Card */}
			<ExamGeneratorConfigCard
				semesters={semesters}
				selectedSemesterId={selectedSemesterId}
				onSemesterChange={onSemesterChange}
				selectedSemester={selectedSemester}
				scopeType={scopeType}
				onScopeTypeChange={onScopeTypeChange}
				scopeId={scopeId}
				onScopeIdChange={onScopeIdChange}
				schools={schools}
				faculties={faculties}
				departments={departments}
				canOptimize={canOptimize}
				isGenerating={isGenerating}
				onGenerate={onGenerate}
				isSchoolAdmin={isSchoolAdmin}
				isFacultyAdmin={isFacultyAdmin}
				isDeptAdmin={isDeptAdmin}
				existingRunForScope={existingRunForScope}
			/>

			{/* Recent Optimization Runs Card */}
			<ExamRecentRunsCard
				runs={runs}
				isLoading={isRunsLoading}
				onOpenHistory={onOpenHistory}
			/>

			{/* Full Generation History Modal */}
			<ExamGenerationHistoryModal
				isOpen={isHistoryOpen}
				onClose={onCloseHistory}
				runs={runs}
				isLoading={isRunsLoading}
			/>
		</div>
	);
};
export default ExamOptimizerGeneratorView;
