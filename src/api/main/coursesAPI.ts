import apiClient from "@/api/apiClient";
import type { Course, CourseAccessGrant, AdminLevel, User } from "@/types";

interface RawCourse {
  id: number | string;
  code: string;
  title: string;
  level: number;
  owning_level: AdminLevel;
  owning_department?: number | string | null;
  owning_department_name?: string;
  owning_faculty?: number | string | null;
  owning_faculty_name?: string;
  owning_school?: number | string | null;
  owning_school_name?: string;
  lecturers?: (number | string)[];
  registration_count?: number;
}

interface RawGrant {
  id: number | string;
  course: number | string;
  course_code?: string;
  course_title?: string;
  granted_to_level: AdminLevel;
  granted_to_department?: number | string | null;
  granted_to_department_name?: string;
  granted_to_faculty?: number | string | null;
  granted_to_faculty_name?: string;
  granted_to_school?: number | string | null;
  granted_to_school_name?: string;
  direction: "offered" | "requested";
  status: "pending" | "approved" | "rejected";
  initiated_by?: number | string;
  initiated_by_name?: string;
  decided_by?: number | string;
  decided_by_name?: string;
  decided_at?: string;
  created_at?: string;
}

interface RawRegistration {
  id: number | string;
  student?: number | string;
  student_name?: string;
  matric_number?: string;
  course: number | string;
  course_code?: string;
  course_title?: string;
  academic_session: string;
}

export function mapRawCourseToCourse(raw: RawCourse, lecturersList: User[] = []): Course {
  const assignedLecturerIds = Array.isArray(raw.lecturers) ? raw.lecturers.map(String) : [];
  const assignedLecturers = lecturersList.filter((l) => assignedLecturerIds.includes(l.id));

  return {
    id: String(raw.id),
    code: raw.code,
    title: raw.title,
    level: raw.level,
    creditUnits: 3, // Standard default or derived
    departmentId: raw.owning_department ? String(raw.owning_department) : undefined,
    departmentName: raw.owning_department_name,
    owningLevel: raw.owning_level || "department",
    owningSchool: raw.owning_school ? String(raw.owning_school) : undefined,
    schoolName: raw.owning_school_name,
    owningFaculty: raw.owning_faculty ? String(raw.owning_faculty) : undefined,
    facultyName: raw.owning_faculty_name,
    owningDepartment: raw.owning_department ? String(raw.owning_department) : undefined,
    lecturers: assignedLecturers,
    registrationCount: raw.registration_count || 0,
  };
}

export function mapRawGrantToGrant(raw: RawGrant): CourseAccessGrant {
  return {
    id: String(raw.id),
    courseId: String(raw.course),
    courseCode: raw.course_code || "",
    courseTitle: raw.course_title || "",
    grantedToLevel: raw.granted_to_level || "department",
    grantedToDepartmentId: raw.granted_to_department ? String(raw.granted_to_department) : undefined,
    grantedToDepartmentName: raw.granted_to_department_name,
    grantedToFacultyId: raw.granted_to_faculty ? String(raw.granted_to_faculty) : undefined,
    grantedToFacultyName: raw.granted_to_faculty_name,
    grantedToSchoolId: raw.granted_to_school ? String(raw.granted_to_school) : undefined,
    grantedToSchoolName: raw.granted_to_school_name,
    direction: raw.direction || "offered",
    status: raw.status || "pending",
    requestedBy: raw.initiated_by_name || "Admin Officer",
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

export function mapCourseToRawPayload(data: Partial<Course> & { scopeId?: string; lecturerIds?: string[] }) {
  const owningLevel = data.owningLevel || "department";
  const targetScopeId = data.scopeId || data.departmentId;
  const lecturerIds = Array.isArray(data.lecturers)
    ? data.lecturers.map((l) => Number(l.id)).filter(Boolean)
    : Array.isArray(data.lecturerIds)
    ? data.lecturerIds.map(Number).filter(Boolean)
    : [];

  return {
    code: data.code?.trim().toUpperCase(),
    title: data.title?.trim(),
    level: Number(data.level || 100),
    owning_level: owningLevel,
    owning_department: owningLevel === "department" && targetScopeId ? Number(targetScopeId) : undefined,
    owning_faculty: owningLevel === "faculty" && targetScopeId ? Number(targetScopeId) : undefined,
    owning_school: owningLevel === "school" && targetScopeId ? Number(targetScopeId) : undefined,
    lecturers: lecturerIds,
  };
}

/**
 * GET /api/courses/courses/
 */
export async function getCoursesList(lecturersList: User[] = []): Promise<Course[]> {
  const response = await apiClient.get<RawCourse[] | { results: RawCourse[] }>("/courses/courses/");
  const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return list.map((item) => mapRawCourseToCourse(item, lecturersList));
}

/**
 * POST /api/courses/courses/
 */
export async function createCourseAPI(
  data: Partial<Course> & { scopeId?: string; lecturerIds?: string[] },
  lecturersList: User[] = []
): Promise<Course> {
  const payload = mapCourseToRawPayload(data);
  const response = await apiClient.post<RawCourse>("/courses/courses/", payload);
  return mapRawCourseToCourse(response.data, lecturersList);
}

/**
 * PATCH /api/courses/courses/{id}/
 */
export async function updateCourseAPI(
  id: string,
  data: Partial<Course> & { scopeId?: string; lecturerIds?: string[] },
  lecturersList: User[] = []
): Promise<Course> {
  const payload = mapCourseToRawPayload(data);
  const response = await apiClient.patch<RawCourse>(`/courses/courses/${id}/`, payload);
  return mapRawCourseToCourse(response.data, lecturersList);
}

/**
 * DELETE /api/courses/courses/{id}/
 */
export async function deleteCourseAPI(id: string): Promise<void> {
  await apiClient.delete(`/courses/courses/${id}/`);
}

/**
 * GET /api/courses/grants/
 */
export async function getCourseGrantsList(): Promise<CourseAccessGrant[]> {
  const response = await apiClient.get<RawGrant[] | { results: RawGrant[] }>("/courses/grants/");
  const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return list.map(mapRawGrantToGrant);
}

/**
 * POST /api/courses/grants/
 */
export async function createCourseGrantAPI(payload: {
  course: number | string;
  granted_to_level: AdminLevel;
  granted_to_department?: number | string | null;
  granted_to_faculty?: number | string | null;
  granted_to_school?: number | string | null;
  direction: "offered" | "requested";
}): Promise<CourseAccessGrant> {
  const response = await apiClient.post<RawGrant>("/courses/grants/", payload);
  return mapRawGrantToGrant(response.data);
}

/**
 * POST /api/courses/grants/{id}/approve/
 */
export async function approveCourseGrantAPI(id: string): Promise<CourseAccessGrant> {
  const response = await apiClient.post<RawGrant>(`/courses/grants/${id}/approve/`);
  return mapRawGrantToGrant(response.data);
}

/**
 * POST /api/courses/grants/{id}/reject/
 */
export async function rejectCourseGrantAPI(id: string): Promise<CourseAccessGrant> {
  const response = await apiClient.post<RawGrant>(`/courses/grants/${id}/reject/`);
  return mapRawGrantToGrant(response.data);
}

/**
 * DELETE /api/courses/grants/{id}/
 */
export async function deleteCourseGrantAPI(id: string): Promise<void> {
  await apiClient.delete(`/courses/grants/${id}/`);
}

/**
 * GET /api/courses/registrations/
 */
export async function getCourseRegistrationsList(): Promise<RawRegistration[]> {
  const response = await apiClient.get<RawRegistration[] | { results: RawRegistration[] }>(
    "/courses/registrations/"
  );
  return Array.isArray(response.data) ? response.data : response.data?.results || [];
}

/**
 * POST /api/courses/registrations/
 */
export async function createCourseRegistrationAPI(payload: {
  course: number | string;
  student?: number | string;
  academic_session: string;
}): Promise<RawRegistration> {
  const response = await apiClient.post<RawRegistration>("/courses/registrations/", payload);
  return response.data;
}
