import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import type { DiscrepancyRequest } from '@/types';

interface DiscrepancyDetailSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRejectTrigger: (id: string) => void;
  onWithdraw: (id: string) => void;
  request: DiscrepancyRequest | null;
}

export default function DiscrepancyDetailSlideOver({
  isOpen,
  onClose,
  onApprove,
  onRejectTrigger,
  onWithdraw,
  request,
}: DiscrepancyDetailSlideOverProps) {
  if (!request) return null;

  const isPending = request.status === 'pending';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Discrepancy #{request.id}</span>
          <Badge
            variant={
              request.status === 'approved' || request.status === 'applied'
                ? 'success'
                : request.status === 'rejected'
                ? 'danger'
                : 'warning'
            }
          >
            {request.status.toUpperCase()}
          </Badge>
        </div>
      }
      description={`Submitted by ${request.requestedBy} (${request.requestedByRole})`}
      size="lg"
      footer={
        isPending ? (
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onWithdraw(request.id);
                onClose();
              }}
            >
              Withdraw Request
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onRejectTrigger(request.id);
                  onClose();
                }}
              >
                Reject Request
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onApprove(request.id);
                  onClose();
                }}
              >
                Approve & Apply
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-surface-raised rounded-xl border border-border space-y-1">
          <Text variant="caption" className="font-bold text-text-main block">
            {request.courseCode} - {request.courseTitle}
          </Text>
          <Text variant="caption" color="muted" className="block text-xs">
            Request Type: {request.requestType} • Created: {new Date(request.createdAt).toLocaleString()}
          </Text>
        </div>

        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Stated Reason / Justification
          </Text>
          <p className="text-sm p-3 bg-surface rounded-xl border border-border text-text-main">
            {request.reason}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
            <Text variant="caption" className="font-bold text-text-muted text-xs block">
              Original Schedule
            </Text>
            <Text variant="caption" className="font-semibold block text-xs">
              Venue: {request.proposedVenueName || 'Standard Venue'}
            </Text>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
            <Text variant="caption" className="font-bold text-primary text-xs block">
              Proposed Schedule
            </Text>
            <Text variant="caption" className="font-semibold block text-xs">
              Venue: {request.proposedVenueName || 'N/A'}
            </Text>
            <Text variant="caption" color="muted" className="block text-xs">
              Time: {request.proposedStartTime || 'N/A'} - {request.proposedEndTime || 'N/A'}
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
}
