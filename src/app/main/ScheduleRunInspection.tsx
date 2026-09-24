import { useState, useMemo, useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
	getGenerationRun,
	publishGenerationRun,
} from "@/api/main/generationAPI";
import { getDepartmentsList, getFacultiesList } from "@/api/main/hierarchyAPI";
import { getPrograms } from "@/api/main/programsAPI";
import {
	getAdminAccessibleDepartmentIds,
	isAssignmentInScope,
	getAdminScopeLabel,
} from "@/lib/scopeUtils";
import type {
	Department,
	Faculty,
	Program,
	TimetableGenerationRun,
} from "@/types";
import type { DepartmentOption } from "@/components/schedules/generator/DepartmentLoopBar";
import ScheduleRunInspectionView from "@/pages/main/ScheduleRunInspectionView";

const route = getRouteApi("/_main/schedules_/generator_/$runId");

export default function ScheduleRunInspectionContainer() {
	const { runId } = route.useParams();
	const queryClient = useQueryClient();
	const { user: currentUser } = useAuth();

	// Scope role flags
	const adminLevel = currentUser?.adminLevel;
	const isDeptAdmin =
		currentUser?.role === "admin" && adminLevel === "department";
	const isFacultyAdmin =
		currentUser?.role === "admin" && adminLevel === "faculty";
	const isSchoolAdmin =
		currentUser?.role === "admin" && adminLevel === "school";
	const isSuperuser =
		currentUser?.role === "admin" &&
		(!adminLevel || adminLevel === "university");

	// State
	const [selectedFacultyId, setSelectedFacultyId] = useState<string>("ALL");
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<
		string | number
	>("");
	const [selectedProgramId, setSelectedProgramId] = useState<string | number>(
		"",
	);
	const [selectedLevel, setSelectedLevel] = useState<number>(100);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [activeTab, setActiveTab] = useState<"grid" | "diagnostics" | "table">(
		"grid",
	);

	// 1. Fetch detailed run data
	const {
		data: run,
		isLoading: isRunLoading,
		refetch: refetchRun,
	} = useQuery<TimetableGenerationRun>({
		queryKey: ["scheduling", "generationRun", runId],
		queryFn: () => getGenerationRun(runId),
		enabled: Boolean(runId),
	});

	// 2. Fetch hierarchy data for scope filtering and name lookups
	const { data: allDepartments = [] } = useQuery<Department[]>({
		queryKey: ["departments"],
		queryFn: getDepartmentsList,
	});

	const { data: allFaculties = [] } = useQuery<Faculty[]>({
		queryKey: ["faculties"],
		queryFn: getFacultiesList,
	});

	const { data: allPrograms = [] } = useQuery<Program[]>({
		queryKey: ["programs"],
		queryFn: () => getPrograms(),
	});

	// 3. Resolve accessible faculties for School Admin / University Admin
	const allowedFaculties = useMemo(() => {
		if (isSchoolAdmin) {
			const schoolId = currentUser?.adminScopeId || currentUser?.schoolId;
			if (!schoolId) return [];
			return allFaculties.filter(
				(f) => String(f.schoolId) === String(schoolId),
			);
		}
		if (isFacultyAdmin) {
			const facId = currentUser?.adminScopeId || currentUser?.facultyId;
			if (!facId) return [];
			return allFaculties.filter((f) => String(f.id) === String(facId));
		}
		return allFaculties;
	}, [allFaculties, isSchoolAdmin, isFacultyAdmin, currentUser]);

	// 4. Resolve accessible department IDs based on admin scope and active faculty filter
	const accessibleDepartmentIds = useMemo(() => {
		return getAdminAccessibleDepartmentIds(
			currentUser,
			allDepartments,
			allFaculties,
			selectedFacultyId,
		);
	}, [currentUser, allDepartments, allFaculties, selectedFacultyId]);

	// 5. Resolve raw departments present in this run
	const runDepartments: DepartmentOption[] = useMemo(() => {
		if (
			!run ||
			!run.assignmentsPayload ||
			run.assignmentsPayload.length === 0
		) {
			return allDepartments.map((d) => ({
				id: d.id,
				code: d.code,
				name: d.name,
			}));
		}

		// Count occurrences per department
		const deptMap = new Map<
			string,
			{ id: string | number; code?: string; name: string; courseCount: number }
		>();

		for (const a of run.assignmentsPayload) {
			const deptId = String(a.department_id || "");
			if (!deptId) continue;

			if (!deptMap.has(deptId)) {
				const match = allDepartments.find((d) => String(d.id) === deptId);
				deptMap.set(deptId, {
					id: deptId,
					code: match?.code,
					name: a.department_name || match?.name || `Department #${deptId}`,
					courseCount: 0,
				});
			}

			const record = deptMap.get(deptId)!;
			record.courseCount += 1;
		}

		const list = Array.from(deptMap.values());
		return list.length > 0
			? list
			: allDepartments.map((d) => ({ id: d.id, code: d.code, name: d.name }));
	}, [run, allDepartments]);

	// 6. Filter run departments to only those accessible by the admin's scope
	const accessibleRunDepartments = useMemo(() => {
		return runDepartments.filter((d) =>
			accessibleDepartmentIds.includes(String(d.id)),
		);
	}, [runDepartments, accessibleDepartmentIds]);

	// 7. Enforce department selection based on admin scope
	useEffect(() => {
		if (isDeptAdmin) {
			const myDeptId = currentUser?.adminScopeId || currentUser?.departmentId;
			if (myDeptId && String(selectedDepartmentId) !== String(myDeptId)) {
				setSelectedDepartmentId(myDeptId);
			}
		} else if (accessibleRunDepartments.length > 0) {
			const exists = accessibleRunDepartments.some(
				(d) => String(d.id) === String(selectedDepartmentId),
			);
			if (!exists) {
				setSelectedDepartmentId(accessibleRunDepartments[0].id);
			}
		}
	}, [
		isDeptAdmin,
		currentUser,
		accessibleRunDepartments,
		selectedDepartmentId,
	]);

	// 8. Resolve programs belonging to selected department
	const departmentPrograms = useMemo(() => {
		if (!selectedDepartmentId) return [];
		return allPrograms.filter(
			(p) => String(p.departmentId) === String(selectedDepartmentId),
		);
	}, [allPrograms, selectedDepartmentId]);

	// Automatically ensure a valid program is selected when department programs update
	useEffect(() => {
		if (departmentPrograms.length > 0) {
			const currentValid = departmentPrograms.some(
				(p) => String(p.id) === String(selectedProgramId),
			);
			if (!currentValid) {
				setSelectedProgramId(departmentPrograms[0].id);
			}
		}
	}, [departmentPrograms, selectedProgramId]);

	// When faculty changes, update department and program
	const handleSelectFaculty = (facId: string) => {
		setSelectedFacultyId(facId);
		// Let accessibleDepartmentIds update; the useEffect above will select the first accessible dept
	};

	// When department changes, update selectedProgramId to first program
	const handleSelectDepartment = (deptId: string | number) => {
		if (isDeptAdmin) return; // Department admins cannot change department
		setSelectedDepartmentId(deptId);
		const progs = allPrograms.filter(
			(p) => String(p.departmentId) === String(deptId),
		);
		if (progs.length > 0) {
			setSelectedProgramId(progs[0].id);
		} else {
			setSelectedProgramId("");
		}
	};

	// When program changes, reset level if current level exceeds program's maxLevel
	const handleSelectProgram = (progId: string | number) => {
		setSelectedProgramId(progId);
		const prog = departmentPrograms.find(
			(p) => String(p.id) === String(progId),
		);
		if (prog && prog.maxLevel && selectedLevel > prog.maxLevel) {
			setSelectedLevel(100);
		}
	};

	// 9. Filter run assignments strictly according to admin scope
	const scopedAssignments = useMemo(() => {
		const payload = run?.assignmentsPayload || [];
		if (!currentUser || currentUser.role !== "admin" || isSuperuser) {
			if (selectedFacultyId && selectedFacultyId !== "ALL") {
				return payload.filter((a) =>
					isAssignmentInScope(a, accessibleDepartmentIds),
				);
			}
			return payload;
		}
		return payload.filter((a) =>
			isAssignmentInScope(a, accessibleDepartmentIds),
		);
	}, [
		run,
		currentUser,
		isSuperuser,
		selectedFacultyId,
		accessibleDepartmentIds,
	]);

	// 10. Human-readable Admin Scope Label
	const scopeLabel = useMemo(() => {
		return getAdminScopeLabel(
			currentUser,
			allDepartments,
			allFaculties,
			selectedFacultyId,
		);
	}, [currentUser, allDepartments, allFaculties, selectedFacultyId]);

	// 11. Publish Mutation
	const publishMutation = useMutation({
		mutationFn: () => publishGenerationRun(runId),
		onSuccess: () => {
			toast.success("Timetable successfully published to live!");
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "generationRun", runId],
			});
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "generationRuns"],
			});
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "entries"],
			});
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "sessions"],
			});
			refetchRun();
		},
		onError: (err: any) => {
			const errorMsg =
				err?.response?.data?.error ||
				err?.message ||
				"Failed to publish timetable.";
			toast.error(errorMsg);
		},
	});

	return (
		<ScheduleRunInspectionView
			run={run || null}
			isLoading={isRunLoading}
			faculties={allowedFaculties}
			selectedFacultyId={selectedFacultyId}
			onSelectFaculty={handleSelectFaculty}
			departments={accessibleRunDepartments}
			selectedDepartmentId={selectedDepartmentId}
			onSelectDepartment={handleSelectDepartment}
			departmentPrograms={departmentPrograms}
			selectedProgramId={selectedProgramId}
			onSelectProgram={handleSelectProgram}
			selectedLevel={selectedLevel}
			onSelectLevel={setSelectedLevel}
			searchQuery={searchQuery}
			onSearchChange={setSearchQuery}
			activeTab={activeTab}
			onTabChange={setActiveTab}
			isPublishing={publishMutation.isPending}
			onPublish={() => publishMutation.mutate()}
			onRefetch={() => refetchRun()}
			// Admin Permissions & Scoping Props
			isDeptAdmin={isDeptAdmin}
			isFacultyAdmin={isFacultyAdmin}
			isSchoolAdmin={isSchoolAdmin}
			isSuperuser={isSuperuser}
			scopedDepartmentIds={accessibleDepartmentIds}
			scopedAssignments={scopedAssignments}
			scopeLabel={scopeLabel}
			allDepartments={allDepartments}
			allFaculties={allFaculties}
			allPrograms={allPrograms}
		/>
	);
}
