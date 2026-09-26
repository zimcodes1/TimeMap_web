import { useMemo } from "react";
import {
	Building2,
	Layers,
	GraduationCap,
	Calendar,
	RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Faculty, Department, Program } from "@/types";

interface DashboardScopeFilterBarProps {
	adminLevel?: string;
	faculties: Faculty[];
	selectedFacultyId: string;
	onFacultyChange: (facultyId: string) => void;
	departments: Department[];
	selectedDepartmentId: string;
	onDepartmentChange: (departmentId: string) => void;
	programs: Program[];
	selectedProgramId: string;
	onProgramChange: (programId: string) => void;
	selectedLevel: string;
	onLevelChange: (level: string) => void;
	maxLevel?: number;
	currentWeekLabel?: string;
	onResetFilters: () => void;
}

export default function DashboardScopeFilterBar({
	adminLevel,
	faculties,
	selectedFacultyId,
	onFacultyChange,
	departments,
	selectedDepartmentId,
	onDepartmentChange,
	programs,
	selectedProgramId,
	onProgramChange,
	selectedLevel,
	onLevelChange,
	maxLevel,
	currentWeekLabel,
	onResetFilters,
}: DashboardScopeFilterBarProps) {
	const isDeptAdmin = adminLevel === "department";
	const isFacultyAdmin = adminLevel === "faculty";
	const isSchoolOrSuperuser =
		adminLevel === "school" || adminLevel === "university" || !adminLevel;

	// Dynamic Level Options according to maxLevel
	const levelOptions = useMemo(() => {
		const max = maxLevel && maxLevel >= 100 ? maxLevel : 400;
		const opts = [{ label: "All Levels", value: "" }];
		for (let lvl = 100; lvl <= max; lvl += 100) {
			opts.push({ label: `${lvl} Level`, value: String(lvl) });
		}
		return opts;
	}, [maxLevel]);

	// Active department details
	const activeDepartment = departments.find(
		(d) => String(d.id) === String(selectedDepartmentId),
	);

	return (
		<div className="bg-surface/80 border border-border/80 rounded-2xl p-4 shadow-sm backdrop-blur-md space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				{/* Scope indicator and Week badge */}
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
						<Layers size={14} className="text-primary" />
						Institutional Scope:
					</span>
					{isDeptAdmin && activeDepartment && (
						<Badge variant="default" className="text-xs font-semibold">
							Dept. of {activeDepartment.name}
						</Badge>
					)}
					{isFacultyAdmin && (
						<Badge variant="info" className="text-xs font-semibold">
							Faculty-Level Admin Scope
						</Badge>
					)}
					{isSchoolOrSuperuser && (
						<Badge variant="outline" className="text-xs font-semibold">
							School-Wide Admin Scope
						</Badge>
					)}

					{currentWeekLabel && (
						<Badge
							variant="success"
							className="text-xs flex items-center gap-1 py-0.5 px-2.5 font-medium ml-1"
						>
							<Calendar size={12} className="inline mb-1 mr-1" />
							<span>{currentWeekLabel}</span>
						</Badge>
					)}
				</div>

				<Button
					variant="ghost"
					size="sm"
					onClick={onResetFilters}
					className="text-xs text-text-muted hover:text-text-main h-8 px-2 flex items-center gap-1.5"
				>
					<RotateCcw size={12} />
					<span>Reset Filters</span>
				</Button>
			</div>

			{/* Filters Controls Row */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
				{/* 1. Faculty Filter (Only for School Admin / Superuser) */}
				{isSchoolOrSuperuser && (
					<div className="space-y-1">
						<label className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
							<Building2 size={12} />
							<span>Faculty</span>
						</label>
						<select
							value={selectedFacultyId}
							onChange={(e) => onFacultyChange(e.target.value)}
							className="w-full text-xs bg-surface-raised border border-border rounded-xl px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
						>
							{faculties.map((f) => (
								<option key={f.id} value={f.id}>
									{f.name}
								</option>
							))}
						</select>
					</div>
				)}

				{/* 2. Department Filter (For School and Faculty Admins; hidden or badge for Dept Admin) */}
				{!isDeptAdmin ? (
					<div className="space-y-1">
						<label className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
							<Building2 size={12} />
							<span>Department</span>
						</label>
						<select
							value={selectedDepartmentId}
							onChange={(e) => onDepartmentChange(e.target.value)}
							className="w-full text-xs bg-surface-raised border border-border rounded-xl px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
						>
							{departments.map((d) => (
								<option key={d.id} value={d.id}>
									{d.code} - {d.name}
								</option>
							))}
						</select>
					</div>
				) : (
					/* Program Filter for Department Admin */
					<div className="space-y-1">
						<label className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
							<GraduationCap size={12} />
							<span>Academic Program</span>
						</label>
						<select
							value={selectedProgramId}
							onChange={(e) => onProgramChange(e.target.value)}
							className="w-full text-xs bg-surface-raised border border-border rounded-xl px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
						>
							<option value="">All Programs ({programs.length})</option>
							{programs.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name} ({p.code})
								</option>
							))}
						</select>
					</div>
				)}

				{/* 3. Level Filter (Available for all admins) */}
				<div className="space-y-1">
					<label className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
						<Layers size={12} />
						<span>Academic Level</span>
					</label>
					<select
						value={selectedLevel}
						onChange={(e) => onLevelChange(e.target.value)}
						className="w-full text-xs bg-surface-raised border border-border rounded-xl px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
					>
						{levelOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>

				{/* 4. Secondary Program filter for Faculty Admin if they drill down */}
				{isFacultyAdmin && (
					<div className="space-y-1">
						<label className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
							<GraduationCap size={12} />
							<span>Program Filter (Optional)</span>
						</label>
						<select
							value={selectedProgramId}
							onChange={(e) => onProgramChange(e.target.value)}
							className="w-full text-xs bg-surface-raised border border-border rounded-xl px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
						>
							<option value="">All Department Programs</option>
							{programs.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name} ({p.code})
								</option>
							))}
						</select>
					</div>
				)}
			</div>
		</div>
	);
}
