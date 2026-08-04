import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { School } from '@/types';

interface EditSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, name: string, code: string) => void;
  school: School | null;
}

export default function EditSchoolModal({
  isOpen,
  onClose,
  onSubmit,
  school,
}: EditSchoolModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (school) {
      setName(school.name);
      setCode(school.code);
    }
  }, [school]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (school && name && code) {
      onSubmit(school.id, name, code);
      onClose();
    }
  };

  if (!school) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit School — ${school.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Text variant="body-sm" color="muted">
          Update institution school metadata.
        </Text>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">School Code</label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. SAAT, SEET"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">School Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. School of Science and Technology"
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
