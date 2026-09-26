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
	const isSchoolOrSuperuser =
		adminLevel === "school" || adminLevel === "university" || !adminLevel;

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

	// Active department details
	const activeDepartment = useMemo(() => {
		return displayedDepartments.find(
			(d) => String(d.id) === String(selectedDepartmentId),
		);
	}, [displayedDepartments, selectedDepartmentId]);

	// Compute maxLevel based on selected program or department's default program
	const computedMaxLevel = useMemo(() => {
		if (selectedProgramId) {
			const prog = programsData.find(
				(p) => String(p.id) === String(selectedProgramId),
			);
			if (prog?.maxLevel) return prog.maxLevel;
		}
		// Look for default program of department
		const defaultProg = programsData.find((p) => p.isDefault);
		if (defaultProg?.maxLevel) return defaultProg.maxLevel;

		const deptProgDefault = activeDepartment?.programs?.find(
			(p) => p.isDefault,
		);
		if (deptProgDefault?.maxLevel) return deptProgDefault.maxLevel;

		if (activeDepartment?.maxLevel) return activeDepartment.maxLevel;
		return 400;
	}, [selectedProgramId, programsData, activeDepartment]);

	// Auto-clamp selectedLevel if it exceeds computedMaxLevel
	useEffect(() => {
		if (selectedLevel && Number(selectedLevel) > computedMaxLevel) {
			setSelectedLevel("");
		}
	}, [computedMaxLevel, selectedLevel]);

	// Base params common to queries
	const baseFilterParams = useMemo(() => {
		if (isSchoolOrSuperuser) {
			return {
				facultyId: selectedFacultyId || undefined,
				semesterId: activeSemester?.id ? String(activeSemester.id) : undefined,
			};
		}
		if (isFacultyAdmin) {
			return {
				facultyId: currentUser?.adminScopeId || undefined,
				departmentId: selectedDepartmentId || undefined,
				level: selectedLevel || undefined,
				semesterId: activeSemester?.id ? String(activeSemester.id) : undefined,
			};
		}
		return {
			departmentId: selectedDepartmentId || undefined,
			programId: selectedProgramId || undefined,
			level: selectedLevel || undefined,
			semesterId: activeSemester?.id ? String(activeSemester.id) : undefined,
		};
	}, [
		isSchoolOrSuperuser,
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

	// 2. Lecturer Breakdown (Department Admin only)
	const { data: lecturersData, isLoading: lecturersLoading } = useQuery({
		queryKey: ["analytics", "detailed", "lecturers", baseFilterParams],
		queryFn: () =>
			getLectureHoldRateAnalytics({ ...baseFilterParams, groupBy: "lecturer" }),
		enabled: isDeptAdmin && Boolean(selectedDepartmentId),
	});

	// 3. Courses Breakdown (Department Admin only)
	const { data: coursesData, isLoading: coursesLoading } = useQuery({
		queryKey: ["analytics", "detailed", "courses", baseFilterParams],
		queryFn: () =>
			getLectureHoldRateAnalytics({ ...baseFilterParams, groupBy: "course" }),
		enabled: isDeptAdmin && Boolean(selectedDepartmentId),
	});

	// 4. Programs Breakdown (Department Admin only)
	const { data: programsBreakdownData, isLoading: programsLoading } = useQuery({
		queryKey: ["analytics", "detailed", "programs", baseFilterParams],
		queryFn: () =>
			getLectureHoldRateAnalytics({ ...baseFilterParams, groupBy: "program" }),
		enabled: isDeptAdmin && Boolean(selectedDepartmentId),
	});

	// 5. Faculty Totals Breakdown (School Admins only)
	const { data: facultiesDataResponse, isLoading: facultiesLoading } = useQuery(
		{
			queryKey: ["analytics", "detailed", "faculties", activeSemester?.id],
			queryFn: () =>
				getLectureHoldRateAnalytics({
					semesterId: activeSemester?.id
						? String(activeSemester.id)
						: undefined,
					groupBy: "faculty",
				}),
			enabled: isSchoolOrSuperuser,
		},
	);

	// 6. Department Totals Breakdown (Faculty Admins only)
	const deptTotalsParams = useMemo(() => {
		return {
			facultyId: currentUser?.adminScopeId || undefined,
			semesterId: activeSemester?.id ? String(activeSemester.id) : undefined,
			groupBy: "department" as const,
		};
	}, [currentUser, activeSemester]);

	const { data: departmentsDataResponse, isLoading: departmentsLoading } =
		useQuery({
			queryKey: ["analytics", "detailed", "departments", deptTotalsParams],
			queryFn: () => getLectureHoldRateAnalytics(deptTotalsParams),
			enabled: isFacultyAdmin,
		});

	// 7. Weekly Progression
	const { data: weeklyBreakdown, isLoading: weeklyLoading } = useQuery({
		queryKey: ["analytics", "detailed", "weekly", baseFilterParams],
		queryFn: () =>
			getLectureHoldRateAnalytics({ ...baseFilterParams, groupBy: "week" }),
	});

	const handleResetFilters = () => {
		setSelectedProgramId("");
		setSelectedLevel("");
		if (isSchoolOrSuperuser && scopedFaculties.length > 0) {
			setSelectedFacultyId(String(scopedFaculties[0].id));
		} else if (isFacultyAdmin && displayedDepartments.length > 0) {
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
			maxLevel={computedMaxLevel}
			summaryHoldRate={summaryHoldRate}
			facultiesBreakdown={facultiesDataResponse?.breakdown || []}
			facultiesLoading={facultiesLoading}
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
