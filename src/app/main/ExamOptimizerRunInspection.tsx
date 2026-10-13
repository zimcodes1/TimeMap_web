import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, CircleAlert, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OptimizedExamEvent } from "@/api/main/examOptimizerAPI";
import { getExamOptimizerAccess, getExamOptimizerRun, approveExamOptimizerRun, publishExamOptimizerRun } from "@/api/main/examOptimizerAPI";

const METRIC_LABELS: Record<string, string> = {
	courses_total: "Courses in scope", courses_scheduled: "Scheduled", courses_unscheduled: "Unscheduled",
	hard_conflicts: "Hard conflicts", student_conflicts: "Student conflicts", venue_conflicts: "Venue conflicts",
	venue_allocations: "Venue allocations", venues_used: "Venues used", average_venue_utilization: "Average venue use",
	active_exam_days: "Exam days", joined_sessions: "Joined periods", runtime_seconds: "Runtime (seconds)", result_status: "Result",
	cbt_turns: "CBT turns", maximum_exams_per_student_per_week: "Max exams/student/week", students_over_three_exams_per_week: "Students over 3/week",
	average_exams_per_student_week: "Average weekly load", maximum_exams_per_student_per_day: "Max exams/student/day",
	candidate_windows_evaluated: "Time candidates evaluated", events_with_registration_membership: "Exact student cohorts", events_using_population_estimates: "Estimated cohorts",
};

export default function ExamOptimizerRunInspection() {
	const { runId } = useParams({ from: "/_main/exams_/generator_/$runId" });
	const queryClient = useQueryClient();
	const run = useQuery({ queryKey: ["exam-optimizer-run", runId], queryFn: () => getExamOptimizerRun(runId) });
	const access = useQuery({ queryKey: ["exam-optimizer-access", run.data?.semester_id, run.data?.scope_type, run.data?.scope_id], queryFn: () => getExamOptimizerAccess(run.data!.semester_id!, run.data!.scope_type!, run.data!.scope_id!), enabled: Boolean(run.data?.semester_id) });
	const approve = useMutation({ mutationFn: () => approveExamOptimizerRun(runId), onSuccess: async () => { toast.success("Exam timetable approved."); await queryClient.invalidateQueries({ queryKey: ["exam-optimizer-run", runId] }); await queryClient.invalidateQueries({ queryKey: ["exam-optimizer-runs"] }); run.refetch(); } , onError: (error: any) => toast.error(error?.response?.data?.detail || "Could not approve exam timetable.") });
	const publish = useMutation({ mutationFn: () => publishExamOptimizerRun(runId), onSuccess: async () => { toast.success("Exam timetable published."); await queryClient.invalidateQueries({ queryKey: ["exam-optimizer-run", runId] }); await queryClient.invalidateQueries({ queryKey: ["exam-optimizer-runs"] }); await queryClient.invalidateQueries({ queryKey: ["scheduling", "exam-optimizer"] }); run.refetch(); }, onError: (error: any) => toast.error(error?.response?.data?.detail || "Could not publish exam timetable.") });
	const data = run.data;
	const metrics = data?.metrics || {};
	const canManage = Boolean(access.data?.can_optimize);
	const metricEntries = Object.entries(METRIC_LABELS).filter(([key]) => metrics[key] !== undefined);
	const grouped = (data?.events || []).reduce<Record<string, OptimizedExamEvent[]>>((acc, event) => { (acc[event.date] ||= []).push(event); return acc; }, {});
	return <div className="mx-auto max-w-7xl space-y-6 pb-12">
		<Link to="/exams/generator" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary"><ArrowLeft size={15} /> Back to generator</Link>
		{run.isLoading ? <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-text-muted">Loading optimizer run…</div> : !data ? <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-text-muted">Exam optimizer run not found or access was denied.</div> : <>
			<header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-text-main">Inspect Exam Timetable</h1><p className="mt-1 text-sm text-text-muted">{data.scope_type} scope · Semester #{data.semester_id} · Run {String(data.run_id).slice(0, 8)}</p><p className="mt-1 text-xs text-text-muted">Created {data.created_at ? new Date(data.created_at).toLocaleString() : ""}{data.approved_at ? ` · Approved ${new Date(data.approved_at).toLocaleString()}` : ""}{data.published_at ? ` · Published ${new Date(data.published_at).toLocaleString()}` : ""}</p></div><div className="flex flex-wrap items-center gap-2"><Badge variant={data.status === "published" ? "success" : data.status === "approved" ? "info" : "warning"}>{data.status}</Badge>{canManage && data.status === "draft" && <Button variant="outline" onClick={() => approve.mutate()} disabled={approve.isPending} className="gap-2"><CheckCircle2 size={15} />{approve.isPending ? "Approving…" : "Approve run"}</Button>}{canManage && data.status === "approved" && <Button onClick={() => publish.mutate()} disabled={publish.isPending} className="gap-2"><UploadCloud size={15} />{publish.isPending ? "Publishing…" : "Publish timetable"}</Button>}</div></header>
			<section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">{metricEntries.map(([key, label]) => <div key={key} className="rounded-xl border border-border bg-surface p-4"><div className="text-xs text-text-muted">{label}</div><div className="mt-1 text-xl font-bold text-text-main">{key === "average_venue_utilization" ? `${(Number(metrics[key]) * 100).toFixed(1)}%` : metrics[key]}</div></div>)}</section>
			{data.diagnostics.unscheduled?.length ? <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><h2 className="mb-2 flex items-center gap-2 font-semibold text-amber-700"><CircleAlert size={16} />Unscheduled courses</h2><ul className="space-y-1 text-sm">{data.diagnostics.unscheduled.map((item) => <li key={item.course_code}><b>{item.course_code}</b> · {item.reason}</li>)}</ul></section> : <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700">All courses were scheduled and the independent constraint validation passed.</div>}
			<section className="space-y-4"><h2 className="text-lg font-semibold">Exam allocation preview</h2>{Object.entries(grouped).map(([date, events]) => <div key={date} className="rounded-2xl border border-border bg-surface p-4"><h3 className="mb-3 font-semibold">{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3><div className="space-y-3">{events?.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((event) => <article key={`${event.course_id}-${event.date}`} className="rounded-xl border border-border/70 p-4"><div className="flex flex-wrap justify-between gap-2"><div><b>{event.course_code}</b> · {event.course_title}<div className="mt-1 text-xs text-text-muted">{event.start_time.slice(0, 5)}–{event.end_time.slice(0, 5)} · {event.exam_type.replace("_", " ")} · {event.course_level}L · {event.student_count} students</div></div>{event.joined_courses.length > 0 && <Badge variant="info">Joined: {event.joined_courses.join(", ")}</Badge>}</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{event.venues.map((venue) => <div key={venue.venue_id} className="rounded-lg bg-surface-raised p-3 text-sm"><b>{venue.venue_name}</b><div className="text-xs text-text-muted">{venue.students} students · {venue.turns} turn{venue.turns === 1 ? "" : "s"}</div></div>)}</div><p className="mt-2 text-xs text-text-muted">{event.explanation}</p></article>)}</div></div>)}</section>
		</>}
	</div>;
}
