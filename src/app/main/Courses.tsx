import { useState } from 'react';
import CoursesView from '@/pages/main/CoursesView';
import CreateCourseModal from '@/components/modals/CreateCourseModal';
import EditCourseModal from '@/components/modals/EditCourseModal';
import OfferAccessGrantModal from '@/components/modals/OfferAccessGrantModal';
import RequestAccessGrantModal from '@/components/modals/RequestAccessGrantModal';
import CourseRegistrationModal from '@/components/modals/CourseRegistrationModal';
import { mockCourses, mockGrants, mockDepartments, mockLecturers } from '@/constants/mockData';
import type { Course, CourseAccessGrant, AdminLevel } from '@/types';

export default function CoursesContainer() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [grants, setGrants] = useState<CourseAccessGrant[]>(mockGrants);

  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isOfferGrantOpen, setIsOfferGrantOpen] = useState(false);
  const [isRequestGrantOpen, setIsRequestGrantOpen] = useState(false);
  const [isRegisterStudentOpen, setIsRegisterStudentOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleCreateCourse = (data: Partial<Course>) => {
    const newCourse: Course = {
      id: `crs_${Date.now()}`,
      code: data.code || 'CSC000',
      title: data.title || 'Untitled Course',
      level: data.level || 300,
      creditUnits: data.creditUnits || 3,
      departmentId: data.departmentId || 'dept_csc',
      departmentName: data.departmentName,
      owningLevel: data.owningLevel || 'department',
      lecturers: data.lecturers || [],
      registrationCount: 0,
    };
    setCourses((prev) => [newCourse, ...prev]);
  };

  const handleEditCourse = (id: string, updated: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const handleOfferGrant = (data: { courseId: string; grantedToLevel: AdminLevel; grantedToDepartmentId?: string }) => {
    const targetCourse = courses.find((c) => c.id === data.courseId);
    const targetDept = mockDepartments.find((d) => d.id === data.grantedToDepartmentId);
    const newGrant: CourseAccessGrant = {
      id: `grant_${Date.now()}`,
      courseId: data.courseId,
      courseCode: targetCourse?.code || 'CRS',
      courseTitle: targetCourse?.title || 'Course',
      grantedToLevel: data.grantedToLevel,
      grantedToDepartmentId: data.grantedToDepartmentId,
      grantedToDepartmentName: targetDept?.name,
      direction: 'offered',
      status: 'pending',
      requestedBy: 'Dr. Sarah Jenkins',
      createdAt: new Date().toISOString(),
    };
    setGrants((prev) => [newGrant, ...prev]);
  };

  const handleRequestGrant = (data: { courseId: string }) => {
    const targetCourse = courses.find((c) => c.id === data.courseId);
    const newGrant: CourseAccessGrant = {
      id: `grant_${Date.now()}`,
      courseId: data.courseId,
      courseCode: targetCourse?.code || 'CRS',
      courseTitle: targetCourse?.title || 'Course',
      grantedToLevel: 'department',
      direction: 'requested',
      status: 'pending',
      requestedBy: 'Dr. Sarah Jenkins',
      createdAt: new Date().toISOString(),
    };
    setGrants((prev) => [newGrant, ...prev]);
  };

  const handleRegisterStudent = (data: { courseId: string; academicSession: string }) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === data.courseId ? { ...c, registrationCount: (c.registrationCount || 0) + 1 } : c
      )
    );
  };

  const handleApproveGrant = (id: string) => {
    setGrants((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'approved' } : g))
    );
  };

  const handleRejectGrant = (id: string) => {
    setGrants((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'rejected' } : g))
    );
  };

  return (
    <>
      <CoursesView
        courses={courses}
        grants={grants}
        onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
        onOpenOfferGrant={() => setIsOfferGrantOpen(true)}
        onOpenRequestGrant={() => setIsRequestGrantOpen(true)}
        onOpenRegisterStudent={() => setIsRegisterStudentOpen(true)}
        onEditCourse={(c) => setEditingCourse(c)}
        onApproveGrant={handleApproveGrant}
        onRejectGrant={handleRejectGrant}
      />

      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        onSubmit={handleCreateCourse}
        departments={mockDepartments}
        lecturers={mockLecturers}
      />

      <EditCourseModal
        isOpen={Boolean(editingCourse)}
        onClose={() => setEditingCourse(null)}
        onSubmit={handleEditCourse}
        course={editingCourse}
        departments={mockDepartments}
        lecturers={mockLecturers}
      />

      <OfferAccessGrantModal
        isOpen={isOfferGrantOpen}
        onClose={() => setIsOfferGrantOpen(false)}
        onSubmit={handleOfferGrant}
        courses={courses}
        departments={mockDepartments}
      />

      <RequestAccessGrantModal
        isOpen={isRequestGrantOpen}
        onClose={() => setIsRequestGrantOpen(false)}
        onSubmit={handleRequestGrant}
        externalCourses={courses}
      />

      <CourseRegistrationModal
        isOpen={isRegisterStudentOpen}
        onClose={() => setIsRegisterStudentOpen(false)}
        onSubmit={handleRegisterStudent}
        courses={courses}
      />
    </>
  );
}
