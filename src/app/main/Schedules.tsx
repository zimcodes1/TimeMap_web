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
      courseId,
      courseCode: selectedCourse?.code || 'CSC301',
      courseTitle: selectedCourse?.title || 'Lecture',
      lecturerId: 'lec_01',
      lecturerName: 'Prof. Alan Turing',
      venueId,
      venueName: selectedVenue?.name || 'LT1',
      dayOfWeek: (data.day_of_week as TimetableEntry['dayOfWeek']) || 'Monday',
      startTime: (data.start_time as string) || '09:00:00',
      endTime: (data.end_time as string) || '11:00:00',
      type: (data.entry_type as TimetableEntry['type']) || 'lecture',
      academicSession: '2025/2026',
      hasConflict: false,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setConflictOutcome('PROCEED');
    setConflictDetailMsg('Live entry created; recurring lectures automatically materialized into dated sessions.');
    setIsConflictModalOpen(true);
  };

  const handleShiftSession = (data: { venueId: string; startTime: string; endTime: string }) => {
    if (!selectedSessionForShift) return;
    const venue = mockVenues.find((v) => v.id === data.venueId);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionForShift.id
          ? {
              ...s,
              venueId: data.venueId,
              venueName: venue?.name || s.venueName,
              startTime: data.startTime,
              endTime: data.endTime,
              status: 'shifted',
            }
          : s
      )
    );
    setSelectedSessionForShift(null);
  };

  const handleCreateExamSitting = (data: { timetableEntryId: string; invigilatorIds: string[] }) => {
    const entry = entries.find((e) => e.id === data.timetableEntryId);
    const assignedInvigilators = mockLecturers.filter((l) => data.invigilatorIds.includes(l.id));
    const newExam: ExamSitting = {
      id: `exam_${Date.now()}`,
      timetableEntryId: data.timetableEntryId,
      courseCode: entry?.courseCode || 'CSC301',
      courseTitle: entry?.courseTitle || 'Exam',
      venueName: entry?.venueName || 'Main Hall',
      date: '2026-08-20',
      startTime: entry?.startTime || '09:00:00',
      endTime: entry?.endTime || '12:00:00',
      registeredCandidatesCount: 142,
      invigilators: assignedInvigilators,
    };
    setExamSittings((prev) => [newExam, ...prev]);
  };

  return (
    <>
      <SchedulesView
        entries={entries}
        sessions={sessions}
        examSittings={examSittings}
        onOpenScheduleEntry={() => setIsScheduleEntryOpen(true)}
        onOpenExamSitting={() => setIsExamSittingOpen(true)}
        onShiftSessionTrigger={(sess) => setSelectedSessionForShift(sess)}
      />

      <ScheduleEntryModal
        isOpen={isScheduleEntryOpen}
        onClose={() => setIsScheduleEntryOpen(false)}
        onSubmit={handleCreateScheduleEntry}
        courses={mockCourses}
        venues={mockVenues}
      />

      <ConflictFeedbackModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        outcomeType={conflictOutcome}
        detailMessage={conflictDetailMsg}
        conflicts={conflictsList}
      />

      <SessionShiftModal
        isOpen={!!selectedSessionForShift}
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
    </>
  );
}
