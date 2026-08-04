import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import type { User, UserRole, AdminLevel, Department } from '@/types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updated: Partial<User>) => void;
  user: User | null;
  departments: Department[];
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  departments,
}: EditUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [adminLevel, setAdminLevel] = useState<AdminLevel>('department');
  const [departmentId, setDepartmentId] = useState('');
  const [level, setLevel] = useState<number>(300);
  const [isClassRep, setIsClassRep] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setIdentifier(user.identifier || '');
      setRole(user.role || 'admin');
      setAdminLevel(user.adminLevel || 'department');
      setDepartmentId(user.departmentId || '');
      setLevel(user.level || 300);
      setIsClassRep(user.isClassRep || false);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && name && email && identifier) {
      const targetDept = departments.find((d) => d.id === departmentId);

      onSubmit(user.id, {
        name,
        email,
        identifier,
        role,
        adminLevel: role === 'admin' ? adminLevel : undefined,
        departmentId: role !== 'admin' ? departmentId : undefined,
        departmentName: targetDept?.name,
        level: role === 'student' ? level : undefined,
        isClassRep: role === 'student' ? isClassRep : false,
      });
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit User Account — ${user.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Text variant="body-sm" color="muted">
          Update user profile credentials, assigned department, and access permissions.
        </Text>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Identifier / Staff ID / Matric</label>
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">User Account Role</label>
            <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="admin">Admin Officer</option>
              <option value="lecturer">Lecturer</option>
              <option value="student">Student / Class Rep</option>
            </Select>
          </div>
        </div>

        {role === 'admin' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Admin Scope Level</label>
            <Select value={adminLevel} onChange={(e) => setAdminLevel(e.target.value as AdminLevel)}>
              <option value="university">University Admin</option>
              <option value="school">School Admin</option>
              <option value="faculty">Faculty Admin</option>
              <option value="department">Department Admin</option>
            </Select>
          </div>
        )}

        {role !== 'admin' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Assigned Department</label>
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>
          </div>
        )}

        {role === 'student' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-surface-raised border border-border rounded-xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-main">Academic Level</label>
              <Select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
                <option value={100}>100 Level</option>
                <option value={200}>200 Level</option>
                <option value={300}>300 Level</option>
                <option value={400}>400 Level</option>
                <option value={500}>500 Level</option>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isClassRep"
                checked={isClassRep}
                onChange={(e) => setIsClassRep(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border focus:ring-ring"
              />
              <label htmlFor="isClassRep" className="text-xs font-semibold text-text-main cursor-pointer">
                Designate as Class Rep
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save User Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
