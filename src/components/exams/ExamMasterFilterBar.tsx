import React, { useMemo } from "react";
import { Search, Filter, Layers } from "lucide-react";
import type { Program } from "@/types";
import { getAvailableLevelsForPrograms } from "@/utils/examTimeframeGrouping";

interface ExamMasterFilterBarProps {
	selectedLevel: number | "ALL";
	onSelectLevel: (lvl: number | "ALL") => void;
	programs: Program[];
	searchQuery: string;
	onSearchChange: (q: string) => void;
	selectedExamType?: string;
	onSelectExamType?: (type: string) => void;
	totalExamsCount: number;
	filteredExamsCount: number;
	className?: string;
}

export const ExamMasterFilterBar: React.FC<ExamMasterFilterBarProps> = ({
	selectedLevel,
	onSelectLevel,
	programs = [],
	searchQuery,
	onSearchChange,
	selectedExamType = "ALL",
	onSelectExamType,
	totalExamsCount,
	filteredExamsCount,
	className = "",
}) => {
	// Dynamically derive available level options from all programs in the scope
	const availableLevels = useMemo(() => {
		return getAvailableLevelsForPrograms(programs);
	}, [programs]);

	return (
		<div
			className={`p-3.5 bg-surface border border-border rounded-2xl shadow-xs space-y-3 ${className}`}
		>
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
				{/* Level Selector Pills */}
				<div className="flex flex-wrap items-center gap-1.5">
					<div className="flex items-center gap-1 text-xs font-bold text-text-muted mr-1">
						<Layers size={13} className="text-primary" />
						<span>Academic Level:</span>
					</div>

					<div className="flex flex-wrap items-center gap-1 bg-surface-raised border border-border p-1 rounded-xl">
						<button
							type="button"
							onClick={() => onSelectLevel("ALL")}
							className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
								selectedLevel === "ALL"
									? "bg-primary text-white shadow-xs"
									: "text-text-muted hover:text-text-main hover:bg-surface-hover"
							}`}
						>
							All Levels
						</button>

						{availableLevels.map((lvl) => {
							const isSelected = selectedLevel === lvl;
							return (
								<button
									key={lvl}
									type="button"
									onClick={() => onSelectLevel(lvl)}
									className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
										isSelected
											? "bg-primary text-white shadow-xs"
											: "text-text-muted hover:text-text-main hover:bg-surface-hover"
									}`}
								>
									{lvl}L
								</button>
							);
						})}
					</div>
				</div>

				{/* Search & Exam Type Filter */}
				<div className="flex flex-wrap items-center gap-2.5">
					{/* Exam Type Filter Pills */}
					{onSelectExamType && (
						<div className="flex items-center gap-1 bg-surface-raised border border-border p-1 rounded-xl text-xs">
							{[
								{ id: "ALL", label: "All Types" },
								{ id: "written", label: "Written" },
								{ id: "cbt", label: "CBT" },
								{ id: "lab_practical", label: "Practical" },
							].map((type) => {
								const isSelected = selectedExamType === type.id;
								return (
									<button
										key={type.id}
										type="button"
										onClick={() => onSelectExamType(type.id)}
										className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
											isSelected
												? "bg-primary text-white font-bold"
												: "text-text-muted hover:text-text-main"
										}`}
									>
										{type.label}
									</button>
								);
							})}
						</div>
					)}

					{/* Quick Search */}
					<div className="relative min-w-[200px] sm:min-w-[220px]">
						<Search
							size={14}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
						/>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder="Search course code..."
							className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-raised border border-border rounded-xl text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
						/>
					</div>
				</div>
			</div>

			{/* Count & Active Summary */}
			<div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border/50">
				<div className="flex items-center gap-1.5">
					<Filter size={11} className="text-primary" />
					<span>
						Showing <strong className="text-text-main font-semibold">{filteredExamsCount}</strong> of{" "}
						{totalExamsCount} examinations scheduled
					</span>
				</div>
				{selectedLevel !== "ALL" && (
					<span className="text-primary font-medium">
						Filtered to {selectedLevel} Level
					</span>
				)}
			</div>
		</div>
	);
};

