import { useState, useMemo, useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getGenerationRun,
	publishGenerationRun,
} from "@/api/main/generationAPI";
import { getDepartmentsList } from "@/api/main/hierarchyAPI";
import { getPrograms } from "@/api/main/programsAPI";
import type { Department, Program, TimetableGenerationRun } from "@/types";
import type { DepartmentOption } from "@/components/schedules/generator/DepartmentLoopBar";
import ScheduleRunInspectionView from "@/pages/main/ScheduleRunInspectionView";

const route = getRouteApi("/_main/schedules_/generator_/$runId");

export default function ScheduleRunInspectionContainer() {
	const { runId } = route.useParams();
	const queryClient = useQueryClient();

	// State
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<
		string | number
	>("");
	const [selectedProgramId, setSelectedProgramId] = useState<string | number>(
		"ALL",
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

	// 2. Fetch hierarchy data for name and program lookups
	const { data: allDepartments = [] } = useQuery<Department[]>({
		queryKey: ["departments"],
		queryFn: getDepartmentsList,
	});

	const { data: allPrograms = [] } = useQuery<Program[]>({
		queryKey: ["programs"],
		queryFn: () => getPrograms(),
	});

	// 3. Resolve departments present in this run
	const runDepartments: DepartmentOption[] = useMemo(() => {
		if (
			!run ||
			!run.assignmentsPayload ||
			run.assignmentsPayload.length === 0
		) {
			// Fallback to all departments if assignments payload is empty
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
				// Find matching dept in allDepartments
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

	// Initialize selectedDepartmentId when runDepartments loads
	useEffect(() => {
		if (runDepartments.length > 0 && !selectedDepartmentId) {
			setSelectedDepartmentId(runDepartments[0].id);
		}
	}, [runDepartments, selectedDepartmentId]);

	// 4. Resolve programs belonging to selected department
	const departmentPrograms = useMemo(() => {
		if (!selectedDepartmentId) return [];
		return allPrograms.filter(
			(p) => String(p.departmentId) === String(selectedDepartmentId),
		);
	}, [allPrograms, selectedDepartmentId]);

	// When department changes, update selectedProgramId
	const handleSelectDepartment = (deptId: string | number) => {
		setSelectedDepartmentId(deptId);
		const progs = allPrograms.filter(
			(p) => String(p.departmentId) === String(deptId),
		);
		if (progs.length > 0) {
			setSelectedProgramId(progs[0].id);
		} else {
			setSelectedProgramId("ALL");
		}
	};

	// When program changes, reset level if current level exceeds program's maxLevel
	const handleSelectProgram = (progId: string | number) => {
		setSelectedProgramId(progId);
		if (progId !== "ALL") {
			const prog = departmentPrograms.find(
				(p) => String(p.id) === String(progId),
			);
			if (prog && prog.maxLevel && selectedLevel > prog.maxLevel) {
				setSelectedLevel(100);
			}
		}
	};

	// 5. Publish Mutation
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
			departments={runDepartments}
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
		/>
	);
}
