import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { LectureSession, Venue } from '@/types';

interface SessionShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { venueId: string; date?: string; startTime: string; endTime: string }) => void;
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
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const [venueId, setVenueId] = useState(session?.venueId || venues[0]?.id || '');
  const [date, setDate] = useState(session?.date || todayStr);
  const [startTime, setStartTime] = useState(session?.startTime || '09:00:00');
  const [endTime, setEndTime] = useState(session?.endTime || '11:00:00');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setVenueId(session.venueId || venues[0]?.id || '');
      setDate(session.date || todayStr);
      setStartTime(session.startTime || '09:00:00');
      setEndTime(session.endTime || '11:00:00');
      setError(null);
    }
  }, [session, venues, todayStr]);

  if (!session) return null;

  const isEvent = session.entryType === 'event';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (date < todayStr) {
      setError("Cannot reschedule to a past date.");
      return;
    }
    if (startTime >= endTime) {
      setError("Start time must be before end time.");
      return;
    }
    onSubmit({ venueId, date, startTime, endTime });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEvent ? "Shift / Reschedule Event" : "Shift Session Instance"}
      description={
        isEvent
          ? `Override venue, date, or time for event "${session.courseTitle || session.courseCode || 'Academic Event'}".`
          : `Override room or time for single session on ${session.date} (${session.courseCode}).`
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEvent ? "Apply Event Shift" : "Apply Instance Shift"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl border border-danger/30 bg-danger/10 text-danger text-xs">
            {error}
          </div>
        )}
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Target Venue
          </Text>
          <Select
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            options={venues.map((v) => ({ value: v.id, label: `${v.name} (${v.capacity} seats)` }))}
          />
        </div>
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Date
          </Text>
          <Input
            type="date"
            min={todayStr}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
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
