import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import StudentsView from "@/pages/main/StudentsView";
import { getDepartmentStudentCounts, getStudentCountAnalytics, saveDepartmentStudentCount } from "@/api/main/studentCountsAPI";
import { getDepartmentsList, getFacultiesList, getSchoolsList } from "@/api/main/hierarchyAPI";
import { filterDepartmentsByScope, filterFacultiesByScope, filterSchoolsByScope } from "@/lib/scopeUtils";
import { useAuth } from "@/hooks/useAuth";

export default function StudentsContainer() {
  const { user } = useAuth(); const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ departmentId: "", facultyId: "", schoolId: "", level: "" });
  const { data: counts = [] } = useQuery({ queryKey: ["student-counts"], queryFn: getDepartmentStudentCounts });
  const { data: departments = [] } = useQuery({ queryKey: ["hierarchy", "departments"], queryFn: getDepartmentsList });
  const { data: faculties = [] } = useQuery({ queryKey: ["hierarchy", "faculties"], queryFn: getFacultiesList });
  const { data: schools = [] } = useQuery({ queryKey: ["hierarchy", "schools"], queryFn: getSchoolsList });
  const analyticsQuery = useQuery({ queryKey: ["student-counts", "analytics", filters], queryFn: () => getStudentCountAnalytics(filters) });
  const mutation = useMutation({ mutationFn: saveDepartmentStudentCount, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["student-counts"] }); toast.success("Department student total saved"); }, onError: () => toast.error("Could not save the department total") });
  const scopedDepartments = useMemo(() => filterDepartmentsByScope(departments, user, faculties), [departments, user, faculties]);
  const scopedFaculties = useMemo(() => filterFacultiesByScope(faculties, user, departments), [faculties, user, departments]);
  const scopedSchools = useMemo(() => filterSchoolsByScope(schools, user), [schools, user]);
  const save = async (level: number, count: number) => { const departmentId = user?.adminScopeId || user?.departmentId; const existing = counts.find((item) => item.departmentId === departmentId && item.level === level); if (!departmentId) return; await mutation.mutateAsync({ id: existing?.id, department: departmentId, level, count }); };
  return <StudentsView user={user} counts={counts} analytics={analyticsQuery.data} departments={scopedDepartments} faculties={scopedFaculties} schools={scopedSchools} filters={filters} onFiltersChange={setFilters} onSave={save} saving={mutation.isPending} loading={analyticsQuery.isLoading} />;
}
