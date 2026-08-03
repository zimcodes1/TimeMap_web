import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { UnreportedSessionFlag } from '@/types';

interface AcknowledgeFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  flag: UnreportedSessionFlag | null;
}

export default function AcknowledgeFlagModal({
  isOpen,
  onClose,
  onConfirm,
  flag,
}: AcknowledgeFlagModalProps) {
  if (!flag) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acknowledge Unreported Session Flag"
      description="Mark this expired unreported lecture session flag as acknowledged."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Acknowledge Flag
          </Button>
        </>
      }
    >
      <div className="p-3 bg-surface-raised rounded-xl border border-border space-y-1">
        <Text variant="caption" className="font-bold text-text-main block">
          {flag.timetableEntryTitle} ({flag.courseCode})
        </Text>
        <Text variant="caption" color="muted" className="block text-xs">
          Session Date: {flag.sessionDate} • Flagged At: {new Date(flag.flaggedAt).toLocaleString()}
        </Text>
      </div>
    </Modal>
  );
}
