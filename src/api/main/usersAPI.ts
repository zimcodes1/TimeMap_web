import apiClient from "../apiClient";
import type { User, Department, Faculty, School, UserRole, AdminLevel } from "@/types";

export interface CreateStudentPayload {
  matric_number: string;
  full_name: string;
  department: number | string;
  level: number;
  is_class_rep?: boolean;
  email?: string;
}

export interface CreateLecturerPayload {
  staff_id: string;
  full_name: string;
  department: number | string;
  email?: string;
}

export interface CreateAdminPayload {
  staff_id: string;
  full_name: string;
  level: AdminLevel;
  email?: string;
  scope_department?: number | string | null;
  scope_faculty?: number | string | null;
  scope_school?: number | string | null;
}

interface RawUser {
  id: number | string;
  identifier: string;
  role: UserRole;
  requires_password_reset: boolean;
  is_active: boolean;
}

interface RawStudentProfile {
  id: number | string;
  user: RawUser;
  matric_number: string;
  full_name: string;
  department: number | string;
  department_name?: string;
  level: number;
  is_class_rep: boolean;
  email?: string;
}

interface RawLecturerProfile {
  id: number | string;
  user: RawUser;
  staff_id: string;
  full_name: string;
  department: number | string;
  department_name?: string;
  email?: string;
}

interface RawAdminProfile {
  id: number | string;
  user: RawUser;
  staff_id: string;
  full_name: string;
  level: AdminLevel;
  email?: string;
  scope_department?: number | string;
  scope_faculty?: number | string;
  scope_school?: number | string;
}

export function mapRawStudentToUser(raw: RawStudentProfile): User {
  return {
    id: String(raw.id),
    identifier: raw.matric_number || raw.user?.identifier || "",
    name: raw.full_name,
    email: raw.email || "",
    role: "student",
    departmentId: raw.department ? String(raw.department) : undefined,
    departmentName: raw.department_name,
    matricNumber: raw.matric_number,
    level: raw.level,
    isClassRep: raw.is_class_rep,
    isActive: raw.user?.is_active ?? true,
    requiresPasswordReset: raw.user?.requires_password_reset ?? true,
  };
}

export function mapRawLecturerToUser(raw: RawLecturerProfile): User {
  return {
    id: String(raw.id),
    identifier: raw.staff_id || raw.user?.identifier || "",
    name: raw.full_name,
    email: raw.email || "",
    role: "lecturer",
    departmentId: raw.department ? String(raw.department) : undefined,
    departmentName: raw.department_name,
    staffId: raw.staff_id,
    isActive: raw.user?.is_active ?? true,
    requiresPasswordReset: raw.user?.requires_password_reset ?? true,
  };
}

export function mapRawAdminToUser(raw: RawAdminProfile): User {
  return {
    id: String(raw.id),
    identifier: raw.staff_id || raw.user?.identifier || "",
    name: raw.full_name,
    email: raw.email || "",
    role: "admin",
    adminLevel: raw.level,
    staffId: raw.staff_id,
    departmentId: raw.scope_department ? String(raw.scope_department) : undefined,
    adminScopeId: raw.scope_school
      ? String(raw.scope_school)
      : raw.scope_faculty
      ? String(raw.scope_faculty)
      : raw.scope_department
      ? String(raw.scope_department)
      : undefined,
    isActive: raw.user?.is_active ?? true,
    requiresPasswordReset: raw.user?.requires_password_reset ?? true,
  };
}

/**
 * GET /api/auth/students/
 */
export async function getStudentsList(): Promise<User[]> {
  const response = await apiClient.get<RawStudentProfile[] | { results: RawStudentProfile[] }>(
    "/auth/students/"
  );
  const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return list.map(mapRawStudentToUser);
}

/**
 * POST /api/auth/students/
 */
export async function createStudentAPI(payload: CreateStudentPayload): Promise<User> {
  const response = await apiClient.post<RawStudentProfile>("/auth/students/", payload);
  return mapRawStudentToUser(response.data);
}

/**
 * PATCH /api/auth/students/{id}/
 */
export async function updateStudentAPI(
  id: string,
  payload: Partial<CreateStudentPayload>
): Promise<User> {
  const response = await apiClient.patch<RawStudentProfile>(`/auth/students/${id}/`, payload);
  return mapRawStudentToUser(response.data);
}

/**
 * DELETE /api/auth/students/{id}/
 */
export async function deleteStudentAPI(id: string): Promise<void> {
  await apiClient.delete(`/auth/students/${id}/`);
}

/**
 * POST /api/auth/students/{id}/toggle-active/
 */
export async function toggleStudentActiveAPI(id: string): Promise<User> {
  const response = await apiClient.post<RawStudentProfile>(`/auth/students/${id}/toggle-active/`);
  return mapRawStudentToUser(response.data);
}

/**
 * POST /api/auth/students/{id}/reset-password/
 */
export async function resetStudentPasswordAPI(id: string): Promise<void> {
  await apiClient.post(`/auth/students/${id}/reset-password/`);
}

/**
 * GET /api/auth/lecturers/
 */
export async function getLecturersList(): Promise<User[]> {
  const response = await apiClient.get<RawLecturerProfile[] | { results: RawLecturerProfile[] }>(
    "/auth/lecturers/"
  );
  const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return list.map(mapRawLecturerToUser);
}

/**
 * POST /api/auth/lecturers/
 */
export async function createLecturerAPI(payload: CreateLecturerPayload): Promise<User> {
  const response = await apiClient.post<RawLecturerProfile>("/auth/lecturers/", payload);
  return mapRawLecturerToUser(response.data);
}

/**
 * PATCH /api/auth/lecturers/{id}/
 */
export async function updateLecturerAPI(
  id: string,
  payload: Partial<CreateLecturerPayload>
): Promise<User> {
  const response = await apiClient.patch<RawLecturerProfile>(`/auth/lecturers/${id}/`, payload);
  return mapRawLecturerToUser(response.data);
}

/**
 * DELETE /api/auth/lecturers/{id}/
 */
export async function deleteLecturerAPI(id: string): Promise<void> {
  await apiClient.delete(`/auth/lecturers/${id}/`);
}

/**
 * POST /api/auth/lecturers/{id}/toggle-active/
 */
export async function toggleLecturerActiveAPI(id: string): Promise<User> {
  const response = await apiClient.post<RawLecturerProfile>(`/auth/lecturers/${id}/toggle-active/`);
  return mapRawLecturerToUser(response.data);
}

/**
 * POST /api/auth/lecturers/{id}/reset-password/
 */
export async function resetLecturerPasswordAPI(id: string): Promise<void> {
  await apiClient.post(`/auth/lecturers/${id}/reset-password/`);
}

/**
 * GET /api/auth/admins/
 */
export async function getAdminsList(): Promise<User[]> {
  const response = await apiClient.get<RawAdminProfile[] | { results: RawAdminProfile[] }>(
    "/auth/admins/"
  );
  const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return list.map(mapRawAdminToUser);
}

/**
 * POST /api/auth/admins/
 */
export async function createAdminAPI(payload: CreateAdminPayload): Promise<User> {
  const response = await apiClient.post<RawAdminProfile>("/auth/admins/", payload);
  return mapRawAdminToUser(response.data);
}

/**
 * PATCH /api/auth/admins/{id}/
 */
export async function updateAdminAPI(
  id: string,
  payload: Partial<CreateAdminPayload>
): Promise<User> {
  const response = await apiClient.patch<RawAdminProfile>(`/auth/admins/${id}/`, payload);
  return mapRawAdminToUser(response.data);
}

/**
 * DELETE /api/auth/admins/{id}/
 */
export async function deleteAdminAPI(id: string): Promise<void> {
  await apiClient.delete(`/auth/admins/${id}/`);
}

/**
 * POST /api/auth/admins/{id}/toggle-active/
 */
export async function toggleAdminActiveAPI(id: string): Promise<User> {
  const response = await apiClient.post<RawAdminProfile>(`/auth/admins/${id}/toggle-active/`);
  return mapRawAdminToUser(response.data);
}

/**
 * POST /api/auth/admins/{id}/reset-password/
 */
export async function resetAdminPasswordAPI(id: string): Promise<void> {
  await apiClient.post(`/auth/admins/${id}/reset-password/`);
}

/**
 * GET /api/hierarchy/departments/
 */
export async function getDepartmentsOptions(): Promise<Department[]> {
  try {
    const response = await apiClient.get("/hierarchy/departments/");
    const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
    return list.map((d: Record<string, unknown>) => ({
      id: String(d.id),
      name: String(d.name || ""),
      code: String(d.code || ""),
      facultyId: String(d.faculty || ""),
    }));
  } catch {
    return [];
  }
}

/**
 * GET /api/hierarchy/faculties/
 */
export async function getFacultiesOptions(): Promise<Faculty[]> {
  try {
    const response = await apiClient.get("/hierarchy/faculties/");
    const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
    return list.map((f: Record<string, unknown>) => ({
      id: String(f.id),
      name: String(f.name || ""),
      code: String(f.code || ""),
      schoolId: String(f.school || ""),
    }));
  } catch {
    return [];
  }
}

/**
 * GET /api/hierarchy/schools/
 */
export async function getSchoolsOptions(): Promise<School[]> {
  try {
    const response = await apiClient.get("/hierarchy/schools/");
    const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
    return list.map((s: Record<string, unknown>) => ({
      id: String(s.id),
      name: String(s.name || ""),
      code: String(s.code || ""),
    }));
  } catch {
    return [];
  }
}
