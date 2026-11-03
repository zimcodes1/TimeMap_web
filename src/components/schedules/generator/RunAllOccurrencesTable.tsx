import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Search, X, ShieldCheck } from "lucide-react";
import type {
	GeneratedAssignment,
	GenerationConflictReport,
	Department,
	Faculty,
	Program,
} from "@/types";
import { ScheduleConflictDetailModal } from "./ScheduleConflictDetailModal";
import { resolveAssignmentConflicts } from "./conflictResolver";

interface RunAllOccurrencesTableProps {
	assignments: GeneratedAssignment[];
	allDepartments: Department[];
	allFaculties: Faculty[];
	allPrograms: Program[];
	conflictReport?: GenerationConflictReport;
	isDeptAdmin?: boolean;
	isFacultyAdmin?: boolean;
	isSchoolAdmin?: boolean;
	isSuperuser?: boolean;
	scopeLabel?: { title: string; subtitle?: string; level: string };
}

export function RunAllOccurrencesTable({
	assignments,
	allDepartments,
	allFaculties,
	allPrograms,
	conflictReport,
	isDeptAdmin = false,
	isSchoolAdmin = false,
	isSuperuser = false,
	scopeLabel,
}: RunAllOccurrencesTableProps) {
	// Filter states
	const [facultyFilter, setFacultyFilter] = useState<string>("ALL");
	const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
	const [programFilter, setProgramFilter] = useState<string>("ALL");
	const [levelFilter, setLevelFilter] = useState<string>("ALL");
	const [dayFilter, setDayFilter] = useState<string>("ALL");
	const [conflictFilter, setConflictFilter] = useState<
		"ALL" | "CONFLICTED" | "CLEAN"
	>("ALL");
	const [searchQuery, setSearchQuery] = useState<string>("");

	// Selected assignment for conflict inspection modal
	const [selectedAssignment, setSelectedAssignment] =
		useState<GeneratedAssignment | null>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	// Available department options present in scoped assignments
	const availableDepartments = useMemo(() => {
		const deptIds = new Set<string>();
		for (const a of assignments) {
			if (a.department_id) deptIds.add(String(a.department_id));
		}

		return allDepartments
			.filter((d) => deptIds.has(String(d.id)))
			.filter((d) => {
				if (facultyFilter === "ALL") return true;
				return String(d.facultyId) === String(facultyFilter);
			});
	}, [assignments, allDepartments, facultyFilter]);

	// Available faculties present in scoped assignments
	const availableFaculties = useMemo(() => {
		const deptIds = new Set<string>();
		for (const a of assignments) {
			if (a.department_id) deptIds.add(String(a.department_id));
		}

		const facIds = new Set<string>();
		for (const d of allDepartments) {
			if (deptIds.has(String(d.id)) && d.facultyId) {
				facIds.add(String(d.facultyId));
			}
		}

		return allFaculties.filter((f) => facIds.has(String(f.id)));
	}, [assignments, allDepartments, allFaculties]);

	// Available programs present in scoped assignments
	const availablePrograms = useMemo(() => {
		if (departmentFilter !== "ALL") {
			return allPrograms.filter(
				(p) => String(p.departmentId) === String(departmentFilter),
			);
		}
		const deptIds = new Set(availableDepartments.map((d) => String(d.id)));
		return allPrograms.filter((p) => deptIds.has(String(p.departmentId)));
	}, [allPrograms, departmentFilter, availableDepartments]);

	// Conflict lookup set for rapid matching
	const { hardConflictedCourses, softConflictedCourses } = useMemo(() => {
		const hard = new Set<string>();
		const soft = new Set<string>();
		const cr = conflictReport || {};
		const d = cr.details || {};

		const addOccOrCourse = (
			set: Set<string>,
			occ?: string | number,
			code?: string,
		) => {
			if (occ) set.add(String(occ));
			if (code) set.add(String(code));
		};

		// Student
		for (const c of (d.student_conflicts ||
			cr.student_conflicts ||
			[]) as any[]) {
			addOccOrCourse(hard, c.occurrence_a, c.course_a);
			addOccOrCourse(hard, c.occurrence_b, c.course_b);
		}
		// Lecturer
		for (const c of (d.lecturer_conflicts ||
			cr.lecturer_conflicts ||
			[]) as any[]) {
			addOccOrCourse(hard, c.occurrence_a, c.course_a);
			addOccOrCourse(hard, c.occurrence_b, c.course_b);
		}
		// Venue
		for (const c of (d.venue_conflicts || cr.venue_conflicts || []) as any[]) {
			addOccOrCourse(hard, c.occurrence_a, c.course_a);
			addOccOrCourse(hard, c.occurrence_b, c.course_b);
		}
		// Daily
		for (const c of (d.daily_limit_violations ||
			cr.daily_limit_violations ||
			[]) as any[]) {
			if (c.courses) {
				c.courses.forEach((code: string) => hard.add(code));
			}
		}
		// Repeat
		for (const c of (d.occurrence_day_violations ||
			cr.occurrence_day_violations ||
			[]) as any[]) {
			if (c.course) hard.add(c.course);
			if (c.course_code) hard.add(c.course_code);
			if (c.occurrences) {
				c.occurrences.forEach((occ: string) => hard.add(String(occ)));
			}
		}
		// Capacity (soft)
		for (const c of (d.capacity_overflows ||
			d.capacity_violations ||
			cr.capacity_violations ||
			cr.capacity_overflows ||
			[]) as any[]) {
			if (c.course) soft.add(c.course);
			if (c.course_code) soft.add(c.course_code);
			if (c.occurrence) soft.add(String(c.occurrence));
		}

		return { hardConflictedCourses: hard, softConflictedCourses: soft };
	}, [conflictReport]);

	const checkHasConflict = (a: GeneratedAssignment) => {
		const isHard =
			hardConflictedCourses.has(a.occurrence_id) ||
			hardConflictedCourses.has(a.course_code);
		const isSoft =
			softConflictedCourses.has(a.occurrence_id) ||
			softConflictedCourses.has(a.course_code);
		return { isHard, isSoft };
	};

	// Filtered assignments
	const filteredOccurrences = useMemo(() => {
		return assignments.filter((a) => {
			// Faculty filter
			if (facultyFilter !== "ALL") {
				const matchDept = allDepartments.find(
					(d) => String(d.id) === String(a.department_id),
				);
				if (
					!matchDept ||
					String(matchDept.facultyId) !== String(facultyFilter)
				) {
					return false;
				}
			}

			// Department filter
			if (departmentFilter !== "ALL") {
				if (String(a.department_id) !== String(departmentFilter)) {
					return false;
				}
			}

			// Program filter
			if (programFilter !== "ALL") {
				if (a.program_ids && a.program_ids.length > 0) {
					const hasProg = a.program_ids.some(
						(pid) => String(pid) === String(programFilter),
					);
					if (!hasProg) return false;
				}
			}

			// Level filter
			if (levelFilter !== "ALL") {
				let aLevel = a.level;
				if (!aLevel) {
					const match = a.course_code.match(/\d{3}/);
					if (match) aLevel = parseInt(match[0][0], 10) * 100;
				}
				if (String(aLevel) !== String(levelFilter)) {
					return false;
				}
			}

			// Day filter
			if (dayFilter !== "ALL") {
				if ((a.day || "").toUpperCase() !== dayFilter.toUpperCase()) {
					return false;
				}
			}

			// Conflict status filter
			if (conflictFilter !== "ALL") {
				const { isHard, isSoft } = checkHasConflict(a);
				if (conflictFilter === "CONFLICTED" && !isHard && !isSoft) {
					return false;
				}
				if (conflictFilter === "CLEAN" && (isHard || isSoft)) {
					return false;
				}
			}

			// Text search
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchCode = a.course_code.toLowerCase().includes(q);
				const matchTitle = a.course_title.toLowerCase().includes(q);
				const matchVenue = a.venue_name.toLowerCase().includes(q);
				const matchLec = a.lecturers?.some((l) => l.toLowerCase().includes(q));
				if (!matchCode && !matchTitle && !matchVenue && !matchLec) {
					return false;
				}
			}

			return true;
		});
	}, [
		assignments,
		facultyFilter,
		departmentFilter,
		programFilter,
		levelFilter,
		dayFilter,
		conflictFilter,
		searchQuery,
		allDepartments,
		hardConflictedCourses,
		softConflictedCourses,
	]);

	// Selected conflicts for inspection modal
	const selectedConflicts = useMemo(() => {
		if (!selectedAssignment) return [];
		return resolveAssignmentConflicts(selectedAssignment, conflictReport);
	}, [selectedAssignment, conflictReport]);

	// Open conflict modal for row
	const handleRowClick = (a: GeneratedAssignment) => {
		setSelectedAssignment(a);
		setIsModalOpen(true);
	};

	// Clear all filters
	const handleResetFilters = () => {
		setFacultyFilter("ALL");
		setDepartmentFilter("ALL");
		setProgramFilter("ALL");
		setLevelFilter("ALL");
		setDayFilter("ALL");
		setConflictFilter("ALL");
		setSearchQuery("");
	};

	const hasActiveFilters =
		facultyFilter !== "ALL" ||
		departmentFilter !== "ALL" ||
		programFilter !== "ALL" ||
		levelFilter !== "ALL" ||
		dayFilter !== "ALL" ||
		conflictFilter !== "ALL" ||
		searchQuery !== "";

	return (
		<div className="border border-border rounded-2xl bg-surface overflow-hidden shadow-xs space-y-4 p-4">
			{/* Header with Title and Scope Indicator */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
				<div>
					<h3 className="text-sm font-bold text-text-main flex items-center gap-2">
						<FileText size={16} className="text-primary" />
						<span>Scheduled Occurrences Explorer</span>
					</h3>
					<div className="flex flex-wrap items-center gap-2 mt-1">
						<p className="text-xs text-text-muted">
							Showing {filteredOccurrences.length} of {assignments.length}{" "}
							occurrences within your administrative scope.
						</p>
						{scopeLabel && (
							<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-raised border border-border text-[10px] text-text-muted font-medium">
								<ShieldCheck size={10} className="text-primary" />
								<span>
									{scopeLabel.title} ({scopeLabel.level})
								</span>
							</span>
						)}
					</div>
				</div>

				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleResetFilters}
						className="h-8 px-2.5 text-xs text-text-muted hover:text-text-main gap-1 cursor-pointer"
					>
						<X size={12} />
						<span>Reset Filters</span>
					</Button>
				)}
			</div>

			{/* Sub-Filters Toolbar */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
				{/* 1. Faculty Filter (Only for School & University Admin) */}
				{(isSchoolAdmin || isSuperuser) && availableFaculties.length > 1 && (
					<div>
						<label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
							Faculty
						</label>
						<Select
							value={facultyFilter}
							onChange={(e) => {
								setFacultyFilter(e.target.value);
								setDepartmentFilter("ALL");
								setProgramFilter("ALL");
							}}
							options={[
								{ value: "ALL", label: "All Faculties" },
								...availableFaculties.map((f) => ({
									value: String(f.id),
									label: f.name,
								})),
							]}
						/>
					</div>
				)}

				{/* 2. Department Filter (Only if multiple departments available) */}
				{!isDeptAdmin && availableDepartments.length > 1 && (
					<div>
						<label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
							Department
						</label>
						<Select
							value={departmentFilter}
							onChange={(e) => {
								setDepartmentFilter(e.target.value);
								setProgramFilter("ALL");
							}}
							options={[
								{ value: "ALL", label: "All Departments" },
								...availableDepartments.map((d) => ({
									value: String(d.id),
									label: d.name,
								})),
							]}
						/>
					</div>
				)}

				{/* 3. Program Filter */}
				{availablePrograms.length > 1 && (
					<div>
						<label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
							Program
						</label>
						<Select
							value={programFilter}
							onChange={(e) => setProgramFilter(e.target.value)}
							options={[
								{ value: "ALL", label: "All Programs" },
								...availablePrograms.map((p) => ({
									value: String(p.id),
									label: p.name,
								})),
							]}
						/>
					</div>
				)}

				{/* 4. Level Filter */}
				<div>
					<label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
						Level
					</label>
					<Select
						value={levelFilter}
						onChange={(e) => setLevelFilter(e.target.value)}
						options={[
							{ value: "ALL", label: "All Levels" },
							{ value: "100", label: "100 Level" },
							{ value: "200", label: "200 Level" },
							{ value: "300", label: "300 Level" },
							{ value: "400", label: "400 Level" },
							{ value: "500", label: "500 Level" },
						]}
					/>
				</div>

				{/* 5. Day Filter */}
				<div>
					<label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
						Day
					</label>
					<Select
						value={dayFilter}
						onChange={(e) => setDayFilter(e.target.value)}
						options={[
							{ value: "ALL", label: "All Days" },
							{ value: "MO", label: "Monday" },
							{ value: "TU", label: "Tuesday" },
							{ value: "WE", label: "Wednesday" },
							{ value: "TH", label: "Thursday" },
							{ value: "FR", label: "Friday" },
						]}
					/>
				</div>

				{/* 6. Conflict Status Filter */}
				<div>
					<label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
						Status
					</label>
					<Select
						value={conflictFilter}
						onChange={(e) =>
							setConflictFilter(
								e.target.value as "ALL" | "CONFLICTED" | "CLEAN",
							)
						}
						options={[
							{ value: "ALL", label: "All Occurrences" },
							{ value: "CONFLICTED", label: "Conflicts Only" },
							{ value: "CLEAN", label: "Clean Only" },
						]}
					/>
				</div>
			</div>

			{/* Search Bar */}
			<div className="relative flex items-center">
				<Search
					size={14}
					className="absolute left-3 text-text-muted pointer-events-none"
				/>
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search course code, title, venue, or lecturer..."
					className="w-full h-9 pl-8 pr-7 text-xs bg-surface-raised border border-border rounded-xl text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary transition-colors"
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => setSearchQuery("")}
						className="absolute right-2 p-1 text-text-muted hover:text-text-main cursor-pointer"
					>
						<X size={12} />
					</button>
				)}
			</div>

			{/* Occurrences Table */}
			<div className="overflow-x-auto max-h-[550px] overflow-y-auto rounded-xl border border-border">
				<table className="w-full text-xs text-left border-collapse">
					<thead className="sticky top-0 bg-surface-raised border-b border-border z-10 text-text-muted font-bold uppercase tracking-wider">
						<tr>
							<th className="p-3">Course</th>
							<th className="p-3">Department</th>
							<th className="p-3">Level</th>
							<th className="p-3">Day & Time</th>
							<th className="p-3">Venue</th>
							<th className="p-3">Lecturers</th>
							<th className="p-3">Students</th>
							<th className="p-3 text-center">Status</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{filteredOccurrences.length > 0 ? (
							filteredOccurrences.map((a, idx) => {
								const { isHard, isSoft } = checkHasConflict(a);
								const isPractical =
									(a.course_type || "").toLowerCase() === "practical";

								return (
									<tr
										key={`${a.occurrence_id || a.course_code}-${idx}`}
										onClick={() => handleRowClick(a)}
										className={`transition-colors cursor-pointer ${
											isHard
												? "bg-red-500/5 hover:bg-red-500/10"
												: isSoft
													? "bg-amber-500/5 hover:bg-amber-500/10"
													: "hover:bg-surface-raised/40"
										}`}
										title="Click to view full schedule diagnostics"
									>
										<td className="p-3">
											<div className="flex items-center gap-1.5">
												<span
													className={`font-extrabold ${
														isHard ? "text-red-400" : "text-primary"
													}`}
												>
													{a.course_code}
												</span>
												{isPractical && (
													<Badge
														variant="secondary"
														className="text-[9px] py-0 px-1 bg-amber-500/20 text-amber-300 border-amber-500/30"
													>
														Lab
													</Badge>
												)}
												<Badge
													variant="outline"
													className="text-[9px] py-0 px-1 font-mono"
												>
													#{a.occurrence_index || 1}
												</Badge>
											</div>
											<div className="text-[11px] text-text-muted truncate max-w-xs mt-0.5">
												{a.course_title}
											</div>
										</td>
										<td className="p-3 text-text-muted">
											{a.department_name || `Dept #${a.department_id || "—"}`}
										</td>
										<td className="p-3 font-semibold text-text-main">
											{a.level ? `${a.level}L` : "—"}
										</td>
										<td className="p-3">
											<div className="font-semibold text-text-main">
												{a.day_name || a.day}
											</div>
											<div className="text-[11px] font-mono text-text-muted">
												{a.start_time?.slice(0, 5)} - {a.end_time?.slice(0, 5)}
											</div>
										</td>
										<td className="p-3 font-medium text-text-main">
											{a.venue_name}
										</td>
										<td className="p-3 text-text-muted">
											{a.lecturers && a.lecturers.length > 0
												? a.lecturers.join(", ")
												: "—"}
										</td>
										<td className="p-3 font-mono text-text-main">
											{a.expected_students || 0}
										</td>
										<td className="p-3 text-center">
											{isHard ? (
												<Badge
													variant="danger"
													className="text-[9px] justify-center flex-ro items py-0.5 px-1.5 bg-red-500/10 text-red-500 border-red-500/40 flex items-center gap-1"
												>
													<span>Conflict</span>
												</Badge>
											) : isSoft ? (
												<Badge
													variant="warning"
													className="text-[9px] py-0.5 px-1.5 bg-amber-500/20 text-amber-300 border-amber-500/30 inline-flex items-center gap-1"
												>
													<span>Capacity</span>
												</Badge>
											) : (
												<Badge
													variant="success"
													className="text-[9px] py-0.5 px-1.5 inline-flex items-center gap-1"
												>
													<span>Clean</span>
												</Badge>
											)}
										</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td
									colSpan={8}
									className="p-8 text-center text-xs text-text-muted space-y-1"
								>
									<FileText
										size={20}
										className="mx-auto text-text-subtle mb-1"
									/>
									<p className="font-semibold text-text-main">
										No scheduled occurrences matched your filters
									</p>
									<p className="text-[11px]">
										Try resetting filters or adjusting search keywords.
									</p>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Modal for inspect on row click */}
			<ScheduleConflictDetailModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedAssignment(null);
				}}
				assignment={selectedAssignment}
				conflicts={selectedConflicts}
			/>
		</div>
	);
}
