import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import type { Faculty, School } from '@/types';

interface EditFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, name: string, code: string, schoolId: string) => void;
  faculty: Faculty | null;
  schools: School[];
}

export default function EditFacultyModal({
  isOpen,
  onClose,
  onSubmit,
  faculty,
  schools,
}: EditFacultyModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [schoolId, setSchoolId] = useState('');

  useEffect(() => {
    if (faculty) {
      setName(faculty.name);
      setCode(faculty.code);
      setSchoolId(faculty.schoolId);
    }
  }, [faculty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (faculty && name && code && schoolId) {
      onSubmit(faculty.id, name, code, schoolId);
      onClose();
    }
  };

  if (!faculty) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Faculty — ${faculty.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Text variant="body-sm" color="muted">
          Update faculty details and parent school assignment.
        </Text>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">Parent School</label>
          <Select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">Faculty Code</label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. FNS, FPS"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">Faculty Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Faculty of Natural Sciences"
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
