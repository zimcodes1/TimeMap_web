import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

interface CreateFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
}

export default function CreateFacilityModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateFacilityModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name });
    setName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Facility Item"
      description="Create a new facility tag for venues (e.g. HD Projector, AC)."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Facility
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Facility Name
          </Text>
          <Input
            placeholder="e.g. HD Projector"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
