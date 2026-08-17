import type { User, Department, Faculty, School } from "@/types";

/**
 * Resolves the numeric-level rank of a given admin level string.
 * superuser/university=4, school=3, faculty=2, department=1, student/lecturer=0
 */
export function getAdminLevelRank(role?: string, adminLevel?: string): number {
  if (role === "student" || role === "lecturer") return 0;
  if (!adminLevel) return 4; // superuser/system user
  const ranks: Record<string, number> = {
    department: 1,
    faculty: 2,
    school: 3,
    university: 4,
  };
  return ranks[adminLevel] ?? 1;
}

/**
 * Returns the scoped department ID for an admin user.
 * - Department Admin → adminScopeId (their assigned department)
 * - Faculty Admin → undefined (has access to many departments)
 * - School Admin → undefined
 * - Superuser → undefined (all departments)
 */
export function getAdminScopedDepartmentId(currentUser: User | null): string | undefined {
  if (!currentUser || currentUser.role !== "admin") return undefined;
  if (currentUser.adminLevel === "department") {
    // Department admins: scope = one specific department, stored as adminScopeId
    return currentUser.adminScopeId || currentUser.departmentId;
  }
  return undefined;
}

/**
 * Filters a list of departments according to the logged-in user's scope.
 *
 * - Department Admin: returns ONLY their single assigned department (adminScopeId).
 * - Faculty Admin: returns ONLY departments whose facultyId matches adminScopeId.
 * - School Admin: returns ONLY departments whose faculty belongs to adminScopeId school
 *   (requires faculties list to cross-reference).
 * - Superuser / University Admin / non-admin: returns all departments unfiltered.
 */
export function filterDepartmentsByScope(
  departments: Department[],
  currentUser: User | null,
  faculties: Faculty[] = []
): Department[] {
  if (!currentUser || currentUser.role !== "admin") {
    return departments;
  }

  const adminLevel = currentUser.adminLevel;

  if (adminLevel === "department") {
    // Scope = exactly one department
    const myDeptId = currentUser.adminScopeId || currentUser.departmentId;
    if (!myDeptId) return [];
    return departments.filter((d) => String(d.id) === String(myDeptId));
  }

  if (adminLevel === "faculty") {
    // Scope = all departments in my faculty
    const myFacultyId = currentUser.adminScopeId;
    if (!myFacultyId) return [];
    return departments.filter((d) => String(d.facultyId) === String(myFacultyId));
  }

  if (adminLevel === "school") {
    // Scope = all departments in faculties under my school
    const mySchoolId = currentUser.adminScopeId;
    if (!mySchoolId) return [];
    const myFacultyIds = faculties
      .filter((f) => String(f.schoolId) === String(mySchoolId))
      .map((f) => String(f.id));
    return departments.filter((d) => myFacultyIds.includes(String(d.facultyId)));
  }

  // university / superuser: no filter
  return departments;
}

/**
 * Filters a list of faculties according to the logged-in user's scope.
 *
 * - Faculty Admin: returns ONLY their single assigned faculty (adminScopeId).
 * - School Admin: returns ONLY faculties in their school (adminScopeId).
 * - Department Admin: returns the faculty their department belongs to (1 faculty).
 *   (requires departments list for lookup)
 * - Superuser / University Admin: returns all faculties.
 */
export function filterFacultiesByScope(
  faculties: Faculty[],
  currentUser: User | null,
  departments: Department[] = []
): Faculty[] {
  if (!currentUser || currentUser.role !== "admin") {
    return faculties;
  }

  const adminLevel = currentUser.adminLevel;

  if (adminLevel === "faculty") {
    const myFacultyId = currentUser.adminScopeId;
    if (!myFacultyId) return [];
    return faculties.filter((f) => String(f.id) === String(myFacultyId));
  }

  if (adminLevel === "school") {
    const mySchoolId = currentUser.adminScopeId;
    if (!mySchoolId) return [];
    return faculties.filter((f) => String(f.schoolId) === String(mySchoolId));
  }

  if (adminLevel === "department") {
    // Dept admin → belongs to 1 faculty
    const myDeptId = currentUser.adminScopeId || currentUser.departmentId;
    if (!myDeptId) return [];
    const myDept = departments.find((d) => String(d.id) === String(myDeptId));
    if (!myDept) return [];
    return faculties.filter((f) => String(f.id) === String(myDept.facultyId));
  }

  return faculties;
}

/**
 * Filters a list of schools according to the logged-in user's scope.
 *
 * - School Admin: returns ONLY their assigned school (adminScopeId).
 * - Faculty / Department Admin: returns the school their scope belongs to (1 school).
 * - Superuser / University Admin: returns all schools.
 */
export function filterSchoolsByScope(
  schools: School[],
  currentUser: User | null
): School[] {
  if (!currentUser || currentUser.role !== "admin") {
    return schools;
  }

  const adminLevel = currentUser.adminLevel;

  if (adminLevel === "school") {
    const mySchoolId = currentUser.adminScopeId;
    if (!mySchoolId) return [];
    return schools.filter((s) => String(s.id) === String(mySchoolId));
  }

  // faculty & department admins don't need to pick a school in forms
  // so return empty to prevent them seeing all schools
  if (adminLevel === "faculty" || adminLevel === "department") {
    return [];
  }

  return schools;
}
