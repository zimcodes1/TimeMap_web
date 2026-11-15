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

  const cleanCode = code.trim().toUpperCase();
  const cleanName = name.trim();
  const isCodeValid = !code.trim() || /^[A-Za-z0-9_-]+$/.test(code.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetFacultyId = facultyId || department?.facultyId || faculties[0]?.id || "";
    if (department && cleanName && cleanCode && targetFacultyId && isCodeValid) {
      onSubmit(department.id, cleanName, cleanCode, targetFacultyId);
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
          <Select value={facultyId || department.facultyId || (faculties[0]?.id ?? "")} onChange={(e) => setFacultyId(e.target.value)} required>
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
            placeholder="e.g. CSC, MAT, CS-CYB"
            required
          />
          {!isCodeValid ? (
            <span className="text-xs text-danger font-medium">
              Code must contain only letters, numbers, hyphens, and underscores without spaces.
            </span>
          ) : (
            <span className="text-xs text-text-muted">
              Letters, numbers, hyphens, and underscores only.
            </span>
          )}
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
          <Button variant="primary" type="submit" disabled={!cleanName || !cleanCode || !isCodeValid}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
