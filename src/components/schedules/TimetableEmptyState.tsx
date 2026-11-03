import React from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface TimetableEmptyStateProps {
	currentWeek?: number;
	weekRangeLabel?: string;
	canGenerate?: boolean;
	isSemesterConfigured?: boolean;
	onOpenScheduleEntry?: () => void;
	title?: string;
	description?: string;
}

export const TimetableEmptyState: React.FC<TimetableEmptyStateProps> = ({
	currentWeek = 1,
	weekRangeLabel,
	canGenerate = false,
	isSemesterConfigured = true,
	onOpenScheduleEntry,
	title,
	description,
}) => {
	const defaultTitle = title || `No Lectures Scheduled for Week ${currentWeek}`;
	const defaultDescription =
		description ||
		(weekRangeLabel
			? `No lectures scheduled during ${weekRangeLabel} in the current scope.`
			: "No lecture timetable has been published for this semester in the current scope.");

	return (
		<div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-4">
			<div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border mx-auto flex items-center justify-center text-text-muted shadow-xs">
				<Calendar size={22} />
			</div>
			<div className="space-y-1.5 max-w-md mx-auto">
				<Text variant="h4" weight="bold" className="text-text-main text-center">
					{defaultTitle}
				</Text>
				<Text variant="body-sm" color="muted" className="text-center leading-relaxed">
					{defaultDescription}
				</Text>
			</div>

			{isSemesterConfigured && (canGenerate || onOpenScheduleEntry) && (
				<div className="pt-2 flex flex-wrap items-center justify-center gap-2">
					{canGenerate && (
						<Link to="/schedules/generator">
							<Button
								variant="primary"
								size="sm"
								className="gap-1.5 text-xs shadow-sm cursor-pointer"
							>
								<Sparkles size={14} />
								<span>Generate Timetable</span>
							</Button>
						</Link>
					)}
					{onOpenScheduleEntry && (
						<Button
							variant="outline"
							size="sm"
							onClick={onOpenScheduleEntry}
							className="gap-1.5 text-xs cursor-pointer"
						>
							<Plus size={14} />
							<span>Schedule Lecture</span>
						</Button>
					)}
				</div>
			)}
		</div>
	);
};

