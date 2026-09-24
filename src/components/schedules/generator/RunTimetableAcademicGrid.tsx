import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Users, BookOpen, Clock } from "lucide-react";
import type { GeneratedAssignment, GenerationConflictReport } from "@/types";
import {
	ScheduleConflictDetailModal,
	type AssociatedConflict,
} from "./ScheduleConflictDetailModal";
import { resolveAssignmentConflicts } from "./conflictResolver";

export interface TimeSlot {
	id: string;
	periodIndex: number;
	label: string;
	start: string;
	end: string;
}

export const GENERATOR_TIME_SLOTS: TimeSlot[] = [
	{
		id: "slot-1",
		periodIndex: 1,
		label: "08:00 - 10:00",
		start: "08:00:00",
		end: "10:00:00",
	},
	{
		id: "slot-2",
		periodIndex: 2,
		label: "10:00 - 12:00",
		start: "10:00:00",
		end: "12:00:00",
	},
	{
		id: "slot-3",
		periodIndex: 3,
		label: "12:00 - 14:00",
		start: "12:00:00",
		end: "14:00:00",
	},
	{
		id: "slot-4",
		periodIndex: 4,
		label: "14:00 - 16:00",
		start: "14:00:00",
		end: "16:00:00",
	},
	{
		id: "slot-5",
		periodIndex: 5,
		label: "16:00 - 18:00",
		start: "16:00:00",
		end: "18:00:00",
	},
];

const DAYS = [
	{ code: "MO", name: "Monday" },
	{ code: "TU", name: "Tuesday" },
	{ code: "WE", name: "Wednesday" },
	{ code: "TH", name: "Thursday" },
	{ code: "FR", name: "Friday" },
];

/**
 * Normalizes period indexing to 1-based (1..5) so 08:00-10:00 maps to Period 1,
 * avoiding the 0 || 1 collision bug when backend uses 0-based indexing.
 */
function getSlotPeriodIndex(a: GeneratedAssignment): number {
	if (a.start_time) {
		const time = a.start_time.slice(0, 5);
		if (time === "08:00") return 1;
		if (time === "10:00") return 2;
		if (time === "12:00") return 3;
		if (time === "14:00") return 4;
		if (time === "16:00") return 5;
	}
	if (typeof a.period_index === "number") {
		if (a.period_index >= 0 && a.period_index <= 4) {
			return a.period_index + 1;
		}
		return a.period_index;
	}
	return 1;
}

interface RunTimetableAcademicGridProps {
	assignments: GeneratedAssignment[];
	conflictReport?: GenerationConflictReport;
	selectedDepartmentId?: string | number;
	selectedProgramId?: string | number;
	selectedLevel?: number;
	searchQuery?: string;
}

export function RunTimetableAcademicGrid({
	assignments,
	conflictReport,
	selectedDepartmentId,
	selectedProgramId,
	selectedLevel = 100,
	searchQuery = "",
}: RunTimetableAcademicGridProps) {
	// Selected assignment for conflict inspection modal
	const [selectedAssignment, setSelectedAssignment] =
		useState<GeneratedAssignment | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// 1. Strict cohort filtering: Filter assignments for the active department, program, and level
	const filteredAssignments = useMemo(() => {
		return assignments.filter((a) => {
			// Level filter
			if (selectedLevel) {
				let aLevel = a.level;
				if (!aLevel) {
					const match = a.course_code.match(/\d{3}/);
					if (match) {
						aLevel = parseInt(match[0][0], 10) * 100;
					}
				}
				if (aLevel && aLevel !== selectedLevel) {
					return false;
				}
			}

			// Program filter: check if this assignment's student groups include selectedProgramId
			if (selectedProgramId && selectedProgramId !== "ALL") {
				if (a.program_ids && a.program_ids.length > 0) {
					const hasProg = a.program_ids.some(
						(pid) => String(pid) === String(selectedProgramId),
					);
					if (!hasProg) return false;
				} else if (
					selectedDepartmentId &&
					a.department_id &&
					String(a.department_id) !== String(selectedDepartmentId)
				) {
					// Fallback to department matching if program_ids not present
					return false;
				}
			} else if (selectedDepartmentId) {
				// No specific program selected; filter by department
				const aDept = String(a.department_id || "");
				if (aDept && aDept !== String(selectedDepartmentId)) {
					return false;
				}
			}

			// Search query filter
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchCode = a.course_code.toLowerCase().includes(q);
				const matchTitle = a.course_title.toLowerCase().includes(q);
				const matchVenue = a.venue_name.toLowerCase().includes(q);
				if (!matchCode && !matchTitle && !matchVenue) {
					return false;
				}
			}

			return true;
		});
	}, [
		assignments,
		selectedDepartmentId,
		selectedProgramId,
		selectedLevel,
		searchQuery,
	]);

	// 2. Group filtered assignments by (dayCode, periodIndex)
	const slotMap = useMemo(() => {
		const map: Record<string, GeneratedAssignment[]> = {};
		for (const a of filteredAssignments) {
			const dayKey = (a.day || "").toUpperCase();
			const periodIndex = getSlotPeriodIndex(a);
			const key = `${dayKey}_${periodIndex}`;
			if (!map[key]) {
				map[key] = [];
			}
			map[key].push(a);
		}
		return map;
	}, [filteredAssignments]);

	// 3. Resolve all conflicts associated with a given assignment
	const getConflictsForAssignment = (
		a: GeneratedAssignment,
		cellAssignments: GeneratedAssignment[],
	): AssociatedConflict[] => {
		return resolveAssignmentConflicts(a, conflictReport, cellAssignments);
	};

	// Active conflicts for the modal
	const activeModalConflicts = useMemo(() => {
		if (!selectedAssignment) return [];
		const dayKey = (selectedAssignment.day || "").toUpperCase();
		const periodIdx = getSlotPeriodIndex(selectedAssignment);
		const cellList = slotMap[`${dayKey}_${periodIdx}`] || [];
		return getConflictsForAssignment(selectedAssignment, cellList);
	}, [selectedAssignment, slotMap, conflictReport]);

	const handleCardClick = (a: GeneratedAssignment) => {
		setSelectedAssignment(a);
		setIsModalOpen(true);
	};

	return (
		<div className="space-y-3">
			{/* Matrix Table */}
			<div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs scrollbar-thin">
				<table className="w-full border-collapse text-left min-w-[960px]">
					<thead>
						<tr className="border-b border-border bg-surface-raised/70">
							<th className="p-3.5 text-xs font-bold uppercase tracking-wider text-text-muted w-40 border-r border-border">
								Day
							</th>
							{GENERATOR_TIME_SLOTS.map((slot) => (
								<th
									key={slot.id}
									className="p-3.5 text-xs font-bold text-center text-text-main border-r border-border last:border-r-0 min-w-[170px]"
								>
									<div className="font-extrabold text-xs">{slot.label}</div>
									<div className="text-[10px] text-text-muted font-normal">
										Period {slot.periodIndex}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{DAYS.map((day) => (
							<tr
								key={day.code}
								className="border-b border-border last:border-b-0 hover:bg-surface-raised/30 transition-colors"
							>
								{/* Day Column */}
								<td className="p-3.5 font-bold text-xs text-text-main border-r border-border bg-surface-raised/40 align-top">
									<div className="text-text-main font-bold whitespace-nowrap">
										{day.name}
									</div>
									<div className="text-[10px] text-text-muted font-mono uppercase mt-0.5">
										{day.code}
									</div>
								</td>

								{/* Time Slots */}
								{GENERATOR_TIME_SLOTS.map((slot) => {
									const isFridayJummat =
										day.code === "FR" && slot.periodIndex === 3;
									const key = `${day.code}_${slot.periodIndex}`;
									const cellAssignments = slotMap[key] || [];

									if (isFridayJummat) {
										return (
											<td
												key={slot.id}
												className="p-2 border-r border-border last:border-r-0 align-top bg-surface-raised/20 h-32"
											>
												<div className="h-full rounded-xl border border-dashed border-border/60 bg-surface-raised/30 flex flex-col items-center justify-center p-2 text-center">
													<Clock size={14} className="text-text-muted mb-1" />
													<span className="text-[11px] font-semibold text-text-muted">
														Jummat Prayer Break
													</span>
													<span className="text-[10px] text-text-subtle">
														12:00 - 14:00
													</span>
												</div>
											</td>
										);
									}

									return (
										<td
											key={slot.id}
											className="p-2 border-r border-border last:border-r-0 align-top h-32"
										>
											{cellAssignments.length > 0 ? (
												<div className="space-y-1.5 h-full">
													{cellAssignments.map((a, idx) => {
														const isPractical =
															(a.course_type || "").toLowerCase() ===
															"practical";
														const conflicts = getConflictsForAssignment(
															a,
															cellAssignments,
														);
														const hasHardConflict = conflicts.some(
															(c) => c.severity === "hard",
														);
														const hasSoftConflict = conflicts.some(
															(c) => c.severity === "soft",
														);

														return (
															<div
																key={`${a.occurrence_id || a.course_code}-${idx}`}
																onClick={() => handleCardClick(a)}
																className={`p-2 rounded-xl text-xs space-y-1 border shadow-2xs transition-all cursor-pointer ${
																	hasHardConflict
																		? "bg-red-500/5 border-red-500/10 hover:border-red-500/20 hover:bg-red-500/15 ring-1 ring-red-500/30 text-text-main"
																		: hasSoftConflict
																			? "bg-amber-500/30 border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/15 text-text-main"
																			: "bg-primary/10 border-primary/20 hover:border-primary/40 hover:bg-primary/15 text-text-main"
																}`}
																title={
																	hasHardConflict
																		? "Click to view conflict diagnostics"
																		: "Click to view lecture details"
																}
															>
																{/* Code & Badges */}
																<div className="flex items-center justify-between gap-1">
																	<span
																		className={`font-extrabold tracking-tight ${
																			hasHardConflict
																				? "text-red-400"
																				: "text-primary"
																		}`}
																	>
																		{a.course_code}
																	</span>

																	<div className="flex items-center gap-1">
																		{isPractical && (
																			<Badge
																				variant="secondary"
																				className="text-[9px] py-0 px-1 bg-black text-white border-amber-500/30"
																			>
																				Lab
																			</Badge>
																		)}

																		<Badge
																			variant="primary"
																			className="text-[9px] py-0 px-1 font-mono"
																		>
																			#{a.occurrence_index || 1}
																		</Badge>
																	</div>
																</div>

																{/* Title */}
																<div
																	className="text-[11px] font-medium text-text-main truncate"
																	title={a.course_title}
																>
																	{a.course_title}
																</div>

																{/* Venue */}
																<div className="flex items-center gap-1 text-[10px] text-text-muted truncate">
																	<Building2
																		size={10}
																		className="shrink-0 text-text-subtle"
																	/>
																	<span className="truncate font-medium">
																		{a.venue_name}
																	</span>
																</div>

																{/* Lecturers */}
																{a.lecturers && a.lecturers.length > 0 && (
																	<div className="flex items-center gap-1 text-[10px] text-text-muted truncate">
																		<User
																			size={10}
																			className="shrink-0 text-text-subtle"
																		/>
																		<span className="truncate">
																			{a.lecturers.join(", ")}
																		</span>
																	</div>
																)}

																{/* Headcount */}
																{a.expected_students > 0 && (
																	<div className="flex items-center gap-1 text-[9px] text-text-subtle pt-0.5 border-t border-border/40">
																		<Users size={9} className="shrink-0" />
																		<span>{a.expected_students} students</span>
																	</div>
																)}
															</div>
														);
													})}
												</div>
											) : (
												<div className="h-full rounded-xl border border-dashed border-border/30 flex items-center justify-center p-2 text-center text-text-subtle opacity-40">
													<span className="text-[10px]">—</span>
												</div>
											)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Empty Results State */}
			{filteredAssignments.length === 0 && (
				<div className="p-8 text-center rounded-2xl border border-dashed border-border bg-surface-raised/20 space-y-2">
					<BookOpen size={24} className="mx-auto text-text-muted opacity-50" />
					<div className="text-xs font-semibold text-text-main">
						No scheduled lectures found for this selection
					</div>
					<div className="text-[11px] text-text-muted max-w-sm mx-auto">
						No course assignments in this run matched Level {selectedLevel}L
						under the active program filter. Try selecting another level or
						degree program.
					</div>
				</div>
			)}

			{/* Conflict Diagnostics & Schedule Detail Modal */}
			<ScheduleConflictDetailModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedAssignment(null);
				}}
				assignment={selectedAssignment}
				conflicts={activeModalConflicts}
			/>
		</div>
	);
}
