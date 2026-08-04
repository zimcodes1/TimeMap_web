import { useState } from 'react';
import UsersView from '@/pages/main/UsersView';
import CreateUserModal from '@/components/modals/CreateUserModal';
import EditUserModal from '@/components/modals/EditUserModal';
import ResetPasswordModal from '@/components/modals/ResetPasswordModal';
import ToggleUserStatusModal from '@/components/modals/ToggleUserStatusModal';
import { mockAdmins, mockLecturers, mockStudents, mockDepartments } from '@/constants/mockData';
import type { User } from '@/types';
import { toast } from 'sonner';

export default function UsersContainer() {
  const [admins, setAdmins] = useState<User[]>(mockAdmins);
  const [lecturers, setLecturers] = useState<User[]>(mockLecturers);
  const [students, setStudents] = useState<User[]>(mockStudents);

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [toggleStatusTarget, setToggleStatusTarget] = useState<User | null>(null);

  const handleCreateUser = (data: Record<string, unknown>) => {
    const role = (data.role as User['role']) || 'admin';
    const newUser: User = {
      id: `usr_${Date.now()}`,
      identifier: (data.identifier as string) || 'USR100',
      name: (data.name as string) || 'New User',
      email: (data.email as string) || 'user@timemap.edu',
      role,
      adminLevel: role === 'admin' ? (data.scope_level as User['adminLevel']) || 'department' : undefined,
      departmentId: data.department as string,
      isActive: true,
      requiresPasswordReset: true,
    };

    if (role === 'admin') setAdmins((prev) => [newUser, ...prev]);
    else if (role === 'lecturer') setLecturers((prev) => [newUser, ...prev]);
    else setStudents((prev) => [newUser, ...prev]);

    toast.success('User account created successfully');
  };

  const handleEditUser = (id: string, updated: Partial<User>) => {
    const updater = (list: User[]) => list.map((u) => (u.id === id ? { ...u, ...updated } : u));
    setAdmins(updater);
    setLecturers(updater);
    setStudents(updater);
    toast.success('User details updated');
  };

  const handleResetPassword = () => {
    if (!selectedUserForReset) return;
    const userId = selectedUserForReset.id;
    const updater = (list: User[]) =>
      list.map((u) => (u.id === userId ? { ...u, requiresPasswordReset: true } : u));
    setAdmins(updater);
    setLecturers(updater);
    setStudents(updater);
    setSelectedUserForReset(null);
    toast.success(`Temporary password issued for user`);
  };

  const handleToggleUserStatus = (userId: string, targetStatus: boolean) => {
    const updater = (list: User[]) =>
      list.map((u) => (u.id === userId ? { ...u, isActive: targetStatus } : u));
    setAdmins(updater);
    setLecturers(updater);
    setStudents(updater);
    setToggleStatusTarget(null);
    toast.success(`Account status set to ${targetStatus ? 'Active' : 'Inactive'}`);
  };

  return (
    <>
      <UsersView
        admins={admins}
        lecturers={lecturers}
        students={students}
        onOpenCreateUser={() => setIsCreateUserOpen(true)}
        onEditUser={(u) => setEditingUser(u)}
        onOpenResetPassword={(u) => setSelectedUserForReset(u)}
        onToggleStatusTrigger={(u) => setToggleStatusTarget(u)}
      />

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onSubmit={handleCreateUser}
        departments={mockDepartments}
      />

      <EditUserModal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditUser}
        user={editingUser}
        departments={mockDepartments}
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
        onConfirm={handleToggleUserStatus}
        user={toggleStatusTarget}
      />
    </>
  );
}
