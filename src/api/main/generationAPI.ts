import apiClient from "@/api/apiClient";
import type {
  TimetableGenerationRun,
  GenerationScopePermission,
  GenerateTimetablePayload,
  PublishRunResult,
  GenerationStatus,
  GenerationResultStatus,
} from "@/types";

interface RawGenerationRun {
  id: string;
  semester: number | string;
  semester_name?: string;
  scope_type: "school" | "faculty" | "department";
  scope_id: number | string;
  scope_name?: string;
  status: GenerationStatus;
  result_status: GenerationResultStatus;
  hard_conflicts_count: number;
  student_conflicts_count: number;
  lecturer_conflicts_count: number;
  venue_conflicts_count: number;
  daily_limit_violations_count: number;
  occurrence_day_violations_count: number;
  capacity_penalty: number;
  fitness_score: number;
  conflict_report?: any;
  generation_metrics?: any;
  assignments_payload?: any[];
  is_published: boolean;
  initiated_by?: number | string | null;
  initiated_by_name?: string | null;
  created_at: string;
  completed_at?: string | null;
}

interface RawGenerationScopePermission {
  id: number | string;
  school: number | string;
  school_name?: string;
  allow_faculty_generation: boolean;
  allow_department_generation: boolean;
  updated_at?: string;
}

export function mapRawRunToRun(raw: RawGenerationRun): TimetableGenerationRun {
  return {
    id: String(raw.id),
    semesterId: String(raw.semester),
    semesterName: raw.semester_name,
    scopeType: raw.scope_type,
    scopeId: String(raw.scope_id),
    scopeName: raw.scope_name,
    status: raw.status,
    resultStatus: raw.result_status,
    hardConflictsCount: raw.hard_conflicts_count ?? 0,
    studentConflictsCount: raw.student_conflicts_count ?? 0,
    lecturerConflictsCount: raw.lecturer_conflicts_count ?? 0,
    venueConflictsCount: raw.venue_conflicts_count ?? 0,
    dailyLimitViolationsCount: raw.daily_limit_violations_count ?? 0,
    occurrenceDayViolationsCount: raw.occurrence_day_violations_count ?? 0,
    capacityPenalty: raw.capacity_penalty ?? 0,
    fitnessScore: raw.fitness_score ?? 0,
    conflictReport: {
      ...raw.conflict_report,
      student_conflicts:
        raw.conflict_report?.details?.student_conflicts ??
        raw.conflict_report?.student_conflicts ??
        [],
      lecturer_conflicts:
        raw.conflict_report?.details?.lecturer_conflicts ??
        raw.conflict_report?.lecturer_conflicts ??
        [],
      venue_conflicts:
        raw.conflict_report?.details?.venue_conflicts ??
        raw.conflict_report?.venue_conflicts ??
        [],
      daily_limit_violations:
        raw.conflict_report?.details?.daily_limit_violations ??
        raw.conflict_report?.daily_limit_violations ??
        [],
      occurrence_day_violations:
        raw.conflict_report?.details?.occurrence_day_violations ??
        raw.conflict_report?.occurrence_day_violations ??
        [],
      capacity_violations:
        raw.conflict_report?.details?.capacity_overflows ??
        raw.conflict_report?.details?.capacity_violations ??
        raw.conflict_report?.capacity_violations ??
        raw.conflict_report?.capacity_overflows ??
        [],
    },
    generationMetrics: {
      ...raw.generation_metrics,
      runtime_seconds:
        raw.generation_metrics?.runtime_seconds ??
        raw.generation_metrics?.elapsed_seconds ??
        0,
      elapsed_seconds:
        raw.generation_metrics?.elapsed_seconds ??
        raw.generation_metrics?.runtime_seconds ??
        0,
    },
    assignmentsPayload: raw.assignments_payload || [],
    isPublished: Boolean(raw.is_published),
    initiatedByName: raw.initiated_by_name ?? undefined,
    createdAt: raw.created_at,
    completedAt: raw.completed_at ?? undefined,
  };
}

export function mapRawPermissionToPermission(
  raw: RawGenerationScopePermission
): GenerationScopePermission {
  return {
    id: String(raw.id),
    schoolId: String(raw.school),
    schoolName: raw.school_name,
    allowFacultyGeneration: Boolean(raw.allow_faculty_generation),
    allowDepartmentGeneration: Boolean(raw.allow_department_generation),
    updatedAt: raw.updated_at,
  };
}

/**
 * Trigger Genetic Algorithm timetable generation
 * POST /api/scheduling/generate/
 */
export async function generateTimetable(
  payload: GenerateTimetablePayload
): Promise<TimetableGenerationRun> {
  const semesterId = Number(payload.semester_id || payload.semester);
  const scopeId = Number(payload.scope_id);

  if (!semesterId || isNaN(semesterId)) {
    throw new Error("Invalid semester ID. Please select an active semester.");
  }
  if (!scopeId || isNaN(scopeId)) {
    throw new Error("Invalid scope ID. Please select a valid target scope.");
  }

  const response = await apiClient.post<RawGenerationRun>(
    "/scheduling/generate/",
    {
      semester_id: semesterId,
      semester: semesterId,
      scope_type: payload.scope_type,
      scope_id: scopeId,
      population_size: payload.population_size,
      max_generations: payload.max_generations,
      mutation_rate: payload.mutation_rate,
      stagnation_limit: payload.stagnation_limit,
      publish_immediately: payload.publish_immediately ?? false,
    }
  );
  return mapRawRunToRun(response.data);
}

/**
 * List past generation runs
 * GET /api/scheduling/generate/runs/
 */
export async function getGenerationRuns(params?: {
  semester?: string | number;
  scope_type?: string;
  scope_id?: string | number;
}): Promise<TimetableGenerationRun[]> {
  const response = await apiClient.get<RawGenerationRun[]>(
    "/scheduling/generate/runs/",
    {
      params: {
        semester: params?.semester,
        scope_type: params?.scope_type,
        scope_id: params?.scope_id,
      },
    }
  );
  const data = Array.isArray(response.data) ? response.data : [];
  return data.map(mapRawRunToRun);
}

/**
 * Get detailed diagnostics for a single generation run
 * GET /api/scheduling/generate/runs/{run_id}/
 */
export async function getGenerationRunDetail(
  runId: string
): Promise<TimetableGenerationRun> {
  const response = await apiClient.get<RawGenerationRun>(
    `/scheduling/generate/runs/${runId}/`
  );
  return mapRawRunToRun(response.data);
}

export const getGenerationRun = getGenerationRunDetail;

/**
 * Publish a generated run into live TimetableEntry & LectureSession records
 * POST /api/scheduling/generate/runs/{run_id}/publish/
 */
export async function publishGenerationRun(
  runId: string
): Promise<PublishRunResult> {
  const response = await apiClient.post<PublishRunResult>(
    `/scheduling/generate/runs/${runId}/publish/`
  );
  return response.data;
}

/**
 * Fetch generation permissions for a school
 * GET /api/scheduling/generate/permissions/?school={school_id}
 */
export async function getGenerationPermissions(
  schoolId?: string | number
): Promise<GenerationScopePermission> {
  const response = await apiClient.get<RawGenerationScopePermission>(
    "/scheduling/generate/permissions/",
    {
      params: schoolId ? { school: schoolId } : undefined,
    }
  );
  return mapRawPermissionToPermission(response.data);
}

/**
 * Update generation permissions (Superuser only)
 * PATCH /api/scheduling/generate/permissions/
 */
export async function updateGenerationPermissions(payload: {
  school: string | number;
  allow_faculty_generation?: boolean;
  allow_department_generation?: boolean;
}): Promise<GenerationScopePermission> {
  const response = await apiClient.patch<RawGenerationScopePermission>(
    "/scheduling/generate/permissions/",
    {
      school: Number(payload.school),
      allow_faculty_generation: payload.allow_faculty_generation,
      allow_department_generation: payload.allow_department_generation,
    }
  );
  return mapRawPermissionToPermission(response.data);
}

