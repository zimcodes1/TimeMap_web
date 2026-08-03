import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { Department, Faculty } from '@/types';

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { facultyId: string; name: string; code: string }) => void;
  faculties: Faculty[];
  initialData?: Department | null;
}

export default function CreateDepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  faculties,
  initialData,
}: CreateDepartmentModalProps) {
  const [facultyId, setFacultyId] = useState(initialData?.facultyId || faculties[0]?.id || '');
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !facultyId) return;
    onSubmit({ facultyId, name, code });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Department' : 'Add New Department'}
      description="Select parent faculty and enter department information."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Create Department'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Parent Faculty
          </Text>
          <Select
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            options={faculties.map((f) => ({ value: f.id, label: `${f.name} (${f.code})` }))}
          />
        </div>
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Department Name
          </Text>
          <Input
            placeholder="e.g. Computer Science"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Department Code
          </Text>
          <Input
            placeholder="e.g. CSC"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
