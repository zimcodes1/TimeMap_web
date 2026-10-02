import { useState, useMemo } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
	getLecturerDetailAPI,
	updateLecturerAPI,
	resetLecturerPasswordAPI,
	toggleLecturerActiveAPI,
	getDepartmentsOptions,
	getFacultiesOptions,
	getSchoolsOptions,
} from "@/api/main/usersAPI";
import { getCoursesList } from "@/api/main/coursesAPI";
import { getSemesters } from "@/api/main/semestersAPI";
import { getLectureHoldRateAnalytics } from "@/api/main/dashboardAPI";
import type { User, Course, Semester, Department, Faculty, School } from "@/types";
import LecturerDetailsView from "@/pages/main/LecturerDetailsView";
import EditUserModal from "@/components/modals/EditUserModal";
import ResetPasswordModal from "@/components/modals/ResetPasswordModal";
import ToggleUserStatusModal from "@/components/modals/ToggleUserStatusModal";

const route = getRouteApi("/_main/lecturers_/$lecturerId");

export default function LecturerDetailsContainer() {
	const { lecturerId } = route.useParams();
	const queryClient = useQueryClient();
	const { user: currentUser } = useAuth();

	// Modal states
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
	const [isToggleStatusOpen, setIsToggleStatusOpen] = useState(false);

	// Filter state
	const [selectedCourseId, setSelectedCourseId] = useState<string>("");

	// 1. Fetch Lecturer Profile
	const {
		data: lecturer,
		isLoading: lecturerLoading,
	} = useQuery<User>({
		queryKey: ["auth", "lecturer", lecturerId],
		queryFn: () => getLecturerDetailAPI(lecturerId),
		enabled: Boolean(lecturerId),
	});

	// 2. Fetch Semesters to get active semester
	const { data: semesters = [] } = useQuery<Semester[]>({
		queryKey: ["semesters", "list"],
		queryFn: () => getSemesters(),
	});

	const activeSemester = useMemo(() => {
		return semesters.find((s) => s.isActive) || semesters[0];
	}, [semesters]);

	// 3. Fetch Courses Assigned to this Lecturer this Semester
	const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
		queryKey: ["courses", "lecturer", lecturerId, activeSemester?.id],
		queryFn: () =>
			getCoursesList([], {
				semester: activeSemester?.id,
				lecturer: lecturerId,
			}),
		enabled: Boolean(lecturerId),
	});

	// 4. Fetch Hold Rate Stats for this Lecturer
	const { data: holdRate, isLoading: holdRateLoading } = useQuery({
		queryKey: [
			"analytics",
			"lecturer-hold-rate",
			lecturerId,
			activeSemester?.id,
			selectedCourseId,
		],
		queryFn: () =>
			getLectureHoldRateAnalytics({
				lecturerId,
				semesterId: activeSemester?.id ? String(activeSemester.id) : undefined,
				courseId: selectedCourseId || undefined,
				groupBy: "week",
			}),
		enabled: Boolean(lecturerId),
	});

	// Hierarchy for Edit Modal
	const { data: departments = [] } = useQuery<Department[]>({
		queryKey: ["hierarchy", "departments", "options"],
		queryFn: getDepartmentsOptions,
		enabled: isEditOpen,
	});

	const { data: faculties = [] } = useQuery<Faculty[]>({
		queryKey: ["hierarchy", "faculties", "options"],
		queryFn: getFacultiesOptions,
		enabled: isEditOpen,
	});

	const { data: schools = [] } = useQuery<School[]>({
		queryKey: ["hierarchy", "schools", "options"],
		queryFn: getSchoolsOptions,
		enabled: isEditOpen,
	});

	// Mutations
	const editMutation = useMutation({
		mutationFn: (updated: Partial<User>) =>
			updateLecturerAPI(lecturerId, {
				full_name: updated.name,
				email: updated.email,
				department: updated.departmentId,
			}),
		onSuccess: () => {
			toast.success("Lecturer profile updated successfully");
			queryClient.invalidateQueries({ queryKey: ["auth", "lecturer", lecturerId] });
			queryClient.invalidateQueries({ queryKey: ["auth", "lecturers"] });
			setIsEditOpen(false);
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.detail || "Failed to update lecturer");
		},
	});

	const resetPasswordMutation = useMutation({
		mutationFn: () => resetLecturerPasswordAPI(lecturerId),
		onSuccess: () => {
			toast.success("Forced password reset flag issued");
			queryClient.invalidateQueries({ queryKey: ["auth", "lecturer", lecturerId] });
			setIsResetPasswordOpen(false);
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.detail || "Failed to reset password");
		},
	});

	const toggleStatusMutation = useMutation({
		mutationFn: () => toggleLecturerActiveAPI(lecturerId),
		onSuccess: (updated) => {
			toast.success(
				`Lecturer account ${updated.isActive ? "activated" : "deactivated"} successfully`,
			);
			queryClient.invalidateQueries({ queryKey: ["auth", "lecturer", lecturerId] });
			queryClient.invalidateQueries({ queryKey: ["auth", "lecturers"] });
			setIsToggleStatusOpen(false);
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.detail || "Failed to toggle status");
		},
	});

	// Permission checks
	const canManage = useMemo(() => {
		if (!currentUser) return false;
		if (currentUser.adminLevel === "system" || currentUser.adminLevel === "university") return true;
		if (currentUser.adminLevel === "school")
			return true;
		if (currentUser.adminLevel === "faculty") return true;
		if (currentUser.adminLevel === "department") {
			// Department admin can manage lecturers in their department
			if (!lecturer?.departmentId) return true;
			const myDeptId = currentUser.adminScopeId || currentUser.departmentId;
			return String(lecturer.departmentId) === String(myDeptId);
		}
		return false;
	}, [currentUser, lecturer]);

	return (
		<>
			<LecturerDetailsView
				lecturer={lecturer}
				lecturerLoading={lecturerLoading}
				courses={courses}
				coursesLoading={coursesLoading}
				holdRate={holdRate}
				holdRateLoading={holdRateLoading}
				selectedCourseId={selectedCourseId}
				onCourseChange={setSelectedCourseId}
				activeSemester={activeSemester}
				canManage={canManage}
				onEdit={() => setIsEditOpen(true)}
				onResetPassword={() => setIsResetPasswordOpen(true)}
				onToggleStatus={() => setIsToggleStatusOpen(true)}
			/>

			{/* Edit Modal */}
			{isEditOpen && lecturer && (
				<EditUserModal
					isOpen={isEditOpen}
					onClose={() => setIsEditOpen(false)}
					onSubmit={(_, updated) => editMutation.mutate(updated)}
					user={lecturer}
					departments={departments}
					faculties={faculties}
					schools={schools}
				/>
			)}

			{/* Reset Password Modal */}
			{isResetPasswordOpen && lecturer && (
				<ResetPasswordModal
					isOpen={isResetPasswordOpen}
					onClose={() => setIsResetPasswordOpen(false)}
					onConfirm={() => resetPasswordMutation.mutate()}
					user={lecturer}
				/>
			)}

			{/* Toggle Status Modal */}
			{isToggleStatusOpen && lecturer && (
				<ToggleUserStatusModal
					isOpen={isToggleStatusOpen}
					onClose={() => setIsToggleStatusOpen(false)}
					onConfirm={() => toggleStatusMutation.mutate()}
					user={lecturer}
				/>
			)}
		</>
	);
}
