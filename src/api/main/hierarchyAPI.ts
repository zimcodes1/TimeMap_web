import apiClient from "../apiClient";
import type { School, Faculty, Department } from "@/types";

interface RawSchool {
  id: number | string;
  name: string;
  code: string;
  created_at?: string;
}

interface RawFaculty {
  id: number | string;
  school: number | string;
  school_name?: string;
  name: string;
  code: string;
  created_at?: string;
}

interface RawDepartment {
  id: number | string;
  faculty: number | string;
  faculty_name?: string;
  school_name?: string;
  name: string;
  code: string;
  created_at?: string;
}

export function mapRawSchool(raw: RawSchool): School {
  return {
    id: String(raw.id),
    name: raw.name,
    code: raw.code,
  };
}

export function mapRawFaculty(raw: RawFaculty): Faculty {
  return {
    id: String(raw.id),
    name: raw.name,
    code: raw.code,
    schoolId: String(raw.school),
    schoolName: raw.school_name,
  };
}

export function mapRawDepartment(raw: RawDepartment): Department {
  return {
    id: String(raw.id),
    name: raw.name,
    code: raw.code,
    facultyId: String(raw.faculty),
    facultyName: raw.faculty_name,
  };
}

/**
 * GET /api/hierarchy/schools/
 */
export async function getSchoolsList(): Promise<School[]> {
  const response = await apiClient.get<RawSchool[] | { results: RawSchool[] }>("/hierarchy/schools/");
  const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return list.map(mapRawSchool);
}

/**
 * POST /api/hierarchy/schools/
 */
export async function createSchoolAPI(payload: { name: string; code: string }): Promise<School> {
  const response = await apiClient.post<RawSchool>("/hierarchy/schools/", payload);
  return mapRawSchool(response.data);
}

/**
 * PATCH /api/hierarchy/schools/{id}/
 */
export async function updateSchoolAPI(id: string, payload: { name?: string; code?: string }): Promise<School> {
  const response = await apiClient.patch<RawSchool>(`/hierarchy/schools/${id}/`, payload);
  return mapRawSchool(response.data);
}

/**
 * DELETE /api/hierarchy/schools/{id}/
 */
export async function deleteSchoolAPI(id: string): Promise<void> {
  await apiClient.delete(`/hierarchy/schools/${id}/`);
}

/**
 * GET /api/hierarchy/faculties/
 */
export async function getFacultiesList(): Promise<Faculty[]> {
  const response = await apiClient.get<RawFaculty[] | { results: RawFaculty[] }>("/hierarchy/faculties/");
  const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return list.map(mapRawFaculty);
}

/**
 * POST /api/hierarchy/faculties/
 */
export async function createFacultyAPI(payload: { school: number | string; name: string; code: string }): Promise<Faculty> {
  const response = await apiClient.post<RawFaculty>("/hierarchy/faculties/", payload);
  return mapRawFaculty(response.data);
}

/**
 * PATCH /api/hierarchy/faculties/{id}/
 */
export async function updateFacultyAPI(id: string, payload: { school?: number | string; name?: string; code?: string }): Promise<Faculty> {
  const response = await apiClient.patch<RawFaculty>(`/hierarchy/faculties/${id}/`, payload);
  return mapRawFaculty(response.data);
}

/**
 * DELETE /api/hierarchy/faculties/{id}/
 */
export async function deleteFacultyAPI(id: string): Promise<void> {
  await apiClient.delete(`/hierarchy/faculties/${id}/`);
}

/**
 * GET /api/hierarchy/departments/
 */
export async function getDepartmentsList(): Promise<Department[]> {
  const response = await apiClient.get<RawDepartment[] | { results: RawDepartment[] }>("/hierarchy/departments/");
  const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
  return list.map(mapRawDepartment);
}

/**
 * POST /api/hierarchy/departments/
 */
export async function createDepartmentAPI(payload: { faculty: number | string; name: string; code: string }): Promise<Department> {
  const response = await apiClient.post<RawDepartment>("/hierarchy/departments/", payload);
  return mapRawDepartment(response.data);
}

/**
 * PATCH /api/hierarchy/departments/{id}/
 */
export async function updateDepartmentAPI(id: string, payload: { faculty?: number | string; name?: string; code?: string }): Promise<Department> {
  const response = await apiClient.patch<RawDepartment>(`/hierarchy/departments/${id}/`, payload);
  return mapRawDepartment(response.data);
}

/**
 * DELETE /api/hierarchy/departments/{id}/
 */
export async function deleteDepartmentAPI(id: string): Promise<void> {
  await apiClient.delete(`/hierarchy/departments/${id}/`);
}
