import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import StudentsView from "@/pages/main/StudentsView";
import {
	getProgramStudentCounts,
	getStudentCountAnalytics,
	saveProgramStudentCount,
} from "@/api/main/studentCountsAPI";
import {
	getDepartmentsList,
	getFacultiesList,
	getSchoolsList,
} from "@/api/main/hierarchyAPI";
import { getPrograms } from "@/api/main/programsAPI";
import {
	filterDepartmentsByScope,
	filterFacultiesByScope,
	filterSchoolsByScope,
} from "@/lib/scopeUtils";
import { useAuth } from "@/hooks/useAuth";

export default function StudentsContainer() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [filters, setFilters] = useState<{
		departmentId: string;
		facultyId: string;
		schoolId: string;
		level: string;
		programId?: string;
	}>({
		departmentId: "",
		facultyId: "",
		schoolId: "",
		level: "",
		programId: "",
	});

	const { data: counts = [] } = useQuery({
		queryKey: ["student-counts"],
		queryFn: () => getProgramStudentCounts(),
	});

	const { data: departments = [] } = useQuery({
		queryKey: ["hierarchy", "departments"],
		queryFn: getDepartmentsList,
	});

	const { data: faculties = [] } = useQuery({
		queryKey: ["hierarchy", "faculties"],
		queryFn: getFacultiesList,
	});

	const { data: schools = [] } = useQuery({
		queryKey: ["hierarchy", "schools"],
		queryFn: getSchoolsList,
	});

	const { data: programs = [] } = useQuery({
		queryKey: ["hierarchy", "programs"],
		queryFn: () => getPrograms(),
	});

	const analyticsQuery = useQuery({
		queryKey: ["student-counts", "analytics", filters],
		queryFn: () => getStudentCountAnalytics(filters),
	});

	const mutation = useMutation({
		mutationFn: saveProgramStudentCount,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["student-counts"] });
			toast.success("Program student total saved");
		},
		onError: () => toast.error("Could not save the program total"),
	});

	const scopedDepartments = useMemo(
		() => filterDepartmentsByScope(departments, user, faculties),
		[departments, user, faculties],
	);
	const scopedFaculties = useMemo(
		() => filterFacultiesByScope(faculties, user, departments),
		[faculties, user, departments],
	);
	const scopedSchools = useMemo(
		() => filterSchoolsByScope(schools, user),
		[schools, user],
	);

	const save = async (programId: string, level: number, count: number) => {
		if (!programId) {
			toast.error("Please select a program");
			return;
		}
		const existing = counts.find(
			(item) =>
				String(item.programId) === String(programId) && item.level === level,
		);
		await mutation.mutateAsync({
			id: existing?.id,
			program: programId,
			level,
			count,
		});
	};

	return (
		<StudentsView
			user={user}
			counts={counts}
			analytics={analyticsQuery.data}
			departments={scopedDepartments}
			faculties={scopedFaculties}
			schools={scopedSchools}
			programs={programs}
			filters={filters}
			onFiltersChange={setFilters}
			onSave={save}
			saving={mutation.isPending}
			loading={analyticsQuery.isLoading}
		/>
	);
}
