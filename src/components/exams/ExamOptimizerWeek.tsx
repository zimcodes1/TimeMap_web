import type { OptimizedExamEvent } from "@/api/main/examOptimizerAPI";

interface Props { events: OptimizedExamEvent[]; weekStart: string; weekEnd: string; level: number | "ALL"; programId: string; departmentId?: string; }

export function ExamOptimizerWeek({ events, weekStart, weekEnd, level, programId, departmentId = "ALL" }: Props) {
	const rows = events.filter((event) => event.date >= weekStart && event.date <= weekEnd)
		.filter((event) => level === "ALL" || event.course_level === level)
		.filter((event) => programId === "ALL" || event.program_id == null || String(event.program_id) === programId)
		.filter((event) => departmentId === "ALL" || event.department_id == null || String(event.department_id) === departmentId)
		.sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time) || a.course_code.localeCompare(b.course_code));
	if (!rows.length) return <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-muted">No optimized exams are scheduled for this week.</div>;
	return <div className="space-y-3">{rows.map((event) => <article key={`${event.course_id}-${event.date}`} className="rounded-xl border border-border bg-surface p-4">
		<div className="flex flex-wrap items-start justify-between gap-3"><div><div className="font-semibold text-text-main">{event.course_code} · {event.course_title}</div><div className="mt-1 text-xs text-text-muted">{event.date} · {event.start_time.slice(0, 5)}–{event.end_time.slice(0, 5)} · {event.course_level}L{event.department_name ? ` · ${event.department_name}` : ""}{event.program_name ? ` · ${event.program_name}` : ""}</div></div><span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{event.exam_type.replace("_", " ")}</span></div>
		<div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted"><span>{event.student_count} candidates · {event.duration_minutes} min</span>{event.joined_courses.length > 0 && <span>Shared period with {event.joined_courses.join(", ")}</span>}{event.venues.map((venue) => <span key={venue.venue_id}>{venue.venue_name}: {venue.students} students{venue.turns > 1 ? ` · ${venue.turns} turns` : ""}</span>)}</div>
		<p className="mt-2 text-xs text-text-muted">{event.explanation}</p>
	</article>)}</div>;
}
