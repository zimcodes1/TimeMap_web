import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { Course, Venue, SessionType } from '@/types';

interface ScheduleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  courses: Course[];
  venues: Venue[];
}

export default function ScheduleEntryModal({
  isOpen,
  onClose,
  onSubmit,
  courses,
  venues,
}: ScheduleEntryModalProps) {
  const [entryType, setEntryType] = useState<SessionType>('lecture');
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [venueId, setVenueId] = useState(venues[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('11:00:00');
  const [recurrenceRule, setRecurrenceRule] = useState('weekly:tuesday');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [academicSession, setAcademicSession] = useState('2025/2026');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCourse = courses.find((c) => c.id === courseId);
    const selectedVenue = venues.find((v) => v.id === venueId);
    onSubmit({
      entry_type: entryType,
      title: title || `${selectedCourse?.code || 'Session'} ${entryType}`,
      course: courseId,
      course_code: selectedCourse?.code,
      venue: venueId,
      venue_name: selectedVenue?.name,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      recurrence_rule: recurrenceRule,
      recurrence_start_date: startDate,
      recurrence_end_date: endDate,
      academic_session: academicSession,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Timetable Entry"
      description="Schedule a lecture, exam, or campus event. Automatically evaluates backend conflicts."
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit Schedule Entry
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Entry Type
            </Text>
            <Select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as SessionType)}
              options={[
                { value: 'lecture', label: 'Recurring Lecture' },
                { value: 'exam', label: 'Examination Sitting' },
                { value: 'event', label: 'One-off Event' },
              ]}
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Entry Title (Optional)
            </Text>
            <Input
              placeholder="e.g. CSC301 Weekly Lecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Academic Session
            </Text>
            <Input
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              placeholder="2025/2026"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Course
            </Text>
            <Select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              options={courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.title}` }))}
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Venue
            </Text>
            <Select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              options={venues.map((v) => ({
                value: v.id,
                label: `${v.name} (Cap: ${v.capacity})`,
              }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Day of Week
            </Text>
            <Select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              options={[
                { value: 'Monday', label: 'Monday' },
                { value: 'Tuesday', label: 'Tuesday' },
                { value: 'Wednesday', label: 'Wednesday' },
                { value: 'Thursday', label: 'Thursday' },
                { value: 'Friday', label: 'Friday' },
                { value: 'Saturday', label: 'Saturday' },
              ]}
            />
          </div>
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

        {entryType === 'lecture' && (
          <div className="p-3 bg-surface-raised rounded-xl border border-border space-y-3">
            <Text variant="caption" className="font-bold text-text-main block">
              Lecture Recurrence Rule
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Text variant="caption" className="text-xs mb-1 block">
                  Pattern String
                </Text>
                <Input
                  value={recurrenceRule}
                  onChange={(e) => setRecurrenceRule(e.target.value)}
                  placeholder="weekly:tuesday"
                />
              </div>
              <div>
                <Text variant="caption" className="text-xs mb-1 block">
                  Start Date
                </Text>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Text variant="caption" className="text-xs mb-1 block">
                  End Date
                </Text>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
