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
  semester?: number | string | null;
  semester_name?: string;
  session_label?: string;
  program_scope?: "general" | "program";
  target_program?: number | string | null;
  target_program_name?: string;
  target_program_code?: string;
  lecturers?: (number | string)[];
  lecturers_details?: {
    id: number | string;
    staff_id: string;
    name: string;
    email?: string;
    department_id?: number | string;
    department_name?: string;
  }[];
  registration_count?: number;
  course_type?: "lecture" | "practical";
  required_occurrences_per_week?: number;
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
  grant_scope?: "general" | "program";
  target_program?: number | string | null;
  target_program_name?: string;
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

  let assignedLecturers: User[] = [];
  if (Array.isArray(raw.lecturers_details) && raw.lecturers_details.length > 0) {
    assignedLecturers = raw.lecturers_details.map((l) => ({
      id: String(l.id),
      identifier: l.staff_id || "",
      name: l.name || "",
      email: l.email || "",
      role: "lecturer" as const,
      departmentId: l.department_id ? String(l.department_id) : undefined,
      departmentName: l.department_name,
      staffId: l.staff_id,
      isActive: true,
      requiresPasswordReset: false,
    }));
  } else if (assignedLecturerIds.length > 0) {
    assignedLecturers = assignedLecturerIds.map((id) => {
      const found = lecturersList.find((l) => String(l.id) === String(id));
      if (found) return found;
      return {
        id: String(id),
        identifier: String(id),
        name: `Lecturer #${id}`,
        email: "",
        role: "lecturer" as const,
        isActive: true,
        requiresPasswordReset: false,
      };
    });
  }

  return {
    id: String(raw.id),
    code: raw.code,
    title: raw.title,
    level: raw.level,
    departmentId: raw.owning_department ? String(raw.owning_department) : undefined,
    departmentName: raw.owning_department_name,
    owningLevel: raw.owning_level || "department",
    owningSchool: raw.owning_school ? String(raw.owning_school) : undefined,
    schoolName: raw.owning_school_name,
    owningFaculty: raw.owning_faculty ? String(raw.owning_faculty) : undefined,
    facultyName: raw.owning_faculty_name,
    owningDepartment: raw.owning_department ? String(raw.owning_department) : undefined,
    semesterId: raw.semester ? String(raw.semester) : undefined,
    semesterName: raw.semester_name,
    sessionLabel: raw.session_label,
    programScope: raw.program_scope || "general",
    targetProgramId: raw.target_program ? String(raw.target_program) : undefined,
    targetProgramName: raw.target_program_name,
    targetProgramCode: raw.target_program_code,
    lecturers: assignedLecturers,
    lecturerIds: assignedLecturerIds,
    registrationCount: raw.registration_count || 0,
    courseType: raw.course_type || "lecture",
    requiredOccurrencesPerWeek: raw.required_occurrences_per_week ?? 1,
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
    grantScope: raw.grant_scope || "general",
    targetProgramId: raw.target_program ? String(raw.target_program) : undefined,
    targetProgramName: raw.target_program_name,
    direction: raw.direction || "offered",
    status: raw.status || "pending",
    requestedBy: raw.initiated_by_name || "Admin Officer",
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

export function mapCourseToRawPayload(data: Partial<Course> & { scopeId?: string; lecturerIds?: string[] }) {
  const owningLevel = data.owningLevel || "department";
  const targetScopeId = data.scopeId || data.owningDepartment || data.departmentId;
  const lecturerIds = Array.isArray(data.lecturerIds)
    ? data.lecturerIds.map(Number).filter(Boolean)
    : Array.isArray(data.lecturers)
      ? data.lecturers.map((l) => Number(l.id)).filter(Boolean)
      : undefined;

  const payload: Record<string, any> = {
    code: data.code?.trim().toUpperCase(),
    title: data.title?.trim(),
    level: Number(data.level || 100),
    owning_level: owningLevel,
    owning_department: owningLevel === "department" && targetScopeId ? Number(targetScopeId) : (data.owningDepartment ? Number(data.owningDepartment) : undefined),
    owning_faculty: owningLevel === "faculty" && targetScopeId ? Number(targetScopeId) : (data.owningFaculty ? Number(data.owningFaculty) : undefined),
    owning_school: owningLevel === "school" && targetScopeId ? Number(targetScopeId) : (data.owningSchool ? Number(data.owningSchool) : undefined),
    semester: data.semesterId ? Number(data.semesterId) : undefined,
    program_scope: data.programScope || "general",
    target_program: data.targetProgramId ? Number(data.targetProgramId) : null,
    course_type: data.courseType || "lecture",
    required_occurrences_per_week: data.requiredOccurrencesPerWeek ? Number(data.requiredOccurrencesPerWeek) : 1,
  };

  if (lecturerIds !== undefined) {
    payload.lecturers = lecturerIds;
  }

  return payload;
}

/**
 * GET /api/courses/courses/
 */
export async function getCoursesList(
  lecturersList: User[] = [],
  params?: { semester?: string | number; program?: string | number }
): Promise<Course[]> {
  const response = await apiClient.get<RawCourse[] | { results: RawCourse[] }>("/courses/courses/", { params });
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
  grant_scope?: "general" | "program";
  target_program?: number | string | null;
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
