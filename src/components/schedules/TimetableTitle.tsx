import React from "react";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";

interface TimetableTitleProps {
	programName?: string;
	level?: number | string;
	weekNumber: number;
	totalWeeks?: number;
	dateRangeLabel?: string;
	isExam?: boolean;
	semesterName?: string;
}

export const TimetableTitle: React.FC<TimetableTitleProps> = ({
	programName = "Academic",
	level = 100,
	weekNumber,
	totalWeeks,
	dateRangeLabel,
	isExam = false,
	semesterName,
}) => {
	const levelDisplay =
		typeof level === "number"
			? `${level}lv`
			: level.includes("lv")
				? level
				: `${level}lv`;
	const typeLabel = isExam ? "Exam Timetable" : "Timetable";

	return (
		<div className="flex flex-col items-center justify-center text-center py-2 space-y-1">
			<div className="flex items-center gap-2">
				<Text
					variant="h3"
					weight="extrabold"
					className="text-text-main tracking-tight text-lg sm:text-xl md:text-2xl"
				>
					{levelDisplay} {programName} {typeLabel}: Week {weekNumber}
				</Text>
			</div>

			<div className="flex flex-wrap items-center justify-center gap-2 text-xs text-text-muted">
				{semesterName && (
					<Badge
						variant="primary"
						className="text-[11px] font-semibold py-0.5 px-2"
					>
						{semesterName}
					</Badge>
				)}
				{totalWeeks && (
					<span className="font-medium text-text-subtle">
						(Week {weekNumber} of {totalWeeks})
					</span>
				)}
				{dateRangeLabel && (
					<span className="text-text-muted font-mono text-[11px]">
						• {dateRangeLabel}
					</span>
				)}
			</div>
		</div>
	);
};
