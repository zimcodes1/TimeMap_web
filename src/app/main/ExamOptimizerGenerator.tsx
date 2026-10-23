import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSemesters } from "@/api/main/semestersAPI";
import {
	getSchoolsList,
	getFacultiesList,
	getDepartmentsList,
} from "@/api/main/hierarchyAPI";
import {
	getExamOptimizerAccess,
	getExamOptimizerRuns,
	optimizeExamTimetable,
	exportExamSchedulingProblem,
	type ExamOptimizerResult,
} from "@/api/main/examOptimizerAPI";
import { useAuth } from "@/hooks/useAuth";
import type { Semester, School, Faculty, Department } from "@/types";
import ExamOptimizerGeneratorView from "@/pages/main/ExamOptimizerGeneratorView";

type Scope = "school" | "faculty" | "department";

export default function ExamOptimizerGenerator() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const isSchoolAdmin =
		user?.role === "admin" &&
		(user.adminLevel === "school" || user.adminLevel === "system" || user.adminLevel === "university");
	const isFacultyAdmin =
		user?.role === "admin" && user.adminLevel === "faculty";
	const isDeptAdmin =
		user?.role === "admin" && user.adminLevel === "department";

	// Default scope based on user role
	const [scopeType, setScopeType] = useState<Scope>(
		isDeptAdmin ? "department" : isFacultyAdmin ? "faculty" : "school",
	);
	const [scopeId, setScopeId] = useState("");
	const [semesterId, setSemesterId] = useState("");
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	// Queries
	const { data: semesters = [] } = useQuery<Semester[]>({
		queryKey: ["semesters"],
		queryFn: () => getSemesters(),
	});

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

	// Active semester resolution
	const activeSemester = useMemo(() => {
		if (semesterId) {
			const found = semesters.find((s) => String(s.id) === String(semesterId));
			if (found) return found;
		}
		return semesters.find((s) => s.isActive) || semesters[0];
	}, [semesters, semesterId]);

	useEffect(() => {
		if (activeSemester?.id && !semesterId) {
			setSemesterId(String(activeSemester.id));
		}
	}, [activeSemester, semesterId]);

	const preferredScopeId = useMemo(() => {
		if (scopeType === "school") {
			return user?.adminScopeId || user?.schoolId || (schools[0] ? String(schools[0].id) : "");
		}
		if (scopeType === "faculty") {
			return isFacultyAdmin
				? user?.adminScopeId || user?.facultyId || ""
				: faculties[0]
					? String(faculties[0].id)
					: "";
		}
		return isDeptAdmin
			? user?.adminScopeId || user?.departmentId || ""
			: departments[0]
				? String(departments[0].id)
				: "";
	}, [scopeType, isSchoolAdmin, isFacultyAdmin, isDeptAdmin, user, schools, faculties, departments]);

	useEffect(() => {
		if (!scopeId && preferredScopeId) {
			setScopeId(String(preferredScopeId));
		}
	}, [preferredScopeId, scopeId]);

	// Optimizer Access Query
	const accessQuery = useQuery({
		queryKey: ["exam-optimizer-access", activeSemester?.id, scopeType, scopeId],
		queryFn: () => getExamOptimizerAccess(activeSemester!.id, scopeType, scopeId),
		enabled: Boolean(activeSemester?.id && scopeId),
	});

	// Optimizer Runs Query
	const runsQuery = useQuery<ExamOptimizerResult[]>({
		queryKey: ["exam-optimizer-runs", activeSemester?.id],
		queryFn: () => getExamOptimizerRuns(activeSemester?.id),
		enabled: Boolean(activeSemester?.id),
	});

	const runs = runsQuery.data || [];

	// Existing run for selected scope & semester
	const existingRunForScope = useMemo(() => {
		if (!scopeId || !scopeType) return null;
		return runs.find(
			(r) =>
				String(r.scope_type) === String(scopeType) &&
				String(r.scope_id) === String(scopeId),
		);
	}, [runs, scopeType, scopeId]);

	// Generation Mutation
	const generateMutation = useMutation({
		mutationFn: () =>
			optimizeExamTimetable(activeSemester!.id, scopeType, scopeId),
		onSuccess: async (run) => {
			await queryClient.invalidateQueries({ queryKey: ["exam-optimizer-runs"] });
			toast.success("Exam timetable draft generated successfully!");
			navigate({
				to: "/exams/generator/$runId",
				params: { runId: String(run.run_id) },
			});
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.detail ||
					error.message ||
					"Exam timetable generation failed.",
			);
		},
	});

	const canOptimize =
		isSchoolAdmin || Boolean(accessQuery.data?.can_optimize);

	const handleExportProblem = async (format: "json" | "csv" = "json") => {
		if (!activeSemester?.id || !scopeId) {
			toast.error(
				"Please select a target semester and scope before exporting.",
			);
			return;
		}
		setIsExporting(true);
		const toastId = toast.loading(
			`Exporting exam scheduling problem dataset (${format.toUpperCase()})...`,
		);
		try {
			const data = await exportExamSchedulingProblem({
				semester_id: activeSemester.id,
				scope_type: scopeType,
				scope_id: scopeId,
				format,
			});

			const filename = `exam_scheduling_problem_${scopeType}_${scopeId}_semester_${activeSemester.id}.${format}`;
			if (format === "csv") {
				const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			} else {
				const blob = new Blob([JSON.stringify(data, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
			toast.success(
				`Exam problem dataset exported successfully as ${format.toUpperCase()}!`,
				{ id: toastId },
			);
		} catch (err: any) {
			const errorMsg =
				err?.response?.data?.detail ||
				err?.response?.data?.error ||
				err?.message ||
				"Failed to export exam scheduling problem.";
			toast.error(errorMsg, { id: toastId });
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<ExamOptimizerGeneratorView
			semesters={semesters}
			selectedSemesterId={semesterId}
			onSemesterChange={setSemesterId}
			selectedSemester={activeSemester}
			scopeType={scopeType}
			onScopeTypeChange={setScopeType}
			scopeId={scopeId}
			onScopeIdChange={setScopeId}
			schools={schools}
			faculties={faculties}
			departments={departments}
			canOptimize={canOptimize}
			isGenerating={generateMutation.isPending}
			onGenerate={() => generateMutation.mutate()}
			isSchoolAdmin={isSchoolAdmin}
			isFacultyAdmin={isFacultyAdmin}
			isDeptAdmin={isDeptAdmin}
			runs={runs}
			isRunsLoading={runsQuery.isLoading}
			existingRunForScope={existingRunForScope}
			isHistoryOpen={isHistoryOpen}
			onOpenHistory={() => setIsHistoryOpen(true)}
			onCloseHistory={() => setIsHistoryOpen(false)}
			onExportProblem={handleExportProblem}
			isExporting={isExporting}
		/>
	);
}
