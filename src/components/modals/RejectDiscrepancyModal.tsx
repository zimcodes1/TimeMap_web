import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

interface RejectDiscrepancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RejectDiscrepancyModal({
  isOpen,
  onClose,
  onConfirm,
}: RejectDiscrepancyModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Discrepancy Request"
      description="Provide an administrative reason for rejecting this request."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit}>
            Confirm Rejection
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Rejection Reason
          </Text>
          <Input
            placeholder="e.g. Venue already reserved for faculty event"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
