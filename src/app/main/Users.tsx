import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UsersView from "@/pages/main/UsersView";
import CreateUserModal from "@/components/modals/CreateUserModal";
import EditUserModal from "@/components/modals/EditUserModal";
import ResetPasswordModal from "@/components/modals/ResetPasswordModal";
import ToggleUserStatusModal from "@/components/modals/ToggleUserStatusModal";
import {
  getStudentsList,
  createStudentAPI,
  updateStudentAPI,
  toggleStudentActiveAPI,
  resetStudentPasswordAPI,
  getLecturersList,
  createLecturerAPI,
  updateLecturerAPI,
  toggleLecturerActiveAPI,
  resetLecturerPasswordAPI,
  getAdminsList,
  createAdminAPI,
  updateAdminAPI,
  toggleAdminActiveAPI,
  resetAdminPasswordAPI,
  getDepartmentsOptions,
  getFacultiesOptions,
  getSchoolsOptions,
} from "@/api/main/usersAPI";
import type { User, AdminLevel } from "@/types";
import { toast } from "sonner";

export default function UsersContainer() {
  const queryClient = useQueryClient();

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [toggleStatusTarget, setToggleStatusTarget] = useState<User | null>(null);

  // Queries
  const {
    data: admins = [],
    isLoading: adminsLoading,
    isRefetching: adminsRefetching,
    refetch: refetchAdmins,
  } = useQuery({
    queryKey: ["auth", "admins"],
    queryFn: getAdminsList,
  });

  const {
    data: lecturers = [],
    isLoading: lecturersLoading,
    isRefetching: lecturersRefetching,
    refetch: refetchLecturers,
  } = useQuery({
    queryKey: ["auth", "lecturers"],
    queryFn: getLecturersList,
  });

  const {
    data: students = [],
    isLoading: studentsLoading,
    isRefetching: studentsRefetching,
    refetch: refetchStudents,
  } = useQuery({
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

  const isRefetching = adminsRefetching || lecturersRefetching || studentsRefetching;

  // Manual Refresh
  const handleManualRefresh = async () => {
    await Promise.all([refetchAdmins(), refetchLecturers(), refetchStudents()]);
    toast.success("User directory refreshed successfully");
  };

  // Mutations
  const createStudentMutation = useMutation({
    mutationFn: createStudentAPI,
    onSuccess: () => {
      toast.success("Student account created with default password '12345678'");
      setIsCreateUserOpen(false);
      queryClient.invalidateQueries({ queryKey: ["auth", "students"] });
    },
    onError: () => toast.error("Failed to create student account"),
  });

  const createLecturerMutation = useMutation({
    mutationFn: createLecturerAPI,
    onSuccess: () => {
      toast.success("Lecturer account created with default password '12345678'");
      setIsCreateUserOpen(false);
      queryClient.invalidateQueries({ queryKey: ["auth", "lecturers"] });
    },
    onError: () => toast.error("Failed to create lecturer account"),
  });

  const createAdminMutation = useMutation({
    mutationFn: createAdminAPI,
    onSuccess: () => {
      toast.success("Admin officer account created with default password '12345678'");
      setIsCreateUserOpen(false);
      queryClient.invalidateQueries({ queryKey: ["auth", "admins"] });
    },
    onError: () => toast.error("Failed to create admin officer account"),
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      updateStudentAPI(id, {
        matric_number: payload.identifier || payload.matricNumber,
        full_name: payload.name,
        department: payload.departmentId,
        level: payload.level,
        is_class_rep: payload.isClassRep,
        email: payload.email,
      }),
    onSuccess: () => {
      toast.success("Student details updated");
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["auth", "students"] });
    },
    onError: () => toast.error("Failed to update student details"),
  });

  const updateLecturerMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      updateLecturerAPI(id, {
        staff_id: payload.identifier || payload.staffId,
        full_name: payload.name,
        department: payload.departmentId,
        email: payload.email,
      }),
    onSuccess: () => {
      toast.success("Lecturer details updated");
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["auth", "lecturers"] });
    },
    onError: () => toast.error("Failed to update lecturer details"),
  });

  const updateAdminMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> & { scopeId?: string } }) => {
      const level = payload.adminLevel || "department";
      const targetScopeId = payload.scopeId || payload.departmentId;
      return updateAdminAPI(id, {
        staff_id: payload.identifier || payload.staffId,
        full_name: payload.name,
        level,
        scope_department: level === "department" ? targetScopeId : null,
        scope_faculty: level === "faculty" ? targetScopeId : null,
        scope_school: level === "school" ? targetScopeId : null,
      });
    },
    onSuccess: () => {
      toast.success("Admin details updated");
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["auth", "admins"] });
    },
    onError: () => toast.error("Failed to update admin details"),
  });

  const handleCreateUser = (data: Partial<User> & { scopeId?: string }) => {
    const role = data.role || "student";
    if (role === "student") {
      createStudentMutation.mutate({
        matric_number: data.identifier || "",
        full_name: data.name || "",
        department: data.departmentId || departments[0]?.id || 1,
        level: data.level || 100,
        is_class_rep: Boolean(data.isClassRep),
        email: data.email,
      });
    } else if (role === "lecturer") {
      createLecturerMutation.mutate({
        staff_id: data.identifier || "",
        full_name: data.name || "",
        department: data.departmentId || departments[0]?.id || 1,
        email: data.email,
      });
    } else {
      const level = (data.adminLevel as AdminLevel) || "department";
      const targetScopeId = data.scopeId || data.departmentId;
      createAdminMutation.mutate({
        staff_id: data.identifier || "",
        full_name: data.name || "",
        level,
        scope_department: level === "department" ? targetScopeId : null,
        scope_faculty: level === "faculty" ? targetScopeId : null,
        scope_school: level === "school" ? targetScopeId : null,
      });
    }
  };

  const handleEditUserSubmit = (id: string, updated: Partial<User> & { scopeId?: string }) => {
    if (editingUser?.role === "student") {
      updateStudentMutation.mutate({ id, payload: updated });
    } else if (editingUser?.role === "lecturer") {
      updateLecturerMutation.mutate({ id, payload: updated });
    } else {
      updateAdminMutation.mutate({ id, payload: updated });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserForReset) return;
    try {
      if (selectedUserForReset.role === "student") {
        await resetStudentPasswordAPI(selectedUserForReset.id);
      } else if (selectedUserForReset.role === "lecturer") {
        await resetLecturerPasswordAPI(selectedUserForReset.id);
      } else {
        await resetAdminPasswordAPI(selectedUserForReset.id);
      }
      toast.success(`Password reset to default '12345678' for ${selectedUserForReset.identifier}`);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setSelectedUserForReset(null);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    if (!toggleStatusTarget) return;
    try {
      if (toggleStatusTarget.role === "student") {
        await toggleStudentActiveAPI(userId);
      } else if (toggleStatusTarget.role === "lecturer") {
        await toggleLecturerActiveAPI(userId);
      } else {
        await toggleAdminActiveAPI(userId);
      }
      toast.success(`Account status updated for ${toggleStatusTarget.name}`);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    } catch {
      toast.error("Failed to update user active status");
    } finally {
      setToggleStatusTarget(null);
    }
  };

  return (
    <>
      <UsersView
        admins={admins}
        adminsLoading={adminsLoading}
        lecturers={lecturers}
        lecturersLoading={lecturersLoading}
        students={students}
        studentsLoading={studentsLoading}
        isRefetching={isRefetching}
        onManualRefresh={handleManualRefresh}
        onOpenCreateUser={() => setIsCreateUserOpen(true)}
        onEditUser={(u) => setEditingUser(u)}
        onOpenResetPassword={(u) => setSelectedUserForReset(u)}
        onToggleStatusTrigger={(u) => setToggleStatusTarget(u)}
      />

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onSubmit={handleCreateUser}
        departments={departments}
        faculties={faculties}
        schools={schools}
      />

      <EditUserModal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditUserSubmit}
        user={editingUser}
        departments={departments}
        faculties={faculties}
        schools={schools}
      />

      <ResetPasswordModal
        isOpen={Boolean(selectedUserForReset)}
        onClose={() => setSelectedUserForReset(null)}
        onConfirm={handleResetPassword}
        user={selectedUserForReset}
      />

      <ToggleUserStatusModal
        isOpen={Boolean(toggleStatusTarget)}
        onClose={() => setToggleStatusTarget(null)}
        onConfirm={() => toggleStatusTarget && handleToggleUserStatus(toggleStatusTarget.id)}
        user={toggleStatusTarget}
      />
    </>
  );
}
