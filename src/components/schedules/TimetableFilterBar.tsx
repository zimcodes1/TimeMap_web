import React, { useMemo } from "react";
import type { Program } from "@/types";
import { BookOpen, Layers } from "lucide-react";

interface TimetableFilterBarProps {
	programs: Program[];
	selectedProgramId: string;
	onSelectProgram: (programId: string) => void;
	selectedLevel: number;
	onSelectLevel: (level: number) => void;
	searchQuery?: string;
	onSearchChange?: (query: string) => void;
	className?: string;
}

export const TimetableFilterBar: React.FC<TimetableFilterBarProps> = ({
	programs,
	selectedProgramId,
	onSelectProgram,
	selectedLevel,
	onSelectLevel,
	className = "",
}) => {
	// Find current selected program
	const activeProgram = useMemo(() => {
		return programs.find((p) => p.id === selectedProgramId) || programs[0];
	}, [programs, selectedProgramId]);

	// Derive available levels for selected program based on its maxLevel
	const availableLevels = useMemo(() => {
		const max = activeProgram?.maxLevel || 400;
		const levels: number[] = [];
		for (let lvl = 100; lvl <= max; lvl += 100) {
			levels.push(lvl);
		}
		return levels;
	}, [activeProgram]);

	return (
		<div
			className={`flex flex-wrap items-center justify-between gap-3 p-3 bg-surface border border-border rounded-2xl shadow-xs ${className}`}
		>
			{/* Program Selector */}
			<div className="flex flex-wrap items-center gap-1.5">
				<div className="flex items-center gap-1 text-xs font-bold text-text-muted mr-1.5">
					<BookOpen size={14} className="text-primary" />
					<span>Program:</span>
				</div>

				{programs.length > 0 ? (
					<div className="flex flex-wrap items-center gap-1.5">
						{programs.map((prog) => {
							const isSelected =
								(selectedProgramId || programs[0]?.id) === prog.id;
							return (
								<button
									key={prog.id}
									type="button"
									onClick={() => onSelectProgram(prog.id)}
									className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
										isSelected
											? "bg-primary text-white shadow-xs border border-primary font-bold"
											: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted hover:text-text-main border border-border"
									}`}
								>
									<span>{prog.name}</span>
									{prog.code && (
										<span
											className={`ml-1 text-[10px] font-mono ${isSelected ? "text-white/80" : "text-text-subtle"}`}
										>
											({prog.code})
										</span>
									)}
								</button>
							);
						})}
					</div>
				) : (
					<div className="flex items-center gap-1 text-xs text-text-muted">
						<Layers size={13} />
						<span>Default Program</span>
					</div>
				)}
			</div>

			{/* Level Selector */}
			<div className="flex items-center gap-1.5">
				<span className="text-xs font-bold text-text-muted mr-1">Level:</span>
				<div className="flex items-center gap-1 bg-surface-raised border border-border p-1 rounded-xl">
					{availableLevels.map((lvl) => {
						const isSelected = selectedLevel === lvl;
						return (
							<button
								key={lvl}
								type="button"
								onClick={() => onSelectLevel(lvl)}
								className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
									isSelected
										? "bg-primary text-white shadow-xs"
										: "text-text-muted hover:text-text-main"
								}`}
							>
								{lvl}L
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};
