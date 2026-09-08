import apiClient from "../apiClient";

export interface DepartmentStudentCount {
  id: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  facultyId: string;
  facultyName: string;
  schoolId: string;
  schoolName: string;
  level: number;
  count: number;
  updatedByName?: string;
  updatedAt: string;
}

export interface StudentCountAnalytics {
  summary: {
    totalStudents: number;
    levelsReporting: number;
    departmentsReporting?: number;
    facultiesReporting?: number;
    schoolsReporting?: number;
  };
  availableDimensions: Array<"level" | "department" | "faculty" | "school">;
  byDepartment: Array<{ departmentId: string; departmentName: string; departmentCode: string; facultyId: string; facultyName: string; schoolId: string; schoolName: string; studentCount: number }>;
  byFaculty: Array<{ facultyId: string; facultyName: string; studentCount: number }>;
  bySchool: Array<{ schoolId: string; schoolName: string; studentCount: number }>;
  byLevel: Array<{ level: number; studentCount: number }>;
}

interface RawCount {
  id: number | string; department: number | string; department_name: string; department_code: string;
  faculty_id: number | string; faculty_name: string; school_id: number | string; school_name: string;
  level: number; count: number; updated_by_name?: string; updated_at: string;
}

const mapCount = (item: RawCount): DepartmentStudentCount => ({
  id: String(item.id), departmentId: String(item.department), departmentName: item.department_name,
  departmentCode: item.department_code, facultyId: String(item.faculty_id), facultyName: item.faculty_name,
  schoolId: String(item.school_id), schoolName: item.school_name, level: item.level, count: item.count,
  updatedByName: item.updated_by_name, updatedAt: item.updated_at,
});

export async function getDepartmentStudentCounts(): Promise<DepartmentStudentCount[]> {
  const response = await apiClient.get<RawCount[] | { results: RawCount[] }>("/student-counts/departments/");
  const data = Array.isArray(response.data) ? response.data : response.data.results || [];
  return data.map(mapCount);
}

export async function saveDepartmentStudentCount(payload: { id?: string; department: string; level: number; count: number }): Promise<DepartmentStudentCount> {
  const response = payload.id
    ? await apiClient.patch<RawCount>(`/student-counts/departments/${payload.id}/`, { count: payload.count })
    : await apiClient.post<RawCount>("/student-counts/departments/", { department: payload.department, level: payload.level, count: payload.count });
  return mapCount(response.data);
}

export async function getStudentCountAnalytics(filters: { departmentId?: string; facultyId?: string; schoolId?: string; level?: string }): Promise<StudentCountAnalytics> {
  const params: Record<string, string> = {};
  if (filters.departmentId) params.department_id = filters.departmentId;
  if (filters.facultyId) params.faculty_id = filters.facultyId;
  if (filters.schoolId) params.school_id = filters.schoolId;
  if (filters.level) params.level = filters.level;
  const response = await apiClient.get("/student-counts/departments/analytics/", { params });
  const data = response.data;
  return {
    summary: {
      totalStudents: data.summary?.total_students ?? 0,
      levelsReporting: data.summary?.levels_reporting ?? 0,
      departmentsReporting: data.summary?.departments_reporting,
      facultiesReporting: data.summary?.faculties_reporting,
      schoolsReporting: data.summary?.schools_reporting,
    },
    availableDimensions: data.available_dimensions || ["level"],
    byDepartment: (data.by_department || []).map((item: Record<string, unknown>) => ({
      departmentId: String(item.department_id), departmentName: String(item.department_name), departmentCode: String(item.department_code),
      facultyId: String(item.faculty_id), facultyName: String(item.faculty_name), schoolId: String(item.school_id), schoolName: String(item.school_name), studentCount: Number(item.student_count ?? 0),
    })),
    byFaculty: (data.by_faculty || []).map((item: Record<string, unknown>) => ({ facultyId: String(item.faculty_id), facultyName: String(item.faculty_name), studentCount: Number(item.student_count ?? 0) })),
    bySchool: (data.by_school || []).map((item: Record<string, unknown>) => ({ schoolId: String(item.school_id), schoolName: String(item.school_name), studentCount: Number(item.student_count ?? 0) })),
    byLevel: (data.by_level || []).map((item: Record<string, unknown>) => ({ level: Number(item.level), studentCount: Number(item.student_count ?? 0) })),
  };
}
