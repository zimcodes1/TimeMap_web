import {
	Calendar,
	ChevronDown,
	ChevronRight,
	Plus,
	Edit2,
	Trash2,
	CheckCircle,
	Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { AcademicSession, Semester } from "@/types";

interface SessionAccordionItemProps {
	session: AcademicSession;
	semesters: Semester[];
	isExpanded: boolean;
	onToggleExpand: () => void;
	canManage: boolean;
	onOpenCreateSemester: (sessionId: string) => void;
	onEditSession: (session: AcademicSession) => void;
	onSetCurrentSession: (id: string) => void;
	onDeleteSession: (id: string, label: string) => void;
	onEditSemester: (semester: Semester) => void;
	onActivateSemester: (id: string) => void;
	onDeleteSemester: (id: string, name: string) => void;
}

export function SessionAccordionItem({
	session,
	semesters,
	isExpanded,
	onToggleExpand,
	canManage,
	onOpenCreateSemester,
	onEditSession,
	onSetCurrentSession,
	onDeleteSession,
	onEditSemester,
	onActivateSemester,
	onDeleteSemester,
}: SessionAccordionItemProps) {
	return (
		<div className="border border-border rounded-2xl bg-surface overflow-hidden shadow-xs transition-all duration-200">
			{/* Accordion Header */}
			<div
				onClick={onToggleExpand}
				className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface-raised/40 select-none transition-colors"
			>
				<div className="flex items-start sm:items-center gap-3.5">
					<button
						type="button"
						aria-label={isExpanded ? "Collapse session" : "Expand session"}
						className="w-8 h-8 rounded-lg bg-surface-raised text-text-muted hover:text-text-main flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors cursor-pointer"
					>
						{isExpanded ? (
							<ChevronDown size={18} />
						) : (
							<ChevronRight size={18} />
						)}
					</button>

					<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
						<Calendar size={20} />
					</div>

					<div>
						<div className="flex flex-wrap items-center gap-2">
							<Text variant="body" weight="bold" className="text-text-main">
								{session.label} Academic Session
							</Text>

							{session.isCurrent ? (
								<Badge
									variant="primary"
									className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
								>
									Current Session
								</Badge>
							) : (
								<Badge variant="outline" className="text-xs text-text-muted">
									Inactive
								</Badge>
							)}

							<Badge variant="secondary" className="text-xs">
								{semesters.length}{" "}
								{semesters.length === 1 ? "Semester" : "Semesters"}
							</Badge>
						</div>

						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-text-muted">
							<span>
								Calendar:{" "}
								<strong className="text-text-main font-medium">
									{session.startDate}
								</strong>{" "}
								&rarr;{" "}
								<strong className="text-text-main font-medium">
									{session.endDate}
								</strong>
							</span>
							{session.schoolName && (
								<>
									<span>&bull;</span>
									<span>{session.schoolName}</span>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Header Actions */}
				<div
					onClick={(e) => e.stopPropagation()}
					className="flex flex-wrap items-center gap-1.5 self-end md:self-center shrink-0"
				>
					{!session.isCurrent && canManage && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => onSetCurrentSession(session.id)}
							className="h-8 px-2.5 text-xs text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/30 cursor-pointer"
						>
							<CheckCircle size={13} className="mr-1" /> Set Current
						</Button>
					)}

					{canManage && (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onOpenCreateSemester(session.id)}
								className="h-8 px-2.5 text-xs text-primary hover:bg-primary/10 border-primary/30 cursor-pointer"
							>
								<Plus size={13} className="mr-1" /> Add Semester
							</Button>

							<Button
								variant="outline"
								size="sm"
								onClick={() => onEditSession(session)}
								className="h-8 px-2.5 text-xs cursor-pointer"
								title="Edit academic session"
							>
								<Edit2 size={13} className="mr-1" /> Edit
							</Button>

							<Button
								variant="outline"
								size="sm"
								onClick={() => onDeleteSession(session.id, session.label)}
								className="h-8 px-2 text-xs text-danger hover:bg-danger-surface border-danger-surface cursor-pointer"
								title="Delete academic session"
							>
								<Trash2 size={13} />
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Accordion Expanded Content */}
			{isExpanded && (
				<div className="border-t border-border/70 bg-surface-raised/20 p-4 sm:p-5">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Text variant="caption" weight="bold" color="muted">
									SEMESTERS IN THIS SESSION
								</Text>
								<span className="text-xs text-text-subtle">
									({semesters.length})
								</span>
							</div>

							{canManage && semesters.length > 0 && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => onOpenCreateSemester(session.id)}
									className="h-7 px-2 text-xs text-primary hover:bg-primary/10 border-primary/30 cursor-pointer"
								>
									<Plus size={12} className="mr-1" /> Add Semester
								</Button>
							)}
						</div>

						{semesters.length === 0 ? (
							<div className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-dashed border-border rounded-xl space-y-2">
								<div className="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center text-text-subtle">
									<Calendar size={18} />
								</div>
								<Text
									variant="body-sm"
									weight="medium"
									className="text-text-main"
								>
									No semesters configured for this session
								</Text>
								<Text
									variant="caption"
									color="muted"
									className="text-center max-w-md"
								>
									Add teaching and exam semesters to this session to enable
									course scheduling and lecture timetable tracking.
								</Text>
								{canManage && (
									<Button
										variant="primary"
										size="sm"
										onClick={() => onOpenCreateSemester(session.id)}
										className="mt-2 h-8 text-xs cursor-pointer"
									>
										<Plus size={13} className="mr-1" /> Add First Semester
									</Button>
								)}
							</div>
						) : (
							<div className="overflow-x-auto border border-border/80 rounded-xl bg-surface">
								<table className="w-full text-left border-collapse text-xs">
									<thead>
										<tr className="border-b border-border bg-surface-raised/60 text-text-muted font-semibold">
											<th className="py-2.5 px-3">Semester</th>
											<th className="py-2.5 px-3">Calendar Dates</th>
											<th className="py-2.5 px-3">Lecture Period</th>
											<th className="py-2.5 px-3">Exam Period</th>
											{canManage && (
												<th className="py-2.5 px-3 text-right">Actions</th>
											)}
										</tr>
									</thead>
									<tbody className="divide-y divide-border/50">
										{semesters.map((sem) => (
											<tr
												key={sem.id}
												className="hover:bg-surface-raised/40 transition-colors"
											>
												<td className="py-3 px-3">
													<div className="flex items-center gap-2">
														<span className="font-semibold text-text-main">
															{sem.displayName ||
																(sem.name === "first"
																	? "First Semester"
																	: "Second Semester")}
														</span>
														{sem.isActive && (
															<Badge
																variant="primary"
																className="text-[10px] py-0 px-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
															>
																Active
															</Badge>
														)}
													</div>
												</td>

												<td className="py-3 px-3 text-text-main">
													<div>
														{sem.startDate} &rarr; {sem.endDate}
													</div>
													{sem.durationValue ? (
														<div className="text-[11px] text-text-muted">
															{sem.durationValue} {sem.durationType}
														</div>
													) : null}
												</td>

												<td className="py-3 px-3">
													{sem.lectureStartDate && sem.lectureEndDate ? (
														<span className="text-text-main font-medium">
															{sem.lectureStartDate} &rarr; {sem.lectureEndDate}
														</span>
													) : (
														<span className="text-text-muted italic">
															Not set
														</span>
													)}
												</td>

												<td className="py-3 px-3">
													{sem.examStartDate && sem.examEndDate ? (
														<span className="text-primary font-medium">
															{sem.examStartDate} &rarr; {sem.examEndDate}
														</span>
													) : (
														<span className="text-text-muted italic">
															Not set
														</span>
													)}
												</td>

												{canManage && (
													<td className="py-3 px-3 text-right">
														<div className="flex items-center justify-end gap-1.5">
															{!sem.isActive && (
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => onActivateSemester(sem.id)}
																	className="h-7 px-2 text-xs text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/30 cursor-pointer"
																	title="Activate semester"
																>
																	<CheckCircle size={12} className="mr-1" />{" "}
																	Activate
																</Button>
															)}
															<Button
																variant="outline"
																size="sm"
																onClick={() => onEditSemester(sem)}
																className="h-7 px-2 text-xs cursor-pointer"
																title="Edit semester"
															>
																<Edit2 size={12} className="mr-1" /> Edit
															</Button>
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	onDeleteSemester(
																		sem.id,
																		sem.displayName || sem.name,
																	)
																}
																className="h-7 px-2 text-xs text-danger hover:bg-danger-surface border-danger-surface cursor-pointer"
																title="Delete semester"
															>
																<Trash2 size={12} />
															</Button>
														</div>
													</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
