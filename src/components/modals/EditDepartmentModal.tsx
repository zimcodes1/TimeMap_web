import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import type { Department, Faculty } from '@/types';

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, name: string, code: string, facultyId: string) => void;
  department: Department | null;
  faculties: Faculty[];
}

export default function EditDepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  department,
  faculties,
}: EditDepartmentModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [facultyId, setFacultyId] = useState('');

  useEffect(() => {
    if (department) {
      setName(department.name);
      setCode(department.code);
      setFacultyId(department.facultyId);
    }
  }, [department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (department && name && code && facultyId) {
      onSubmit(department.id, name, code, facultyId);
      onClose();
    }
  };

  if (!department) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Department — ${department.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Text variant="body-sm" color="muted">
          Update department information and parent faculty assignment.
        </Text>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">Parent Faculty</label>
          <Select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">Department Code</label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CSC, MAT"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">Department Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Computer Science"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
