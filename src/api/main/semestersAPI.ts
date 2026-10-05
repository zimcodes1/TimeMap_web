import apiClient from "../apiClient";
import type { AcademicSession, Semester, FacultyExamPeriod, EffectiveExamPeriod } from "@/types";

export interface RawSemester {
  id: number | string;
  session: number | string;
  session_label?: string;
  school_id?: number | string;
  school_name?: string;
  name: 'first' | 'second' | 'third' | 'fourth' | string;
  display_name?: string;
  start_date: string;
  end_date: string;
  duration_type: 'weeks' | 'months' | 'fixed';
  duration_value?: number;
  lecture_start_date?: string;
  lecture_end_date?: string;
  exam_start_date?: string;
  exam_end_date?: string;
  is_active: boolean;
  created_by?: number | string;
  created_by_name?: string;
  created_at?: string;
}

export interface RawAcademicSession {
  id: number | string;
  school: number | string;
  school_name?: string;
  school_code?: string;
  label: string;
  start_date: string;
  end_date: string;
  max_semesters?: number;
  is_current: boolean;
  semesters?: RawSemester[];
  created_at?: string;
}

export function mapRawSemester(raw: RawSemester): Semester {
  return {
    id: String(raw.id),
    sessionId: String(raw.session),
    sessionLabel: raw.session_label,
    schoolId: raw.school_id ? String(raw.school_id) : undefined,
    schoolName: raw.school_name,
    name: raw.name,
    displayName: raw.display_name || (raw.name === 'first' ? 'First Semester' : 'Second Semester'),
    startDate: raw.start_date,
    endDate: raw.end_date,
    durationType: raw.duration_type || 'fixed',
    durationValue: raw.duration_value,
    lectureStartDate: raw.lecture_start_date,
    lectureEndDate: raw.lecture_end_date,
    examStartDate: raw.exam_start_date,
    examEndDate: raw.exam_end_date,
    isActive: Boolean(raw.is_active),
    createdByName: raw.created_by_name,
    createdAt: raw.created_at,
  };
}

export function mapRawAcademicSession(raw: RawAcademicSession): AcademicSession {
  return {
    id: String(raw.id),
    schoolId: String(raw.school),
    schoolName: raw.school_name,
    schoolCode: raw.school_code,
    label: raw.label,
    startDate: raw.start_date,
    endDate: raw.end_date,
    maxSemesters: raw.max_semesters ?? 2,
    isCurrent: Boolean(raw.is_current),
    semesters: raw.semesters ? raw.semesters.map(mapRawSemester) : [],
    createdAt: raw.created_at,
  };
}

export async function getAcademicSessions(params?: {
  school?: string | number;
  is_current?: boolean;
}): Promise<AcademicSession[]> {
  const response = await apiClient.get<RawAcademicSession[]>("/scheduling/academic-sessions/", { params });
  return (response.data || []).map(mapRawAcademicSession);
}

export async function createAcademicSession(data: {
  school: string | number;
  label: string;
  start_date: string;
  end_date: string;
  max_semesters?: number;
  is_current?: boolean;
}): Promise<AcademicSession> {
  const response = await apiClient.post<RawAcademicSession>("/scheduling/academic-sessions/", data);
  return mapRawAcademicSession(response.data);
}

export async function updateAcademicSession(
  id: string | number,
  data: Partial<{
    label: string;
    start_date: string;
    end_date: string;
    max_semesters: number;
    is_current: boolean;
  }>
): Promise<AcademicSession> {
  const response = await apiClient.patch<RawAcademicSession>(`/scheduling/academic-sessions/${id}/`, data);
  return mapRawAcademicSession(response.data);
}

export async function setCurrentAcademicSession(id: string | number): Promise<AcademicSession> {
  const response = await apiClient.post<RawAcademicSession>(`/scheduling/academic-sessions/${id}/set-current/`);
  return mapRawAcademicSession(response.data);
}

export async function deleteAcademicSession(id: string | number): Promise<void> {
  await apiClient.delete(`/scheduling/academic-sessions/${id}/`);
}

export async function getSemesters(params?: {
  session?: string | number;
  school?: string | number;
  is_active?: boolean;
}): Promise<Semester[]> {
  const response = await apiClient.get<RawSemester[]>("/scheduling/semesters/", { params });
  return (response.data || []).map(mapRawSemester);
}

export async function createSemester(data: {
  session: string | number;
  name: 'first' | 'second' | 'third' | 'fourth' | string;
  start_date: string;
  end_date: string;
  duration_type?: 'weeks' | 'months' | 'fixed';
  duration_value?: number;
  lecture_start_date?: string;
  lecture_end_date?: string;
  exam_start_date?: string;
  exam_end_date?: string;
  is_active?: boolean;
}): Promise<Semester> {
  const response = await apiClient.post<RawSemester>("/scheduling/semesters/", data);
  return mapRawSemester(response.data);
}

export async function updateSemester(
  id: string | number,
  data: Partial<{
    name: 'first' | 'second' | 'third' | 'fourth' | string;
    start_date: string;
    end_date: string;
    duration_type: 'weeks' | 'months' | 'fixed';
    duration_value?: number;
    lecture_start_date?: string;
    lecture_end_date?: string;
    exam_start_date?: string;
    exam_end_date?: string;
    is_active: boolean;
  }>
): Promise<Semester> {
  const response = await apiClient.patch<RawSemester>(`/scheduling/semesters/${id}/`, data);
  return mapRawSemester(response.data);
}

export async function activateSemester(id: string | number): Promise<Semester> {
  const response = await apiClient.post<RawSemester>(`/scheduling/semesters/${id}/activate/`);
  return mapRawSemester(response.data);
}

export async function deleteSemester(id: string | number): Promise<void> {
  await apiClient.delete(`/scheduling/semesters/${id}/`);
}

export async function setSemesterExamPeriod(
  semesterId: string | number,
  data: { exam_start_date: string; exam_end_date: string }
): Promise<Semester> {
  const response = await apiClient.post<RawSemester>(
    `/scheduling/semesters/${semesterId}/set-exam-period/`,
    data
  );
  return mapRawSemester(response.data);
}

export async function getFacultyExamPeriods(
  semesterId: string | number,
  facultyId?: string | number
): Promise<FacultyExamPeriod[]> {
  const response = await apiClient.get<any[]>(
    `/scheduling/semesters/${semesterId}/faculty-exam-periods/`,
    { params: facultyId ? { faculty: facultyId } : undefined }
  );
  return (response.data || []).map((raw) => ({
    id: String(raw.id),
    semesterId: String(raw.semester),
    semesterName: raw.semester_name,
    facultyId: String(raw.faculty),
    facultyName: raw.faculty_name,
    facultyCode: raw.faculty_code,
    startDate: raw.start_date,
    endDate: raw.end_date,
    createdByName: raw.created_by_name,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }));
}

export async function setFacultyExamPeriod(
  semesterId: string | number,
  data: { faculty: string | number; start_date: string; end_date: string }
): Promise<FacultyExamPeriod> {
  const response = await apiClient.post(
    `/scheduling/semesters/${semesterId}/faculty-exam-periods/`,
    data
  );
  const raw = response.data;
  return {
    id: String(raw.id),
    semesterId: String(raw.semester),
    semesterName: raw.semester_name,
    facultyId: String(raw.faculty),
    facultyName: raw.faculty_name,
    facultyCode: raw.faculty_code,
    startDate: raw.start_date,
    endDate: raw.end_date,
    createdByName: raw.created_by_name,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function deleteFacultyExamPeriod(
  semesterId: string | number,
  facultyId: string | number
): Promise<void> {
  await apiClient.delete(`/scheduling/semesters/${semesterId}/faculty-exam-periods/`, {
    data: { faculty: facultyId },
  });
}

export async function getEffectiveExamPeriod(
  semesterId: string | number,
  params?: { faculty?: string | number; department?: string | number }
): Promise<EffectiveExamPeriod> {
  const response = await apiClient.get(
    `/scheduling/semesters/${semesterId}/effective-exam-period/`,
    { params }
  );
  const raw = response.data;
  return {
    semesterId: String(raw.semester_id),
    schoolId: raw.school_id ? String(raw.school_id) : undefined,
    schoolExamStartDate: raw.school_exam_start_date,
    schoolExamEndDate: raw.school_exam_end_date,
    allowFacultyExamPeriod: Boolean(raw.allow_faculty_exam_period),
    effectiveStartDate: raw.effective_start_date,
    effectiveEndDate: raw.effective_end_date,
    source: raw.source || "none",
    isSet: Boolean(raw.is_set),
    facultyId: raw.faculty_id ? String(raw.faculty_id) : undefined,
    facultyName: raw.faculty_name,
  };
}

