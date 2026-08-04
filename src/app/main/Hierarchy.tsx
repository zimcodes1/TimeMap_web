import { useState } from 'react';
import HierarchyView from '@/pages/main/HierarchyView';
import CreateSchoolModal from '@/components/modals/CreateSchoolModal';
import CreateFacultyModal from '@/components/modals/CreateFacultyModal';
import CreateDepartmentModal from '@/components/modals/CreateDepartmentModal';
import EditSchoolModal from '@/components/modals/EditSchoolModal';
import EditFacultyModal from '@/components/modals/EditFacultyModal';
import EditDepartmentModal from '@/components/modals/EditDepartmentModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { mockSchools, mockFaculties, mockDepartments } from '@/constants/mockData';
import type { School, Faculty, Department } from '@/types';

export default function HierarchyContainer() {
  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [faculties, setFaculties] = useState<Faculty[]>(mockFaculties);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);

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
    type: 'School' | 'Faculty' | 'Department';
  } | null>(null);

  // Handlers
  const handleCreateSchool = (data: { name: string; code: string }) => {
    const newSch: School = {
      id: `sch_${Date.now()}`,
      name: data.name,
      code: data.code,
    };
    setSchools((prev) => [newSch, ...prev]);
  };

  const handleCreateFaculty = (data: { name: string; code: string; schoolId: string }) => {
    const targetSch = schools.find((s) => s.id === data.schoolId);
    const newFac: Faculty = {
      id: `fac_${Date.now()}`,
      name: data.name,
      code: data.code,
      schoolId: data.schoolId,
      schoolName: targetSch?.name || 'Science & Tech',
    };
    setFaculties((prev) => [newFac, ...prev]);
  };

  const handleCreateDepartment = (data: { name: string; code: string; facultyId: string }) => {
    const targetFac = faculties.find((f) => f.id === data.facultyId);
    const newDept: Department = {
      id: `dept_${Date.now()}`,
      name: data.name,
      code: data.code,
      facultyId: data.facultyId,
      facultyName: targetFac?.name || 'FNS',
    };
    setDepartments((prev) => [newDept, ...prev]);
  };

  const handleEditSchool = (id: string, name: string, code: string) => {
    setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, name, code } : s)));
  };

  const handleEditFaculty = (id: string, name: string, code: string, schoolId: string) => {
    const targetSch = schools.find((s) => s.id === schoolId);
    setFaculties((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, name, code, schoolId, schoolName: targetSch?.name || f.schoolName } : f
      )
    );
  };

  const handleEditDepartment = (id: string, name: string, code: string, facultyId: string) => {
    const targetFac = faculties.find((f) => f.id === facultyId);
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, name, code, facultyId, facultyName: targetFac?.name || d.facultyName } : d
      )
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    if (type === 'School') setSchools((prev) => prev.filter((s) => s.id !== id));
    if (type === 'Faculty') setFaculties((prev) => prev.filter((f) => f.id !== id));
    if (type === 'Department') setDepartments((prev) => prev.filter((d) => d.id !== id));
    setDeleteTarget(null);
  };

  return (
    <>
      <HierarchyView
        schools={schools}
        faculties={faculties}
        departments={departments}
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
        itemName={deleteTarget?.name || ''}
        itemType={deleteTarget?.type || 'item'}
      />
    </>
  );
}
