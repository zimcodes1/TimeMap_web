import React from "react";
import { BadgeX } from "lucide-react";

interface TimetableDiagnosticsBannerProps {
	hasPublishedTimetable?: boolean;
	scheduledCount?: number;
	attentionCount?: number;
	unscheduledItems?: any[];
}

export const TimetableDiagnosticsBanner: React.FC<
	TimetableDiagnosticsBannerProps
> = ({
	hasPublishedTimetable = false,
	scheduledCount = 0,
	attentionCount = 0,
	unscheduledItems = [],
}) => {
	return (
		<div className="space-y-4">
			{/* Diagnostics Banner */}
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-5">
				<div className="w-full flex flex-col justify-center items-center gap-5 text-sm text-text-muted">
					{hasPublishedTimetable ? (
						`${scheduledCount} scheduled · ${attentionCount} need attention`
					) : (
						<>
							<BadgeX size={20} />
							<p>No optimizer run has been published for this scope</p>
						</>
					)}
				</div>
			</div>

			{/* Attention List if unscheduled courses exist */}
			{hasPublishedTimetable && unscheduledItems.length > 0 && (
				<div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
					<div className="mb-2 font-semibold text-amber-600">
						Courses needing attention
					</div>
					<ul className="space-y-1 text-xs text-text-muted">
						{unscheduledItems.map((item, idx) => (
							<li key={item.course_code || idx}>
								<span className="font-medium">{item.course_code}:</span>{" "}
								{item.reason}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
