import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { Venue } from '@/types';

interface ToggleVenueStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  venue: Venue | null;
}

export default function ToggleVenueStatusModal({
  isOpen,
  onClose,
  onConfirm,
  venue,
}: ToggleVenueStatusModalProps) {
  if (!venue) return null;

  const isDeactivating = venue.isAvailable;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDeactivating ? 'Deactivate Venue' : 'Reactivate Venue'}
      description={
        isDeactivating
          ? `Are you sure you want to deactivate ${venue.name}? This will affect future timetable bookings against this venue.`
          : `Reactivate ${venue.name} to allow scheduling and bookings.`
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isDeactivating ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isDeactivating ? 'Deactivate Venue' : 'Activate Venue'}
          </Button>
        </>
      }
    >
      <div className="p-3 bg-surface-raised rounded-xl border border-border space-y-1">
        <Text variant="caption" className="font-bold text-text-main block">
          {venue.name} ({venue.code || 'No Code'})
        </Text>
        <Text variant="caption" color="muted" className="block text-xs">
          Building: {venue.building || 'N/A'} • Capacity: {venue.capacity}
        </Text>
      </div>
    </Modal>
  );
}
