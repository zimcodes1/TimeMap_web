import { useState } from 'react';
import HierarchyView from '@/pages/main/HierarchyView';
import CreateSchoolModal from '@/components/modals/CreateSchoolModal';
import CreateFacultyModal from '@/components/modals/CreateFacultyModal';
import CreateDepartmentModal from '@/components/modals/CreateDepartmentModal';
import { mockSchools, mockFaculties, mockDepartments } from '@/constants/mockData';
import type { School, Faculty, Department } from '@/types';

export default function HierarchyContainer() {
  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [faculties, setFaculties] = useState<Faculty[]>(mockFaculties);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);

  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  const handleCreateSchool = (data: { name: string; code: string }) => {
    const newSchool: School = {
      id: `sch_${Date.now()}`,
      name: data.name,
      code: data.code,
    };
    setSchools((prev) => [...prev, newSchool]);
  };

  const handleCreateFaculty = (data: { schoolId: string; name: string; code: string }) => {
    const school = schools.find((s) => s.id === data.schoolId);
    const newFaculty: Faculty = {
      id: `fac_${Date.now()}`,
      schoolId: data.schoolId,
      schoolName: school?.name,
      name: data.name,
      code: data.code,
    };
    setFaculties((prev) => [...prev, newFaculty]);
  };

  const handleCreateDepartment = (data: { facultyId: string; name: string; code: string }) => {
    const faculty = faculties.find((f) => f.id === data.facultyId);
    const newDept: Department = {
      id: `dept_${Date.now()}`,
      facultyId: data.facultyId,
      facultyName: faculty?.name,
      name: data.name,
      code: data.code,
    };
    setDepartments((prev) => [...prev, newDept]);
  };

  return (
    <>
      <HierarchyView
        schools={schools}
        faculties={faculties}
        departments={departments}
        onOpenCreateSchool={() => setIsSchoolModalOpen(true)}
        onOpenCreateFaculty={() => setIsFacultyModalOpen(true)}
        onOpenCreateDepartment={() => setIsDeptModalOpen(true)}
      />

      <CreateSchoolModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        onSubmit={handleCreateSchool}
      />

      <CreateFacultyModal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
        onSubmit={handleCreateFaculty}
        schools={schools}
      />

      <CreateDepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        onSubmit={handleCreateDepartment}
        faculties={faculties}
      />
    </>
  );
}
