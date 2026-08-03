import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { School } from '@/types';

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; code: string }) => void;
  initialData?: School | null;
}

export default function CreateSchoolModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreateSchoolModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    onSubmit({ name, code });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit School' : 'Add New School'}
      description="Enter the institutional details for the school."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Create School'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            School Name
          </Text>
          <Input
            placeholder="e.g. Nasarawa State University"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            School Code
          </Text>
          <Input
            placeholder="e.g. NSUK"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
