import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import {
	TableToolbar,
	type ToolbarFilter,
} from "@/components/ui/table-toolbar";
import {
	FileText,
	Cpu,
	FlaskConical,
	Clock,
	Users,
	SlidersHorizontal,
	Lock,
	Share2,
	CheckCircle2,
	Layers,
} from "lucide-react";
import type { Course } from "@/types";

interface CourseExamSettingsTableProps {
	courses: Course[];
	isLoading?: boolean;
	onEditExamSettings: (course: Course) => void;
	isExamOfficer?: boolean;
}

export function CourseExamSettingsTable({
	courses,
	isLoading = false,
	onEditExamSettings,
	isExamOfficer = false,
}: CourseExamSettingsTableProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [levelFilter, setLevelFilter] = useState("");
	const [examTypeFilter, setExamTypeFilter] = useState("");
	const [originFilter, setOriginFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	// Quick Metrics
	const stats = useMemo(() => {
		let written = 0;
		let cbt = 0;
		let practical = 0;
		let granted = 0;

		courses.forEach((c) => {
			if (c.isGrantedToScope) granted++;
			if (c.examType === "cbt") cbt++;
			else if (c.examType === "lab_practical") practical++;
			else written++;
		});

		return {
			total: courses.length,
			written,
			cbt,
			practical,
			granted,
		};
	}, [courses]);

	// Filtered Courses
	const filteredCourses = useMemo(() => {
		return courses.filter((c) => {
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				!q ||
				c.code.toLowerCase().includes(q) ||
				c.title.toLowerCase().includes(q) ||
				(c.departmentName && c.departmentName.toLowerCase().includes(q)) ||
				(c.facultyName && c.facultyName.toLowerCase().includes(q));

			const matchesLevel = !levelFilter || c.level === Number(levelFilter);
			const matchesType =
				!examTypeFilter || (c.examType || "written") === examTypeFilter;

			const matchesOrigin =
				!originFilter ||
				(originFilter === "granted" && c.isGrantedToScope) ||
				(originFilter === "native" && !c.isGrantedToScope);

			return matchesSearch && matchesLevel && matchesType && matchesOrigin;
		});
	}, [courses, searchQuery, levelFilter, examTypeFilter, originFilter]);

	// Toolbar Filters
	const toolbarFilters = useMemo<ToolbarFilter[]>(() => {
		return [
			{
				id: "level",
				label: "Level",
				value: levelFilter,
				onChange: (val) => {
					setLevelFilter(val);
					setCurrentPage(1);
				},
				options: [
					{ label: "100 Level", value: "100" },
					{ label: "200 Level", value: "200" },
					{ label: "300 Level", value: "300" },
					{ label: "400 Level", value: "400" },
					{ label: "500 Level", value: "500" },
				],
			},
			{
				id: "examType",
				label: "Exam Mode",
				value: examTypeFilter,
				onChange: (val) => {
					setExamTypeFilter(val);
					setCurrentPage(1);
				},
				options: [
					{ label: "Written (Hall)", value: "written" },
					{ label: "CBT", value: "cbt" },
					{ label: "Lab Practical", value: "lab_practical" },
				],
			},
			{
				id: "origin",
				label: "Scope Origin",
				value: originFilter,
				onChange: (val) => {
					setOriginFilter(val);
					setCurrentPage(1);
				},
				options: [
					{ label: "Scope Owned (Native)", value: "native" },
					{ label: "Granted Access (External)", value: "granted" },
				],
			},
		];
	}, [levelFilter, examTypeFilter, originFilter]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-16 rounded-xl" />
					))}
				</div>
				<Skeleton className="h-12 rounded-xl" />
				<Skeleton className="h-64 rounded-xl" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Exam Officer Scope Notice */}
			{isExamOfficer && (
				<div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
					<SlidersHorizontal size={14} className="shrink-0" />
					<span>
						Exam Officer Scope: You can modify exam mode and duration windows
						for native courses in your scope. Courses granted access from other
						scopes are read-only.
					</span>
				</div>
			)}

			{/* Metric Stat Cards */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<Card className="p-3.5 bg-surface border-border flex items-center justify-between">
					<div>
						<Text variant="caption" color="muted" weight="medium">
							Total Courses
						</Text>
						<Text variant="h4" weight="bold" className="text-text-main mt-0.5">
							{stats.total}
						</Text>
					</div>
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<Layers size={18} />
					</div>
				</Card>

				<Card className="p-3.5 bg-surface border-border flex items-center justify-between">
					<div>
						<Text variant="caption" color="muted" weight="medium">
							Written Exams
						</Text>
						<Text variant="h4" weight="bold" className="text-text-main mt-0.5">
							{stats.written}
						</Text>
					</div>
					<div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
						<FileText size={18} />
					</div>
				</Card>

				<Card className="p-3.5 bg-surface border-border flex items-center justify-between">
					<div>
						<Text variant="caption" color="muted" weight="medium">
							CBT Exams
						</Text>
						<Text variant="h4" weight="bold" className="text-text-main mt-0.5">
							{stats.cbt}
						</Text>
					</div>
					<div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
						<Cpu size={18} />
					</div>
				</Card>

				<Card className="p-3.5 bg-surface border-border flex items-center justify-between">
					<div>
						<Text variant="caption" color="muted" weight="medium">
							Granted (Read-Only)
						</Text>
						<Text variant="h4" weight="bold" className="text-text-main mt-0.5">
							{stats.granted}
						</Text>
					</div>
					<div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
						<Lock size={18} />
					</div>
				</Card>
			</div>

			{/* Search & Filter Toolbar */}
			<TableToolbar
				searchQuery={searchQuery}
				onSearchChange={(q) => {
					setSearchQuery(q);
					setCurrentPage(1);
				}}
				searchPlaceholder="Search course code, title, or department..."
				totalCount={courses.length}
				filteredCount={filteredCourses.length}
				filters={toolbarFilters}
				onResetFilters={() => {
					setSearchQuery("");
					setLevelFilter("");
					setExamTypeFilter("");
					setOriginFilter("");
					setCurrentPage(1);
				}}
			/>

			{/* Streamlined Exam Configurations Data Table */}
			<DataTable
				columns={[
					{
						header: "Course & Level",
						accessor: (c: Course) => (
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<Badge
										variant="primary"
										className="font-mono text-xs font-bold tracking-wide"
									>
										{c.code}
									</Badge>
									<span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-surface-raised border border-border text-text-muted">
										{c.level}L
									</span>
								</div>
								<div
									className="text-xs font-medium text-text-main line-clamp-1 max-w-xs"
									title={c.title}
								>
									{c.title}
								</div>
							</div>
						),
					},
					{
						header: "Scope & Origin",
						accessor: (c: Course) => {
							const scopeLabel =
								c.departmentName ||
								c.facultyName ||
								c.schoolName ||
								c.owningLevel;
							return (
								<div className="space-y-1">
									<div className="text-xs font-medium text-text-main">
										{scopeLabel}
									</div>
									<div>
										{c.isGrantedToScope ? (
											<Badge
												variant="warning"
												className="text-[10px] gap-1 px-1.5 py-0.5 font-normal"
											>
												Granted Access
											</Badge>
										) : c.canEditExamSettings ? (
											<Badge
												variant="outline"
												className="text-[10px] text-text-muted gap-1 px-1.5 py-0.5 font-normal"
											>
												Native Scope
											</Badge>
										) : (
											<></>
										)}
									</div>
								</div>
							);
						},
					},
					{
						header: "Exam Mode",
						accessor: (c: Course) => {
							const type = c.examType || "written";
							if (type === "cbt") {
								return (
									<Badge
										variant="outline"
										className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1.5 text-xs py-1"
									>
										CBT
									</Badge>
								);
							}
							if (type === "lab_practical") {
								return (
									<Badge
										variant="outline"
										className="border-amber-500/30 bg-amber-500/10 text-amber-400 gap-1.5 text-xs py-1"
									>
										Practical
									</Badge>
								);
							}
							return (
								<Badge
									variant="outline"
									className="border-blue-500/30 bg-blue-500/10 text-blue-400 gap-1.5 text-xs py-1"
								>
									Written
								</Badge>
							);
						},
					},
					{
						header: "Sitting Window",
						accessor: (c: Course) => {
							if (c.examType === "cbt") {
								return (
									<Badge
										variant="outline"
										className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[11px] font-normal gap-1"
										title="Duration is calculated dynamically via student throughput and computer lab capacity."
									>
										Throughput Calc
									</Badge>
								);
							}
							const mins = c.examDurationMinutes || 120;
							const hrs = (mins / 60).toFixed(mins % 60 === 0 ? 0 : 1);
							return (
								<div className="flex items-center gap-1.5 text-xs font-mono text-text-main">
									<Clock size={13} className="text-primary" />
									<span>
										{mins}m ({hrs}h)
									</span>
								</div>
							);
						},
					},
					{
						header: "CBT Turn Time",
						accessor: (c: Course) => {
							if (c.examType !== "cbt") {
								return (
									<span className="text-xs text-text-subtle font-mono">—</span>
								);
							}
							const perStudent = c.examDurationPerStudentMinutes || 45;
							return (
								<span className="text-xs font-mono font-medium text-emerald-400">
									{perStudent}m / student
								</span>
							);
						},
					},
					{
						header: "Candidates",
						accessor: (c: Course) => (
							<div className="flex items-center gap-1.5 text-xs text-text-muted font-mono">
								<Users size={13} className="text-text-subtle" />
								<span>{c.registrationCount || 0}</span>
							</div>
						),
					},
					{
						header: "Actions",
						align: "right",
						accessor: (c: Course) => {
							const isLocked = c.canEditExamSettings === false;

							if (isLocked) {
								const lockReason = c.isGrantedToScope
									? "Granted (Read-Only)"
									: c.owningLevel === "department"
										? "Department Scope"
										: "Read-Only";
								return (
									<Badge
										variant="outline"
										className="text-[11px] text-text-subtle gap-1.5 py-1 px-2.5 bg-surface-raised/60 border-border select-none"
										title="Course can only be configured by its originating scope exam officer or admin."
									>
										<Lock size={11} />
									</Badge>
								);
							}

							return (
								<Button
									variant="outline"
									size="sm"
									onClick={() => onEditExamSettings(c)}
									className="h-8 gap-1.5 text-xs font-medium text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
								>
									<SlidersHorizontal size={13} />
									<span>Configure</span>
								</Button>
							);
						},
					},
				]}
				data={filteredCourses}
				keyExtractor={(c) => c.id}
				currentPage={currentPage}
				onPageChange={setCurrentPage}
				emptyTitle="No Courses Found"
				emptyMessage="No courses in your scope match the selected filters."
			/>
		</div>
	);
}
