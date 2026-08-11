import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HierarchyView from "@/pages/main/HierarchyView";
import CreateSchoolModal from "@/components/modals/CreateSchoolModal";
import CreateFacultyModal from "@/components/modals/CreateFacultyModal";
import CreateDepartmentModal from "@/components/modals/CreateDepartmentModal";
import EditSchoolModal from "@/components/modals/EditSchoolModal";
import EditFacultyModal from "@/components/modals/EditFacultyModal";
import EditDepartmentModal from "@/components/modals/EditDepartmentModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import {
  getSchoolsList,
  createSchoolAPI,
  updateSchoolAPI,
  deleteSchoolAPI,
  getFacultiesList,
  createFacultyAPI,
  updateFacultyAPI,
  deleteFacultyAPI,
  getDepartmentsList,
  createDepartmentAPI,
  updateDepartmentAPI,
  deleteDepartmentAPI,
} from "@/api/main/hierarchyAPI";
import type { School, Faculty, Department } from "@/types";
import { toast } from "sonner";

export default function HierarchyContainer() {
  const queryClient = useQueryClient();

  // Modal Open states
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);
  const [isCreateFacultyOpen, setIsCreateFacultyOpen] = useState(false);
  const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);

  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: "School" | "Faculty" | "Department";
  } | null>(null);

  // Queries
  const {
    data: schools = [],
    isLoading: schoolsLoading,
    isRefetching: schoolsRefetching,
    refetch: refetchSchools,
  } = useQuery({
    queryKey: ["hierarchy", "schools"],
    queryFn: getSchoolsList,
  });

  const {
    data: faculties = [],
    isLoading: facultiesLoading,
    isRefetching: facultiesRefetching,
    refetch: refetchFaculties,
  } = useQuery({
    queryKey: ["hierarchy", "faculties"],
    queryFn: getFacultiesList,
  });

  const {
    data: departments = [],
    isLoading: departmentsLoading,
    isRefetching: departmentsRefetching,
    refetch: refetchDepartments,
  } = useQuery({
    queryKey: ["hierarchy", "departments"],
    queryFn: getDepartmentsList,
  });

  const isRefetching = schoolsRefetching || facultiesRefetching || departmentsRefetching;

  // Manual Refresh
  const handleManualRefresh = async () => {
    await Promise.all([refetchSchools(), refetchFaculties(), refetchDepartments()]);
    toast.success("Hierarchy data refreshed");
  };

  // School Mutations
  const createSchoolMutation = useMutation({
    mutationFn: createSchoolAPI,
    onSuccess: () => {
      toast.success("School created successfully");
      setIsCreateSchoolOpen(false);
      queryClient.invalidateQueries({ queryKey: ["hierarchy", "schools"] });
    },
    onError: () => toast.error("Failed to create school"),
  });

  const updateSchoolMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; code: string } }) =>
      updateSchoolAPI(id, payload),
    onSuccess: () => {
      toast.success("School details updated");
      setEditingSchool(null);
      queryClient.invalidateQueries({ queryKey: ["hierarchy", "schools"] });
    },
    onError: () => toast.error("Failed to update school details"),
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: deleteSchoolAPI,
    onSuccess: () => {
      toast.success("School deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["hierarchy"] });
    },
    onError: () => toast.error("Failed to delete school"),
  });

  // Faculty Mutations
  const createFacultyMutation = useMutation({
    mutationFn: createFacultyAPI,
    onSuccess: () => {
      toast.success("Faculty created successfully");
      setIsCreateFacultyOpen(false);
      queryClient.invalidateQueries({ queryKey: ["hierarchy", "faculties"] });
    },
    onError: () => toast.error("Failed to create faculty"),
  });

  const updateFacultyMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { school: string; name: string; code: string };
    }) => updateFacultyAPI(id, payload),
    onSuccess: () => {
      toast.success("Faculty details updated");
      setEditingFaculty(null);
      queryClient.invalidateQueries({ queryKey: ["hierarchy", "faculties"] });
    },
    onError: () => toast.error("Failed to update faculty details"),
  });

  const deleteFacultyMutation = useMutation({
    mutationFn: deleteFacultyAPI,
    onSuccess: () => {
      toast.success("Faculty deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["hierarchy"] });
    },
    onError: () => toast.error("Failed to delete faculty"),
  });

  // Department Mutations
  const createDepartmentMutation = useMutation({
    mutationFn: createDepartmentAPI,
    onSuccess: () => {
      toast.success("Department created successfully");
      setIsCreateDepartmentOpen(false);
      queryClient.invalidateQueries({ queryKey: ["hierarchy", "departments"] });
    },
    onError: () => toast.error("Failed to create department"),
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { faculty: string; name: string; code: string };
    }) => updateDepartmentAPI(id, payload),
    onSuccess: () => {
      toast.success("Department details updated");
      setEditingDepartment(null);
      queryClient.invalidateQueries({ queryKey: ["hierarchy", "departments"] });
    },
    onError: () => toast.error("Failed to update department details"),
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: deleteDepartmentAPI,
    onSuccess: () => {
      toast.success("Department deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["hierarchy"] });
    },
    onError: () => toast.error("Failed to delete department"),
  });

  // Handlers
  const handleCreateSchool = (data: { name: string; code: string }) => {
    createSchoolMutation.mutate(data);
  };

  const handleCreateFaculty = (data: { schoolId: string; name: string; code: string }) => {
    createFacultyMutation.mutate({
      school: data.schoolId,
      name: data.name,
      code: data.code,
    });
  };

  const handleCreateDepartment = (data: { facultyId: string; name: string; code: string }) => {
    createDepartmentMutation.mutate({
      faculty: data.facultyId,
      name: data.name,
      code: data.code,
    });
  };

  const handleEditSchool = (id: string, name: string, code: string) => {
    updateSchoolMutation.mutate({ id, payload: { name, code } });
  };

  const handleEditFaculty = (id: string, name: string, code: string, schoolId: string) => {
    updateFacultyMutation.mutate({ id, payload: { school: schoolId, name, code } });
  };

  const handleEditDepartment = (id: string, name: string, code: string, facultyId: string) => {
    updateDepartmentMutation.mutate({ id, payload: { faculty: facultyId, name, code } });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    if (type === "School") deleteSchoolMutation.mutate(id);
    else if (type === "Faculty") deleteFacultyMutation.mutate(id);
    else if (type === "Department") deleteDepartmentMutation.mutate(id);
  };

  return (
    <>
      <HierarchyView
        schools={schools}
        schoolsLoading={schoolsLoading}
        faculties={faculties}
        facultiesLoading={facultiesLoading}
        departments={departments}
        departmentsLoading={departmentsLoading}
        isRefetching={isRefetching}
        onManualRefresh={handleManualRefresh}
        onOpenCreateSchool={() => setIsCreateSchoolOpen(true)}
        onOpenCreateFaculty={() => setIsCreateFacultyOpen(true)}
        onOpenCreateDepartment={() => setIsCreateDepartmentOpen(true)}
        onEditSchool={(s) => setEditingSchool(s)}
        onEditFaculty={(f) => setEditingFaculty(f)}
        onEditDepartment={(d) => setEditingDepartment(d)}
        onDeleteTrigger={(id, name, type) => setDeleteTarget({ id, name, type })}
      />

      <CreateSchoolModal
        isOpen={isCreateSchoolOpen}
        onClose={() => setIsCreateSchoolOpen(false)}
        onSubmit={handleCreateSchool}
      />

      <CreateFacultyModal
        isOpen={isCreateFacultyOpen}
        onClose={() => setIsCreateFacultyOpen(false)}
        onSubmit={handleCreateFaculty}
        schools={schools}
      />

      <CreateDepartmentModal
        isOpen={isCreateDepartmentOpen}
        onClose={() => setIsCreateDepartmentOpen(false)}
        onSubmit={handleCreateDepartment}
        faculties={faculties}
      />

      <EditSchoolModal
        isOpen={Boolean(editingSchool)}
        onClose={() => setEditingSchool(null)}
        onSubmit={handleEditSchool}
        school={editingSchool}
      />

      <EditFacultyModal
        isOpen={Boolean(editingFaculty)}
        onClose={() => setEditingFaculty(null)}
        onSubmit={handleEditFaculty}
        faculty={editingFaculty}
        schools={schools}
      />

      <EditDepartmentModal
        isOpen={Boolean(editingDepartment)}
        onClose={() => setEditingDepartment(null)}
        onSubmit={handleEditDepartment}
        department={editingDepartment}
        faculties={faculties}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.name || ""}
        itemType={deleteTarget?.type || "item"}
      />
    </>
  );
}
