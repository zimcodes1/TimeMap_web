import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardView from "@/pages/main/DashboardView";
import {
	getLectureHoldRateAnalytics,
	getVenueUtilizationAnalytics,
	getDiscrepancyAnalytics,
	getDashboardSummaryCounts,
} from "@/api/main/dashboardAPI";
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

export default function DashboardContainer() {
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

	// State for filters
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

	// Filter departments visible under the selected faculty (for School Admins)
	const displayedDepartments = useMemo(() => {
		if (isDeptAdmin) {
			return scopedDepartments;
		}
		if (isFacultyAdmin) {
			return scopedDepartments;
		}
		// School admin or superuser: filter scoped departments by selected faculty
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

	// Reset program if department changes and program doesn't belong
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

	// 2. Analytics Queries
	// Hold Rate: scoped to department (or faculty), program, level, semester, grouped by week
	const holdRateParams = useMemo(() => {
		return {
			facultyId: isFacultyAdmin
				? currentUser?.adminScopeId || undefined
				: selectedFacultyId || undefined,
			departmentId: selectedDepartmentId || undefined,
			programId: selectedProgramId || undefined,
			level: selectedLevel || undefined,
			semesterId: activeSemester?.id ? String(activeSemester.id) : undefined,
			groupBy: "week",
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

	const { data: holdRate, isLoading: holdRateLoading } = useQuery({
		queryKey: ["analytics", "hold-rate", holdRateParams],
		queryFn: () => getLectureHoldRateAnalytics(holdRateParams),
	});

	// Venue Utilization: strictly scoped per department!
	const utilizationParams = useMemo(() => {
		return {
			departmentId: selectedDepartmentId || undefined,
			semesterId: activeSemester?.id ? String(activeSemester.id) : undefined,
		};
	}, [selectedDepartmentId, activeSemester]);

	const { data: utilization, isLoading: utilizationLoading } = useQuery({
		queryKey: ["analytics", "utilization", utilizationParams],
		queryFn: () => getVenueUtilizationAnalytics(utilizationParams),
		enabled: Boolean(selectedDepartmentId),
	});

	// Discrepancy Analytics
	const discrepancyParams = useMemo(() => {
		return {
			departmentId: selectedDepartmentId || undefined,
			semesterId: activeSemester?.id ? String(activeSemester.id) : undefined,
		};
	}, [selectedDepartmentId, activeSemester]);

	const { data: discrepancies, isLoading: discrepanciesLoading } = useQuery({
		queryKey: ["analytics", "discrepancies", discrepancyParams],
		queryFn: () => getDiscrepancyAnalytics(discrepancyParams),
	});

	// Dashboard Summary Counts
	const { data: summaryCounts, isLoading: countsLoading } = useQuery({
		queryKey: ["analytics", "summary-counts"],
		queryFn: getDashboardSummaryCounts,
	});

	const handleResetFilters = () => {
		setSelectedProgramId("");
		setSelectedLevel("");
		if (!isDeptAdmin && displayedDepartments.length > 0) {
			setSelectedDepartmentId(String(displayedDepartments[0].id));
		}
	};

	return (
		<DashboardView
			holdRate={holdRate}
			holdRateLoading={holdRateLoading}
			utilization={utilization}
			utilizationLoading={utilizationLoading}
			discrepancies={discrepancies}
			discrepanciesLoading={discrepanciesLoading}
			summaryCounts={summaryCounts}
			countsLoading={countsLoading}
			departments={displayedDepartments}
			faculties={scopedFaculties}
			programs={programsData}
			adminLevel={adminLevel}
			activeSemester={activeSemester}
			selectedFacultyId={selectedFacultyId}
			onFacultyChange={setSelectedFacultyId}
			selectedDepartmentId={selectedDepartmentId}
			onDepartmentChange={setSelectedDepartmentId}
			selectedProgramId={selectedProgramId}
			onProgramChange={setSelectedProgramId}
			selectedLevel={selectedLevel}
			onLevelChange={setSelectedLevel}
			currentWeekLabel={currentWeekLabel}
			onResetFilters={handleResetFilters}
		/>
	);
}
