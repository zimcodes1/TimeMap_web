import { useState } from 'react';
import SchedulesView from '@/pages/main/SchedulesView';
import ScheduleEntryModal from '@/components/modals/ScheduleEntryModal';
import ConflictFeedbackModal from '@/components/modals/ConflictFeedbackModal';
import SessionShiftModal from '@/components/modals/SessionShiftModal';
import CreateExamSittingModal from '@/components/modals/CreateExamSittingModal';
import {
  mockTimetableEntries,
  mockLectureSessions,
  mockExamSittings,
  mockCourses,
  mockVenues,
  mockLecturers,
} from '@/constants/mockData';
import type { TimetableEntry, LectureSession, ExamSitting, ConflictOutcomeType } from '@/types';
import { toast } from 'sonner';

export default function SchedulesContainer() {
  const [entries, setEntries] = useState<TimetableEntry[]>(mockTimetableEntries);
  const [sessions, setSessions] = useState<LectureSession[]>(mockLectureSessions);
  const [examSittings, setExamSittings] = useState<ExamSitting[]>(mockExamSittings);

  const [isScheduleEntryOpen, setIsScheduleEntryOpen] = useState(false);
  const [isExamSittingOpen, setIsExamSittingOpen] = useState(false);
  const [selectedSessionForShift, setSelectedSessionForShift] = useState<LectureSession | null>(null);

  // Conflict Feedback State
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictOutcome, setConflictOutcome] = useState<ConflictOutcomeType>('PROCEED');
  const [conflictDetailMsg, setConflictDetailMsg] = useState('');
  const [conflictsList, setConflictsList] = useState<Array<{ type: string; venueName?: string; date?: string; startTime?: string; endTime?: string; conflictingTitle?: string }>>([]);

  const handleCreateScheduleEntry = (data: Record<string, unknown>) => {
    const courseId = data.course as string;
    const venueId = data.venue as string;
    const selectedCourse = mockCourses.find((c) => c.id === courseId);
    const selectedVenue = mockVenues.find((v) => v.id === venueId);

    // Simulate Conflict Engine Check
    if (selectedVenue?.owningLevel === 'school' && selectedVenue.id === 'ven_3') {
      setConflictOutcome('ROUTE_APPROVAL');
      setConflictDetailMsg('Booking touches a venue outside your scope and has been routed for approval.');
      setIsConflictModalOpen(true);
      return;
    }

    if (data.start_time === '11:30:00' && selectedVenue?.id === 'ven_2') {
      setConflictOutcome('HARD_REJECT');
      setConflictDetailMsg('Booking clashes with 1 existing schedule entry/duty.');
      setConflictsList([
        {
          type: 'venue_clash',
          venueName: selectedVenue.name,
          date: '2026-08-18',
          startTime: '11:30:00',
          endTime: '13:30:00',
          conflictingTitle: 'EEE402 Exam Sitting Collision',
        },
      ]);
      setIsConflictModalOpen(true);
      return;
    }

    const newEntry: TimetableEntry = {
      id: `entry_${Date.now()}`,
      type: (data.entry_type as TimetableEntry['type']) || 'lecture',
      courseId: courseId || 'crs_1',
      courseCode: selectedCourse?.code || 'CSC301',
      courseTitle: selectedCourse?.title || 'Course',
      venueId: venueId || 'ven_1',
      venueName: selectedVenue?.name || 'Main Hall',
      startTime: (data.start_time as string) || '08:00:00',
      endTime: (data.end_time as string) || '10:00:00',
      academicSession: (data.academic_session as string) || '2025/2026',
      lecturerName: 'Dr. Sarah Jenkins',
      dayOfWeek: 'Monday',
      hasConflict: false,
    };

    setEntries((prev) => [newEntry, ...prev]);
    toast.success('Schedule entry created successfully (201 PROCEED)');
  };

  const handleShiftSession = (data: { venueId: string; startTime: string; endTime: string }) => {
    if (!selectedSessionForShift) return;
    const selectedVenue = mockVenues.find((v) => v.id === data.venueId);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionForShift.id
          ? {
              ...s,
              startTime: data.startTime,
              endTime: data.endTime,
              status: 'shifted',
              venueId: data.venueId,
              venueName: selectedVenue?.name || s.venueName,
            }
          : s
      )
    );
    setSelectedSessionForShift(null);
    toast.success(`Session shifted (${data.startTime} - ${data.endTime})`);
  };

  const handleCreateExamSitting = (data: { timetableEntryId: string; invigilatorIds: string[] }) => {
    const entry = entries.find((e) => e.id === data.timetableEntryId);
    const invigs = mockLecturers.filter((l) => data.invigilatorIds.includes(l.id));

    const newExam: ExamSitting = {
      id: `exam_${Date.now()}`,
      timetableEntryId: data.timetableEntryId,
      courseCode: entry?.courseCode || 'CSC301',
      courseTitle: entry?.courseTitle || 'Data Structures',
      venueName: entry?.venueName || 'Auditorium A',
      date: '2026-08-25',
      startTime: entry?.startTime || '09:00:00',
      endTime: entry?.endTime || '12:00:00',
      registeredCandidatesCount: 120,
      invigilators: invigs,
    };
    setExamSittings((prev) => [newExam, ...prev]);
    setIsExamSittingOpen(false);
    toast.success('Exam sitting created successfully');
  };

  const handleMaterializeSession = (entry: TimetableEntry) => {
    const newSession: LectureSession = {
      id: `sess_${Date.now()}`,
      entryId: entry.id,
      courseCode: entry.courseCode,
      courseTitle: entry.courseTitle,
      lecturerName: entry.lecturerName,
      date: new Date().toISOString().split('T')[0],
      startTime: entry.startTime,
      endTime: entry.endTime,
      venueId: entry.venueId,
      venueName: entry.venueName,
      status: 'scheduled',
    };
    setSessions((prev) => [newSession, ...prev]);
    toast.success(`Materialized dated session for ${entry.courseCode} on ${newSession.date}`);
  };

  return (
    <>
      <SchedulesView
        entries={entries}
        sessions={sessions}
        examSittings={examSittings}
        onOpenScheduleEntry={() => setIsScheduleEntryOpen(true)}
        onOpenExamSitting={() => setIsExamSittingOpen(true)}
        onShiftSessionTrigger={(s) => setSelectedSessionForShift(s)}
        onMaterializeTrigger={handleMaterializeSession}
      />

      <ScheduleEntryModal
        isOpen={isScheduleEntryOpen}
        onClose={() => setIsScheduleEntryOpen(false)}
        onSubmit={handleCreateScheduleEntry}
        courses={mockCourses}
        venues={mockVenues}
      />

      <SessionShiftModal
        isOpen={Boolean(selectedSessionForShift)}
        onClose={() => setSelectedSessionForShift(null)}
        onSubmit={handleShiftSession}
        session={selectedSessionForShift}
        venues={mockVenues}
      />

      <CreateExamSittingModal
        isOpen={isExamSittingOpen}
        onClose={() => setIsExamSittingOpen(false)}
        onSubmit={handleCreateExamSitting}
        entries={entries}
        lecturers={mockLecturers}
      />

      <ConflictFeedbackModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        outcomeType={conflictOutcome}
        detailMessage={conflictDetailMsg}
        conflicts={conflictsList}
      />
    </>
  );
}
