import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabSwitcher } from "@/components/ui/tabs";
import {
	Clock,
	MapPin,
	User,
	Edit,
	Layers,
	CheckCircle2,
	XCircle,
	HelpCircle,
} from "lucide-react";
import type { LectureSession } from "@/types";
import type { WeekDayInfo } from "@/utils/semesterWeeks";

interface TimetableListViewProps {
	sessions: LectureSession[];
	weekDayDates: WeekDayInfo[];
	todayStr: string;
	onShiftSessionTrigger?: (session: LectureSession) => void;
	isExam?: boolean;
}

export const TimetableListView: React.FC<TimetableListViewProps> = ({
	sessions,
	weekDayDates,
	todayStr,
	onShiftSessionTrigger,
	isExam = false,
}) => {
	const [listSubTab, setListSubTab] = useState<"upcoming" | "past">("upcoming");

	// Partition sessions for this week based on date relative to today
	const upcomingSessions = sessions.filter((s) => s.date >= todayStr);
	const pastSessions = sessions.filter((s) => s.date < todayStr);

	const activeDisplaySessions =
		listSubTab === "upcoming" ? upcomingSessions : pastSessions;

	return (
		<div className="space-y-4">
			{/* Subtab switcher */}
			<div className="flex items-center justify-between">
				<TabSwitcher<"upcoming" | "past">
					size="sm"
					tabs={[
						{
							id: "upcoming",
							label: isExam ? "Upcoming Exam Sessions" : "This Week's Lectures",
							count: upcomingSessions.length,
						},
						{
							id: "past",
							label: isExam ? "Completed Exams" : "Past Lectures",
							count: pastSessions.length,
						},
					]}
					activeTab={listSubTab}
					onChange={(tab) => setListSubTab(tab)}
				/>
			</div>

			{/* Days List */}
			<div className="space-y-4">
				{weekDayDates.map((dayInfo) => {
					const daySessions = activeDisplaySessions.filter(
						(s) => s.date === dayInfo.dateStr,
					);

					return (
						<Card
							key={dayInfo.dateStr}
							className="p-4 border border-border/80 bg-surface rounded-2xl shadow-xs space-y-3"
						>
							{/* Day Header */}
							<div className="flex items-center justify-between pb-2 border-b border-border/60">
								<div className="flex items-center gap-2">
									<span className="font-extrabold text-sm text-text-main">
										{dayInfo.dayWithDate}
									</span>
									{dayInfo.dateStr === todayStr && (
										<Badge
											variant="primary"
											className="text-[10px] font-bold py-0.5 px-2"
										>
											Today
										</Badge>
									)}
								</div>
								<span className="text-xs font-medium text-text-muted">
									{daySessions.length}{" "}
									{daySessions.length === 1 ? "session" : "sessions"}
								</span>
							</div>

							{/* Sessions inside day */}
							{daySessions.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
									{daySessions.map((session) => (
										<div
											key={session.id}
											className="p-3 bg-surface-raised border border-border rounded-xl space-y-2 hover:border-primary/40 transition-colors shadow-2xs"
										>
											<div className="flex items-start justify-between gap-2">
												<div>
													<div className="font-extrabold text-sm text-primary">
														{session.courseCode}
													</div>
													<div
														className="text-xs font-medium text-text-main line-clamp-1"
														title={session.courseTitle}
													>
														{session.courseTitle}
													</div>
												</div>

												<Badge
													variant={
														session.status === "scheduled"
															? "success"
															: session.status === "shifted"
																? "warning"
																: "default"
													}
													className="text-[10px] capitalize shrink-0"
												>
													{session.status}
												</Badge>
											</div>

											<div className="space-y-1 text-xs text-text-muted pt-1">
												<div className="flex items-center gap-1.5 font-mono">
													<Clock size={13} className="text-primary shrink-0" />
													<span>
														{session.startTime} - {session.endTime}
													</span>
												</div>

												<div className="flex items-center gap-1.5">
													<MapPin
														size={13}
														className="text-text-subtle shrink-0"
													/>
													<span className="truncate font-semibold text-text-main">
														{session.venueName}
													</span>
												</div>

												{session.lecturerName && (
													<div className="flex items-center gap-1.5">
														<User
															size={13}
															className="text-text-subtle shrink-0"
														/>
														<span className="truncate">
															{session.lecturerName}
														</span>
													</div>
												)}
											</div>

											{/* Footer & Actions */}
											<div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
												<div className="flex items-center gap-1">
													{session.courseLevel && (
														<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted">
															{session.courseLevel}L
														</span>
													)}

													{listSubTab === "past" && session.reportStatus && (
														<span className="inline-flex items-center gap-1 text-[11px] font-semibold">
															{session.reportStatus === "held" ? (
																<span className="text-emerald-500 flex items-center gap-0.5">
																	<CheckCircle2 size={12} /> Held
																</span>
															) : session.reportStatus === "not_held" ? (
																<span className="text-red-400 flex items-center gap-0.5">
																	<XCircle size={12} /> Not Held
																</span>
															) : (
																<span className="text-amber-400 flex items-center gap-0.5">
																	<HelpCircle size={12} /> Unreported
																</span>
															)}
														</span>
													)}
												</div>

												{session.canShift && onShiftSessionTrigger && (
													<Button
														variant="outline"
														size="sm"
														onClick={() => onShiftSessionTrigger(session)}
														className="h-7 px-2 text-[11px] font-semibold cursor-pointer gap-1"
													>
														<Edit size={11} /> Shift
													</Button>
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="py-4 text-center text-text-subtle text-xs flex items-center justify-center gap-1.5">
									<Layers size={14} className="opacity-40" />
									<span>
										No scheduled {isExam ? "exams" : "lectures"} on this day.
									</span>
								</div>
							)}
						</Card>
					);
				})}
			</div>
		</div>
	);
};
