import apiClient from "@/api/apiClient";
import type { Venue, Facility, AdminLevel, VenueType } from "@/types";

interface RawFacility {
  id: number | string;
  name: string;
}

interface RawVenue {
  id: number | string;
  name: string;
  venue_type: VenueType;
  capacity: number;
  exam_capacity?: number;
  facilities?: (number | string)[];
  facilities_details?: RawFacility[];
  owning_level: AdminLevel;
  owning_department?: number | string | null;
  owning_department_name?: string;
  owning_faculty?: number | string | null;
  owning_faculty_name?: string;
  owning_school?: number | string | null;
  owning_school_name?: string;
  is_active: boolean;
  created_at?: string;
}

export function mapRawVenueToVenue(raw: RawVenue): Venue {
  return {
    id: String(raw.id),
    name: raw.name,
    venueType: raw.venue_type,
    capacity: raw.capacity,
    examCapacity: raw.exam_capacity,
    owningLevel: raw.owning_level || "department",
    owningDepartmentId: raw.owning_department ? String(raw.owning_department) : undefined,
    owningDepartmentName: raw.owning_department_name,
    facilities: Array.isArray(raw.facilities_details)
      ? raw.facilities_details.map((f) => ({ id: String(f.id), name: f.name }))
      : [],
    isAvailable: raw.is_active ?? true,
  };
}

export function mapVenueToRawPayload(data: Partial<Venue> & { scopeId?: string }) {
  const facilityIds = Array.isArray(data.facilities)
    ? data.facilities.map((f) => (typeof f === "object" ? Number(f.id) : Number(f))).filter(Boolean)
    : [];

  const owningLevel = data.owningLevel || "department";
  const targetScopeId = data.scopeId || data.owningDepartmentId;

  return {
    name: data.name,
    venue_type: data.venueType || "lecture_hall",
    capacity: Number(data.capacity || 0),
    exam_capacity: data.examCapacity ? Number(data.examCapacity) : undefined,
    facilities: facilityIds,
    owning_level: owningLevel,
    owning_department: owningLevel === "department" && targetScopeId ? Number(targetScopeId) : undefined,
    owning_faculty: owningLevel === "faculty" && targetScopeId ? Number(targetScopeId) : undefined,
    owning_school: owningLevel === "school" && targetScopeId ? Number(targetScopeId) : undefined,
    is_active: data.isAvailable ?? true,
  };
}

export const getVenues = async (): Promise<Venue[]> => {
  try {
    const response = await apiClient.get<RawVenue[] | { results: RawVenue[] }>("/venues/venues/");
    const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
    return list.map(mapRawVenueToVenue);
  } catch (err) {
    console.warn("Backend API /venues/venues/ error:", err);
    return [];
  }
};

export const getVenueById = async (id: string): Promise<Venue> => {
  const response = await apiClient.get<RawVenue>(`/venues/venues/${id}/`);
  return mapRawVenueToVenue(response.data);
};

export const createVenueAPI = async (data: Partial<Venue> & { scopeId?: string }): Promise<Venue> => {
  const payload = mapVenueToRawPayload(data);
  const response = await apiClient.post<RawVenue>("/venues/venues/", payload);
  return mapRawVenueToVenue(response.data);
};

export const updateVenueAPI = async (
  id: string,
  data: Partial<Venue> & { scopeId?: string }
): Promise<Venue> => {
  const payload = mapVenueToRawPayload(data);
  const response = await apiClient.patch<RawVenue>(`/venues/venues/${id}/`, payload);
  return mapRawVenueToVenue(response.data);
};

export const deleteVenueAPI = async (id: string): Promise<void> => {
  await apiClient.delete(`/venues/venues/${id}/`);
};

export const activateVenueAPI = async (id: string): Promise<Venue> => {
  const response = await apiClient.post<RawVenue>(`/venues/venues/${id}/activate/`);
  return mapRawVenueToVenue(response.data);
};

export const deactivateVenueAPI = async (id: string): Promise<Venue> => {
  const response = await apiClient.post<RawVenue>(`/venues/venues/${id}/deactivate/`);
  return mapRawVenueToVenue(response.data);
};

export const getFacilities = async (): Promise<Facility[]> => {
  try {
    const response = await apiClient.get<RawFacility[] | { results: RawFacility[] }>(
      "/venues/facilities/"
    );
    const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
    return list.map((f) => ({ id: String(f.id), name: f.name }));
  } catch (err) {
    console.warn("Backend API /venues/facilities/ error:", err);
    return [];
  }
};

export const createFacilityAPI = async (payload: { name: string }): Promise<Facility> => {
  const response = await apiClient.post<RawFacility>("/venues/facilities/", payload);
  return { id: String(response.data.id), name: response.data.name };
};

export const deleteFacilityAPI = async (id: string): Promise<void> => {
  await apiClient.delete(`/venues/facilities/${id}/`);
};
