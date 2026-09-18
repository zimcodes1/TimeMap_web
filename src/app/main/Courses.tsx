import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CoursesView from "@/pages/main/CoursesView";
import CreateCourseModal from "@/components/modals/CreateCourseModal";
import EditCourseModal from "@/components/modals/EditCourseModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import OfferAccessGrantModal from "@/components/modals/OfferAccessGrantModal";
import RequestAccessGrantModal from "@/components/modals/RequestAccessGrantModal";
import CourseRegistrationModal from "@/components/modals/CourseRegistrationModal";
import {
	getCoursesList,
	createCourseAPI,
	updateCourseAPI,
	deleteCourseAPI,
	getCourseGrantsList,
	createCourseGrantAPI,
	approveCourseGrantAPI,
	rejectCourseGrantAPI,
	createCourseRegistrationAPI,
} from "@/api/main/coursesAPI";
import {
	getDepartmentsOptions,
	getFacultiesOptions,
	getSchoolsOptions,
	getLecturersList,
	getStudentsList,
} from "@/api/main/usersAPI";
import { getPrograms } from "@/api/main/programsAPI";
import { getSemesters } from "@/api/main/semestersAPI";
import type { Course, AdminLevel } from "@/types";
import { toast } from "sonner";

export default function CoursesContainer() {
	const queryClient = useQueryClient();

	// Modal Visibility States
	const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
	const [isOfferGrantOpen, setIsOfferGrantOpen] = useState(false);
	const [isRequestGrantOpen, setIsRequestGrantOpen] = useState(false);
	const [isRegisterStudentOpen, setIsRegisterStudentOpen] = useState(false);
	const [editingCourse, setEditingCourse] = useState<Course | null>(null);
	const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

	// React Query Options Data
	const { data: lecturers = [] } = useQuery({
		queryKey: ["auth", "lecturers"],
		queryFn: getLecturersList,
	});

	const { data: students = [] } = useQuery({
		queryKey: ["auth", "students"],
		queryFn: getStudentsList,
	});

	const { data: departments = [] } = useQuery({
		queryKey: ["hierarchy", "departments"],
		queryFn: getDepartmentsOptions,
	});

	const { data: faculties = [] } = useQuery({
		queryKey: ["hierarchy", "faculties"],
		queryFn: getFacultiesOptions,
	});

	const { data: schools = [] } = useQuery({
		queryKey: ["hierarchy", "schools"],
		queryFn: getSchoolsOptions,
	});

	const { data: programs = [] } = useQuery({
		queryKey: ["hierarchy", "programs"],
		queryFn: () => getPrograms(),
	});

	const { data: semesters = [] } = useQuery({
		queryKey: ["scheduling", "semesters"],
		queryFn: () => getSemesters(),
	});

	// React Query Fetching for Courses & Grants
	const {
		data: coursesData,
		isLoading: isCoursesLoading,
		isRefetching: isCoursesRefetching,
		refetch: refetchCourses,
	} = useQuery({
		queryKey: ["courses", "list"],
		queryFn: () => getCoursesList(lecturers),
	});

	const {
		data: grantsData,
		isLoading: isGrantsLoading,
		isRefetching: isGrantsRefetching,
		refetch: refetchGrants,
	} = useQuery({
		queryKey: ["courses", "grants"],
		queryFn: getCourseGrantsList,
	});

	const courses = useMemo(() => {
		if (!coursesData) return [];
		return coursesData.map((c) => {
			const assignedIds =
				c.lecturerIds && c.lecturerIds.length > 0
					? c.lecturerIds.map(String)
					: (c.lecturers || []).map((l) => String(l.id));

			if (assignedIds.length === 0) return c;

			const hasRealLecturers =
				c.lecturers &&
				c.lecturers.length > 0 &&
				!c.lecturers.every((l) => l.name?.startsWith("Lecturer #"));

			if (hasRealLecturers && lecturers.length === 0) {
				return c;
			}

			const matched = assignedIds.map((id) => {
				const found = lecturers.find((l) => String(l.id) === String(id));
				if (found) return found;
				const existing = c.lecturers?.find((l) => String(l.id) === String(id));
				return (
					existing || {
						id: String(id),
						identifier: String(id),
						name: `Lecturer #${id}`,
						email: "",
						role: "lecturer" as const,
						isActive: true,
						requiresPasswordReset: false,
					}
				);
			});

			return {
				...c,
				lecturers: matched,
			};
		});
	}, [coursesData, lecturers]);
	const grants = grantsData ?? [];
	const isLoading = isCoursesLoading || isGrantsLoading;
	const isRefetching = isCoursesRefetching || isGrantsRefetching;

	// React Query Mutations
	const createCourseMutation = useMutation({
		mutationFn: (
			data: Partial<Course> & { scopeId?: string; lecturerIds?: string[] },
		) => createCourseAPI(data, lecturers),
		onSuccess: (newCourse) => {
			queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
			toast.success(`Course "${newCourse.code}" created successfully.`);
			setIsCreateCourseOpen(false);
		},
		onError: (err) => {
			toast.error("Failed to create course.");
			console.error("createCourse error:", err);
		},
	});

	const editCourseMutation = useMutation({
		mutationFn: ({
			id,
			updated,
		}: {
			id: string;
			updated: Partial<Course> & { scopeId?: string; lecturerIds?: string[] };
		}) => updateCourseAPI(id, updated, lecturers),
		onSuccess: (updatedCourse) => {
			queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
			toast.success(`Course "${updatedCourse.code}" updated successfully.`);
			setEditingCourse(null);
		},
		onError: (err) => {
			toast.error("Failed to update course.");
			console.error("editCourse error:", err);
		},
	});

	const deleteCourseMutation = useMutation({
		mutationFn: (id: string) => deleteCourseAPI(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
			toast.success("Course deleted successfully.");
		},
		onError: () => toast.error("Failed to delete course."),
	});

	const offerGrantMutation = useMutation({
		mutationFn: (data: {
			courseId: string;
			grantedToLevel: AdminLevel;
			grantedToDepartmentId?: string;
			grantedToFacultyId?: string;
			grantedToSchoolId?: string;
		}) =>
			createCourseGrantAPI({
				course: data.courseId,
				granted_to_level: data.grantedToLevel,
				granted_to_department: data.grantedToDepartmentId,
				granted_to_faculty: data.grantedToFacultyId,
				granted_to_school: data.grantedToSchoolId,
				direction: "offered",
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses", "grants"] });
			toast.success("Course access grant offered successfully.");
			setIsOfferGrantOpen(false);
		},
		onError: () => toast.error("Failed to offer course access grant."),
	});

	const requestGrantMutation = useMutation({
		mutationFn: (data: { courseId: string }) =>
			createCourseGrantAPI({
				course: data.courseId,
				granted_to_level: "department",
				direction: "requested",
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses", "grants"] });
			toast.success("Course access grant request submitted.");
			setIsRequestGrantOpen(false);
		},
		onError: () => toast.error("Failed to request course access grant."),
	});

	const approveGrantMutation = useMutation({
		mutationFn: (id: string) => approveCourseGrantAPI(id),
		onSuccess: (updatedGrant) => {
			queryClient.invalidateQueries({ queryKey: ["courses", "grants"] });
			queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
			toast.success(`Access grant #${updatedGrant.id} approved.`);
		},
		onError: () => toast.error("Failed to approve access grant."),
	});

	const rejectGrantMutation = useMutation({
		mutationFn: (id: string) => rejectCourseGrantAPI(id),
		onSuccess: (updatedGrant) => {
			queryClient.invalidateQueries({ queryKey: ["courses", "grants"] });
			queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
			toast.success(`Access grant #${updatedGrant.id} rejected.`);
		},
		onError: () => toast.error("Failed to reject access grant."),
	});

	const registerStudentMutation = useMutation({
		mutationFn: (data: {
			courseId: string;
			studentId?: string;
			academicSession: string;
		}) =>
			createCourseRegistrationAPI({
				course: data.courseId,
				student: data.studentId,
				academic_session: data.academicSession,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
			toast.success("Student registered for course successfully.");
			setIsRegisterStudentOpen(false);
		},
		onError: () => toast.error("Failed to register student for course."),
	});

	// Handlers
	const handleCreateCourse = (
		data: Partial<Course> & { scopeId?: string; lecturerIds?: string[] },
	) => {
		createCourseMutation.mutate(data);
	};

	const handleEditCourse = (
		id: string,
		updated: Partial<Course> & { scopeId?: string; lecturerIds?: string[] },
	) => {
		editCourseMutation.mutate({ id, updated });
	};

	const handleDeleteCourse = (id: string) => {
		const target = courses.find((c) => c.id === id);
		if (target) {
			setDeletingCourse(target);
		}
	};

	const handleOfferGrant = (data: {
		courseId: string;
		grantedToLevel: AdminLevel;
		grantedToDepartmentId?: string;
		grantedToFacultyId?: string;
		grantedToSchoolId?: string;
	}) => {
		offerGrantMutation.mutate(data);
	};

	const handleRequestGrant = (data: { courseId: string }) => {
		requestGrantMutation.mutate(data);
	};

	const handleRegisterStudent = (data: {
		courseId: string;
		studentId?: string;
		academicSession: string;
	}) => {
		registerStudentMutation.mutate(data);
	};

	const handleManualRefresh = () => {
		refetchCourses();
		refetchGrants();
	};

	return (
		<>
			<CoursesView
				courses={courses}
				grants={grants}
				faculties={faculties}
				departments={departments}
				programs={programs}
				semesters={semesters}
				isLoading={isLoading}
				isRefetching={isRefetching}
				onRefresh={handleManualRefresh}
				onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
				onOpenOfferGrant={() => setIsOfferGrantOpen(true)}
				onOpenRequestGrant={() => setIsRequestGrantOpen(true)}
				onEditCourse={(c) => setEditingCourse(c)}
				onDeleteCourse={handleDeleteCourse}
				onApproveGrant={(id) => approveGrantMutation.mutate(id)}
				onRejectGrant={(id) => rejectGrantMutation.mutate(id)}
			/>

			<CreateCourseModal
				isOpen={isCreateCourseOpen}
				onClose={() => setIsCreateCourseOpen(false)}
				onSubmit={handleCreateCourse}
				departments={departments}
				faculties={faculties}
				schools={schools}
				programs={programs}
				semesters={semesters}
				lecturers={lecturers}
			/>

			<EditCourseModal
				isOpen={Boolean(editingCourse)}
				onClose={() => setEditingCourse(null)}
				onSubmit={handleEditCourse}
				course={editingCourse}
				departments={departments}
				programs={programs}
				semesters={semesters}
				lecturers={lecturers}
			/>

			<OfferAccessGrantModal
				isOpen={isOfferGrantOpen}
				onClose={() => setIsOfferGrantOpen(false)}
				onSubmit={handleOfferGrant}
				courses={courses}
				departments={departments}
				faculties={faculties}
				schools={schools}
				programs={programs}
			/>

			<RequestAccessGrantModal
				isOpen={isRequestGrantOpen}
				onClose={() => setIsRequestGrantOpen(false)}
				onSubmit={handleRequestGrant}
				externalCourses={courses}
				faculties={faculties}
				departments={departments}
			/>

			<CourseRegistrationModal
				isOpen={isRegisterStudentOpen}
				onClose={() => setIsRegisterStudentOpen(false)}
				onSubmit={handleRegisterStudent}
				courses={courses}
				students={students}
			/>

			<DeleteConfirmModal
				isOpen={Boolean(deletingCourse)}
				onClose={() => setDeletingCourse(null)}
				onConfirm={() => {
					if (deletingCourse) {
						deleteCourseMutation.mutate(deletingCourse.id);
					}
				}}
				title="Delete Course Confirmation"
				itemName={
					deletingCourse
						? `${deletingCourse.code} — ${deletingCourse.title}`
						: ""
				}
				itemType="course"
			/>
		</>
	);
}
