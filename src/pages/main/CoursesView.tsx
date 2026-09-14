import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TabSwitcher } from "@/components/ui/tabs";
import {
	TableToolbar,
	type ToolbarFilter,
} from "@/components/ui/table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import {
	Plus,
	Share2,
	BookOpen,
	ShieldCheck,
	Edit2,
	CheckCircle,
	XCircle,
	RefreshCw,
	Trash2,
	Lock,
} from "lucide-react";
import type {
	Course,
	CourseAccessGrant,
	Faculty,
	Department,
	Program,
	Semester,
} from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface CoursesViewProps {
	courses: Course[];
	grants: CourseAccessGrant[];
	faculties?: Faculty[];
	departments?: Department[];
	programs?: Program[];
	semesters?: Semester[];
	isLoading?: boolean;
	isRefetching?: boolean;
	onRefresh?: () => void;
	onOpenCreateCourse: () => void;
	onOpenOfferGrant: () => void;
	onOpenRequestGrant: () => void;
	onEditCourse: (course: Course) => void;
	onDeleteCourse?: (id: string) => void;
	onApproveGrant: (id: string) => void;
	onRejectGrant: (id: string) => void;
}

export default function CoursesView({
	courses,
	grants,
	faculties = [],
	departments = [],
	programs = [],
	semesters = [],
	isLoading = false,
	isRefetching = false,
	onRefresh,
	onOpenCreateCourse,
	onOpenOfferGrant,
	onOpenRequestGrant,
	onEditCourse,
	onDeleteCourse,
	onApproveGrant,
	onRejectGrant,
}: CoursesViewProps) {
	const { user: currentUser } = useAuth();
	const adminLevel = currentUser?.adminLevel;
	const isSuperuser =
		currentUser?.role === "admin" &&
		(!adminLevel || adminLevel === "university");
	const isUniversityAdmin = isSuperuser;
	const isSchoolAdmin =
		currentUser?.role === "admin" && adminLevel === "school";
	const isFacultyAdmin =
		currentUser?.role === "admin" && adminLevel === "faculty";
	const isDeptAdmin =
		currentUser?.role === "admin" && adminLevel === "department";

	// Tab configurations per admin level
	const visibleTabs = useMemo(() => {
		if (isUniversityAdmin || isSchoolAdmin) {
			return [
				{
					id: "catalog",
					label: "Course Catalog",
					icon: BookOpen,
					count: courses.length,
				},
			];
		}
		return [
			{
				id: "catalog",
				label: "Course Catalog",
				icon: BookOpen,
				count: courses.length,
			},
			{
				id: "grants",
				label: "Access Grants Queue",
				icon: Share2,
				count: grants.length,
			},
		];
	}, [isUniversityAdmin, isSchoolAdmin, courses.length, grants.length]);

	const [activeTab, setActiveTab] = useState<
		"catalog" | "grants" | "registrations"
	>("catalog");
	const [searchQuery, setSearchQuery] = useState("");
	const [levelFilter, setLevelFilter] = useState("");
	const [scopeFilter, setScopeFilter] = useState("");
	const [facultyFilter, setFacultyFilter] = useState("");
	const [departmentFilter, setDepartmentFilter] = useState("");
	const [semesterFilter, setSemesterFilter] = useState("");
	const [programFilter, setProgramFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	// Filter catalog
	const filteredCourses = useMemo(() => {
		return courses.filter((c) => {
			const q = searchQuery.toLowerCase();
			const matchesSearch =
				!q ||
				c.code.toLowerCase().includes(q) ||
				c.title.toLowerCase().includes(q) ||
				(c.departmentName && c.departmentName.toLowerCase().includes(q)) ||
				(c.facultyName && c.facultyName.toLowerCase().includes(q)) ||
				(c.schoolName && c.schoolName.toLowerCase().includes(q));

			const matchesLevel = !levelFilter || c.level === Number(levelFilter);
			const matchesScope = !scopeFilter || c.owningLevel === scopeFilter;
			const matchesSemester =
				!semesterFilter || c.semesterId === semesterFilter;
			const matchesProgram =
				!programFilter ||
				(programFilter === "general"
					? c.programScope === "general"
					: c.targetProgramId === programFilter);

			const matchesFaculty =
				!facultyFilter ||
				String(c.owningFaculty) === facultyFilter ||
				c.facultyName === facultyFilter ||
				faculties.find((f) => f.id === facultyFilter)?.name === c.facultyName ||
				departments.find((d) => d.id === String(c.owningDepartment))
					?.facultyId === facultyFilter;

			const matchesDepartment =
				!departmentFilter ||
				String(c.owningDepartment) === departmentFilter ||
				c.departmentName === departmentFilter ||
				departments.find((d) => d.id === departmentFilter)?.name ===
					c.departmentName;

			return (
				matchesSearch &&
				matchesLevel &&
				matchesScope &&
				matchesSemester &&
				matchesProgram &&
				matchesFaculty &&
				matchesDepartment
			);
		});
	}, [
		courses,
		searchQuery,
		levelFilter,
		scopeFilter,
		semesterFilter,
		programFilter,
		facultyFilter,
		departmentFilter,
		faculties,
		departments,
	]);

	// Filter grants
	const filteredGrants = useMemo(() => {
		return grants.filter((g) => {
			const q = searchQuery.toLowerCase();
			const matchesSearch =
				!q ||
				g.courseCode.toLowerCase().includes(q) ||
				g.courseTitle.toLowerCase().includes(q) ||
				g.requestedBy.toLowerCase().includes(q);

			const matchesStatus = !statusFilter || g.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [grants, searchQuery, statusFilter]);

	// Check if current user is originating owner of a course
	const canManageCourse = (c: Course) => {
		if (isUniversityAdmin) return false; // System level: view all, edit none, delete none

		if (isSchoolAdmin) {
			return (
				c.owningLevel === "school" &&
				(String(c.owningSchool) === String(currentUser?.adminScopeId) ||
					c.schoolName === currentUser?.adminScopeName)
			);
		}

		if (isFacultyAdmin) {
			return (
				c.owningLevel === "faculty" &&
				(String(c.owningFaculty) === String(currentUser?.adminScopeId) ||
					c.facultyName === currentUser?.adminScopeName)
			);
		}

		if (isDeptAdmin) {
			const myDeptId = currentUser?.adminScopeId || currentUser?.departmentId;
			return (
				c.owningLevel === "department" &&
				(String(c.owningDepartment) === String(myDeptId) ||
					c.departmentName === currentUser?.departmentName ||
					c.departmentName === currentUser?.adminScopeName)
			);
		}

		return false;
	};

	const toolbarFilters = useMemo(() => {
		const list: ToolbarFilter[] = [
			{
				id: "level",
				label: "Level",
				value: levelFilter,
				onChange: setLevelFilter,
				options: [
					{ label: "100 Level", value: "100" },
					{ label: "200 Level", value: "200" },
					{ label: "300 Level", value: "300" },
					{ label: "400 Level", value: "400" },
					{ label: "500 Level", value: "500" },
				],
			},
		];

		if (semesters.length > 0) {
			list.unshift({
				id: "semester",
				label: "Semester",
				value: semesterFilter,
				onChange: setSemesterFilter,
				options: semesters.map((s) => ({
					label: `${s.displayName || (s.name === "first" ? "First Semester" : "Second Semester")}${s.isActive ? " (Active)" : ""}`,
					value: s.id,
				})),
			});
		}

		if (programs.length > 0) {
			list.push({
				id: "program",
				label: "Program",
				value: programFilter,
				onChange: setProgramFilter,
				options: [
					{ label: "General Courses Only", value: "general" },
					...programs.map((p) => ({
						label: `${p.code} - ${p.name}`,
						value: p.id,
					})),
				],
			});
		}

		if (isUniversityAdmin) {
			list.push({
				id: "scope",
				label: "Owning Scope",
				value: scopeFilter,
				onChange: setScopeFilter,
				options: [
					{ label: "Department", value: "department" },
					{ label: "Faculty", value: "faculty" },
					{ label: "School", value: "school" },
					{ label: "General", value: "general" },
				],
			});
		}

		if ((isUniversityAdmin || isSchoolAdmin) && faculties.length > 0) {
			list.push({
				id: "faculty",
				label: "Faculty",
				value: facultyFilter,
				onChange: setFacultyFilter,
				options: faculties.map((f) => ({
					label: `${f.code} - ${f.name}`,
					value: f.id,
				})),
			});
		}

		if (
			(isUniversityAdmin || isSchoolAdmin || isFacultyAdmin) &&
			departments.length > 0
		) {
			let deptOptions = departments;
			if (isFacultyAdmin && currentUser?.adminScopeId) {
				const scopedDepts = departments.filter(
					(d) =>
						String(d.facultyId) === String(currentUser.adminScopeId) ||
						d.facultyName === currentUser.adminScopeName,
				);
				if (scopedDepts.length > 0) deptOptions = scopedDepts;
			}
			list.push({
				id: "department",
				label: "Department",
				value: departmentFilter,
				onChange: setDepartmentFilter,
				options: deptOptions.map((d) => ({
					label: `${d.code} - ${d.name}`,
					value: d.id,
				})),
			});
		}

		return list;
	}, [
		isUniversityAdmin,
		isSchoolAdmin,
		isFacultyAdmin,
		levelFilter,
		scopeFilter,
		semesterFilter,
		programFilter,
		facultyFilter,
		departmentFilter,
		semesters,
		programs,
		faculties,
		departments,
		currentUser,
	]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex-col sm:mb-2 sm:flex items-left gap-2">
						<Text variant="h3" weight="bold" className="text-text-main">
							Courses & Access Sharing
						</Text>
					</div>
					<Text variant="body-sm" color="muted">
						{isUniversityAdmin
							? "Read-only course catalog and institutional curriculum overview."
							: isSchoolAdmin
								? "Manage school-level core courses and view academic catalog across all departments."
								: isFacultyAdmin
									? "Manage faculty courses, review cross-department access grants, and view departmental offerings."
									: "Manage departmental courses, offer access grants, and request cross-department offerings."}
					</Text>
				</div>

				{/* Action Button Controls */}
				<div className="flex flex-wrap items-center justify-end gap-2">
					{onRefresh && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onRefresh}
							disabled={isRefetching}
							title="Refresh Course & Grant Registry"
							className="px-2 sm:rounded-full cursor-pointer text-text-muted hover:text-primary"
						>
							<p className="sm:hidden">Refresh</p>
							<RefreshCw
								size={15}
								className={isRefetching ? "animate-spin text-primary" : ""}
							/>
						</Button>
					)}

					{/* Access Grants Buttons: Available only to Faculty & Department Admins */}
					{(isFacultyAdmin || isDeptAdmin) && (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={onOpenOfferGrant}
								className="cursor-pointer"
							>
								<Share2 size={16} className="mr-1" /> Offer Grant
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={onOpenRequestGrant}
								className="cursor-pointer"
							>
								<ShieldCheck size={16} className="mr-1" /> Request Access
							</Button>
						</>
					)}

					{/* Create Course Button: Available to School, Faculty & Department Admins */}
					{!isUniversityAdmin && (
						<Button
							variant="primary"
							size="sm"
							onClick={onOpenCreateCourse}
							className="cursor-pointer"
						>
							<Plus size={16} className="mr-1" /> Create Course
						</Button>
					)}
				</div>
			</div>

			{/* Tabs Switcher */}
			<TabSwitcher
				tabs={visibleTabs}
				activeTab={activeTab}
				onChange={(tab) => {
					setActiveTab(tab as typeof activeTab);
					setCurrentPage(1);
				}}
			/>

			{/* Catalog View */}
			{activeTab === "catalog" && (
				<div className="space-y-4">
					{/* Enhanced Search & Toolbar Filters */}
					<TableToolbar
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						searchPlaceholder="Search course code, title, department, or faculty..."
						totalCount={courses.length}
						filteredCount={filteredCourses.length}
						filters={toolbarFilters}
						onResetFilters={() => {
							setSearchQuery("");
							setLevelFilter("");
							setSemesterFilter("");
							setProgramFilter("");
							setScopeFilter("");
							setFacultyFilter("");
							setDepartmentFilter("");
						}}
					/>

					{isLoading ? (
						<Card className="p-4 space-y-3">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="flex items-center justify-between gap-4"
								>
									<Skeleton className="h-5 w-1/4" />
									<Skeleton className="h-5 w-1/6" />
									<Skeleton className="h-5 w-1/6" />
									<Skeleton className="h-5 w-1/6" />
								</div>
							))}
						</Card>
					) : filteredCourses.length === 0 ? (
						<Card className="p-8 text-center space-y-3">
							<BookOpen
								size={36}
								className="mx-auto text-text-muted opacity-40"
							/>
							<Text variant="h6" weight="bold" className="text-center">
								No Courses Found
							</Text>
							<Text variant="body-sm" color="muted" className="text-center">
								{searchQuery ||
								levelFilter ||
								semesterFilter ||
								programFilter ||
								scopeFilter ||
								facultyFilter ||
								departmentFilter
									? "No courses match your active filter criteria."
									: "No academic courses have been created yet."}
							</Text>
							{!isUniversityAdmin && (
								<Button
									variant="primary"
									size="sm"
									onClick={onOpenCreateCourse}
									className="mt-2 cursor-pointer"
								>
									<Plus size={14} className="mr-1" /> Add Course
								</Button>
							)}
						</Card>
					) : (
						<DataTable
							columns={[
								{
									header: "Course Code & Title",
									accessor: (c: Course) => (
										<div>
											<div className="font-bold text-primary">{c.code}</div>
											<div className="text-xs text-text-main font-medium">
												{c.title}
											</div>
										</div>
									),
								},
								{
									header: "Level & Program",
									accessor: (c: Course) => (
										<div className="text-xs">
											<span className="font-bold text-text-main">
												{c.level}L
											</span>
											{c.programScope === "program" && (
												<div className="text-[11px] text-primary font-medium mt-0.5">
													{c.targetProgramName || "Program Scoped"}
												</div>
											)}
											{c.programScope === "general" && (
												<div className="text-[10px] text-text-muted mt-0.5">
													All Programs
												</div>
											)}
										</div>
									),
								},
								{
									header: "Semester",
									accessor: (c: Course) => (
										<span className="text-xs font-medium text-text-muted">
											{c.semesterName || "Current"}
										</span>
									),
								},
								{
									header: "Department / Scope",
									accessor: (c: Course) => (
										<div className="text-xs">
											<div className="font-semibold text-text-main">
												{c.departmentName ||
													c.facultyName ||
													c.schoolName ||
													"General / Central"}
											</div>
											<Badge
												variant="default"
												className="text-[10px] uppercase mt-0.5 capitalize"
											>
												{c.owningLevel}
											</Badge>
										</div>
									),
								},
								{
									header: "Assigned Staff",
									accessor: (c: Course) => (
										<Badge variant="default" className="text-xs">
											{c.lecturers?.length || 0} Lecturers
										</Badge>
									),
								},
								{
									header: "Students Registered",
									accessor: (c: Course) => (
										<span className="font-bold text-primary text-xs">
											{c.registrationCount || 0} Students
										</span>
									),
								},
								{
									header: "Actions",
									align: "right",
									accessor: (c: Course) => {
										const isOwner = canManageCourse(c);
										if (!isOwner) {
											return (
												<div className="flex items-center justify-end gap-1 text-[11px] text-text-subtle italic">
													<Lock size={12} className="text-text-subtle" />
													<span>Originating Admin Only</span>
												</div>
											);
										}
										return (
											<div className="flex items-center justify-end gap-1.5">
												<Button
													variant="outline"
													size="sm"
													onClick={() => onEditCourse(c)}
													title={`Edit course details for ${c.code}`}
													className="h-8 px-2 text-xs cursor-pointer"
												>
													<Edit2 size={13} className="mr-1" /> Edit
												</Button>
												{onDeleteCourse && (
													<Button
														variant="outline"
														size="sm"
														onClick={() => onDeleteCourse(c.id)}
														title={`Delete course ${c.code}`}
														className="h-8 px-2 text-xs cursor-pointer text-danger hover:bg-danger-surface border-danger-surface"
													>
														<Trash2 size={13} />
													</Button>
												)}
											</div>
										);
									},
								},
							]}
							data={filteredCourses}
							keyExtractor={(c) => c.id}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
						/>
					)}
				</div>
			)}

			{/* Access Grants Queue */}
			{activeTab === "grants" && (
				<div className="space-y-4">
					<TableToolbar
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						searchPlaceholder="Search grants by course code, title, or requester..."
						totalCount={grants.length}
						filteredCount={filteredGrants.length}
						filters={[
							{
								id: "status",
								label: "Status",
								value: statusFilter,
								onChange: setStatusFilter,
								options: [
									{ label: "Pending Approval", value: "pending" },
									{ label: "Approved", value: "approved" },
									{ label: "Rejected", value: "rejected" },
								],
							},
						]}
						onResetFilters={() => {
							setSearchQuery("");
							setStatusFilter("");
						}}
					/>

					{isLoading ? (
						<Card className="p-4 space-y-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="flex items-center justify-between gap-4"
								>
									<Skeleton className="h-5 w-1/4" />
									<Skeleton className="h-5 w-1/4" />
									<Skeleton className="h-5 w-1/6" />
								</div>
							))}
						</Card>
					) : filteredGrants.length === 0 ? (
						<Card className="p-8 text-center space-y-3">
							<Share2
								size={36}
								className="mx-auto text-text-muted opacity-40"
							/>
							<Text variant="h6" weight="bold" className="text-center">
								No Access Grants Found
							</Text>
							<Text variant="body-sm" color="muted" className="text-center">
								{searchQuery || statusFilter
									? "No grant requests match your filter criteria."
									: "No cross-department access grants have been requested or offered yet."}
							</Text>
						</Card>
					) : (
						<DataTable
							columns={[
								{
									header: "Target Course",
									accessor: (g: CourseAccessGrant) => (
										<div>
											<div className="font-bold text-primary">
												{g.courseCode}
											</div>
											<div className="text-xs text-text-main">
												{g.courseTitle}
											</div>
										</div>
									),
								},
								{
									header: "Grant Direction",
									accessor: (g: CourseAccessGrant) => (
										<Badge
											variant={
												g.direction === "offered" ? "primary" : "secondary"
											}
											className="capitalize"
										>
											{g.direction}
										</Badge>
									),
								},
								{
									header: "Recipient Scope",
									accessor: (g: CourseAccessGrant) => (
										<div className="text-xs font-medium">
											{g.grantedToDepartmentName ||
												g.grantedToFacultyName ||
												g.grantedToSchoolName ||
												"All Departments"}
										</div>
									),
								},
								{
									header: "Requested By",
									accessor: (g: CourseAccessGrant) => (
										<span className="text-xs text-text-muted">
											{g.requestedBy || "Department Admin"}
										</span>
									),
								},
								{
									header: "Status",
									accessor: (g: CourseAccessGrant) => {
										const badgeVariant =
											g.status === "approved"
												? "success"
												: g.status === "rejected"
													? "danger"
													: "warning";
										return (
											<Badge variant={badgeVariant} className="capitalize">
												{g.status}
											</Badge>
										);
									},
								},
								{
									header: "Actions",
									align: "right",
									accessor: (g: CourseAccessGrant) => {
										if (g.status !== "pending") {
											return (
												<span className="text-xs text-text-subtle font-medium italic">
													Decided
												</span>
											);
										}
										return (
											<div className="flex items-center justify-end gap-1.5">
												<Button
													variant="outline"
													size="sm"
													onClick={() => onApproveGrant(g.id)}
													className="h-8 px-2 text-xs text-success border-success-surface hover:bg-success-surface cursor-pointer"
												>
													<CheckCircle size={13} className="mr-1" /> Approve
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => onRejectGrant(g.id)}
													className="h-8 px-2 text-xs text-danger border-danger-surface hover:bg-danger-surface cursor-pointer"
												>
													<XCircle size={13} className="mr-1" /> Reject
												</Button>
											</div>
										);
									},
								},
							]}
							data={filteredGrants}
							keyExtractor={(g) => g.id}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
						/>
					)}
				</div>
			)}
		</div>
	);
}
