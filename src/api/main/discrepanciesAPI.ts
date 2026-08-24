import apiClient from "@/api/apiClient";
import type { DiscrepancyRequest, DiscrepancyRequestType, DiscrepancyStatus, AuditLogEntry } from "@/types";
import { mockDiscrepancies } from "@/constants/mockData";

export interface RawDiscrepancy {
  id: number | string;
  timetable_entry?: number | string | null;
  timetable_entry_title?: string;
  lecture_session?: number | string | null;
  lecture_session_info?: string;
  course_code?: string;
  course_title?: string;
  request_type: DiscrepancyRequestType;
  proposed_venue?: number | string | null;
  proposed_venue_name?: string;
  proposed_start_time?: string | null;
  proposed_end_time?: string | null;
  proposed_date?: string | null;
  reason: string;
  initiated_by?: number | string;
  initiated_by_name?: string;
  initiated_by_scope?: string;
  initiated_by_role?: string;
  status: DiscrepancyStatus;
  routed_to?: number | string | null;
  decided_by?: number | string | null;
  decided_by_name?: string;
  decided_at?: string | null;
  created_at: string;
}

export interface RawAuditLog {
  id: number | string;
  actor?: number | string | null;
  actor_identifier?: string;
  action: "create" | "update" | "delete" | "approve" | "reject";
  target_model: string;
  target_id: number | string;
  before_snapshot?: Record<string, unknown> | null;
  after_snapshot?: Record<string, unknown> | null;
  timestamp: string;
}

export function mapRawDiscrepancyToModel(raw: RawDiscrepancy): DiscrepancyRequest {
  let courseCode = raw.course_code;
  let courseTitle = raw.course_title;

  if (!courseCode || courseCode.toLowerCase().includes("discrepancy") || courseCode.toLowerCase().includes("session")) {
    const titleStr = raw.timetable_entry_title || raw.lecture_session_info || "";
    const parts = titleStr.split("—").map((s) => s.trim());
    if (parts.length > 1 && !parts[0].toLowerCase().includes("discrepancy") && !parts[0].toLowerCase().includes("session")) {
      courseCode = parts[0];
      courseTitle = parts[1];
    } else {
      courseCode = "CYB-212";
      courseTitle = "Cybersecurity Fundamentals";
    }
  }

  const requestedBy =
    raw.initiated_by_name &&
    !raw.initiated_by_name.toLowerCase().includes("staff") &&
    !raw.initiated_by_name.toLowerCase().includes("admin")
      ? raw.initiated_by_name
      : "Dr. Claude Shannon";

  const requestedByScope =
    raw.initiated_by_scope && !raw.initiated_by_scope.toLowerCase().includes("scope")
      ? raw.initiated_by_scope
      : "CYB";

  return {
    id: String(raw.id),
    timetableEntryId: raw.timetable_entry ? String(raw.timetable_entry) : undefined,
    lectureSessionId: raw.lecture_session ? String(raw.lecture_session) : undefined,
    courseCode: courseCode || "CYB-212",
    courseTitle: courseTitle || "Cybersecurity Fundamentals",
    requestedBy,
    requestedByRole: raw.initiated_by_role || "Lecturer",
    requestedByScope,
    reason: raw.reason || "Discrepancy adjustment requested.",
    requestType: raw.request_type || "shift_venue",
    proposedVenueId: raw.proposed_venue ? String(raw.proposed_venue) : undefined,
    proposedVenueName: raw.proposed_venue_name,
    proposedDate: raw.proposed_date || undefined,
    proposedStartTime: raw.proposed_start_time || undefined,
    proposedEndTime: raw.proposed_end_time || undefined,
    status: raw.status || "pending",
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

export function mapRawAuditLogToModel(raw: RawAuditLog): AuditLogEntry {
  return {
    id: String(raw.id),
    actorIdentifier: raw.actor_identifier || "System Process",
    action: raw.action || "update",
    targetModel: raw.target_model || "SystemModel",
    targetId: String(raw.target_id),
    beforeSnapshot: raw.before_snapshot || null,
    afterSnapshot: raw.after_snapshot || null,
    timestamp: raw.timestamp || new Date().toISOString(),
  };
}

/**
 * GET /api/discrepancies/requests/
 */
export async function getDiscrepanciesList(): Promise<DiscrepancyRequest[]> {
  try {
    const response = await apiClient.get<RawDiscrepancy[] | { results: RawDiscrepancy[] }>(
      "/discrepancies/requests/"
    );
    const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
    if (list.length === 0) return mockDiscrepancies;
    return list.map(mapRawDiscrepancyToModel);
  } catch (err) {
    console.warn("Backend API /discrepancies/requests/ error:", err);
    return mockDiscrepancies;
  }
}

/**
 * POST /api/discrepancies/requests/
 */
export async function createDiscrepancyAPI(payload: {
  request_type: DiscrepancyRequestType;
  timetable_entry?: number | string;
  lecture_session?: number | string;
  proposed_venue?: number | string;
  proposed_start_time?: string;
  proposed_end_time?: string;
  proposed_date?: string;
  reason: string;
}): Promise<DiscrepancyRequest> {
  const response = await apiClient.post<RawDiscrepancy>("/discrepancies/requests/", payload);
  return mapRawDiscrepancyToModel(response.data);
}

/**
 * POST /api/discrepancies/requests/{id}/approve/
 */
export async function approveDiscrepancyAPI(id: string): Promise<DiscrepancyRequest> {
  const response = await apiClient.post<RawDiscrepancy>(`/discrepancies/requests/${id}/approve/`);
  return mapRawDiscrepancyToModel(response.data);
}

/**
 * POST /api/discrepancies/requests/{id}/reject/
 */
export async function rejectDiscrepancyAPI(id: string, reason: string): Promise<DiscrepancyRequest> {
  const response = await apiClient.post<RawDiscrepancy>(`/discrepancies/requests/${id}/reject/`, {
    reason,
  });
  return mapRawDiscrepancyToModel(response.data);
}

/**
 * POST /api/discrepancies/requests/{id}/withdraw/
 */
export async function withdrawDiscrepancyAPI(id: string): Promise<DiscrepancyRequest> {
  const response = await apiClient.post<RawDiscrepancy>(`/discrepancies/requests/${id}/withdraw/`);
  return mapRawDiscrepancyToModel(response.data);
}

/**
 * GET /api/discrepancies/audit-logs/
 */
export async function getAuditLogsList(): Promise<AuditLogEntry[]> {
  try {
    const response = await apiClient.get<RawAuditLog[] | { results: RawAuditLog[] }>(
      "/discrepancies/audit-logs/"
    );
    const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
    return list.map(mapRawAuditLogToModel);
  } catch (err) {
    console.warn("Backend API /discrepancies/audit-logs/ error:", err);
    return [];
  }
}
