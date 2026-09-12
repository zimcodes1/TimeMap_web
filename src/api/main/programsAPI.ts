import apiClient from "../apiClient";
import type { Program } from "@/types";

export interface RawProgram {
  id: number | string;
  department: number | string;
  department_name?: string;
  department_code?: string;
  faculty_id?: number | string;
  faculty_name?: string;
  school_id?: number | string;
  school_name?: string;
  name: string;
  code: string;
  max_level: number;
  is_default: boolean;
  created_at?: string;
}

export function mapRawProgram(raw: RawProgram): Program {
  return {
    id: String(raw.id),
    departmentId: String(raw.department),
    departmentName: raw.department_name,
    departmentCode: raw.department_code,
    facultyId: raw.faculty_id ? String(raw.faculty_id) : undefined,
    facultyName: raw.faculty_name,
    schoolId: raw.school_id ? String(raw.school_id) : undefined,
    schoolName: raw.school_name,
    name: raw.name,
    code: raw.code,
    maxLevel: raw.max_level,
    isDefault: Boolean(raw.is_default),
    createdAt: raw.created_at,
  };
}

export async function getPrograms(departmentId?: string | number): Promise<Program[]> {
  const params: Record<string, string | number> = {};
  if (departmentId) {
    params.department = departmentId;
  }
  const response = await apiClient.get<RawProgram[]>("/hierarchy/programs/", { params });
  return (response.data || []).map(mapRawProgram);
}

export async function createProgram(data: {
  department: string | number;
  name: string;
  code: string;
  max_level?: number;
}): Promise<Program> {
  const response = await apiClient.post<RawProgram>("/hierarchy/programs/", data);
  return mapRawProgram(response.data);
}

export async function updateProgram(
  id: string | number,
  data: Partial<{
    name: string;
    code: string;
    max_level: number;
  }>
): Promise<Program> {
  const response = await apiClient.patch<RawProgram>(`/hierarchy/programs/${id}/`, data);
  return mapRawProgram(response.data);
}

export async function deleteProgram(id: string | number): Promise<void> {
  await apiClient.delete(`/hierarchy/programs/${id}/`);
}

