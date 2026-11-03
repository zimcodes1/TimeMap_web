import { useMemo } from "react";
import { BookOpen, GraduationCap, Search, X } from "lucide-react";
import type { Program } from "@/types";

interface RunProgramLevelFilterBarProps {
	programs: Program[];
	selectedProgramId: string | number;
	onSelectProgram: (programId: string | number) => void;
	selectedLevel: number;
	onSelectLevel: (level: number) => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	allowAllPrograms?: boolean;
}

export function RunProgramLevelFilterBar({
	programs,
	selectedProgramId,
	onSelectProgram,
	selectedLevel,
	onSelectLevel,
	searchQuery,
	onSearchChange,
	allowAllPrograms = false,
}: RunProgramLevelFilterBarProps) {
	// Active program
	const activeProgram = useMemo(() => {
		return (
			programs.find((p) => String(p.id) === String(selectedProgramId)) ||
			programs[0]
		);
	}, [programs, selectedProgramId]);

	// Derive available levels for active program based on maxLevel (default: 400)
	const availableLevels = useMemo(() => {
		const max = activeProgram?.maxLevel || 400;
		const levels: number[] = [];
		for (let lvl = 100; lvl <= max; lvl += 100) {
			levels.push(lvl);
		}
		return levels;
	}, [activeProgram]);

	return (
		<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-surface border border-border rounded-2xl shadow-xs">
			{/* Left: Program Switcher (strictly individual degree programs or all) */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="flex items-center gap-1.5 text-xs font-bold text-text-muted mr-1">
					<BookOpen size={14} className="text-primary shrink-0" />
					<span>Degree Program:</span>
				</div>

				{allowAllPrograms && programs.length > 0 && (
					<button
						type="button"
						onClick={() => onSelectProgram("ALL")}
						className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
							selectedProgramId === "ALL"
								? "bg-primary text-white shadow-xs font-bold"
								: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted hover:text-text-main border border-border"
						}`}
					>
						All Programs
					</button>
				)}

				{programs.length === 0 ? (
					<span className="text-xs text-text-subtle italic">
						No degree programs found for this department
					</span>
				) : (
					programs.map((prog) => {
						const isSelected =
							String(selectedProgramId) === String(prog.id) ||
							(!selectedProgramId &&
								!allowAllPrograms &&
								prog.id === programs[0]?.id);

						return (
							<button
								key={prog.id}
								type="button"
								onClick={() => onSelectProgram(prog.id)}
								className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
									isSelected
										? "bg-primary text-white shadow-xs font-bold"
										: "bg-surface-raised hover:bg-surface-raised/80 text-text-muted hover:text-text-main border border-border"
								}`}
							>
								<span>{prog.name}</span>
								{prog.code && (
									<span
										className={`ml-1 text-[10px] font-mono ${
											isSelected ? "text-white/80" : "text-text-subtle"
										}`}
									>
										({prog.code})
									</span>
								)}
							</button>
						);
					})
				)}
			</div>

			{/* Right: Level Switcher & Search Bar */}
			<div className="flex flex-wrap items-center gap-3">
				{/* Level Switcher */}
				<div className="flex items-center gap-1.5">
					<div className="flex items-center gap-1 text-xs font-bold text-text-muted">
						<GraduationCap size={14} className="text-primary shrink-0" />
						<span>Level:</span>
					</div>

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

				{/* Quick Search */}
				<div className="relative flex items-center min-w-[180px] max-w-[240px]">
					<Search
						size={14}
						className="absolute left-3 text-text-muted pointer-events-none"
					/>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Search code, title, venue..."
						className="w-full h-9 pl-8 pr-7 text-xs bg-surface-raised border border-border rounded-xl text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary transition-colors"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => onSearchChange("")}
							className="absolute right-2 p-1 text-text-muted hover:text-text-main cursor-pointer"
						>
							<X size={12} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
