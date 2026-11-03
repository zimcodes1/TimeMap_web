import { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
	getExamOptimizerRun,
	getExamOptimizerAccess,
	getOptimizedExamTimetable,
	approveExamOptimizerRun,
	publishExamOptimizerRun,
	type ExamOptimizerResult,
} from "@/api/main/examOptimizerAPI";
import { getDepartmentsList, getFacultiesList } from "@/api/main/hierarchyAPI";
import { getPrograms } from "@/api/main/programsAPI";
import type { Faculty, Department, Program } from "@/types";
import ExamOptimizerRunInspectionView from "@/pages/main/ExamOptimizerRunInspectionView";

export default function ExamOptimizerRunInspection() {
	const { runId } = useParams({ from: "/_main/exams_/generator_/$runId" });
	const queryClient = useQueryClient();
	const { user: currentUser } = useAuth();

	// Tabs and filter states
	const [activeTab, setActiveTab] = useState<
		"master" | "cohort" | "diagnostics" | "table"
	>("master");
	const [selectedFacultyId, setSelectedFacultyId] = useState<string>("ALL");
	const [selectedDepartmentId, setSelectedDepartmentId] =
		useState<string>("ALL");
	const [selectedProgramId, setSelectedProgramId] = useState<string>("");
	const [selectedLevel, setSelectedLevel] = useState<number | "ALL">(100);

	// 1. Fetch the exam optimizer run data
	const {
		data: run,
		isLoading: isRunLoading,
		refetch: refetchRun,
	} = useQuery<ExamOptimizerResult>({
		queryKey: ["exam-optimizer-run", runId],
		queryFn: () => getExamOptimizerRun(runId),
		enabled: Boolean(runId),
	});

	// 2. Fetch user's access permissions for this scope & semester
	const { data: access } = useQuery({
		queryKey: [
			"exam-optimizer-access",
			run?.semester_id,
			run?.scope_type,
			run?.scope_id,
		],
		queryFn: () =>
			getExamOptimizerAccess(
				run!.semester_id!,
				run!.scope_type!,
				run!.scope_id!,
			),
		enabled: Boolean(run?.semester_id && run?.scope_type && run?.scope_id),
	});

	// 3. Fetch hierarchy data for scope filters and lookups
	const { data: allFaculties = [] } = useQuery<Faculty[]>({
		queryKey: ["faculties"],
		queryFn: getFacultiesList,
	});

	const { data: allDepartments = [] } = useQuery<Department[]>({
		queryKey: ["departments"],
		queryFn: getDepartmentsList,
	});

	const { data: allPrograms = [] } = useQuery<Program[]>({
		queryKey: ["programs"],
		queryFn: () => getPrograms(),
	});

	// 4. Fetch existing published timetable for this scope to detect overwrites
	const { data: existingPublishedTimetable } = useQuery({
		queryKey: [
			"scheduling",
			"exam-optimizer-published-scope",
			run?.semester_id,
			run?.scope_type,
			run?.scope_id,
		],
		queryFn: () =>
			getOptimizedExamTimetable(
				run!.semester_id!,
				run!.scope_type!,
				run!.scope_id!,
			),
		enabled: Boolean(run?.semester_id && run?.scope_type && run?.scope_id),
	});

	const existingPublishedInfo =
		existingPublishedTimetable?.run_id &&
		String(existingPublishedTimetable.run_id) !== String(run?.run_id)
			? {
					hasExisting: true,
					runId: String(existingPublishedTimetable.run_id),
					eventsCount: existingPublishedTimetable.events?.length ?? 0,
					sourceScopeType:
						existingPublishedTimetable.source_scope_type ?? undefined,
				}
			: null;

	// Determine management rights: access.can_optimize or admin role
	const canManage = Boolean(
		access?.can_optimize ||
			currentUser?.role === "admin" ||
			currentUser?.adminLevel === "school" ||
			currentUser?.adminLevel === "system",
	);

	// 4. Mutations: Approve and Publish
	const approveMutation = useMutation({
		mutationFn: () => approveExamOptimizerRun(runId),
		onSuccess: async () => {
			toast.success("Exam timetable approved successfully.");
			await queryClient.invalidateQueries({
				queryKey: ["exam-optimizer-run", runId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["exam-optimizer-runs"],
			});
			refetchRun();
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.detail || "Could not approve exam timetable.",
			);
		},
	});

	const publishMutation = useMutation({
		mutationFn: () => publishExamOptimizerRun(runId),
		onSuccess: async () => {
			toast.success("Exam timetable published to live schedule!");
			await queryClient.invalidateQueries({
				queryKey: ["exam-optimizer-run", runId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["exam-optimizer-runs"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["scheduling", "exam-optimizer"],
			});
			refetchRun();
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.detail || "Could not publish exam timetable.",
			);
		},
	});

	// Auto-initialize filters based on run scope
	useEffect(() => {
		if (!run) return;

		if (run.scope_type === "faculty" && run.scope_id) {
			setSelectedFacultyId(String(run.scope_id));
		} else if (run.scope_type === "department" && run.scope_id) {
			setSelectedDepartmentId(String(run.scope_id));
			const dept = allDepartments.find((d) => String(d.id) === String(run.scope_id));
			if (dept?.facultyId) {
				setSelectedFacultyId(String(dept.facultyId));
			}
		}
	}, [run, allDepartments]);

	// Auto-select initial program if none selected
	useEffect(() => {
		if (selectedProgramId || allPrograms.length === 0) return;

		// If a department is selected, choose its default program (or first)
		if (selectedDepartmentId && selectedDepartmentId !== "ALL") {
			const deptPrograms = allPrograms.filter(
				(p) => String(p.departmentId) === String(selectedDepartmentId),
			);
			const defaultProg = deptPrograms.find((p) => p.isDefault) || deptPrograms[0];
			if (defaultProg) {
				setSelectedProgramId(String(defaultProg.id));
				return;
			}
		}

		// Otherwise check events in run
		if (run?.events && run.events.length > 0) {
			const firstEventWithProgram = run.events.find((e) => e.program_id);
			if (firstEventWithProgram?.program_id) {
				setSelectedProgramId(String(firstEventWithProgram.program_id));
				return;
			}
		}

		// Fallback to default program
		const defaultProg = allPrograms.find((p) => p.isDefault) || allPrograms[0];
		if (defaultProg) {
			setSelectedProgramId(String(defaultProg.id));
		}
	}, [selectedProgramId, selectedDepartmentId, allPrograms, run]);

	return (
		<ExamOptimizerRunInspectionView
			run={run || null}
			isLoading={isRunLoading}
			canManage={canManage}
			isApproving={approveMutation.isPending}
			onApprove={() => approveMutation.mutate()}
			isPublishing={publishMutation.isPending}
			onPublish={() => publishMutation.mutate()}
			onRefetch={refetchRun}
			faculties={allFaculties}
			selectedFacultyId={selectedFacultyId}
			onSelectFaculty={setSelectedFacultyId}
			departments={allDepartments}
			selectedDepartmentId={selectedDepartmentId}
			onSelectDepartment={setSelectedDepartmentId}
			programs={allPrograms}
			selectedProgramId={selectedProgramId}
			onSelectProgram={setSelectedProgramId}
			selectedLevel={selectedLevel}
			onSelectLevel={setSelectedLevel}
			activeTab={activeTab}
			onTabChange={setActiveTab}
			currentUser={currentUser}
			existingPublishedInfo={existingPublishedInfo}
		/>
	);
}
