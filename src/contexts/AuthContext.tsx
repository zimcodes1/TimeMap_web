import React, { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type User } from "@/types";
import {
  loginAPI,
  resetPasswordAPI,
  getProfileAPI,
  type LoginCredentials,
  type LoginResponse,
  type ApiUserRaw,
  type ApiProfileRaw,
} from "@/api/auth/authAPI";
import { TOKEN_KEYS } from "@/api/apiClient";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresPasswordReset: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  resetPassword: (newPassword: string) => Promise<void>;
  logout: () => void;
  refetchProfile: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapRawToUser(rawUser: ApiUserRaw, rawProfile?: ApiProfileRaw): User {
  return {
    id: String(rawUser.id),
    identifier: rawUser.identifier,
    name: rawProfile?.full_name || rawUser.identifier,
    email: rawProfile?.email || "",
    role: rawUser.role,
    staffId: rawProfile?.staff_id || rawUser.identifier,
    matricNumber: rawProfile?.matric_number,
    departmentId: rawProfile?.department ? String(rawProfile.department) : undefined,
    departmentName: rawProfile?.department_name,
    adminLevel: rawProfile?.scope_level as User["adminLevel"],
    adminScopeId: rawProfile?.scope_id ? String(rawProfile.scope_id) : undefined,
    level: rawProfile?.level,
    isClassRep: rawProfile?.is_class_rep,
    isActive: rawUser.is_active,
    requiresPasswordReset: rawUser.requires_password_reset,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [requiresPasswordReset, setRequiresPasswordReset] = useState<boolean>(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    setUser(null);
    setRequiresPasswordReset(false);
  }, []);

  const refetchProfile = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getProfileAPI();
      const mappedUser = mapRawToUser(response.user, response.profile);
      setUser(mappedUser);
      setRequiresPasswordReset(response.user.requires_password_reset);
    } catch (err: unknown) {
      // If profile returned 403 due to password reset enforcement
      const errorObj = err as { response?: { status?: number; data?: { requires_password_reset?: boolean } } };
      if (errorObj.response?.status === 403) {
        setRequiresPasswordReset(true);
      } else {
        // Token invalid or network issue
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetchProfile();

    const handleGlobalLogout = () => {
      logout();
    };

    window.addEventListener("auth:logout", handleGlobalLogout);
    return () => {
      window.removeEventListener("auth:logout", handleGlobalLogout);
    };
  }, [refetchProfile, logout]);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const data = await loginAPI(credentials);
    localStorage.setItem(TOKEN_KEYS.ACCESS, data.tokens.access);
    localStorage.setItem(TOKEN_KEYS.REFRESH, data.tokens.refresh);

    const mappedUser = mapRawToUser(data.user, data.profile);
    setUser(mappedUser);

    const requiresReset = Boolean(
      data.requires_password_reset || data.user.requires_password_reset
    );
    setRequiresPasswordReset(requiresReset);

    return data;
  };

  const resetPassword = async (newPassword: string): Promise<void> => {
    await resetPasswordAPI({ new_password: newPassword });
    setRequiresPasswordReset(false);
    if (user) {
      setUser({ ...user, requiresPasswordReset: false });
    }
    await refetchProfile();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user && localStorage.getItem(TOKEN_KEYS.ACCESS)),
    isLoading,
    requiresPasswordReset,
    login,
    resetPassword,
    logout,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
