import { Modal } from '../ui/modal';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { DiscrepancyRequest } from '@/types';

interface WithdrawRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (requestId: string) => void;
  request: DiscrepancyRequest | null;
}

export default function WithdrawRequestModal({
  isOpen,
  onClose,
  onConfirm,
  request,
}: WithdrawRequestModalProps) {
  if (!request) return null;

  const handleConfirm = () => {
    onConfirm(request.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Withdraw Request #${request.id}`}>
      <div className="space-y-4">
        <Text variant="body-sm" color="muted">
          Withdraw this pending discrepancy request. This will remove it from the admin approval queue.
        </Text>

        <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1 text-xs">
          <div>
            Course: <span className="font-semibold">{request.courseCode} — {request.courseTitle}</span>
          </div>
          <div>
            Type:{' '}
            <Badge variant="default" className="capitalize">
              {request.requestType.replace('_', ' ')}
            </Badge>
          </div>
          <div>
            Reason: <span className="text-text-muted">{request.reason}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Withdraw Submission
          </Button>
        </div>
      </div>
    </Modal>
  );
}
