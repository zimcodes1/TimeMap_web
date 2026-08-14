import apiClient from "@/api/apiClient";
import type { ClassRepReport, UnreportedSessionFlag } from "@/types";

export interface RawClassRepReport {
  id: number | string;
  lecture_session: number | string;
  timetable_entry_title?: string;
  course_code?: string;
  course_title?: string;
  session_date?: string;
  reported_by?: number | string;
  reported_by_name?: string;
  held: boolean;
  reason?: string;
  reported_at?: string;
  window_expires_at?: string;
  lecturer_response?: string | null;
  lecturer_responded_at?: string | null;
}

export interface RawUnreportedFlag {
  id: number | string;
  lecture_session: number | string;
  timetable_entry_title?: string;
  course_code?: string;
  session_date?: string;
  flagged_at?: string;
  acknowledged_by?: number | string | null;
  acknowledged_by_name?: string | null;
  acknowledged_at?: string | null;
}

export function mapRawReportToModel(raw: RawClassRepReport): ClassRepReport {
  return {
    id: String(raw.id),
    sessionId: String(raw.lecture_session),
    sessionDate: raw.session_date || undefined,
    courseCode: raw.course_code || "CRS",
    courseTitle: raw.course_title || raw.timetable_entry_title || "Lecture Session",
    held: Boolean(raw.held),
    reasonText: raw.reason || "Class rep report submitted.",
    reporterName: raw.reported_by_name || "Class Representative",
    timestamp: raw.reported_at || new Date().toISOString(),
    createdAt: raw.reported_at || new Date().toISOString(),
    windowExpiresAt: raw.window_expires_at || new Date().toISOString(),
    lecturerResponse: raw.lecturer_response || undefined,
  };
}

export function mapRawFlagToModel(raw: RawUnreportedFlag): UnreportedSessionFlag {
  return {
    id: String(raw.id),
    sessionId: String(raw.lecture_session),
    courseCode: raw.course_code || "CRS",
    timetableEntryTitle: raw.timetable_entry_title || "Lecture Session",
    sessionDate: raw.session_date || "Today",
    flaggedAt: raw.flagged_at || new Date().toISOString(),
    isAcknowledged: Boolean(raw.acknowledged_by),
    acknowledgedAt: raw.acknowledged_at || undefined,
    acknowledgedByName: raw.acknowledged_by_name || undefined,
  };
}

/**
 * GET /api/reporting/reports/
 */
export async function getClassRepReportsList(): Promise<ClassRepReport[]> {
  try {
    const response = await apiClient.get<RawClassRepReport[] | { results: RawClassRepReport[] }>(
      "/reporting/reports/"
    );
    const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
    return list.map(mapRawReportToModel);
  } catch (err) {
    console.warn("Backend API /reporting/reports/ error:", err);
    return [];
  }
}

/**
 * POST /api/reporting/reports/
 */
export async function createClassRepReportAPI(payload: {
  lecture_session: number | string;
  held: boolean;
  reason?: string;
}): Promise<ClassRepReport> {
  const response = await apiClient.post<RawClassRepReport>("/reporting/reports/", payload);
  return mapRawReportToModel(response.data);
}

/**
 * POST /api/reporting/reports/{id}/respond/
 */
export async function respondToReportAPI(id: string, responseText: string): Promise<ClassRepReport> {
  const response = await apiClient.post<RawClassRepReport>(`/reporting/reports/${id}/respond/`, {
    response_text: responseText,
  });
  return mapRawReportToModel(response.data);
}

/**
 * GET /api/reporting/flags/
 */
export async function getUnreportedFlagsList(): Promise<UnreportedSessionFlag[]> {
  try {
    const response = await apiClient.get<RawUnreportedFlag[] | { results: RawUnreportedFlag[] }>(
      "/reporting/flags/"
    );
    const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
    return list.map(mapRawFlagToModel);
  } catch (err) {
    console.warn("Backend API /reporting/flags/ error:", err);
    return [];
  }
}

/**
 * POST /api/reporting/flags/{id}/acknowledge/
 */
export async function acknowledgeFlagAPI(id: string): Promise<UnreportedSessionFlag> {
  const response = await apiClient.post<RawUnreportedFlag>(`/reporting/flags/${id}/acknowledge/`);
  return mapRawFlagToModel(response.data);
}

/**
 * POST /api/reporting/flags/trigger_sweep/
 */
export async function triggerSweepAPI(): Promise<{ message: string; flagged_count: number }> {
  const response = await apiClient.post<{ message: string; flagged_count: number }>(
    "/reporting/flags/trigger_sweep/"
  );
  return response.data;
}
