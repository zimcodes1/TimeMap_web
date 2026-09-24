import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DetailedAnalyticsView from "@/pages/main/DetailedAnalyticsView";
import { getLectureHoldRateAnalytics } from "@/api/main/dashboardAPI";
import { getSemesters } from "@/api/main/semestersAPI";
import { getFacultiesList, getDepartmentsList } from "@/api/main/hierarchyAPI";
import { getPrograms } from "@/api/main/programsAPI";
import { useAuth } from "@/hooks/useAuth";
import {
	filterFacultiesByScope,
	filterDepartmentsByScope,
} from "@/lib/scopeUtils";
import { getSemesterWeekTimeline } from "@/utils/semesterWeeks";
import type { Faculty, Department, Program, Semester } from "@/types";

export default function DetailedAnalyticsContainer() {
	const { user: currentUser } = useAuth();
	const adminLevel = currentUser?.adminLevel;
	const isDeptAdmin = adminLevel === "department";
	const isFacultyAdmin = adminLevel === "faculty";

	// 1. Hierarchy Queries
	const { data: facultiesData = [] } = useQuery<Faculty[]>({
		queryKey: ["hierarchy", "faculties"],
		queryFn: getFacultiesList,
	});

	const { data: departmentsData = [] } = useQuery<Department[]>({
		queryKey: ["hierarchy", "departments"],
		queryFn: getDepartmentsList,
	});

	const { data: semestersData = [] } = useQuery<Semester[]>({
		queryKey: ["semesters", "list"],
		queryFn: () => getSemesters(),
	});

	const activeSemester = useMemo(() => {
		return semestersData.find((s) => s.isActive) || semestersData[0];
	}, [semestersData]);

	// Calculate timeline relative to active semester
	const semesterTimeline = useMemo(() => {
		return getSemesterWeekTimeline(activeSemester);
	}, [activeSemester]);

	const currentWeekLabel = useMemo(() => {
		if (!activeSemester) return undefined;
		return `Week ${semesterTimeline.currentWeek}`;
	}, [activeSemester, semesterTimeline]);

	// Scoped faculties
	const scopedFaculties = useMemo(() => {
		return filterFacultiesByScope(facultiesData, currentUser, departmentsData);
	}, [facultiesData, currentUser, departmentsData]);

	// Scoped departments
	const scopedDepartments = useMemo(() => {
		return filterDepartmentsByScope(
			departmentsData,
			currentUser,
			facultiesData,
		);
	}, [departmentsData, currentUser, facultiesData]);

	// Filter state
	const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
	const [selectedProgramId, setSelectedProgramId] = useState<string>("");
	const [selectedLevel, setSelectedLevel] = useState<string>("");

	// Initialize selected faculty
	useEffect(() => {
		if (scopedFaculties.length > 0 && !selectedFacultyId) {
			setSelectedFacultyId(String(scopedFaculties[0].id));
		}
	}, [scopedFaculties, selectedFacultyId]);

	// Filter departments visible under the selected faculty
	const displayedDepartments = useMemo(() => {
		if (isDeptAdmin || isFacultyAdmin) {
			return scopedDepartments;
		}
		if (selectedFacultyId) {
			return scopedDepartments.filter(
				(d) => String(d.facultyId) === String(selectedFacultyId),
			);
		}
		return scopedDepartments;
	}, [scopedDepartments, isDeptAdmin, isFacultyAdmin, selectedFacultyId]);

	// Initialize selected department
	useEffect(() => {
		if (isDeptAdmin) {
			const myDeptId = currentUser?.adminScopeId || currentUser?.departmentId;
			if (myDeptId && selectedDepartmentId !== String(myDeptId)) {
				setSelectedDepartmentId(String(myDeptId));
			}
		} else if (displayedDepartments.length > 0) {
			const deptExists = displayedDepartments.some(
				(d) => String(d.id) === String(selectedDepartmentId),
			);
			if (!deptExists) {
				setSelectedDepartmentId(String(displayedDepartments[0].id));
			}
		}
	}, [isDeptAdmin, currentUser, displayedDepartments, selectedDepartmentId]);

	// Fetch programs for the selected department
	const { data: programsData = [] } = useQuery<Program[]>({
		queryKey: ["hierarchy", "programs", selectedDepartmentId],
		queryFn: () => getPrograms(selectedDepartmentId),
		enabled: Boolean(selectedDepartmentId),
	});

	// Reset program if department changes
	useEffect(() => {
		if (selectedProgramId && programsData.length > 0) {
			const progExists = programsData.some(
				(p) => String(p.id) === String(selectedProgramId),
			);
			if (!progExists) {
				setSelectedProgramId("");
			}
		}
	}, [selectedDepartmentId, programsData, selectedProgramId]);

	// Base params common to queries
	const baseFilterParams = useMemo(() => {
		return {
			facultyId: isFacultyAdmin
				? currentUser?.adminScopeId || undefined
				: selectedFacultyId || undefined,
			departmentId: selectedDepartmentId || undefined,
			programId: selectedProgramId || undefined,
			level: selectedLevel || undefined,
			semesterId: activeSemester?.id ? String(activeSemester.id) : undefined,
		};
	}, [
		isFacultyAdmin,
		currentUser,
		selectedFacultyId,
		selectedDepartmentId,
		selectedProgramId,
		selectedLevel,
		activeSemester,
	]);

	// 1. Overall Summary
	const { data: summaryHoldRate } = useQuery({
		queryKey: ["analytics", "detailed", "summary", baseFilterParams],
		queryFn: () => getLectureHoldRateAnalytics(baseFilterParams),
	});

	// 2. Lecturer Breakdown
	const { data: lecturersData, isLoading: lecturersLoading } = useQuery({
		queryKey: ["analytics", "detailed", "lecturers", baseFilterParams],
		queryFn: () =>
			getLectureHoldRateAnalytics({ ...baseFilterParams, groupBy: "lecturer" }),
		enabled: Boolean(selectedDepartmentId),
	});

	// 3. Courses Breakdown
	const { data: coursesData, isLoading: coursesLoading } = useQuery({
		queryKey: ["analytics", "detailed", "courses", baseFilterParams],
		queryFn: () =>
			getLectureHoldRateAnalytics({ ...baseFilterParams, groupBy: "course" }),
		enabled: Boolean(selectedDepartmentId),
	});

	// 4. Programs Breakdown
	const { data: programsBreakdownData, isLoading: programsLoading } = useQuery({
		queryKey: ["analytics", "detailed", "programs", baseFilterParams],
		queryFn: () =>
			getLectureHoldRateAnalytics({ ...baseFilterParams, groupBy: "program" }),
		enabled: Boolean(selectedDepartmentId),
	});

	// 5. Department Totals Breakdown (for Faculty & School Admins)
	const deptTotalsParams = useMemo(() => {
		return {
			facultyId: isFacultyAdmin
				? currentUser?.adminScopeId || undefined
				: selectedFacultyId || undefined,
			semesterId: activeSemester?.id ? String(activeSemester.id) : undefined,
			groupBy: "department",
		};
	}, [isFacultyAdmin, currentUser, selectedFacultyId, activeSemester]);

	const { data: departmentsDataResponse, isLoading: departmentsLoading } =
		useQuery({
			queryKey: ["analytics", "detailed", "departments", deptTotalsParams],
			queryFn: () => getLectureHoldRateAnalytics(deptTotalsParams),
			enabled: !isDeptAdmin,
		});

	// 6. Weekly Progression
	const { data: weeklyBreakdown, isLoading: weeklyLoading } = useQuery({
		queryKey: ["analytics", "detailed", "weekly", baseFilterParams],
		queryFn: () =>
			getLectureHoldRateAnalytics({ ...baseFilterParams, groupBy: "week" }),
	});

	const handleResetFilters = () => {
		setSelectedProgramId("");
		setSelectedLevel("");
		if (!isDeptAdmin && displayedDepartments.length > 0) {
			setSelectedDepartmentId(String(displayedDepartments[0].id));
		}
	};

	return (
		<DetailedAnalyticsView
			adminLevel={adminLevel}
			activeSemester={activeSemester}
			currentWeekLabel={currentWeekLabel}
			faculties={scopedFaculties}
			selectedFacultyId={selectedFacultyId}
			onFacultyChange={setSelectedFacultyId}
			departments={displayedDepartments}
			selectedDepartmentId={selectedDepartmentId}
			onDepartmentChange={setSelectedDepartmentId}
			programs={programsData}
			selectedProgramId={selectedProgramId}
			onProgramChange={setSelectedProgramId}
			selectedLevel={selectedLevel}
			onLevelChange={setSelectedLevel}
			summaryHoldRate={summaryHoldRate}
			lecturersBreakdown={lecturersData?.breakdown || []}
			lecturersLoading={lecturersLoading}
			coursesBreakdown={coursesData?.breakdown || []}
			coursesLoading={coursesLoading}
			programsBreakdown={programsBreakdownData?.breakdown || []}
			programsLoading={programsLoading}
			departmentsBreakdown={departmentsDataResponse?.breakdown || []}
			departmentsLoading={departmentsLoading}
			weeklyBreakdown={weeklyBreakdown}
			weeklyLoading={weeklyLoading}
			onResetFilters={handleResetFilters}
		/>
	);
}
