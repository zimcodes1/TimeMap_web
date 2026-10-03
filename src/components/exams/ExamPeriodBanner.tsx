import { Calendar, CalendarOff, Settings, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import type { EffectiveExamPeriod, User } from "@/types";

interface ExamPeriodBannerProps {
	effectivePeriod?: EffectiveExamPeriod | null;
	currentUser?: User | null;
	onOpenSetSchoolExamPeriod: () => void;
	onOpenSetFacultyExamPeriod: () => void;
}

export function ExamPeriodBanner({
	effectivePeriod,
	currentUser,
	onOpenSetSchoolExamPeriod,
	onOpenSetFacultyExamPeriod,
}: ExamPeriodBannerProps) {
	const isSchoolAdmin =
		currentUser?.role === "admin" &&
		(currentUser?.adminLevel === "school" ||
			currentUser?.adminLevel === "system");
	const isFacultyAdmin =
		currentUser?.role === "admin" && currentUser?.adminLevel === "faculty";

	const isExamPeriodSet = Boolean(effectivePeriod?.isSet);
	const allowFaculty = Boolean(effectivePeriod?.allowFacultyExamPeriod);

	// Case 1: No Exam Period Set at all
	if (!isExamPeriodSet) {
		return (
			<div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-start gap-3">
					<div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
						<CalendarOff size={20} />
					</div>
					<div>
						<div className="text-sm font-bold text-amber-500">
							{isSchoolAdmin
								? "School Examination Period Not Configured"
								: isFacultyAdmin && allowFaculty
									? "Faculty Examination Period Not Set"
									: "Examination Period Not Defined"}
						</div>
						<p className="text-xs text-amber-400/90 mt-0.5 leading-relaxed max-w-2xl">
							{isSchoolAdmin
								? "The examination schedule timeline has not been defined for this semester. Exam sitting scheduling and timetable generation remain locked until the exam period is set."
								: isFacultyAdmin && allowFaculty
									? "Your school administrator has enabled faculty-specific examination scheduling. You must configure your faculty's exam start and end dates to unlock exam timetabling."
									: isFacultyAdmin
										? "The school administrator has not yet scheduled an examination period for this semester. Exam timetabling is locked until an exam period is established."
										: "The examination period for this semester has not yet been defined by your faculty or school administration. Exam scheduling and timetable entries are currently locked."}
						</p>
					</div>
				</div>

				<div className="shrink-0 flex items-center gap-2">
					{isSchoolAdmin && (
						<Button
							variant="primary"
							size="sm"
							onClick={onOpenSetSchoolExamPeriod}
							className="h-9 gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
						>
							<Calendar size={14} />
							<span>Set Exam Period</span>
						</Button>
					)}

					{isFacultyAdmin && allowFaculty && (
						<Button
							variant="primary"
							size="sm"
							onClick={onOpenSetFacultyExamPeriod}
							className="h-9 gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
						>
							<Calendar size={14} />
							<span>Set Faculty Period</span>
						</Button>
					)}
				</div>
			</div>
		);
	}

	// Case 2: Exam Period IS defined -> Show active schedule bar
	return (
		<div className="p-3.5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				<div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
					<Calendar size={16} />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<Text variant="caption" weight="bold" className="text-text-main">
							Examination Period:
						</Text>
						<span className="text-xs font-semibold text-primary">
							{effectivePeriod?.effectiveStartDate} to{" "}
							{effectivePeriod?.effectiveEndDate}
						</span>
						<Badge
							variant={
								effectivePeriod?.source === "faculty" ? "primary" : "secondary"
							}
							className="text-[10px] py-0 px-2 uppercase font-medium tracking-wider"
						>
							{effectivePeriod?.source === "faculty"
								? "Faculty Specific"
								: "School Wide"}
						</Badge>
					</div>
					<Text
						variant="caption"
						className="text-text-muted text-[11px] block mt-0.5"
					>
						All examination sessions and sittings are scheduled within this
						active window.
					</Text>
				</div>
			</div>

			<div className="flex items-center gap-2 shrink-0">
				{isSchoolAdmin && (
					<Button
						variant="outline"
						size="sm"
						onClick={onOpenSetSchoolExamPeriod}
						className="h-8 gap-1.5 text-xs cursor-pointer"
					>
						<Settings size={13} />
						<span>Configure Period & Permissions</span>
					</Button>
				)}

				{isFacultyAdmin && allowFaculty && (
					<Button
						variant="outline"
						size="sm"
						onClick={onOpenSetFacultyExamPeriod}
						className="h-8 gap-1.5 text-xs cursor-pointer"
					>
						<Edit3 size={13} />
						<span>
							{effectivePeriod?.source === "faculty"
								? "Edit Faculty Period"
								: "Customize Faculty Period"}
						</span>
					</Button>
				)}
			</div>
		</div>
	);
}
