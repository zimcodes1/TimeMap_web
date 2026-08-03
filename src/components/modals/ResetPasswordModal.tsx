import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { User } from '@/types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}: ResetPasswordModalProps) {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Force Password Reset"
      description={`Trigger forced first-login password reset flag for ${user.name}.`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Issue Password Reset Flag
          </Button>
        </>
      }
    >
      <div className="p-3 bg-surface-raised rounded-xl border border-border space-y-1">
        <Text variant="caption" className="font-bold text-text-main block">
          {user.name} ({user.identifier || user.email})
        </Text>
        <Text variant="caption" color="muted" className="block text-xs">
          Role: {user.role.toUpperCase()}
        </Text>
      </div>
    </Modal>
  );
}
