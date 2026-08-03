import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { DiscrepancyRequestType, Venue, TimetableEntry, LectureSession } from '@/types';

interface SubmitDiscrepancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  venues: Venue[];
  entries: TimetableEntry[];
  sessions: LectureSession[];
}

export default function SubmitDiscrepancyModal({
  isOpen,
  onClose,
  onSubmit,
  venues,
  entries,
  sessions,
}: SubmitDiscrepancyModalProps) {
  const [scopeType, setScopeType] = useState<'instance' | 'pattern'>('instance');
  const [requestType, setRequestType] = useState<DiscrepancyRequestType>('shift_venue');
  const [timetableEntryId, setTimetableEntryId] = useState(entries[0]?.id || '');
  const [lectureSessionId, setLectureSessionId] = useState(sessions[0]?.id || '');
  const [proposedVenueId, setProposedVenueId] = useState(venues[0]?.id || '');
  const [proposedStartTime, setProposedStartTime] = useState('11:00:00');
  const [proposedEndTime, setProposedEndTime] = useState('13:00:00');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit({
      scope_type: scopeType,
      request_type: requestType,
      timetable_entry: scopeType === 'pattern' ? timetableEntryId : undefined,
      lecture_session: scopeType === 'instance' ? lectureSessionId : undefined,
      proposed_venue: proposedVenueId,
      proposed_start_time: proposedStartTime,
      proposed_end_time: proposedEndTime,
      reason,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Discrepancy Request"
      description="Submit a schedule shift, cancellation, postponement, or venue change for approval."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit Request
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Change Scope
            </Text>
            <Select
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value as 'instance' | 'pattern')}
              options={[
                { value: 'instance', label: 'Single Date Session Instance' },
                { value: 'pattern', label: 'All Recurrence Pattern Dates' },
              ]}
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Request Type
            </Text>
            <Select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as DiscrepancyRequestType)}
              options={[
                { value: 'shift_venue', label: 'Shift Venue' },
                { value: 'shift_time', label: 'Shift Time' },
                { value: 'postpone', label: 'Postpone Session' },
                { value: 'cancel', label: 'Cancel Session' },
                { value: 'create_booking', label: 'Cross-Scope Booking' },
              ]}
            />
          </div>
        </div>

        {scopeType === 'instance' ? (
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Target Dated Session
            </Text>
            <Select
              value={lectureSessionId}
              onChange={(e) => setLectureSessionId(e.target.value)}
              options={sessions.map((s) => ({
                value: s.id,
                label: `${s.courseCode} on ${s.date} (${s.startTime} in ${s.venueName})`,
              }))}
            />
          </div>
        ) : (
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Target Timetable Entry
            </Text>
            <Select
              value={timetableEntryId}
              onChange={(e) => setTimetableEntryId(e.target.value)}
              options={entries.map((e) => ({
                value: e.id,
                label: `${e.courseCode} - ${e.courseTitle} (${e.venueName})`,
              }))}
            />
          </div>
        )}

        {(requestType === 'shift_venue' || requestType === 'create_booking') && (
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Proposed Venue
            </Text>
            <Select
              value={proposedVenueId}
              onChange={(e) => setProposedVenueId(e.target.value)}
              options={venues.map((v) => ({ value: v.id, label: v.name }))}
            />
          </div>
        )}

        {(requestType === 'shift_time' || requestType === 'shift_venue') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text variant="caption" className="font-semibold mb-1 block">
                Proposed Start Time
              </Text>
              <Input
                type="time"
                value={proposedStartTime}
                onChange={(e) => setProposedStartTime(e.target.value)}
              />
            </div>
            <div>
              <Text variant="caption" className="font-semibold mb-1 block">
                Proposed End Time
              </Text>
              <Input
                type="time"
                value={proposedEndTime}
                onChange={(e) => setProposedEndTime(e.target.value)}
              />
            </div>
          </div>
        )}

        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Reason / Justification
          </Text>
          <Input
            placeholder="e.g. AC maintenance scheduled in LT1 on Sept 14"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
