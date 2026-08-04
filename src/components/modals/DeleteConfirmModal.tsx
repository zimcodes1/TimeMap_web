import { Modal } from '../ui/modal';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName: string;
  itemType: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  itemName,
  itemType,
}: DeleteConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-danger-surface border border-danger/20 rounded-xl text-danger">
          <AlertTriangle size={24} className="shrink-0" />
          <div>
            <div className="font-bold text-sm">Warning: Destructive Action</div>
            <div className="text-xs opacity-90">
              Deleting this {itemType} may affect associated timetables, bookings, or user grants.
            </div>
          </div>
        </div>

        <Text variant="body-sm" color="muted">
          Are you sure you want to permanently delete <strong className="text-text-main">"{itemName}"</strong>?
        </Text>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
