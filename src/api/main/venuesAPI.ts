import apiClient from '@/api/apiClient';
import type { Venue, Facility } from '@/types';

/**
 * API endpoints for Venues and Facilities management
 */

export const getVenues = async (): Promise<Venue[]> => {
  try {
    const response = await apiClient.get<Venue[] | { results: Venue[] }>('/venues/venues/');
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray((data as { results: Venue[] }).results)) {
      return (data as { results: Venue[] }).results;
    }
    return [];
  } catch (err) {
    console.warn('Backend API /venues/venues/ error:', err);
    return [];
  }
};

export const getVenueById = async (id: string): Promise<Venue> => {
  const response = await apiClient.get<Venue>(`/venues/venues/${id}/`);
  return response.data;
};

export const createVenueAPI = async (payload: Partial<Venue>): Promise<Venue> => {
  const response = await apiClient.post<Venue>('/venues/venues/', payload);
  return response.data;
};

export const updateVenueAPI = async (id: string, payload: Partial<Venue>): Promise<Venue> => {
  const response = await apiClient.patch<Venue>(`/venues/venues/${id}/`, payload);
  return response.data;
};

export const deleteVenueAPI = async (id: string): Promise<void> => {
  await apiClient.delete(`/venues/venues/${id}/`);
};

export const activateVenueAPI = async (id: string): Promise<Venue> => {
  const response = await apiClient.post<Venue>(`/venues/venues/${id}/activate/`);
  return response.data;
};

export const deactivateVenueAPI = async (id: string): Promise<Venue> => {
  const response = await apiClient.post<Venue>(`/venues/venues/${id}/deactivate/`);
  return response.data;
};

export const getFacilities = async (): Promise<Facility[]> => {
  try {
    const response = await apiClient.get<Facility[] | { results: Facility[] }>('/venues/facilities/');
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray((data as { results: Facility[] }).results)) {
      return (data as { results: Facility[] }).results;
    }
    return [];
  } catch (err) {
    console.warn('Backend API /venues/facilities/ error:', err);
    return [];
  }
};

export const createFacilityAPI = async (payload: { name: string; description?: string }): Promise<Facility> => {
  const response = await apiClient.post<Facility>('/venues/facilities/', payload);
  return response.data;
};

export const deleteFacilityAPI = async (id: string): Promise<void> => {
  await apiClient.delete(`/venues/facilities/${id}/`);
};
