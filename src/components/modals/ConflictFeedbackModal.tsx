import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import type { ConflictOutcomeType } from '@/types';

interface ConflictFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  outcomeType: ConflictOutcomeType;
  detailMessage?: string;
  conflicts?: Array<{
    type: string;
    venueName?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    conflictingTitle?: string;
  }>;
}

export default function ConflictFeedbackModal({
  isOpen,
  onClose,
  outcomeType,
  detailMessage,
  conflicts = [],
}: ConflictFeedbackModalProps) {
  const isHardReject = outcomeType === 'HARD_REJECT';
  const isRouteApproval = outcomeType === 'ROUTE_APPROVAL';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {isHardReject && <Badge variant="danger">HARD REJECT (400)</Badge>}
          {isRouteApproval && <Badge variant="warning">ROUTE APPROVAL (202)</Badge>}
          {!isHardReject && !isRouteApproval && <Badge variant="success">PROCEED (201)</Badge>}
          <span>Booking Engine Result</span>
        </div>
      }
      description={detailMessage || 'Conflict detection engine evaluated the proposed schedule.'}
      footer={
        <Button variant="primary" onClick={onClose}>
          Understood
        </Button>
      }
    >
      <div className="space-y-3">
        {isHardReject && conflicts.length > 0 && (
          <div className="space-y-2">
            <Text variant="caption" className="font-bold text-danger block">
              Conflicting Entries Detected ({conflicts.length}):
            </Text>
            {conflicts.map((c, idx) => (
              <div key={idx} className="p-3 bg-red-50 text-red-900 rounded-xl border border-red-200 text-xs space-y-1">
                <span className="font-bold block">{c.conflictingTitle || 'Venue Clash'}</span>
                <div>Venue: {c.venueName || 'N/A'}</div>
                <div>Date/Time: {c.date || ''} ({c.startTime} - {c.endTime})</div>
              </div>
            ))}
          </div>
        )}

        {isRouteApproval && (
          <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs space-y-1">
            <span className="font-bold block">Cross-Scope Approval Required</span>
            <div>
              This venue is outside your direct department scope. A discrepancy request has been automatically created and routed to the owning admin.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
