import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface WeekNavigatorProps {
	currentWeek: number;
	totalWeeks: number;
	onPrevious: () => void;
	onNext: () => void;
	onResetToCurrent?: () => void;
	isCurrentWeekActive?: boolean;
	dateRangeLabel?: string;
	className?: string;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
	currentWeek,
	totalWeeks,
	onPrevious,
	onNext,
	onResetToCurrent,
	isCurrentWeekActive = false,
	dateRangeLabel,
	className = "",
}) => {
	return (
		<div
			className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-surface border border-border rounded-2xl shadow-xs ${className}`}
		>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={onPrevious}
					disabled={currentWeek <= 1}
					className="h-8.5 px-3 text-xs font-semibold gap-1 cursor-pointer disabled:opacity-40"
				>
					<ChevronLeft size={15} />
					<span>Previous Week</span>
				</Button>
			</div>

			<div className="flex items-center gap-2.5 text-center">
				<div className="flex flex-col items-center">
					<div className="flex items-center gap-1.5 font-bold text-sm text-text-main">
						<Calendar size={14} className="text-primary" />
						<span>
							Week {currentWeek} of {totalWeeks}
						</span>
					</div>
					{dateRangeLabel && (
						<span className="text-[11px] text-text-muted font-mono">
							{dateRangeLabel}
						</span>
					)}
				</div>

				{onResetToCurrent && !isCurrentWeekActive && (
					<button
						type="button"
						onClick={onResetToCurrent}
						className="text-[11px] font-semibold text-primary hover:underline ml-1 cursor-pointer"
					>
						Today's Week
					</button>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={onNext}
					disabled={currentWeek >= totalWeeks}
					className="h-8.5 px-3 text-xs font-semibold gap-1 cursor-pointer disabled:opacity-40"
				>
					<span>Next Week</span>
					<ChevronRight size={15} />
				</Button>
			</div>
		</div>
	);
};
