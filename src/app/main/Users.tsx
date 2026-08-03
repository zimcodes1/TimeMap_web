import { useState } from 'react';
import UsersView from '@/pages/main/UsersView';
import CreateUserModal from '@/components/modals/CreateUserModal';
import ResetPasswordModal from '@/components/modals/ResetPasswordModal';
import { mockAdmins, mockLecturers, mockStudents, mockDepartments } from '@/constants/mockData';
import type { User } from '@/types';

export default function UsersContainer() {
  const [admins, setAdmins] = useState<User[]>(mockAdmins);
  const [lecturers, setLecturers] = useState<User[]>(mockLecturers);
  const [students, setStudents] = useState<User[]>(mockStudents);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);

  const handleCreateUser = (data: Partial<User>) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name || 'New User',
      email: data.email || 'user@university.edu',
      role: data.role || 'student',
      identifier: data.identifier,
      departmentId: data.departmentId,
      departmentName: data.departmentName,
      level: data.level,
      isClassRep: data.isClassRep,
      adminLevel: data.adminLevel,
      isActive: true,
      requiresPasswordReset: true,
    };

    if (newUser.role === 'admin') setAdmins((prev) => [...prev, newUser]);
    else if (newUser.role === 'lecturer') setLecturers((prev) => [...prev, newUser]);
    else setStudents((prev) => [...prev, newUser]);
  };

  const handleConfirmPasswordReset = () => {
    if (!selectedUserForReset) return;
    const updateUser = (u: User) =>
      u.id === selectedUserForReset.id ? { ...u, requiresPasswordReset: true } : u;

    setAdmins((prev) => prev.map(updateUser));
    setLecturers((prev) => prev.map(updateUser));
    setStudents((prev) => prev.map(updateUser));
    setSelectedUserForReset(null);
  };

  return (
    <>
      <UsersView
        admins={admins}
        lecturers={lecturers}
        students={students}
        onOpenCreateUser={() => setIsCreateModalOpen(true)}
        onOpenResetPassword={(usr) => setSelectedUserForReset(usr)}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        departments={mockDepartments}
      />

      <ResetPasswordModal
        isOpen={!!selectedUserForReset}
        onClose={() => setSelectedUserForReset(null)}
        onConfirm={handleConfirmPasswordReset}
        user={selectedUserForReset}
      />
    </>
  );
}
