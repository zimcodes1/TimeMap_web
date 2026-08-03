import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { AuditLogEntry } from '@/types';

interface AuditSnapshotDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: AuditLogEntry | null;
}

export default function AuditSnapshotDiffModal({
  isOpen,
  onClose,
  entry,
}: AuditSnapshotDiffModalProps) {
  if (!entry) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Audit Log #${entry.id} - ${entry.targetModel}`}
      description={`Action: ${entry.action.toUpperCase()} by ${entry.actorIdentifier}`}
      size="xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Text variant="caption" className="font-bold text-text-muted mb-2 block">
            Before Snapshot
          </Text>
          <pre className="p-3 bg-surface-raised rounded-xl border border-border text-xs overflow-x-auto text-text-main max-h-60">
            {JSON.stringify(entry.beforeSnapshot || null, null, 2)}
          </pre>
        </div>
        <div>
          <Text variant="caption" className="font-bold text-primary mb-2 block">
            After Snapshot
          </Text>
          <pre className="p-3 bg-surface-raised rounded-xl border border-border text-xs overflow-x-auto text-text-main max-h-60">
            {JSON.stringify(entry.afterSnapshot || null, null, 2)}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
