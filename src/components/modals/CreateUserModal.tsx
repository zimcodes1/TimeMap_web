import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { User, UserRole, Department, AdminLevel } from '@/types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
  departments: Department[];
  initialData?: User | null;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  departments,
  initialData,
}: CreateUserModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [identifier, setIdentifier] = useState(initialData?.identifier || '');
  const [role, setRole] = useState<UserRole>(initialData?.role || 'student');
  const [departmentId, setDepartmentId] = useState(initialData?.departmentId || departments[0]?.id || '');
  const [level, setLevel] = useState(initialData?.level || 300);
  const [isClassRep, setIsClassRep] = useState(initialData?.isClassRep || false);
  const [adminLevel, setAdminLevel] = useState<AdminLevel>(initialData?.adminLevel || 'department');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !identifier.trim()) return;
    const dept = departments.find((d) => d.id === departmentId);
    onSubmit({
      name,
      email,
      identifier,
      role,
      departmentId,
      departmentName: dept?.name,
      level: Number(level),
      isClassRep,
      adminLevel,
      isActive: true,
      requiresPasswordReset: true,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit User' : 'Create User Account'}
      description="Register student, lecturer, or admin officer credentials."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialData ? 'Save User' : 'Create Account'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              User Role
            </Text>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: 'student', label: 'Student / Class Rep' },
                { value: 'lecturer', label: 'Lecturer / Teaching Staff' },
                { value: 'admin', label: 'Admin Officer' },
              ]}
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Unique Identifier
            </Text>
            <Input
              placeholder="e.g. NSUK/CSC/2021/001"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Full Name
            </Text>
            <Input
              placeholder="e.g. Alice Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Email Address
            </Text>
            <Input
              type="email"
              placeholder="e.g. alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Department
          </Text>
          <Select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
          />
        </div>

        {role === 'student' && (
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <Text variant="caption" className="font-semibold mb-1 block">
                Academic Level
              </Text>
              <Select
                value={String(level)}
                onChange={(e) => setLevel(Number(e.target.value))}
                options={[
                  { value: '100', label: '100 Level' },
                  { value: '200', label: '200 Level' },
                  { value: '300', label: '300 Level' },
                  { value: '400', label: '400 Level' },
                  { value: '500', label: '500 Level' },
                ]}
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isClassRep"
                checked={isClassRep}
                onChange={(e) => setIsClassRep(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
              />
              <label htmlFor="isClassRep" className="text-xs font-semibold text-text-main cursor-pointer">
                Designate as Class Representative
              </label>
            </div>
          </div>
        )}

        {role === 'admin' && (
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Admin Scope Level
            </Text>
            <Select
              value={adminLevel}
              onChange={(e) => setAdminLevel(e.target.value as AdminLevel)}
              options={[
                { value: 'department', label: 'Department Admin' },
                { value: 'faculty', label: 'Faculty Admin' },
                { value: 'school', label: 'School Admin' },
              ]}
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
