import React from "react";
import { BookOpen, Users, Clock, Layers, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, Semester } from "@/types";

interface LecturerCoursesListProps {
	courses: Course[];
	isLoading?: boolean;
	activeSemester?: Semester;
}

export const LecturerCoursesList: React.FC<LecturerCoursesListProps> = ({
	courses = [],
	isLoading = false,
	activeSemester,
}) => {
	return (
		<Card className="p-5 space-y-4 border border-border/80 bg-surface/90 shadow-sm">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
						<BookOpen size={16} />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<Text variant="h6" weight="bold" className="text-text-main text-sm sm:text-base">
								Assigned Courses This Semester
							</Text>
							<Badge variant="outline" className="text-[11px] font-semibold">
								{courses.length} {courses.length === 1 ? "Course" : "Courses"}
							</Badge>
						</div>
						<Text variant="caption" color="muted">
							Course offerings assigned to this lecturer for teaching and timetable delivery.
						</Text>
					</div>
				</div>

				{activeSemester && (
					<div className="text-xs text-text-muted font-medium bg-surface-raised px-3 py-1.5 rounded-xl border border-border/60 self-start sm:self-auto">
						<span>Semester: </span>
						<span className="text-text-main font-semibold">
							{activeSemester.name === "first" ? "1st Semester" : "2nd Semester"} (
							{activeSemester.sessionLabel || "Current"})
						</span>
					</div>
				)}
			</div>

			{/* List / Cards */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-28 w-full rounded-2xl" />
					))}
				</div>
			) : courses.length === 0 ? (
				<div className="py-12 flex flex-col items-center justify-center text-center p-6 text-text-muted border border-dashed border-border/60 rounded-xl">
					<AlertCircle size={32} className="text-text-subtle mb-2 opacity-70" />
					<Text variant="body-sm" weight="semibold" className="text-text-main">
						No Courses Assigned For This Semester
					</Text>
					<Text variant="caption" color="muted" className="max-w-md pt-1">
						This lecturer is not assigned to any course offerings in the current semester schedule.
					</Text>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
					{courses.map((course) => {
						const programDisplay =
							course.targetProgramCode ||
							course.targetProgramName ||
							(course.programScope === "general" ? "General Scope (All Programs)" : "Department Program");

						return (
							<div
								key={course.id}
								className="p-4 rounded-2xl bg-surface-raised/60 hover:bg-surface-raised border border-border/80 transition-all duration-200 hover:shadow-sm space-y-3"
							>
								{/* Top Row: Code, Title, Level */}
								<div className="flex items-start justify-between gap-3">
									<div className="space-y-0.5">
										<div className="flex items-center gap-2">
											<span className="font-mono text-sm font-bold text-primary">
												{course.code}
											</span>
											<Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0">
												{course.level}L
											</Badge>
											{course.courseType && (
												<Badge
													variant={course.courseType === "practical" ? "info" : "secondary"}
													className="text-[10px] capitalize px-1.5 py-0"
												>
													{course.courseType}
												</Badge>
											)}
										</div>
										<Text variant="body-sm" weight="semibold" className="text-text-main line-clamp-1">
											{course.title}
										</Text>
									</div>

									{/* Weekly Occurrences */}
									<div className="text-right shrink-0">
										<Badge variant="outline" className="text-[10px] font-medium flex items-center gap-1">
											<Clock size={11} />
											<span>{course.requiredOccurrencesPerWeek ?? 1} hrs/wk</span>
										</Badge>
									</div>
								</div>

								{/* Bottom Row: Program details and student count */}
								<div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-text-muted">
									<div className="flex items-center gap-1.5 text-text-muted max-w-[70%]">
										<Layers size={13} className="text-blue-400 shrink-0" />
										<span className="truncate font-medium text-[11px]" title={programDisplay}>
											{programDisplay}
										</span>
									</div>

									<div className="flex items-center gap-1.5 text-text-main font-semibold text-[11px] shrink-0">
										<Users size={13} className="text-emerald-400" />
										<span>{course.registrationCount ?? 0} Students</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</Card>
	);
};

export default LecturerCoursesList;
