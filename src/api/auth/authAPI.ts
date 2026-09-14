import apiClient from "../apiClient";
import type { UserRole } from "@/types";

export interface ApiUserRaw {
  id: number;
  identifier: string;
  role: UserRole;
  requires_password_reset: boolean;
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
}

export interface ApiProfileRaw {
  id: number;
  matric_number?: string;
  staff_id?: string;
  full_name?: string;
  department?: number;
  department_name?: string;
  scope_level?: "department" | "faculty" | "school" | "university";
  scope_id?: number;
  scope_name?: string;
  level?: number;
  is_class_rep?: boolean;
  email?: string;
  [key: string]: unknown;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  user: ApiUserRaw;
  tokens: {
    access: string;
    refresh: string;
  };
  requires_password_reset: boolean;
  profile: ApiProfileRaw;
}

export interface ProfileResponse {
  user: ApiUserRaw;
  profile: ApiProfileRaw;
}

export interface ResetPasswordPayload {
  new_password: string;
}

export interface ResetPasswordResponse {
  detail: string;
}

/**
 * Perform user login via POST /api/auth/login/
 */
export async function loginAPI(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login/", credentials);
  return response.data;
}

/**
 * Perform forced first-login password reset via POST /api/auth/password-reset/
 */
export async function resetPasswordAPI(
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
  const response = await apiClient.post<ResetPasswordResponse>(
    "/auth/password-reset/",
    payload
  );
  return response.data;
}

/**
 * Get current user profile via GET /api/auth/profile/
 */
export async function getProfileAPI(): Promise<ProfileResponse> {
  const response = await apiClient.get<ProfileResponse>("/auth/profile/");
  return response.data;
}
