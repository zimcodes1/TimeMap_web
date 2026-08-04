import { Modal } from '../ui/modal';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { User } from '@/types';

interface ToggleUserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, targetStatus: boolean) => void;
  user: User | null;
}

export default function ToggleUserStatusModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}: ToggleUserStatusModalProps) {
  if (!user) return null;

  const targetStatus = !user.isActive;

  const handleConfirm = () => {
    onConfirm(user.id, targetStatus);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${targetStatus ? 'Activate' : 'Deactivate'} User Account — ${user.name}`}
    >
      <div className="space-y-4">
        <Text variant="body-sm" color="muted">
          Are you sure you want to {targetStatus ? 'reactivate' : 'deactivate'} account access for{' '}
          <strong className="text-text-main">{user.name}</strong> ({user.identifier})?
        </Text>

        <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-1 text-xs">
          <div>
            Email: <span className="font-semibold">{user.email}</span>
          </div>
          <div>
            Current Status:{' '}
            <Badge variant={user.isActive ? 'success' : 'danger'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div>
            Target New Status:{' '}
            <Badge variant={targetStatus ? 'success' : 'danger'}>
              {targetStatus ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={targetStatus ? 'primary' : 'danger'} onClick={handleConfirm}>
            {targetStatus ? 'Reactivate Account' : 'Deactivate Account'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
