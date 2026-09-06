import apiClient from "../apiClient";
import type {
  TimetableEntry,
  LectureSession,
  ExamSitting,
  Course,
  Venue,
  User,
} from "@/types";
import { AxiosError } from "axios";

export interface CreateScheduleEntryPayload {
  entry_type?: "lecture" | "exam" | "event";
  title?: string;
  course: string | number;
  venue: string | number;
  start_time: string;
  end_time: string;
  recurrence_rule?: string;
  recurrence_start_date?: string;
  recurrence_end_date?: string;
  academic_session?: string;
}

export interface CreateEntrySuccessResponse {
  outcome: "PROCEED";
  entry: TimetableEntry;
}

export interface CreateEntryRouteApprovalResponse {
  outcome: "ROUTE_APPROVAL";
  message: string;
  discrepancy_request_id?: number;
  routed_to_admin_id?: number;
}

export interface CreateEntryHardRejectResponse {
  outcome: "HARD_REJECT";
  detail: string;
  conflicts: Array<{
    type: string;
    venue_id?: number;
    venue_name?: string;
    date?: string;
    start_time?: string;
    end_time?: string;
    conflicting_title?: string;
    conflicting_session_id?: number;
  }>;
}

export type CreateScheduleEntryResult =
  | CreateEntrySuccessResponse
  | CreateEntryRouteApprovalResponse
  | CreateEntryHardRejectResponse;

interface RawTimetableEntry {
  id: number | string;
  entry_type?: "lecture" | "exam" | "event";
  title?: string;
  course?: number | string;
  course_code?: string;
  course_title?: string;
  lecturer?: number | string;
  lecturer_name?: string;
  venue?: number | string;
  venue_name?: string;
  day_of_week?: string;
  start_time: string;
  end_time: string;
  type?: "lecture" | "exam" | "event";
  academic_session?: string;
  recurrence_rule?: string;
  recurrence_start_date?: string;
  recurrence_end_date?: string;
  has_conflict?: boolean;
  conflict_reason?: string;
}

interface RawLectureSession {
  id: number | string;
  timetable_entry?: number | string;
  timetable_entry_title?: string;
  course_code?: string;
  course_title?: string;
  lecturer_name?: string;
  session_date: string;
  session_start_time: string;
  session_end_time: string;
  venue?: number | string;
  venue_name?: string;
  status: "scheduled" | "shifted" | "postponed" | "cancelled" | "held" | "not_held";
  can_shift?: boolean;
  report_status?: "held" | "not_held" | "unreported";
}

interface RawExamSitting {
  id: number | string;
  timetable_entry?: number | string;
  course_code?: string;
  course_title?: string;
  venue_name?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  registered_candidates_count?: number;
  invigilators?: Array<{
    id: number | string;
    identifier?: string;
    full_name?: string;
    email?: string;
  }>;
}

function mapRawEntryToEntry(raw: RawTimetableEntry): TimetableEntry {
  return {
    id: String(raw.id),
    entryType: raw.entry_type || raw.type || "lecture",
    title: raw.title || raw.course_title || "Timetable Entry",
    type: raw.entry_type || raw.type || "lecture",
    courseId: raw.course ? String(raw.course) : undefined,
    courseCode: raw.course_code || "CSC301",
    courseTitle: raw.course_title || raw.title || "Course",
    lecturerName: raw.lecturer_name || "Assigned Lecturer",
    venueId: raw.venue ? String(raw.venue) : "",
    venueName: raw.venue_name || "Venue",
    dayOfWeek: (raw.day_of_week as TimetableEntry["dayOfWeek"]) || "Monday",
    startTime: raw.start_time,
    endTime: raw.end_time,
    academicSession: raw.academic_session || "2025/2026",
    recurrenceRule: raw.recurrence_rule,
    recurrenceStartDate: raw.recurrence_start_date,
    recurrenceEndDate: raw.recurrence_end_date,
    hasConflict: Boolean(raw.has_conflict),
    conflictReason: raw.conflict_reason,
  };
}

function mapRawSessionToSession(raw: RawLectureSession): LectureSession {
  return {
    id: String(raw.id),
    entryId: String(raw.timetable_entry || ""),
    courseCode: raw.course_code || "CSC301",
    courseTitle: raw.course_title || raw.timetable_entry_title || "Course Session",
    lecturerName: raw.lecturer_name || "Lecturer",
    date: raw.session_date,
    startTime: raw.session_start_time,
    endTime: raw.session_end_time,
    venueId: raw.venue ? String(raw.venue) : "",
    venueName: raw.venue_name || "Venue",
    status: raw.status || "scheduled",
    canShift: Boolean(raw.can_shift),
    reportStatus: raw.report_status || "unreported",
  };
}

function mapRawExamSittingToExamSitting(raw: RawExamSitting): ExamSitting {
  return {
    id: String(raw.id),
    timetableEntryId: raw.timetable_entry ? String(raw.timetable_entry) : undefined,
    courseCode: raw.course_code || "EXAM",
    courseTitle: raw.course_title || "Exam Sitting",
    venueName: raw.venue_name || "Exam Venue",
    date: raw.date || new Date().toISOString().split("T")[0],
    startTime: raw.start_time || "09:00:00",
    endTime: raw.end_time || "12:00:00",
    registeredCandidatesCount: raw.registered_candidates_count ?? 0,
    invigilators: (raw.invigilators || []).map((inv) => ({
      id: String(inv.id),
      identifier: inv.identifier || String(inv.id),
      name: inv.full_name || inv.identifier || "Invigilator",
      email: inv.email || "",
      role: "lecturer",
      isActive: true,
    })),
  };
}

/**
 * GET /api/scheduling/entries/
 */
export async function getTimetableEntries(): Promise<TimetableEntry[]> {
  const response = await apiClient.get<RawTimetableEntry[] | { results: RawTimetableEntry[] }>(
    "/scheduling/entries/"
  );
  const data = response.data;
  const list = Array.isArray(data) ? data : data?.results || [];
  return list.map(mapRawEntryToEntry);
}

/**
 * POST /api/scheduling/entries/
 * Handles 201 PROCEED, 202 ROUTE_APPROVAL, and 400 HARD_REJECT
 */
export async function createTimetableEntry(
  payload: CreateScheduleEntryPayload
): Promise<CreateScheduleEntryResult> {
  try {
    const response = await apiClient.post<RawTimetableEntry | CreateEntryRouteApprovalResponse>(
      "/scheduling/entries/",
      payload
    );

    if (response.status === 202) {
      const data = response.data as CreateEntryRouteApprovalResponse;
      return {
        outcome: "ROUTE_APPROVAL",
        message: data.message || "Request routed for approval.",
        discrepancy_request_id: data.discrepancy_request_id,
        routed_to_admin_id: data.routed_to_admin_id,
      };
    }

    const data = response.data as RawTimetableEntry;
    return {
      outcome: "PROCEED",
      entry: mapRawEntryToEntry(data),
    };
  } catch (err: unknown) {
    const axiosError = err as AxiosError<{
      detail?: string;
      conflicts?: Array<{
        type: string;
        venue_id?: number;
        venue_name?: string;
        date?: string;
        start_time?: string;
        end_time?: string;
        conflicting_title?: string;
        conflicting_session_id?: number;
      }>;
    }>;

    if (axiosError.response?.status === 400 && axiosError.response.data?.conflicts) {
      return {
        outcome: "HARD_REJECT",
        detail: axiosError.response.data.detail || "Booking clashes with existing schedules.",
        conflicts: axiosError.response.data.conflicts,
      };
    }

    throw err;
  }
}

/**
 * POST /api/scheduling/entries/{id}/materialize/
 */
export async function materializeSessionAPI(entryId: string): Promise<LectureSession> {
  const response = await apiClient.post<RawLectureSession>(
    `/scheduling/entries/${entryId}/materialize/`
  );
  return mapRawSessionToSession(response.data);
}

/**
 * GET /api/scheduling/sessions/
 */
export async function getLectureSessions(): Promise<LectureSession[]> {
  const response = await apiClient.get<RawLectureSession[] | { results: RawLectureSession[] }>(
    "/scheduling/sessions/"
  );
  const data = response.data;
  const list = Array.isArray(data) ? data : data?.results || [];
  return list.map(mapRawSessionToSession);
}

/**
 * PUT/PATCH /api/scheduling/sessions/{id}/
 */
export async function updateLectureSessionAPI(
  id: string,
  payload: Partial<{
    session_date: string;
    session_start_time: string;
    session_end_time: string;
    venue: string | number;
    status: string;
  }>
): Promise<LectureSession> {
  const response = await apiClient.patch<RawLectureSession>(
    `/scheduling/sessions/${id}/`,
    payload
  );
  return mapRawSessionToSession(response.data);
}

/**
 * GET /api/scheduling/exam-sittings/
 */
export async function getExamSittings(): Promise<ExamSitting[]> {
  const response = await apiClient.get<RawExamSitting[] | { results: RawExamSitting[] }>(
    "/scheduling/exam-sittings/"
  );
  const data = response.data;
  const list = Array.isArray(data) ? data : data?.results || [];
  return list.map(mapRawExamSittingToExamSitting);
}

/**
 * POST /api/scheduling/exam-sittings/
 */
export async function createExamSittingAPI(payload: {
  timetable_entry: string | number;
  invigilators: Array<string | number>;
}): Promise<ExamSitting> {
  const response = await apiClient.post<RawExamSitting>(
    "/scheduling/exam-sittings/",
    payload
  );
  return mapRawExamSittingToExamSitting(response.data);
}

/**
 * Helper: Fetch active courses list for modals
 */
export async function getCoursesOptions(): Promise<Course[]> {
  try {
    const response = await apiClient.get("/courses/courses/");
    const data = response.data;
    const list = Array.isArray(data) ? data : data?.results || [];
    return list.map((c: Record<string, unknown>) => ({
      id: String(c.id),
      code: String(c.code || ""),
      title: String(c.title || ""),
      level: Number(c.level || 100),
      creditUnits: Number(c.credit_units || 3),
      departmentId: String(c.owning_department || ""),
      owningLevel: (c.owning_level as Course["owningLevel"]) || "department",
      lecturers: [],
    }));
  } catch {
    return [];
  }
}

/**
 * Helper: Fetch venues list for modals
 */
export async function getVenuesOptions(): Promise<Venue[]> {
  try {
    const response = await apiClient.get("/venues/venues/");
    const data = response.data;
    const list = Array.isArray(data) ? data : data?.results || [];
    return list.map((v: Record<string, unknown>) => ({
      id: String(v.id),
      name: String(v.name || ""),
      code: String(v.code || ""),
      venueType: (v.venue_type as Venue["venueType"]) || "lecture_hall",
      capacity: Number(v.capacity || 0),
      examCapacity: Number(v.exam_capacity || 0),
      owningLevel: (v.owning_level as Venue["owningLevel"]) || "department",
      facilities: [],
      isAvailable: Boolean(v.is_active ?? true),
    }));
  } catch {
    return [];
  }
}

/**
 * Helper: Fetch lecturers list for exam invigilator selection
 */
export async function getLecturersOptions(): Promise<User[]> {
  try {
    const response = await apiClient.get("/auth/lecturers/");
    const data = response.data;
    const list = Array.isArray(data) ? data : data?.results || [];
    return list.map((l: Record<string, unknown>) => {
      const userObj = (l.user as Record<string, unknown>) || {};
      return {
        id: String(l.id || userObj.id || ""),
        identifier: String(userObj.identifier || l.staff_id || ""),
        name: String(l.full_name || userObj.identifier || "Lecturer"),
        email: String(l.email || ""),
        role: "lecturer" as const,
        staffId: String(l.staff_id || userObj.identifier || ""),
        isActive: Boolean(userObj.is_active ?? true),
      };
    });
  } catch {
    return [];
  }
}
