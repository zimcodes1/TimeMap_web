import apiClient from "../apiClient";
import type {
  HoldRateAnalytics,
  VenueUtilizationAnalytics,
  DiscrepancyAnalytics,
  Department,
} from "@/types";

export interface AnalyticsFilterParams {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  groupBy?: string;
}

export interface DashboardSummaryCounts {
  totalVenues: number;
  activeCourses: number;
  pendingDiscrepancies: number;
  unreportedFlags: number;
}

interface RawHoldRateResponse {
  summary?: {
    total_sessions?: number;
    total_reports?: number;
    held_count?: number;
    not_held_count?: number;
    unreported_count?: number;
    hold_rate_percentage?: number;
  };
  breakdown?: Array<{
    key?: string;
    label?: string;
    course_id?: number | string;
    course_code?: string;
    course_title?: string;
    total_sessions?: number;
    total_reports?: number;
    held_count?: number;
    not_held_count?: number;
    unreported_count?: number;
    hold_rate_percentage?: number;
  }>;
}

interface RawVenueUtilizationResponse {
  summary?: {
    total_venues?: number;
    total_booked_hours?: number;
  };
  breakdown?: Array<{
    venue_id?: number | string;
    venue_name?: string;
    total_booked_hours?: number;
    total_sessions?: number;
  }>;
}

interface RawDiscrepancyAnalyticsResponse {
  summary?: {
    total_discrepancies?: number;
    by_status?: {
      approved?: number;
      rejected?: number;
      pending?: number;
      withdrawn?: number;
      [key: string]: number | undefined;
    };
    by_request_type?: Record<string, number>;
  };
}

/**
 * GET /api/reporting/analytics/lecture-hold-rate/
 */
export async function getLectureHoldRateAnalytics(
  params: AnalyticsFilterParams
): Promise<HoldRateAnalytics> {
  const queryParams: Record<string, string> = {};
  if (params.startDate) queryParams.start_date = params.startDate;
  if (params.endDate) queryParams.end_date = params.endDate;
  if (params.departmentId) queryParams.department_id = params.departmentId;
  if (params.groupBy) queryParams.group_by = params.groupBy;

  const response = await apiClient.get<RawHoldRateResponse>(
    "/reporting/analytics/lecture-hold-rate/",
    { params: queryParams }
  );

  const data = response.data;
  return {
    summary: {
      totalReports: data.summary?.total_reports ?? 0,
      totalSessions: data.summary?.total_sessions ?? 0,
      heldCount: data.summary?.held_count ?? 0,
      notHeldCount: data.summary?.not_held_count ?? 0,
      unreportedCount: data.summary?.unreported_count ?? 0,
      holdRatePercentage: data.summary?.hold_rate_percentage ?? 0,
    },
    breakdown: (data.breakdown || []).map((item) => ({
      key: item.key,
      label: item.label,
      courseId: item.course_id ? String(item.course_id) : undefined,
      courseCode: item.course_code || "",
      courseTitle: item.course_title,
      heldCount: item.held_count ?? 0,
      notHeldCount: item.not_held_count ?? 0,
      unreportedCount: item.unreported_count ?? 0,
      totalReports: item.total_reports ?? 0,
      totalSessions: item.total_sessions ?? 0,
      totalCount: item.total_sessions ?? item.total_reports ?? 0,
      holdRatePercentage: item.hold_rate_percentage ?? 0,
    })),
  };
}

/**
 * GET /api/reporting/analytics/venue-utilization/
 */
export async function getVenueUtilizationAnalytics(
  params: AnalyticsFilterParams
): Promise<VenueUtilizationAnalytics> {
  const queryParams: Record<string, string> = {};
  if (params.startDate) queryParams.start_date = params.startDate;
  if (params.endDate) queryParams.end_date = params.endDate;

  const response = await apiClient.get<RawVenueUtilizationResponse>(
    "/reporting/analytics/venue-utilization/",
    { params: queryParams }
  );

  const data = response.data;
  return {
    summary: {
      totalVenues: data.summary?.total_venues ?? 0,
      totalBookedHours: data.summary?.total_booked_hours ?? 0,
    },
    breakdown: (data.breakdown || []).map((item) => ({
      venueId: item.venue_id ? String(item.venue_id) : "",
      venueName: item.venue_name || "Venue",
      totalBookedHours: item.total_booked_hours ?? 0,
      totalSessions: item.total_sessions ?? 0,
    })),
  };
}

/**
 * GET /api/reporting/analytics/discrepancy-frequency/
 */
export async function getDiscrepancyAnalytics(
  params: AnalyticsFilterParams
): Promise<DiscrepancyAnalytics> {
  const queryParams: Record<string, string> = {};
  if (params.startDate) queryParams.start_date = params.startDate;
  if (params.endDate) queryParams.end_date = params.endDate;

  const response = await apiClient.get<RawDiscrepancyAnalyticsResponse>(
    "/reporting/analytics/discrepancy-frequency/",
    { params: queryParams }
  );

  const data = response.data;
  return {
    summary: {
      totalDiscrepancies: data.summary?.total_discrepancies ?? 0,
      byStatus: {
        approved: data.summary?.by_status?.approved ?? 0,
        rejected: data.summary?.by_status?.rejected ?? 0,
        pending: data.summary?.by_status?.pending ?? 0,
        withdrawn: data.summary?.by_status?.withdrawn ?? 0,
      },
      byRequestType: data.summary?.by_request_type || {},
    },
  };
}

/**
 * Fetch summary counts for top 4 cards
 */
export async function getDashboardSummaryCounts(): Promise<DashboardSummaryCounts> {
  const [venuesRes, coursesRes, requestsRes, flagsRes] = await Promise.allSettled([
    apiClient.get("/venues/venues/"),
    apiClient.get("/courses/courses/"),
    apiClient.get("/discrepancies/requests/", { params: { status: "pending" } }),
    apiClient.get("/reporting/flags/", { params: { acknowledged: "false" } }),
  ]);

  const countFromRes = (res: PromiseSettledResult<unknown>): number => {
    if (res.status === "fulfilled" && res.value && typeof res.value === "object" && "data" in res.value) {
      const data = (res.value as { data: unknown }).data;
      if (Array.isArray(data)) return data.length;
      if (data && typeof data === "object" && "count" in data && typeof data.count === "number") {
        return data.count;
      }
      if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) {
        return data.results.length;
      }
    }
    return 0;
  };

  return {
    totalVenues: countFromRes(venuesRes),
    activeCourses: countFromRes(coursesRes),
    pendingDiscrepancies: countFromRes(requestsRes),
    unreportedFlags: countFromRes(flagsRes),
  };
}

/**
 * GET /api/hierarchy/departments/
 */
export async function getDepartmentsList(): Promise<Department[]> {
  try {
    const response = await apiClient.get("/hierarchy/departments/");
    const data = response.data;
    const list = Array.isArray(data) ? data : data?.results || [];
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
