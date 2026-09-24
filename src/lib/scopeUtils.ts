import type { User, Department, Faculty, School, GeneratedAssignment } from "@/types";

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

  return schools;
}

/**
 * Resolves the visible tabs for user management based on the managers-manage-managers model.
 * - Department Admin: Lecturers, Students (NO Admin Officers)
 * - Faculty Admin: Admin Officers only (NO Lecturers, NO Students)
 * - School Admin: Admin Officers only (NO Lecturers, NO Students)
 * - University Admin / Superuser: Admin Officers, Lecturers, Students
 */
export function getVisibleTabs(currentUser: User | null): ("admin" | "lecturer" | "student")[] {
  if (!currentUser) return ["admin", "lecturer", "student"];

  if (currentUser.role !== "admin") {
    return ["lecturer", "student"];
  }

  const level = currentUser.adminLevel;

  if (level === "department") {
    return ["lecturer", "student"];
  }

  if (level === "faculty" || level === "school") {
    return ["admin"];
  }

  // Superuser / University level
  return ["admin", "lecturer", "student"];
}

/**
 * Resolves the list of department IDs accessible by the current admin user.
 * - Department Admin: returns ONLY their assigned department ID.
 * - Faculty Admin: returns departments belonging to their assigned faculty.
 * - School Admin: returns departments in their school, optionally narrowed by selectedFacultyId.
 * - University Admin / Superuser: returns all departments, optionally narrowed by selectedFacultyId.
 */
export function getAdminAccessibleDepartmentIds(
  currentUser: User | null,
  allDepartments: Department[],
  allFaculties: Faculty[] = [],
  selectedFacultyId?: string
): string[] {
  if (!currentUser || currentUser.role !== "admin") {
    return allDepartments.map((d) => String(d.id));
  }

  const level = currentUser.adminLevel;

  // 1. Department Admin: strictly their own department
  if (level === "department") {
    const myDeptId = currentUser.adminScopeId || currentUser.departmentId;
    return myDeptId ? [String(myDeptId)] : [];
  }

  // 2. Faculty Admin: all departments in their assigned faculty
  if (level === "faculty") {
    const myFacultyId = currentUser.adminScopeId || currentUser.facultyId;
    if (!myFacultyId) return [];
    return allDepartments
      .filter((d) => String(d.facultyId) === String(myFacultyId))
      .map((d) => String(d.id));
  }

  // 3. School Admin: departments in their school, optionally filtered by selectedFacultyId
  if (level === "school") {
    const mySchoolId = currentUser.adminScopeId || currentUser.schoolId;
    if (!mySchoolId) return [];

    const facultiesInSchool = allFaculties.filter(
      (f) => String(f.schoolId) === String(mySchoolId)
    );

    let targetFaculties = facultiesInSchool;
    if (selectedFacultyId && selectedFacultyId !== "ALL") {
      targetFaculties = facultiesInSchool.filter(
        (f) => String(f.id) === String(selectedFacultyId)
      );
    }

    const targetFacultyIds = targetFaculties.map((f) => String(f.id));
    return allDepartments
      .filter((d) => targetFacultyIds.includes(String(d.facultyId)))
      .map((d) => String(d.id));
  }

  // 4. University Admin / Superuser: optionally filtered by selectedFacultyId
  if (selectedFacultyId && selectedFacultyId !== "ALL") {
    return allDepartments
      .filter((d) => String(d.facultyId) === String(selectedFacultyId))
      .map((d) => String(d.id));
  }

  return allDepartments.map((d) => String(d.id));
}

/**
 * Checks if a generated assignment belongs to the admin's accessible departments.
 */
export function isAssignmentInScope(
  a: GeneratedAssignment,
  accessibleDepartmentIds: string[]
): boolean {
  if (!accessibleDepartmentIds || accessibleDepartmentIds.length === 0) {
    return false;
  }

  // Check assignment's owning department
  if (a.department_id && accessibleDepartmentIds.includes(String(a.department_id))) {
    return true;
  }

  // Check if any attributed program's department matches
  if (a.programs && a.programs.length > 0) {
    const hasMatchingProgram = a.programs.some((p) => {
      const progDeptId = (p as any).department_id || (p as any).departmentId;
      return progDeptId && accessibleDepartmentIds.includes(String(progDeptId));
    });
    if (hasMatchingProgram) return true;
  }

  return false;
}

/**
 * Returns a human-readable scope label for the active admin inspection view.
 */
export function getAdminScopeLabel(
  currentUser: User | null,
  departments: Department[] = [],
  faculties: Faculty[] = [],
  selectedFacultyId?: string
): { title: string; subtitle?: string; level: string } {
  if (!currentUser || currentUser.role !== "admin") {
    return { title: "General View", level: "Guest" };
  }

  const level = currentUser.adminLevel || "university";

  if (level === "department") {
    const deptId = currentUser.adminScopeId || currentUser.departmentId;
    const dept = departments.find((d) => String(d.id) === String(deptId));
    return {
      title: dept ? dept.name : "Department Scope",
      subtitle: dept?.code ? `Code: ${dept.code}` : undefined,
      level: "Department Admin",
    };
  }

  if (level === "faculty") {
    const facId = currentUser.adminScopeId || currentUser.facultyId;
    const fac = faculties.find((f) => String(f.id) === String(facId));
    return {
      title: fac ? fac.name : "Faculty Scope",
      subtitle: fac?.code ? `Code: ${fac.code}` : undefined,
      level: "Faculty Admin",
    };
  }

  if (level === "school") {
    let subtitle = currentUser.schoolName || undefined;
    if (selectedFacultyId && selectedFacultyId !== "ALL") {
      const fac = faculties.find((f) => String(f.id) === String(selectedFacultyId));
      if (fac) subtitle = `Filtered to: ${fac.name}`;
    }
    return {
      title: currentUser.schoolName || "School Scope",
      subtitle,
      level: "School Admin",
    };
  }

  return {
    title: "University Scope",
    subtitle: selectedFacultyId && selectedFacultyId !== "ALL"
      ? `Filtered to: ${faculties.find((f) => String(f.id) === String(selectedFacultyId))?.name || "Faculty"}`
      : "Full Access",
    level: "University Admin",
  };
}

