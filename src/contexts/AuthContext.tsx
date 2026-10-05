import React, {
	createContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from "react";
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
export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

function mapRawToUser(rawUser: ApiUserRaw, rawProfile?: ApiProfileRaw): User {
	const rawScopeLevel = rawProfile?.scope_level;
	const scopeLevel = (rawScopeLevel === "university" || (!rawScopeLevel && rawUser.is_superuser))
		? "system"
		: rawScopeLevel;
	const scopeId = rawProfile?.scope_id ? String(rawProfile.scope_id) : undefined;
	const scopeName = rawProfile?.scope_name;

	// Resolve department ID: prioritize numeric ID fields over raw name string
	const resolvedDeptId =
		rawProfile?.department_id !== undefined && rawProfile?.department_id !== null && rawProfile?.department_id !== ""
			? String(rawProfile.department_id)
			: rawProfile?.scope_department_id !== undefined && rawProfile?.scope_department_id !== null && rawProfile?.scope_department_id !== ""
				? String(rawProfile.scope_department_id)
				: scopeLevel === "department" && scopeId
					? scopeId
					: rawProfile?.department && !isNaN(Number(rawProfile.department))
						? String(rawProfile.department)
						: undefined;

	const resolvedDeptName =
		rawProfile?.department_name ||
		(scopeLevel === "department" ? scopeName : undefined) ||
		(typeof rawProfile?.department === "string" ? rawProfile.department : undefined);

	const resolvedFacultyId =
		rawProfile?.faculty_id !== undefined && rawProfile?.faculty_id !== null && rawProfile?.faculty_id !== ""
			? String(rawProfile.faculty_id)
			: rawProfile?.scope_faculty_id !== undefined && rawProfile?.scope_faculty_id !== null && rawProfile?.scope_faculty_id !== ""
				? String(rawProfile.scope_faculty_id)
				: scopeLevel === "faculty" && scopeId
					? scopeId
					: undefined;

	const resolvedFacultyName =
		rawProfile?.faculty_name || (scopeLevel === "faculty" ? scopeName : undefined);

	const resolvedSchoolId =
		rawProfile?.school_id !== undefined && rawProfile?.school_id !== null && rawProfile?.school_id !== ""
			? String(rawProfile.school_id)
			: rawProfile?.scope_school_id !== undefined && rawProfile?.scope_school_id !== null && rawProfile?.scope_school_id !== ""
				? String(rawProfile.scope_school_id)
				: scopeLevel === "school" && scopeId
					? scopeId
					: undefined;

	const resolvedSchoolName =
		rawProfile?.school_name || (scopeLevel === "school" ? scopeName : undefined);

	return {
		id: String(rawUser.id),
		isActive: rawUser.is_active,
		identifier: rawUser.identifier,
		name: rawProfile?.full_name || (rawUser.is_superuser ? `System Administrator (${rawUser.identifier})` : rawUser.identifier),
		email: rawProfile?.email || "",
		role: rawUser.role,
		staffId: rawProfile?.staff_id || rawUser.identifier,
		matricNumber: rawProfile?.matric_number,
		departmentId: resolvedDeptId,
		departmentName: resolvedDeptName,
		facultyId: resolvedFacultyId,
		facultyName: resolvedFacultyName,
		schoolId: resolvedSchoolId,
		schoolName: resolvedSchoolName,
		adminLevel: (scopeLevel || (rawUser.is_superuser ? "system" : undefined)) as User["adminLevel"],
		adminScopeId: scopeId,
		adminScopeName: scopeName || (rawUser.is_superuser ? "System Scope" : undefined),
		level: rawProfile?.level,
		isClassRep: rawProfile?.is_class_rep,
		requiresPasswordReset: rawUser.requires_password_reset,
	};
}

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [requiresPasswordReset, setRequiresPasswordReset] =
		useState<boolean>(false);

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
			const errorObj = err as {
				response?: {
					status?: number;
					data?: { requires_password_reset?: boolean };
				};
			};
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

	const login = async (
		credentials: LoginCredentials,
	): Promise<LoginResponse> => {
		const data = await loginAPI(credentials);
		localStorage.setItem(TOKEN_KEYS.ACCESS, data.tokens.access);
		localStorage.setItem(TOKEN_KEYS.REFRESH, data.tokens.refresh);

		const mappedUser = mapRawToUser(data.user, data.profile);
		setUser(mappedUser);

		const requiresReset = Boolean(
			data.requires_password_reset || data.user.requires_password_reset,
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
