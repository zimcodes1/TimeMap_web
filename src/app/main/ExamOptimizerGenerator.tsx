import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Clock3, History, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getSemesters } from "@/api/main/semestersAPI";
import { getSchoolsList, getFacultiesList, getDepartmentsList } from "@/api/main/hierarchyAPI";
import { getExamOptimizerAccess, getExamOptimizerRuns, optimizeExamTimetable } from "@/api/main/examOptimizerAPI";
import { useAuth } from "@/hooks/useAuth";

type Scope = "school" | "faculty" | "department";

export default function ExamOptimizerGenerator() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isSchoolAdmin = user?.role === "admin" && user.adminLevel === "school";
	const isFacultyAdmin = user?.role === "admin" && user.adminLevel === "faculty";
	const isDepartmentAdmin = user?.role === "admin" && user.adminLevel === "department";
	const isSystemAdmin = user?.role === "admin" && (user.adminLevel === "system" || user.adminLevel === "university");
	const [scopeType, setScopeType] = useState<Scope>(isDepartmentAdmin ? "department" : isFacultyAdmin ? "faculty" : "school");
	const [scopeId, setScopeId] = useState("");
	const [semesterId, setSemesterId] = useState("");
	const semesters = useQuery({ queryKey: ["semesters"], queryFn: () => getSemesters() });
	const schools = useQuery({ queryKey: ["schools"], queryFn: getSchoolsList });
	const faculties = useQuery({ queryKey: ["faculties"], queryFn: getFacultiesList });
	const departments = useQuery({ queryKey: ["departments"], queryFn: getDepartmentsList });
	const semester = semesters.data?.find((item) => String(item.id) === semesterId) || semesters.data?.find((item) => item.isActive) || semesters.data?.[0];
	const availableScopes = useMemo(() => scopeType === "school" ? schools.data || [] : scopeType === "faculty" ? faculties.data || [] : departments.data || [], [scopeType, schools.data, faculties.data, departments.data]);
	const preferredScopeId = scopeType === "school" ? (isSchoolAdmin ? user?.adminScopeId || user?.schoolId : user?.schoolId) : scopeType === "faculty" ? (isFacultyAdmin ? user?.adminScopeId || user?.facultyId : "") : (isDepartmentAdmin ? user?.adminScopeId || user?.departmentId : "");
	const effectiveScopeId = scopeId || preferredScopeId || String(availableScopes[0]?.id || "");
	useEffect(() => { if (semester?.id && !semesterId) setSemesterId(String(semester.id)); }, [semester?.id, semesterId]);
	useEffect(() => {
		if (isDepartmentAdmin) { setScopeType("department"); setScopeId(String(user?.adminScopeId || user?.departmentId || "")); }
		else if (isFacultyAdmin) { setScopeType("faculty"); setScopeId(String(user?.adminScopeId || user?.facultyId || "")); }
		else if (isSchoolAdmin) { setScopeType("school"); setScopeId(String(user?.adminScopeId || user?.schoolId || "")); }
	}, [isDepartmentAdmin, isFacultyAdmin, isSchoolAdmin, user?.adminScopeId, user?.departmentId, user?.facultyId, user?.schoolId]);
	useEffect(() => { if (!scopeId && effectiveScopeId) setScopeId(String(effectiveScopeId)); }, [effectiveScopeId, scopeId]);
	const access = useQuery({ queryKey: ["exam-optimizer-access", semester?.id, scopeType, effectiveScopeId], queryFn: () => getExamOptimizerAccess(semester!.id, scopeType, effectiveScopeId), enabled: Boolean(semester?.id && effectiveScopeId) });
	const runs = useQuery({ queryKey: ["exam-optimizer-runs", semester?.id], queryFn: () => getExamOptimizerRuns(semester?.id), enabled: Boolean(semester?.id) });
	const generate = useMutation({
		mutationFn: () => optimizeExamTimetable(semester!.id, scopeType, effectiveScopeId),
		onSuccess: async (run) => { await queryClient.invalidateQueries({ queryKey: ["exam-optimizer-runs"] }); toast.success("Exam timetable draft generated. Review it before publishing."); navigate({ to: "/exams/generator/$runId", params: { runId: String(run.run_id) } }); },
		onError: (error: any) => toast.error(error?.response?.data?.detail || error.message || "Exam timetable generation failed."),
	});
	const lockedScope = isFacultyAdmin || isDepartmentAdmin;
	const scopeOptions = availableScopes.map((item: any) => ({ value: String(item.id), label: `${item.code || ""} ${item.name}`.trim() }));
	const scopeTypeOptions = (isSchoolAdmin || isSystemAdmin) ? [{ value: "school", label: "School" }, { value: "faculty", label: "Faculty" }, { value: "department", label: "Department" }] : [{ value: scopeType, label: scopeType[0].toUpperCase() + scopeType.slice(1) }];
	const canGenerate = Boolean(access.data?.can_optimize && semester?.examStartDate && semester?.examEndDate);
	return <div className="mx-auto max-w-6xl space-y-6 pb-12">
		<Link to="/exams" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary"><ArrowLeft size={15} /> Back to exam timetable</Link>
		<header><h1 className="text-2xl font-bold text-text-main">Exam Timetable Generator</h1><p className="mt-1 text-sm text-text-muted">Generate a draft for your authorized scope, inspect the allocation and metrics, then approve and publish it.</p></header>
		<section className="grid gap-5 rounded-2xl border border-border bg-surface p-5 md:grid-cols-2">
			<Select label="Semester" value={semester?.id || ""} onChange={(event) => setSemesterId(event.target.value)} options={(semesters.data || []).map((item) => ({ value: item.id, label: `${item.sessionLabel || ""} · ${item.displayName || item.name}` }))} />
			{!lockedScope && <Select label="Scope" value={scopeType} onChange={(event) => { setScopeType(event.target.value as Scope); setScopeId(""); }} options={scopeTypeOptions} />}
			<Select label={`${scopeType[0].toUpperCase() + scopeType.slice(1)} target`} value={effectiveScopeId} onChange={(event) => setScopeId(event.target.value)} options={scopeOptions} disabled={lockedScope} />
			<div className="flex items-end"><Button onClick={() => generate.mutate()} disabled={!canGenerate || generate.isPending} className="gap-2"><Sparkles size={16} />{generate.isPending ? "Generating draft…" : "Generate exam timetable"}</Button></div>
			{semester && (!semester.examStartDate || !semester.examEndDate) && <p className="text-sm text-amber-600 md:col-span-2">Set the semester examination period before generating a timetable.</p>}
			{access.isFetched && !access.data?.can_optimize && <p className="text-sm text-danger md:col-span-2">You do not have optimizer permission for this scope. Faculty and department generation requires the assigned exam officer or an unassigned scope admin.</p>}
		</section>
		<section className="rounded-2xl border border-border bg-surface p-5"><h2 className="mb-4 flex items-center gap-2 font-semibold"><History size={16} /> Recent runs</h2>{(runs.data || []).length ? <div className="divide-y divide-border">{runs.data!.map((run) => <Link key={run.run_id} to="/exams/generator/$runId" params={{ runId: String(run.run_id) }} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm hover:text-primary"><span>{run.scope_type} · {run.status} · {run.metrics?.courses_scheduled ?? run.events.length} courses scheduled</span><span className="flex items-center gap-2 text-xs text-text-muted"><Clock3 size={13} />{run.created_at ? new Date(run.created_at).toLocaleString() : ""}</span></Link>)}</div> : <p className="text-sm text-text-muted">No exam optimizer runs found for this semester.</p>}</section>
	</div>;
}
