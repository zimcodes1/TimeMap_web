import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Users, BookOpen, Clock } from "lucide-react";
import type { GeneratedAssignment } from "@/types";

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

interface RunTimetableAcademicGridProps {
	assignments: GeneratedAssignment[];
	selectedDepartmentId?: string | number;
	selectedProgramId?: string | number;
	selectedLevel?: number;
	searchQuery?: string;
}

export function RunTimetableAcademicGrid({
	assignments,
	selectedDepartmentId,
	selectedProgramId,
	selectedLevel = 100,
	searchQuery = "",
}: RunTimetableAcademicGridProps) {
	// Filter assignments strictly for the active department, program, level, and query
	const filteredAssignments = useMemo(() => {
		return assignments.filter((a) => {
			// 1. Department filter
			if (selectedDepartmentId) {
				const aDept = String(a.department_id || "");
				if (aDept && aDept !== String(selectedDepartmentId)) {
					return false;
				}
			}

			// 2. Program filter (if specified)
			if (selectedProgramId && selectedProgramId !== "ALL") {
				const hasProg = a.program_ids?.some(
					(pid) => String(pid) === String(selectedProgramId),
				);
				if (a.program_ids && a.program_ids.length > 0 && !hasProg) {
					return false;
				}
			}

			// 3. Level filter
			if (selectedLevel) {
				// Match against assignment level, or derive from course code (e.g. COS101 -> 100)
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

			// 4. Search query
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

	// Group filtered assignments by (dayCode, periodIndex)
	const slotMap = useMemo(() => {
		const map: Record<string, GeneratedAssignment[]> = {};
		for (const a of filteredAssignments) {
			const dayKey = (a.day || "").toUpperCase();
			const periodKey = Number(a.period_index || 1);
			const key = `${dayKey}_${periodKey}`;
			if (!map[key]) {
				map[key] = [];
			}
			map[key].push(a);
		}
		return map;
	}, [filteredAssignments]);

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
														return (
															<div
																key={`${a.occurrence_id || a.course_code}-${idx}`}
																className="p-2 rounded-xl text-xs space-y-1 border bg-primary/10 border-primary/20 hover:border-primary/40 text-text-main shadow-2xs transition-all"
															>
																{/* Code & Badges */}
																<div className="flex items-center justify-between gap-1">
																	<span className="font-extrabold text-primary tracking-tight">
																		{a.course_code}
																	</span>
																	<div className="flex items-center gap-1">
																		{isPractical && (
																			<Badge
																				variant="secondary"
																				className="text-[9px] py-0 px-1 bg-amber-500/20 text-amber-300 border-amber-500/30"
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
		</div>
	);
}
