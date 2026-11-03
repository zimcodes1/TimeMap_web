import React, { useState, useMemo } from "react";
import {
	Search,
	X,
	Download,
	Calendar,
	Clock,
	Users,
	Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { OptimizedExamEvent } from "@/api/main/examOptimizerAPI";
import type { Program } from "@/types";
import { formatTime5 } from "@/utils/examTimeframeGrouping";

interface ExamAllEventsTableProps {
	events: OptimizedExamEvent[];
	programs?: Program[];
	onSelectEvent?: (event: OptimizedExamEvent) => void;
	runId?: string | number | null;
	className?: string;
}

export const ExamAllEventsTable: React.FC<ExamAllEventsTableProps> = ({
	events = [],
	programs = [],
	onSelectEvent,
	runId,
	className = "",
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedExamType, setSelectedExamType] = useState<string>("ALL");
	const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
	const [sortBy, setSortBy] = useState<"date" | "code" | "students">("date");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	// Max level resolution from programs
	const availableLevels = useMemo(() => {
		const levelSet = new Set<number>();
		for (const ev of events) {
			if (ev.course_level) levelSet.add(ev.course_level);
		}
		for (const prog of programs) {
			const maxLvl = prog.maxLevel || 400;
			for (let l = 100; l <= maxLvl; l += 100) {
				levelSet.add(l);
			}
		}
		return Array.from(levelSet).sort((a, b) => a - b);
	}, [events, programs]);

	// Filtered & Sorted events
	const filteredEvents = useMemo(() => {
		const result = events.filter((ev) => {
			if (selectedExamType !== "ALL" && ev.exam_type !== selectedExamType) {
				return false;
			}
			if (selectedLevel !== "ALL" && String(ev.course_level) !== selectedLevel) {
				return false;
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const codeMatch = ev.course_code.toLowerCase().includes(q);
				const titleMatch = ev.course_title.toLowerCase().includes(q);
				const progMatch = ev.program_name?.toLowerCase().includes(q);
				const venueMatch = ev.venues.some((v) => v.venue_name.toLowerCase().includes(q));
				if (!codeMatch && !titleMatch && !progMatch && !venueMatch) {
					return false;
				}
			}
			return true;
		});

		// Sorting
		return result.sort((a, b) => {
			let cmp = 0;
			if (sortBy === "date") {
				const dateTimeA = `${a.date}T${a.start_time}`;
				const dateTimeB = `${b.date}T${b.start_time}`;
				cmp = dateTimeA.localeCompare(dateTimeB);
			} else if (sortBy === "code") {
				cmp = a.course_code.localeCompare(b.course_code);
			} else if (sortBy === "students") {
				cmp = a.student_count - b.student_count;
			}
			return sortOrder === "asc" ? cmp : -cmp;
		});
	}, [events, selectedExamType, selectedLevel, searchQuery, sortBy, sortOrder]);

	// CSV Export Handler
	const handleExportCSV = () => {
		if (filteredEvents.length === 0) return;

		const headers = [
			"Course Code",
			"Course Title",
			"Level",
			"Program",
			"Department",
			"Exam Type",
			"Date",
			"Day",
			"Start Time",
			"End Time",
			"Duration (Mins)",
			"Candidates",
			"Venues & Turns",
			"Joined Courses",
		];

		const rows = filteredEvents.map((ev) => {
			const dateObj = new Date(`${ev.date}T12:00:00`);
			const dayName = dateObj.toLocaleDateString(undefined, { weekday: "long" });
			const venuesSummary = ev.venues
				.map((v) => `${v.venue_name} (${v.students} students, ${v.turns} turn${v.turns > 1 ? "s" : ""})`)
				.join(" | ");

			return [
				`"${ev.course_code}"`,
				`"${ev.course_title.replace(/"/g, '""')}"`,
				`"${ev.course_level}L"`,
				`"${ev.program_name || ""}"`,
				`"${ev.department_name || ""}"`,
				`"${ev.exam_type}"`,
				`"${ev.date}"`,
				`"${dayName}"`,
				`"${formatTime5(ev.start_time)}"`,
				`"${formatTime5(ev.end_time)}"`,
				`"${ev.duration_minutes}"`,
				`"${ev.student_count}"`,
				`"${venuesSummary.replace(/"/g, '""')}"`,
				`"${ev.joined_courses.join(", ")}"`,
			].join(",");
		});

		const csvContent = [headers.join(","), ...rows].join("\n");
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute(
			"download",
			`exam-schedule-run-${runId ? String(runId).slice(0, 8) : "ledger"}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Filters & Actions Bar */}
			<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-surface">
				<div className="flex flex-wrap items-center gap-2.5 flex-1">
					{/* Search Field */}
					<div className="relative min-w-[200px] sm:w-64">
						<Search
							size={14}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
						/>
						<input
							type="text"
							placeholder="Search courses, titles, venues..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full h-9 pl-9 pr-8 text-xs rounded-xl bg-surface-raised border border-border text-text-main placeholder:text-text-muted/60 focus:outline-none focus:border-primary transition-colors"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
							>
								<X size={13} />
							</button>
						)}
					</div>

					{/* Level Filter */}
					<div className="w-32">
						<Select
							value={selectedLevel}
							onChange={(e) => setSelectedLevel(e.target.value)}
							className="h-9 text-xs"
						>
							<option value="ALL">All Levels</option>
							{availableLevels.map((lvl) => (
								<option key={lvl} value={String(lvl)}>
									{lvl} Level
								</option>
							))}
						</Select>
					</div>

					{/* Exam Type Filter */}
					<div className="w-36">
						<Select
							value={selectedExamType}
							onChange={(e) => setSelectedExamType(e.target.value)}
							className="h-9 text-xs"
						>
							<option value="ALL">All Exam Types</option>
							<option value="written">Written</option>
							<option value="cbt">CBT Exam</option>
							<option value="lab_practical">Lab Practical</option>
						</Select>
					</div>

					{/* Sort Order Selector */}
					<div className="w-36">
						<Select
							value={`${sortBy}-${sortOrder}`}
							onChange={(e) => {
								const [field, order] = e.target.value.split("-") as [
									"date" | "code" | "students",
									"asc" | "desc",
								];
								setSortBy(field);
								setSortOrder(order);
							}}
							className="h-9 text-xs"
						>
							<option value="date-asc">Date: Earliest</option>
							<option value="date-desc">Date: Latest</option>
							<option value="code-asc">Code: A → Z</option>
							<option value="code-desc">Code: Z → A</option>
							<option value="students-desc">Students: Most</option>
							<option value="students-asc">Students: Least</option>
						</Select>
					</div>
				</div>

				{/* Right Side: CSV Export & Total Count */}
				<div className="flex items-center gap-2 justify-between md:justify-end">
					<span className="text-xs text-text-muted font-mono">
						{filteredEvents.length} of {events.length} courses
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={handleExportCSV}
						disabled={filteredEvents.length === 0}
						className="h-9 gap-1.5 text-xs font-medium cursor-pointer"
					>
						<Download size={13} />
						<span>Export CSV</span>
					</Button>
				</div>
			</div>

			{/* Scheduled Courses Table */}
			<div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-surface-raised/80 border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider">
							<tr>
								<th className="p-3 pl-4">Course</th>
								<th className="p-3">Program / Dept</th>
								<th className="p-3">Type</th>
								<th className="p-3">Date & Time</th>
								<th className="p-3">Duration</th>
								<th className="p-3">Candidates</th>
								<th className="p-3">Assigned Venues</th>
								<th className="p-3 text-right pr-4">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{filteredEvents.length > 0 ? (
								filteredEvents.map((ev) => {
									const dateObj = new Date(`${ev.date}T12:00:00`);
									const dayName = dateObj.toLocaleDateString(undefined, {
										weekday: "short",
										month: "short",
										day: "numeric",
									});
									const durationHours = (ev.duration_minutes / 60)
										.toFixed(1)
										.replace(/\.0$/, "");

									return (
										<tr
											key={`${ev.course_id}-${ev.date}-${ev.start_time}`}
											onClick={() => onSelectEvent?.(ev)}
											className="hover:bg-surface-raised/50 cursor-pointer transition-colors"
										>
											{/* Course info */}
											<td className="p-3 pl-4">
												<div className="flex items-center gap-1.5">
													<span className="font-mono font-bold text-primary">
														{ev.course_code}
													</span>
													<Badge
														variant="outline"
														className="text-[9px] px-1 py-0 font-semibold"
													>
														{ev.course_level}L
													</Badge>
													{ev.joined_courses.length > 0 && (
														<Badge
															variant="info"
															className="text-[9px] px-1 py-0"
															title={`Joined: ${ev.joined_courses.join(", ")}`}
														>
															Joined
														</Badge>
													)}
												</div>
												<div className="text-[11px] text-text-muted truncate max-w-xs mt-0.5">
													{ev.course_title}
												</div>
											</td>

											{/* Program / Department */}
											<td className="p-3 text-text-muted">
												<div className="truncate max-w-[160px] font-medium text-text-main">
													{ev.program_name || "—"}
												</div>
												<div className="text-[10px] text-text-muted truncate max-w-[160px]">
													{ev.department_name || "—"}
												</div>
											</td>

											{/* Exam Type Badge */}
											<td className="p-3">
												<Badge
													variant={
														ev.exam_type === "cbt"
															? "success"
															: ev.exam_type === "lab_practical"
																? "warning"
																: "outline"
													}
													className="text-[10px] uppercase font-semibold tracking-wide"
												>
													{ev.exam_type === "cbt"
														? "CBT"
														: ev.exam_type === "lab_practical"
															? "Practical"
															: "Written"}
												</Badge>
											</td>

											{/* Date & Time */}
											<td className="p-3">
												<div className="font-semibold text-text-main flex items-center gap-1">
													<Calendar size={11} className="text-text-muted" />
													<span>{dayName}</span>
												</div>
												<div className="text-[11px] font-mono text-text-muted flex items-center gap-1 mt-0.5">
													<Clock size={11} />
													<span>
														{formatTime5(ev.start_time)} – {formatTime5(ev.end_time)}
													</span>
												</div>
											</td>

											{/* Duration */}
											<td className="p-3 text-text-muted font-mono">
												{durationHours} hr{Number(durationHours) > 1 ? "s" : ""}
											</td>

											{/* Candidates */}
											<td className="p-3 font-mono font-medium text-text-main">
												<div className="flex items-center gap-1">
													<Users size={12} className="text-text-muted" />
													<span>{ev.student_count}</span>
												</div>
											</td>

											{/* Assigned Venues & Turns */}
											<td className="p-3">
												<div className="space-y-1 max-w-[220px]">
													{ev.venues.map((v) => (
														<div
															key={v.venue_id}
															className="flex items-center justify-between text-[11px] bg-surface-raised px-2 py-0.5 rounded"
														>
															<span className="truncate font-medium text-text-main">
																{v.venue_name}
															</span>
															<span className="text-[10px] font-mono text-text-muted shrink-0 ml-1.5">
																{v.students} sts · {v.turns}T
															</span>
														</div>
													))}
												</div>
											</td>

											{/* Action button */}
											<td className="p-3 text-right pr-4">
												<Button
													variant="ghost"
													size="sm"
													onClick={(e) => {
														e.stopPropagation();
														onSelectEvent?.(ev);
													}}
													className="h-7 w-7 p-0 rounded-lg text-text-muted hover:text-primary"
													title="View Exam Details"
												>
													<Eye size={14} />
												</Button>
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td colSpan={8} className="p-8 text-center text-xs text-text-muted">
										No exam events match your current filter and search criteria.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
