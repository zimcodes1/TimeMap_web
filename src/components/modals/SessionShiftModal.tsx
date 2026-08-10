import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { LectureSession, Venue } from '@/types';

interface SessionShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { venueId: string; startTime: string; endTime: string }) => void;
  session: LectureSession | null;
  venues?: Venue[];
}

export default function SessionShiftModal({
  isOpen,
  onClose,
  onSubmit,
  session,
  venues = [],
}: SessionShiftModalProps) {
  const [venueId, setVenueId] = useState(session?.venueId || venues[0]?.id || '');
  const [startTime, setStartTime] = useState(session?.startTime || '09:00:00');
  const [endTime, setEndTime] = useState(session?.endTime || '11:00:00');

  if (!session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ venueId, startTime, endTime });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shift Session Instance"
      description={`Override room or time for single session on ${session.date} (${session.courseCode}).`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Apply Instance Shift
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Target Venue
          </Text>
          <Select
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            options={venues.map((v) => ({ value: v.id, label: v.name }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Start Time
            </Text>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              End Time
            </Text>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
