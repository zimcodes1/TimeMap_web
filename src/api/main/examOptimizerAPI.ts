import apiClient from "../apiClient";

export interface OptimizedExamEvent {
	course_id: number;
	course_code: string;
	course_title: string;
	course_level: number;
	program_id: number | null;
	program_name: string | null;
	department_id: number | null;
	department_name: string | null;
	exam_type: "written" | "cbt" | "lab_practical";
	student_count: number;
	date: string;
	start_time: string;
	end_time: string;
	duration_minutes: number;
	venues: Array<{ venue_id: number; venue_name: string; students: number; turns: number }>;
	joined_courses: string[];
	joined_session_id?: string;
	explanation: string;
}

export interface ExamOptimizerResult {
	run_id: string | number | null;
	semester_id?: number;
	scope_type?: string;
	scope_id?: number;
	status?: "draft" | "approved" | "published";
	events: OptimizedExamEvent[];
	diagnostics: { scheduled?: number; joined_sessions?: number; unscheduled?: Array<{ course_code: string; reason: string }>; validation?: { valid: boolean; errors: Array<{ course_code: string; reason: string }> } };
	metrics?: Record<string, number | string>;
	created_at?: string;
	approved_at?: string | null;
	approved_by?: number | null;
	published_at?: string | null;
	published_by?: number | null;
}

const params = (semester: string | number, scopeType: string, scopeId: string | number) => ({
	semester, scope_type: scopeType, scope_id: scopeId,
});

export async function getExamOptimizerAccess(semester: string | number, scopeType: string, scopeId: string | number) {
	const { data } = await apiClient.get<{ can_view: boolean; can_optimize: boolean }>("/scheduling/exam-optimizer/access/", { params: params(semester, scopeType, scopeId) });
	return data;
}

export async function getOptimizedExamTimetable(semester: string | number, scopeType: string, scopeId: string | number) {
	const { data } = await apiClient.get<ExamOptimizerResult>("/scheduling/exam-optimizer/timetable/", { params: params(semester, scopeType, scopeId) });
	return data;
}

export async function optimizeExamTimetable(semesterId: string | number, scopeType: string, scopeId: string | number) {
	const { data } = await apiClient.post<ExamOptimizerResult>("/scheduling/exam-optimizer/optimize/", { semester_id: semesterId, scope_type: scopeType, scope_id: scopeId });
	return data;
}

export async function getExamOptimizerRuns(semester?: string | number) {
	const { data } = await apiClient.get<ExamOptimizerResult[]>("/scheduling/exam-optimizer/runs/", { params: semester ? { semester } : undefined });
	return data;
}

export async function getExamOptimizerRun(runId: string) {
	const { data } = await apiClient.get<ExamOptimizerResult>(`/scheduling/exam-optimizer/runs/${runId}/`);
	return data;
}

export async function approveExamOptimizerRun(runId: string) {
	const { data } = await apiClient.post<ExamOptimizerResult>(`/scheduling/exam-optimizer/runs/${runId}/approve/`);
	return data;
}

export async function publishExamOptimizerRun(runId: string) {
	const { data } = await apiClient.post<ExamOptimizerResult>(`/scheduling/exam-optimizer/runs/${runId}/publish/`);
	return data;
}
