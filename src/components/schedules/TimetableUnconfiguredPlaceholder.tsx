import { CalendarOff, CalendarRange, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface TimetableUnconfiguredPlaceholderProps {
	isSchoolAdmin?: boolean;
	hasSession?: boolean;
	hasSemester?: boolean;
}

export function TimetableUnconfiguredPlaceholder({
	isSchoolAdmin = false,
	hasSession = false,
}: TimetableUnconfiguredPlaceholderProps) {
	return (
		<div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center bg-surface border border-dashed border-border rounded-3xl space-y-4 my-4 max-w-2xl mx-auto shadow-sm">
			<div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
				<CalendarOff size={32} />
			</div>

			<div className="space-y-1.5 max-w-md">
				<Text variant="h5" weight="bold" className="text-text-main text-center">
					Lecture Timetable Unavailable
				</Text>
				<Text
					variant="body-sm"
					color="muted"
					className="text-center leading-relaxed"
				>
					{!hasSession
						? "No active academic session has been established for your school. Automated timetable generation, manual lecture booking, and cohort grids require an active academic session."
						: "An academic session exists, but no teaching semester is currently active. Please configure and activate the current semester in Sessions & Semesters to unlock lecture scheduling."}
				</Text>
			</div>

			<div className="pt-2">
				<Link to="/semesters">
					<Button
						variant="primary"
						size="md"
						className="gap-2 cursor-pointer shadow-md font-semibold px-5"
					>
						<CalendarRange size={16} />
						<span>
							{isSchoolAdmin
								? "Configure Academic Sessions & Semesters"
								: "View Academic Sessions & Semesters"}
						</span>
						<ArrowRight size={14} className="ml-1" />
					</Button>
				</Link>
			</div>
		</div>
	);
}
