import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Clock,
	MapPin,
	User,
	Edit,
	CheckCircle2,
	AlertCircle,
	XCircle,
	Ban,
	ShieldAlert,
} from "lucide-react";
import type { LectureSession } from "@/types";
import type { WeekDayInfo } from "@/utils/semesterWeeks";
import { LiveEntryDetailModal } from "./LiveEntryDetailModal";

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
	const [activeModalSession, setActiveModalSession] =
		useState<LectureSession | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const now = new Date();
	const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
		now.getMinutes(),
	).padStart(2, "0")}:00`;

	const handleCardClick = (session: LectureSession) => {
		setActiveModalSession(session);
		setIsModalOpen(true);
	};

	return (
		<div className="space-y-4">
			{/* All days of the active week in one unified container */}
			<div className="space-y-4">
				{weekDayDates.map((dayInfo) => {
					const daySessions = sessions
						.filter((s) => s.date === dayInfo.dateStr)
						.sort((a, b) =>
							(a.startTime || "").localeCompare(b.startTime || ""),
						);

					const isToday = dayInfo.dateStr === todayStr;
					const isPastDay = dayInfo.dateStr < todayStr;

					return (
						<Card
							key={dayInfo.dateStr}
							className={`p-4 border rounded-2xl shadow-xs space-y-3 transition-colors ${
								isToday
									? "border-primary/50 bg-surface ring-1 ring-primary/20"
									: isPastDay
										? "border-border/60 bg-surface/70"
										: "border-border/80 bg-surface"
							}`}
						>
							{/* Day Header */}
							<div className="flex items-center justify-between pb-2 border-b border-border/60">
								<div className="flex items-center gap-2">
									<span
										className={`font-extrabold text-sm ${
											isToday ? "text-primary" : "text-text-main"
										}`}
									>
										{dayInfo.dayWithDate}
									</span>
									{isToday && (
										<Badge
											variant="primary"
											className="text-[10px] font-bold py-0.5 px-2 shadow-2xs"
										>
											Today
										</Badge>
									)}
									{isPastDay && (
										<Badge
											variant="outline"
											className="text-[10px] font-semibold py-0.2 px-1.5 text-text-subtle border-border/60"
										>
											Past
										</Badge>
									)}
								</div>
								<span className="text-xs font-medium text-text-muted">
									{daySessions.length}{" "}
									{daySessions.length === 1
										? isExam
											? "exam"
											: "lecture"
										: isExam
											? "exams"
											: "lectures"}
								</span>
							</div>

							{/* Sessions inside day */}
							{daySessions.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
									{daySessions.map((session) => {
										const isPastSession =
											session.date < todayStr ||
											(session.date === todayStr &&
												Boolean(
													session.endTime && session.endTime < currentTimeStr,
												));
										const hasConflict = session.hasConflict;
										const isPractical =
											(session.courseType || "").toLowerCase() === "practical";

										const isHeld =
											session.reportStatus === "held" ||
											session.status === "held";
										const isNotHeld =
											session.reportStatus === "not_held" ||
											session.status === "not_held";
										const isCancelled = session.status === "cancelled";

										return (
											<div
												key={session.id}
												onClick={() => handleCardClick(session)}
												className={`p-3 rounded-xl space-y-2 border transition-all shadow-2xs cursor-pointer ${
													hasConflict
														? "bg-red-500/10 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/15 text-text-main"
														: isPastSession
															? "bg-surface-raised/40 border-border/60 hover:border-border hover:bg-surface-raised/60 opacity-85 text-text-muted"
															: "bg-surface-raised border-border hover:border-primary/50 hover:bg-surface-raised/80 text-text-main"
												}`}
												title={
													isPastSession
														? "Past lecture session (cannot be shifted). Click to view details."
														: "Click to view lecture details or reschedule."
												}
											>
												<div className="flex items-start justify-between gap-2">
													<div>
														<div className="flex items-center gap-1.5">
															<span
																className={`font-extrabold text-sm ${
																	hasConflict
																		? "text-red-400"
																		: isPastSession
																			? "text-text-muted"
																			: "text-primary"
																}`}
															>
																{session.courseCode}
															</span>
															{isPractical && (
																<Badge
																	variant="secondary"
																	className="text-[9px] py-0 px-1 bg-amber-500/10 text-amber-300 border-amber-500/30"
																>
																	Lab
																</Badge>
															)}
															{hasConflict && (
																<ShieldAlert
																	size={13}
																	className="text-red-400 shrink-0"
																/>
															)}
														</div>
														<div
															className="text-xs font-medium text-text-main line-clamp-1"
															title={session.courseTitle}
														>
															{session.courseTitle}
														</div>
													</div>

													<div className="flex flex-col items-end gap-1 shrink-0">
														{isPastSession ? (
															<>
																<Badge
																	variant="outline"
																	className="text-[9px] py-0 px-1 text-text-subtle border-border/80"
																>
																	Past Lecture
																</Badge>
															</>
														) : (
															<>
																{isToday && (
																	<Badge
																		variant="primary"
																		className="text-[9px] py-0 px-1 font-bold"
																	>
																		Today
																	</Badge>
																)}
																<Badge
																	variant={
																		session.status === "shifted"
																			? "warning"
																			: session.status === "cancelled"
																				? "danger"
																				: "outline"
																	}
																	className="text-[9px] capitalize py-0 px-1.5"
																>
																	{session.status}
																</Badge>
															</>
														)}
													</div>
												</div>

												{/* Time and Venue */}
												<div className="grid grid-cols-2 gap-2 text-xs text-text-muted pt-1 border-t border-border/40">
													<div className="flex items-center gap-1.5 truncate">
														<Clock
															size={12}
															className="shrink-0 text-text-subtle"
														/>
														<span className="font-mono text-[11px]">
															{session.startTime?.slice(0, 5)} -{" "}
															{session.endTime?.slice(0, 5)}
														</span>
													</div>
													<div className="flex items-center gap-1.5 truncate">
														<MapPin
															size={12}
															className="shrink-0 text-text-subtle"
														/>
														<span
															className="truncate text-[11px]"
															title={session.venueName}
														>
															{session.venueName}
														</span>
													</div>
												</div>

												{/* Lecturer and Action / Attendance Readout */}
												<div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 min-h-[28px]">
													<div className="flex items-center gap-1.5 text-text-muted truncate max-w-[170px]">
														<User
															size={12}
															className="shrink-0 text-text-subtle"
														/>
														<span
															className="truncate text-[11px]"
															title={session.lecturerName}
														>
															{session.lecturerName || "Assigned Lecturer"}
														</span>
													</div>

													{/* For past sessions: show report/attendance outcome, NEVER show shift button */}
													{isPastSession ? (
														<div className="flex items-center gap-1">
															{isHeld ? (
																<span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
																	<CheckCircle2
																		size={12}
																		className="shrink-0 text-emerald-400"
																	/>
																	<span>Held</span>
																</span>
															) : isNotHeld ? (
																<span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
																	<XCircle
																		size={12}
																		className="shrink-0 text-rose-400"
																	/>
																	<span>Not Held</span>
																</span>
															) : isCancelled ? (
																<span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
																	<Ban
																		size={12}
																		className="shrink-0 text-rose-400"
																	/>
																	<span>Cancelled</span>
																</span>
															) : (
																<span
																	className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20"
																	title="No attendance report submitted by class rep"
																>
																	<AlertCircle
																		size={12}
																		className="shrink-0 text-amber-400"
																	/>
																	<span>Unreported</span>
																</span>
															)}
														</div>
													) : (
														/* For upcoming/active sessions: show Shift button if authorized */
														session.canShift &&
														onShiftSessionTrigger && (
															<Button
																variant="ghost"
																size="sm"
																onClick={(e) => {
																	e.stopPropagation();
																	onShiftSessionTrigger(session);
																}}
																className="h-6 px-1.5 text-[10px] text-primary hover:bg-primary/10 gap-1 cursor-pointer"
																title="Shift / Reschedule instance"
															>
																<Edit size={11} />
																<span>Shift</span>
															</Button>
														)
													)}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="py-6 text-center text-text-muted text-xs border border-dashed border-border/60 rounded-xl">
									No lectures scheduled for this day
								</div>
							)}
						</Card>
					);
				})}
			</div>

			{/* Interactive Session Detail & Shift Modal */}
			<LiveEntryDetailModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setActiveModalSession(null);
				}}
				session={activeModalSession}
				isPast={
					activeModalSession
						? activeModalSession.date < todayStr ||
							(activeModalSession.date === todayStr &&
								Boolean(
									activeModalSession.endTime &&
									activeModalSession.endTime < currentTimeStr,
								))
						: false
				}
				canShift={activeModalSession?.canShift !== false}
				onShiftClick={
					activeModalSession && onShiftSessionTrigger
						? () => onShiftSessionTrigger(activeModalSession)
						: undefined
				}
			/>
		</div>
	);
};
