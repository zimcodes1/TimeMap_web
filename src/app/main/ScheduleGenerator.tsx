import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSemesters } from "@/api/main/semestersAPI";
import {
	getSchoolsList,
	getFacultiesList,
	getDepartmentsList,
} from "@/api/main/hierarchyAPI";
import {
	getGenerationPermissions,
	getGenerationRuns,
	getGenerationRunDetail,
	generateTimetable,
	publishGenerationRun,
} from "@/api/main/generationAPI";
import type {
	Semester,
	School,
	Faculty,
	Department,
	TimetableGenerationRun,
	GenerateTimetablePayload,
	GenerationScopePermission,
} from "@/types";
import { useAuth } from "@/hooks/useAuth";
import ScheduleGeneratorView from "@/pages/main/ScheduleGeneratorView";
import { GenerationHistoryModal } from "@/components/schedules/GenerationHistoryModal";
import { GenerationPermissionsModal } from "@/components/schedules/GenerationPermissionsModal";
import { OverwriteWarningModal } from "@/components/schedules/generator/OverwriteWarningModal";

export default function ScheduleGeneratorContainer() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useAuth();

	const isSuperuser =
		user?.role === "admin" && user?.adminLevel === "university";
	const isSchoolAdmin = user?.role === "admin" && user?.adminLevel === "school";
	const isFacultyAdmin =
		user?.role === "admin" && user?.adminLevel === "faculty";
	const isDeptAdmin =
		user?.role === "admin" && user?.adminLevel === "department";

	const userSchoolId = user?.adminScopeId || user?.schoolId;

	// State
	const [semesterId, setSemesterId] = useState<string>("");
	const [scopeType, setScopeType] = useState<
		"school" | "faculty" | "department"
	>("school");
	const [scopeId, setScopeId] = useState<string>("");

	// Hyperparameters (defaults aligned with fast and accurate convergence)
	const [populationSize, setPopulationSize] = useState<number>(60);
	const [maxGenerations, setMaxGenerations] = useState<number>(150);
	const [mutationRate, setMutationRate] = useState<number>(0.08);
	const [stagnationLimit, setStagnationLimit] = useState<number>(40);

	// Modals & Active run
	const [activeRun, setActiveRun] = useState<TimetableGenerationRun | null>(
		null,
	);
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
	const [pendingGeneratePayload, setPendingGeneratePayload] =
		useState<GenerateTimetablePayload | null>(null);
	const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);

	// Fetch detailed run data (conflict_report, assignments_payload) for the active run
	const activeRunId = activeRun?.id;
	const { data: detailedActiveRun } = useQuery<TimetableGenerationRun>({
		queryKey: ["scheduling", "generationRunDetail", activeRunId],
		queryFn: () => getGenerationRunDetail(activeRunId!),
		enabled: Boolean(activeRunId),
	});

	const currentRun = detailedActiveRun || activeRun;

	// Base Data Queries
	const { data: semesters = [] } = useQuery<Semester[]>({
		queryKey: ["semesters"],
		queryFn: () => getSemesters(),
	});

	const activeSemester = useMemo(
		() =>
			(semesters as Semester[]).find((s) => s.isActive) ||
			(semesters as Semester[])[0],
		[semesters],
	);

	const { data: schools = [] } = useQuery<School[]>({
		queryKey: ["schools"],
		queryFn: getSchoolsList,
	});

	const { data: faculties = [] } = useQuery<Faculty[]>({
		queryKey: ["faculties"],
		queryFn: getFacultiesList,
	});

	const { data: departments = [] } = useQuery<Department[]>({
		queryKey: ["departments"],
		queryFn: getDepartmentsList,
	});

	// Effective school ID
	const effectiveSchoolId =
		userSchoolId || activeSemester?.schoolId || schools[0]?.id;

	// Generation permissions query
	const { data: permissions } = useQuery<GenerationScopePermission>({
		queryKey: ["scheduling", "generationPermissions", effectiveSchoolId],
		queryFn: () => getGenerationPermissions(effectiveSchoolId),
		enabled: Boolean(effectiveSchoolId),
	});

	// History runs query to auto-load latest run if no active run yet
	const { data: pastRuns = [] } = useQuery<TimetableGenerationRun[]>({
		queryKey: [
			"scheduling",
			"generationRuns",
			semesterId || activeSemester?.id,
		],
		queryFn: () =>
			getGenerationRuns({
				semester: semesterId || activeSemester?.id,
			}),
		enabled: Boolean(semesterId || activeSemester?.id),
	});

	// Initialize active run from past runs if available and not yet set
	useEffect(() => {
		if (!activeRun && pastRuns.length > 0) {
			setActiveRun(pastRuns[0]);
		}
	}, [pastRuns, activeRun]);

	// Initialize semester
	useEffect(() => {
		if (activeSemester?.id && !semesterId) {
			setSemesterId(activeSemester.id);
		}
	}, [activeSemester, semesterId]);

	// Initialize scope based on user role
	useEffect(() => {
		if (isSchoolAdmin) {
			setScopeType("school");
			const sId = user?.adminScopeId || user?.schoolId || schools[0]?.id || "";
			setScopeId(String(sId));
		} else if (isFacultyAdmin) {
			setScopeType("faculty");
			const fId =
				user?.adminScopeId || user?.facultyId || faculties[0]?.id || "";
			setScopeId(String(fId));
		} else if (isDeptAdmin) {
			setScopeType("department");
			const dId =
				user?.adminScopeId || user?.departmentId || departments[0]?.id || "";
			setScopeId(String(dId));
		} else if (isSuperuser && schools.length > 0 && !scopeId) {
			setScopeType("school");
			setScopeId(schools[0].id);
		}
	}, [
		isSchoolAdmin,
		isFacultyAdmin,
		isDeptAdmin,
		isSuperuser,
		user,
		schools,
		faculties,
		departments,
		scopeId,
	]);

	const handleScopeTypeChange = (
		newType: "school" | "faculty" | "department",
	) => {
		setScopeType(newType);
		if (newType === "school") {
			setScopeId(user?.schoolId || schools[0]?.id || "");
		} else if (newType === "faculty") {
			setScopeId(faculties[0]?.id || "");
		} else {
			setScopeId(departments[0]?.id || "");
		}
	};

	// Permissions check
	const allowFaculty = Boolean(permissions?.allowFacultyGeneration);
	const allowDept = Boolean(permissions?.allowDepartmentGeneration);

	const hasPermission = () => {
		if (isSuperuser || isSchoolAdmin) return true;
		if (isFacultyAdmin && allowFaculty) return true;
		if (isDeptAdmin && allowDept) return true;
		return false;
	};

	const getPermissionNotice = () => {
		if (isFacultyAdmin && !allowFaculty) {
			return "Faculty-level generation is currently disabled by system policy. Only school-level admins can run timetable generation.";
		}
		if (isDeptAdmin && !allowDept) {
			return "Department-level generation is currently disabled by system policy. Only school-level admins can run timetable generation.";
		}
		return null;
	};

	// Scope label for display
	const scopeLabel = useMemo(() => {
		if (scopeType === "school") {
			const s = schools.find((sch) => String(sch.id) === String(scopeId));
			return s ? `${s.code} - ${s.name}` : "School-Wide";
		}
		if (scopeType === "faculty") {
			const f = faculties.find((fac) => String(fac.id) === String(scopeId));
			return f ? `${f.code} - ${f.name}` : "Faculty Scoped";
		}
		if (scopeType === "department") {
			const d = departments.find((dept) => String(dept.id) === String(scopeId));
			return d ? `${d.code} - ${d.name}` : "Department Scoped";
		}
		return "Custom Scope";
	}, [scopeType, scopeId, schools, faculties, departments]);

	// Generate Mutation
	const generateMutation = useMutation({
		mutationFn: (payload: GenerateTimetablePayload) =>
			generateTimetable(payload),
		onSuccess: (run) => {
			toast.success(
				"Weekly timetable generated successfully! Opening inspection...",
			);
			setActiveRun(run);
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "generationRuns"],
			});
			navigate({
				to: "/schedules/generator/$runId",
				params: { runId: run.id },
			});
		},
		onError: (err: any) => {
			const errorMsg =
				err?.response?.data?.error ||
				err?.response?.data?.detail ||
				err?.message ||
				"Failed to generate timetable.";
			toast.error(errorMsg);
		},
	});

	// Check if an active published timetable already exists in the selected scope
	const effectiveSemesterId = semesterId || activeSemester?.id;
	const existingPublishedRun = useMemo(() => {
		return pastRuns.find(
			(r) =>
				r.isPublished &&
				String(r.semesterId) === String(effectiveSemesterId) &&
				r.scopeType === scopeType &&
				String(r.scopeId) === String(scopeId),
		);
	}, [pastRuns, effectiveSemesterId, scopeType, scopeId]);

	const handleConfirmOverwriteGenerate = () => {
		if (pendingGeneratePayload) {
			generateMutation.mutate(pendingGeneratePayload);
		}
		setIsOverwriteModalOpen(false);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const currentSemesterId =
			semesterId ||
			activeSemester?.id ||
			(semesters as Semester[])[0]?.id ||
			"";
		if (!currentSemesterId) {
			toast.error("Please select an academic semester.");
			return;
		}

		const effectiveScopeId =
			scopeId ||
			(scopeType === "school"
				? activeSemester?.schoolId || user?.schoolId || schools[0]?.id
				: scopeType === "faculty"
					? faculties[0]?.id
					: departments[0]?.id) ||
			"";

		if (!effectiveScopeId) {
			toast.error("Please select a target scope.");
			return;
		}

		const payload: GenerateTimetablePayload = {
			semester: currentSemesterId,
			semester_id: currentSemesterId,
			scope_type: scopeType,
			scope_id: effectiveScopeId,
			population_size: Number(populationSize) || 60,
			max_generations: Number(maxGenerations) || 150,
			mutation_rate: Number(mutationRate) || 0.08,
			stagnation_limit: Number(stagnationLimit) || 40,
			publish_immediately: false,
		};

		if (existingPublishedRun) {
			setPendingGeneratePayload(payload);
			setIsOverwriteModalOpen(true);
			return;
		}

		generateMutation.mutate(payload);
	};

	// Publish Mutation
	const publishMutation = useMutation({
		mutationFn: (runId: string) => publishGenerationRun(runId),
		onSuccess: (result) => {
			toast.success(
				`Timetable published! ${result.entries_created} recurring entries created, ${result.sessions_materialized} lecture sessions materialized.`,
			);
			if (activeRun) {
				setActiveRun({
					...activeRun,
					isPublished: true,
				});
			}
			queryClient.invalidateQueries({ queryKey: ["timetableEntries"] });
			queryClient.invalidateQueries({ queryKey: ["lectureSessions"] });
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "generationRuns"],
			});
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
		<>
			<ScheduleGeneratorView
				semesters={semesters}
				semesterId={semesterId}
				onSemesterChange={setSemesterId}
				scopeType={scopeType}
				onScopeTypeChange={handleScopeTypeChange}
				scopeId={scopeId}
				onScopeIdChange={setScopeId}
				schools={schools}
				faculties={faculties}
				departments={departments}
				populationSize={populationSize}
				onPopulationSizeChange={setPopulationSize}
				maxGenerations={maxGenerations}
				onMaxGenerationsChange={setMaxGenerations}
				mutationRate={mutationRate}
				onMutationRateChange={setMutationRate}
				stagnationLimit={stagnationLimit}
				onStagnationLimitChange={setStagnationLimit}
				isGenerating={generateMutation.isPending}
				onSubmit={handleSubmit}
				activeRun={currentRun}
				onPublishRun={(id) => publishMutation.mutate(id)}
				isPublishing={publishMutation.isPending}
				onOpenHistory={() => setIsHistoryOpen(true)}
				onOpenPermissions={() => setIsPermissionsOpen(true)}
				isSuperuser={Boolean(isSuperuser)}
				isSchoolAdmin={Boolean(isSchoolAdmin)}
				hasPermission={hasPermission()}
				permissionNotice={getPermissionNotice()}
				scopeLabel={scopeLabel}
			/>

			{/* Overwrite Warning Modal */}
			<OverwriteWarningModal
				isOpen={isOverwriteModalOpen}
				onClose={() => setIsOverwriteModalOpen(false)}
				onConfirm={handleConfirmOverwriteGenerate}
				semesterName={activeSemester?.name}
				scopeLabel={scopeLabel}
				isGenerating={generateMutation.isPending}
			/>

			{/* Generation History Modal */}
			<GenerationHistoryModal
				isOpen={isHistoryOpen}
				onClose={() => setIsHistoryOpen(false)}
				semesterId={semesterId || activeSemester?.id}
				onSelectRun={(run) => {
					setIsHistoryOpen(false);
					navigate({
						to: "/schedules/generator/$runId",
						params: { runId: run.id },
					});
				}}
			/>

			{/* Permissions Modal (Superuser) */}
			{isSuperuser && (
				<GenerationPermissionsModal
					isOpen={isPermissionsOpen}
					onClose={() => setIsPermissionsOpen(false)}
					schoolId={effectiveSchoolId}
				/>
			)}
		</>
	);
}
