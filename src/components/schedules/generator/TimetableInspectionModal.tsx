import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Calendar,
	Building2,
	Users,
	Search,
	Filter,
	LayoutGrid,
	List as ListIcon,
	CheckCircle2,
	AlertTriangle,
	Layers,
	BookOpen,
} from "lucide-react";
import type { GeneratedAssignment, TimetableGenerationRun } from "@/types";

interface TimetableInspectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	run: TimetableGenerationRun | null;
}

const DAYS = [
	{ code: "MO", name: "Monday" },
	{ code: "TU", name: "Tuesday" },
	{ code: "WE", name: "Wednesday" },
	{ code: "TH", name: "Thursday" },
	{ code: "FR", name: "Friday" },
];

const PERIODS = [
	{ index: 0, start: "08:00", end: "10:00", label: "08:00 - 10:00" },
	{ index: 1, start: "10:00", end: "12:00", label: "10:00 - 12:00" },
	{ index: 2, start: "12:00", end: "14:00", label: "12:00 - 14:00" },
	{ index: 3, start: "14:00", end: "16:00", label: "14:00 - 16:00" },
	{ index: 4, start: "16:00", end: "18:00", label: "16:00 - 18:00" },
];

export function TimetableInspectionModal({
	isOpen,
	onClose,
	run,
}: TimetableInspectionModalProps) {
	const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDay, setSelectedDay] = useState<string>("ALL");
	const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

	const rawAssignments = useMemo(
		() => (run?.assignmentsPayload || []) as GeneratedAssignment[],
		[run?.assignmentsPayload],
	);

	// Filter assignments
	const filteredAssignments = useMemo(() => {
		return rawAssignments.filter((a) => {
			if (selectedDay !== "ALL" && a.day !== selectedDay) {
				return false;
			}
			// Extract level from course code (e.g. COS101 -> 100)
			if (selectedLevel !== "ALL") {
				const match = a.course_code.match(/\d{3}/);
				if (match) {
					const lvl = match[0][0] + "00";
					if (lvl !== selectedLevel) return false;
				}
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchCode = a.course_code.toLowerCase().includes(q);
				const matchTitle = a.course_title.toLowerCase().includes(q);
				const matchVenue = a.venue_name.toLowerCase().includes(q);
				if (!matchCode && !matchTitle && !matchVenue) return false;
			}
			return true;
		});
	}, [rawAssignments, selectedDay, selectedLevel, searchQuery]);

	// Stats
	const totalOccurrences = rawAssignments.length;
	const uniqueCourses = new Set(rawAssignments.map((a) => a.course_code)).size;
	const uniqueVenues = new Set(rawAssignments.map((a) => a.venue_name)).size;

	// Grid mapping: (day, period_index) -> list of assignments
	const gridMap = useMemo(() => {
		const map: Record<string, GeneratedAssignment[]> = {};
		for (const a of filteredAssignments) {
			const key = `${a.day}-${a.period_index}`;
			if (!map[key]) map[key] = [];
			map[key].push(a);
		}
		return map;
	}, [filteredAssignments]);

	if (!run) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
							<Calendar size={18} />
						</div>
						<div>
							<h3 className="font-bold text-base text-text-main">
								Timetable Inspection:{" "}
								{run.scopeName || run.scopeType.toUpperCase()}
							</h3>
							<p className="text-xs text-text-muted">
								Semester: {run.semesterName || run.semesterId} | Run ID: #
								{run.id.slice(0, 8)}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{run.resultStatus === "optimal" ||
						run.resultStatus === "feasible" ? (
							<Badge variant="success" icon={<CheckCircle2 size={13} />}>
								{run.hardConflictsCount === 0
									? "100% Conflict-Free"
									: "Feasible"}
							</Badge>
						) : (
							<Badge variant="warning" icon={<AlertTriangle size={13} />}>
								{run.hardConflictsCount} Conflicts
							</Badge>
						)}

						<div className="flex items-center border border-border rounded-lg p-0.5 bg-surface-raised">
							<button
								type="button"
								onClick={() => setViewMode("grid")}
								className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
									viewMode === "grid"
										? "bg-primary text-primary-foreground shadow-xs"
										: "text-text-muted hover:text-text-main"
								}`}
							>
								<LayoutGrid size={13} />
								<span>Grid</span>
							</button>
							<button
								type="button"
								onClick={() => setViewMode("table")}
								className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
									viewMode === "table"
										? "bg-primary text-primary-foreground shadow-xs"
										: "text-text-muted hover:text-text-main"
								}`}
							>
								<ListIcon size={13} />
								<span>Table</span>
							</button>
						</div>
					</div>
				</div>
			}
			size="xl"
		>
			<div className="space-y-4 pt-1 max-h-[80vh] flex flex-col">
				{/* Top Summary & Filter Bar */}
				<div className="p-3 rounded-xl bg-surface-raised border border-border space-y-3">
					<div className="flex flex-wrap items-center justify-between gap-3 text-xs">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1.5 text-text-muted">
								<Layers size={14} className="text-primary" />
								<span>
									Occurrences:{" "}
									<strong className="text-text-main">{totalOccurrences}</strong>
								</span>
							</div>
							<div className="flex items-center gap-1.5 text-text-muted">
								<BookOpen size={14} className="text-primary" />
								<span>
									Courses:{" "}
									<strong className="text-text-main">{uniqueCourses}</strong>
								</span>
							</div>
							<div className="flex items-center gap-1.5 text-text-muted">
								<Building2 size={14} className="text-primary" />
								<span>
									Venues:{" "}
									<strong className="text-text-main">{uniqueVenues}</strong>
								</span>
							</div>
						</div>

						<div className="text-[11px] text-text-muted">
							Showing{" "}
							<strong className="text-text-main">
								{filteredAssignments.length}
							</strong>{" "}
							of {totalOccurrences} scheduled slots
						</div>
					</div>

					{/* Filters Row */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border">
						<div className="relative">
							<Search
								size={14}
								className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle"
							/>
							<input
								type="text"
								placeholder="Search course code, title, room..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-surface text-xs text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary"
							/>
						</div>

						<div className="flex items-center gap-1.5">
							<span className="text-[11px] text-text-muted shrink-0">
								Level:
							</span>
							<select
								value={selectedLevel}
								onChange={(e) => setSelectedLevel(e.target.value)}
								className="w-full h-8 px-2.5 rounded-lg border border-border bg-surface text-xs text-text-main focus:outline-none focus:border-primary"
							>
								<option value="ALL">All Levels</option>
								<option value="100">100 Level</option>
								<option value="200">200 Level</option>
								<option value="300">300 Level</option>
								<option value="400">400 Level</option>
							</select>
						</div>

						<div className="flex items-center gap-1.5">
							<span className="text-[11px] text-text-muted shrink-0">Day:</span>
							<select
								value={selectedDay}
								onChange={(e) => setSelectedDay(e.target.value)}
								className="w-full h-8 px-2.5 rounded-lg border border-border bg-surface text-xs text-text-main focus:outline-none focus:border-primary"
							>
								<option value="ALL">All Days (Mon - Fri)</option>
								{DAYS.map((d) => (
									<option key={d.code} value={d.code}>
										{d.name}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Schedule Display Area */}
				<div className="overflow-y-auto flex-1 pr-1">
					{filteredAssignments.length === 0 ? (
						<div className="p-8 text-center border border-dashed border-border rounded-xl bg-surface-raised/50 space-y-2">
							<Filter size={24} className="mx-auto text-text-subtle" />
							<p className="text-xs font-semibold text-text-main">
								No assignments match your filter
							</p>
							<p className="text-[11px] text-text-muted">
								Try clearing your search query or selecting "All Levels" / "All
								Days".
							</p>
						</div>
					) : viewMode === "grid" ? (
						/* Weekly Interactive Grid */
						<div className="space-y-4">
							{DAYS.filter(
								(d) => selectedDay === "ALL" || selectedDay === d.code,
							).map((d) => {
								return (
									<div
										key={d.code}
										className="border border-border rounded-xl overflow-hidden bg-surface"
									>
										<div className="bg-surface-raised px-4 py-2 border-b border-border flex items-center justify-between">
											<span className="font-bold text-xs text-text-main uppercase tracking-wider flex items-center gap-2">
												<Calendar size={13} className="text-primary" />
												{d.name}
											</span>
											<span className="text-[11px] text-text-muted font-medium">
												{
													filteredAssignments.filter((a) => a.day === d.code)
														.length
												}{" "}
												scheduled
											</span>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border">
											{PERIODS.map((period) => {
												// Friday Jummat break slot
												const isFridayJummat =
													d.code === "FR" && period.index === 2;
												const slotAssignments = isFridayJummat
													? []
													: gridMap[`${d.code}-${period.index}`] || [];

												return (
													<div
														key={period.index}
														className="p-2.5 space-y-2 min-h-[140px] bg-surface/60"
													>
														<div className="flex items-center justify-between text-[10px] text-text-muted pb-1 border-b border-border/60">
															<span className="font-semibold">
																{period.label}
															</span>
															<span>P{period.index + 1}</span>
														</div>

														{isFridayJummat ? (
															<div className="h-full flex items-center justify-center p-3 text-center rounded-lg bg-surface-raised/40 border border-dashed border-border/60 text-[10px] text-text-subtle font-medium">
																Jummat Break (12:00 - 14:00)
															</div>
														) : slotAssignments.length === 0 ? (
															<div className="h-full flex items-center justify-center text-[10px] text-text-subtle/60 italic">
																Free Slot
															</div>
														) : (
															<div className="space-y-2">
																{slotAssignments.map((a) => (
																	<div
																		key={a.occurrence_id}
																		className="p-2 rounded-lg bg-surface-raised border border-border hover:border-primary/50 transition-colors shadow-2xs space-y-1.5"
																	>
																		<div className="flex items-start justify-between gap-1">
																			<span className="font-bold text-xs text-primary">
																				{a.course_code}
																			</span>
																			<span
																				className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
																					a.course_type === "practical"
																						? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
																						: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
																				}`}
																			>
																				{a.course_type === "practical"
																					? "Lab"
																					: "Lec"}
																			</span>
																		</div>

																		<p
																			className="text-[10px] text-text-main font-medium truncate"
																			title={a.course_title}
																		>
																			{a.course_title}
																		</p>

																		<div className="space-y-0.5 text-[9px] text-text-muted pt-0.5 border-t border-border/40">
																			<div
																				className="flex items-center gap-1 truncate"
																				title={a.venue_name}
																			>
																				<Building2
																					size={10}
																					className="text-text-subtle shrink-0"
																				/>
																				<span className="truncate">
																					{a.venue_name}
																				</span>
																			</div>
																			<div className="flex items-center gap-1">
																				<Users
																					size={10}
																					className="text-text-subtle shrink-0"
																				/>
																				<span>
																					{a.expected_students} students
																				</span>
																			</div>
																		</div>
																	</div>
																))}
															</div>
														)}
													</div>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					) : (
						/* Table / List View */
						<div className="border border-border rounded-xl overflow-hidden bg-surface">
							<table className="w-full text-left text-xs border-collapse">
								<thead>
									<tr className="bg-surface-raised border-b border-border text-text-muted text-[11px] font-semibold">
										<th className="py-2.5 px-3">Day</th>
										<th className="py-2.5 px-3">Time Slot</th>
										<th className="py-2.5 px-3">Course</th>
										<th className="py-2.5 px-3">Type</th>
										<th className="py-2.5 px-3">Venue</th>
										<th className="py-2.5 px-3 text-right">Headcount</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{filteredAssignments.map((a) => (
										<tr
											key={a.occurrence_id}
											className="hover:bg-surface-raised/40 transition-colors"
										>
											<td className="py-2 px-3 font-semibold text-text-main">
												{a.day_name || a.day}
											</td>
											<td className="py-2 px-3 text-text-muted font-mono text-[11px]">
												{a.start_time} - {a.end_time}
											</td>
											<td className="py-2 px-3">
												<div className="font-bold text-text-main">
													{a.course_code}
												</div>
												<div className="text-[10px] text-text-muted truncate max-w-[200px]">
													{a.course_title}
												</div>
											</td>
											<td className="py-2 px-3">
												<span
													className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
														a.course_type === "practical"
															? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
															: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
													}`}
												>
													{a.course_type === "practical"
														? "Lab Practical"
														: "Lecture"}
												</span>
											</td>
											<td className="py-2 px-3 text-text-muted">
												{a.venue_name}
											</td>
											<td className="py-2 px-3 text-right font-medium text-text-main">
												{a.expected_students}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Footer Actions */}
				<div className="flex justify-end pt-3 border-t border-border">
					<Button
						variant="outline"
						type="button"
						onClick={onClose}
						className="cursor-pointer text-xs h-9 px-4"
					>
						Close Inspection
					</Button>
				</div>
			</div>
		</Modal>
	);
}
