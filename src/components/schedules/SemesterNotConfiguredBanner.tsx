import { CalendarOff, Settings, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { AcademicSession, Semester } from "@/types";

interface SemesterNotConfiguredBannerProps {
	isSchoolAdmin?: boolean;
	currentAcademicSession?: AcademicSession | null;
	activeSemester?: Semester | null;
}

export function SemesterNotConfiguredBanner({
	isSchoolAdmin = false,
	currentAcademicSession,
	activeSemester,
}: SemesterNotConfiguredBannerProps) {
	const hasSession = Boolean(currentAcademicSession);
	const hasSemester = Boolean(activeSemester && activeSemester.isActive);

	if (hasSession && hasSemester) {
		return null;
	}

	const title = !hasSession
		? "No Current Academic Session Configured"
		: "No Active Semester Configured";

	const description = !hasSession
		? isSchoolAdmin
			? "Your school has no academic session set as current. Create an academic session (e.g., 2026/2027) and activate a teaching semester to enable lecture timetabling, automated generation, and conflict detection."
			: "The school administrator has not configured a current academic session. Timetable generation and lecture scheduling are temporarily locked until the academic calendar is initialized."
		: isSchoolAdmin
			? `Academic session "${currentAcademicSession?.label}" is current, but no semester is currently active. Activate or add a semester in Sessions & Semesters to unlock lecture scheduling.`
			: `Academic session "${currentAcademicSession?.label}" does not have an active semester. Timetable generation and lecture scheduling are locked until a semester is activated.`;

	return (
		<div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div className="flex items-start gap-3">
				<div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
					<CalendarOff size={20} />
				</div>
				<div>
					<div className="text-sm font-bold text-amber-500">{title}</div>
					<p className="text-xs text-amber-400/90 mt-0.5 leading-relaxed max-w-2xl">
						{description}
					</p>
				</div>
			</div>

			<div className="shrink-0 flex items-center gap-2">
				<Link to="/semesters">
					<Button
						variant="primary"
						size="sm"
						className="h-9 gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
					>
						<Settings size={14} />
						<span>
							{isSchoolAdmin
								? "Configure Calendar"
								: "View Academic Calendar"}
						</span>
						<ArrowRight size={13} className="ml-0.5" />
					</Button>
				</Link>
			</div>
		</div>
	);
}
