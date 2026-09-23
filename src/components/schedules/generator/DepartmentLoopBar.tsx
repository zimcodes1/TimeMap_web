import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Building2, Layers } from "lucide-react";

export interface DepartmentOption {
	id: string | number;
	code?: string;
	name: string;
	courseCount?: number;
}

interface DepartmentLoopBarProps {
	departments: DepartmentOption[];
	selectedDepartmentId: string | number;
	onSelectDepartment: (deptId: string | number) => void;
}

export function DepartmentLoopBar({
	departments,
	selectedDepartmentId,
	onSelectDepartment,
}: DepartmentLoopBarProps) {
	const count = departments.length;

	// Determine active index
	const currentIndex = useMemo(() => {
		const idx = departments.findIndex(
			(d) => String(d.id) === String(selectedDepartmentId),
		);
		return idx >= 0 ? idx : 0;
	}, [departments, selectedDepartmentId]);

	const currentDept = departments[currentIndex] || departments[0];

	// Circular previous and next departments
	const prevIndex = (currentIndex - 1 + count) % count;
	const nextIndex = (currentIndex + 1) % count;

	const prevDept = departments[prevIndex];
	const nextDept = departments[nextIndex];

	const handlePrev = () => {
		if (prevDept) {
			onSelectDepartment(prevDept.id);
		}
	};

	const handleNext = () => {
		if (nextDept) {
			onSelectDepartment(nextDept.id);
		}
	};

	if (count === 0) {
		return null;
	}

	return (
		<div className="p-3 rounded-2xl bg-surface border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
			{/* Left Loop Button */}
			<div className="w-full md:w-auto flex items-center justify-start">
				<Button
					variant="outline"
					size="sm"
					onClick={handlePrev}
					disabled={count <= 1}
					className="h-10 px-3 text-xs gap-1.5 cursor-pointer max-w-[220px] justify-start group"
					title={prevDept ? `Switch to ${prevDept.name}` : ""}
				>
					<ChevronLeft
						size={16}
						className="text-text-muted group-hover:text-primary transition-colors shrink-0"
					/>
					<div className="flex flex-col text-left truncate">
						<span className="text-[10px] text-text-subtle uppercase tracking-wider font-bold">
							Previous
						</span>
						<span className="truncate text-text-muted group-hover:text-text-main font-medium">
							{prevDept?.code || prevDept?.name}
						</span>
					</div>
				</Button>
			</div>

			{/* Center: Department Selection & Counter */}
			<div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-center">
				<div className="flex items-center gap-2 text-xs font-bold text-text-main">
					<div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
						<Building2 size={15} />
					</div>
					<span>Department:</span>
				</div>

				<div className="w-full sm:w-64">
					<Select
						value={String(selectedDepartmentId || currentDept?.id || "")}
						onChange={(e) => onSelectDepartment(e.target.value)}
						options={departments.map((d) => ({
							value: String(d.id),
							label: `${d.code ? `[${d.code}] ` : ""}${d.name}${d.courseCount ? ` (${d.courseCount} courses)` : ""}`,
						}))}
					/>
				</div>

				<div className="text-[11px] text-text-muted flex items-center gap-1 font-mono">
					<Layers size={12} className="text-text-subtle" />
					<span>
						{currentIndex + 1} of {count}
					</span>
				</div>
			</div>

			{/* Right Loop Button */}
			<div className="w-full md:w-auto flex items-center justify-end">
				<Button
					variant="outline"
					size="sm"
					onClick={handleNext}
					disabled={count <= 1}
					className="h-10 px-3 text-xs gap-1.5 cursor-pointer max-w-[220px] justify-end group text-right"
					title={nextDept ? `Switch to ${nextDept.name}` : ""}
				>
					<div className="flex flex-col text-right truncate">
						<span className="text-[10px] text-text-subtle uppercase tracking-wider font-bold">
							Next
						</span>
						<span className="truncate text-text-muted group-hover:text-text-main font-medium">
							{nextDept?.code || nextDept?.name}
						</span>
					</div>
					<ChevronRight
						size={16}
						className="text-text-muted group-hover:text-primary transition-colors shrink-0"
					/>
				</Button>
			</div>
		</div>
	);
}
