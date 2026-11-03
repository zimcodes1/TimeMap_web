import { Modal } from '../ui/modal';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, Undo2 } from 'lucide-react';

export interface CancelAccessGrantModalTarget {
  grantId: string;
  courseCode: string;
  courseTitle: string;
  recipientScope: string;
  granterScope?: string;
  targetProgramName?: string;
  direction?: 'offered' | 'requested';
  status?: string;
  isOriginatingOwner?: boolean;
}

interface CancelAccessGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (grantId: string) => void;
  target: CancelAccessGrantModalTarget | null;
  isLoading?: boolean;
}

export default function CancelAccessGrantModal({
  isOpen,
  onClose,
  onConfirm,
  target,
  isLoading = false,
}: CancelAccessGrantModalProps) {
  if (!target) return null;

  const handleConfirm = () => {
    onConfirm(target.grantId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Undo Course Access Grant"
    >
      <div className="space-y-4">
        {/* Warning Alert Banner */}
        <div className="flex items-start gap-3 p-3.5 bg-danger-surface border border-danger/30 rounded-xl text-danger">
          <AlertTriangle size={20} className="shrink-0 mt-0.5 text-danger" />
          <div className="space-y-1">
            <div className="font-bold text-sm">Warning: Turning Off Schedules & Timetable Access</div>
            <div className="text-xs text-text-muted leading-relaxed">
              Undoing this access grant will immediately turn off schedules and make published timetables
              completely unavailable for this course across your department, program levels, and students.
            </div>
          </div>
        </div>

        {/* Grant Details Summary */}
        <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
            <span className="text-text-muted">Course:</span>
            <span className="font-semibold text-text-main">
              {target.courseCode} — {target.courseTitle}
            </span>
          </div>

          {target.granterScope && (
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Originating Department:</span>
              <span className="font-medium text-text-main">{target.granterScope}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-text-muted">Granted Scope:</span>
            <span className="font-medium text-text-main">{target.recipientScope}</span>
          </div>

          {target.targetProgramName && (
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Target Program:</span>
              <span className="font-medium text-text-main">{target.targetProgramName}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-text-muted">Status:</span>
            <Badge
              variant={
                target.status === 'approved'
                  ? 'success'
                  : target.status === 'rejected'
                    ? 'danger'
                    : 'warning'
              }
              className="capitalize text-[11px]"
            >
              {target.status || 'Active'}
            </Badge>
          </div>
        </div>

        <Text variant="body-sm" color="muted">
          Are you sure you want to cancel and undo your department's access to{' '}
          <strong className="text-text-main font-semibold">"{target.courseCode}"</strong>?
        </Text>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Keep Access
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-1.5 cursor-pointer"
          >
            <Undo2 size={14} />
            {isLoading ? 'Undoing Access...' : 'Undo Grant'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

