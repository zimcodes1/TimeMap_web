import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar as CalendarIcon, Clock, AlertTriangle, Layers, UserCheck } from 'lucide-react';
import type { TimetableEntry, LectureSession, ExamSitting } from '@/types';

interface SchedulesViewProps {
  entries: TimetableEntry[];
  sessions: LectureSession[];
  examSittings: ExamSitting[];
  onOpenScheduleEntry: () => void;
  onOpenExamSitting: () => void;
  onShiftSessionTrigger: (session: LectureSession) => void;
}

export default function SchedulesView({
  entries,
  sessions,
  examSittings,
  onOpenScheduleEntry,
  onOpenExamSitting,
  onShiftSessionTrigger,
}: SchedulesViewProps) {
  const [activeTab, setActiveTab] = useState<'entries' | 'sessions' | 'exams'>('entries');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Timetables & Scheduling
          </Text>
          <Text variant="body-sm" color="muted">
            Manage recurring lectures, dated sessions, and exam sittings with Conflict Detection Engine feedback.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenExamSitting}>
            <UserCheck size={16} className="mr-1" /> Create Exam Sitting
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenScheduleEntry}>
            <Plus size={16} className="mr-1" /> Schedule Entry
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('entries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'entries'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <CalendarIcon size={16} /> All Schedule Patterns ({entries.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'sessions'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <Layers size={16} /> Dated Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'exams'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <Clock size={16} /> Exam Sittings ({examSittings.length})
        </button>
      </div>

      {/* Content Tables */}
      <Card className="p-0 overflow-x-auto bg-transparent border-none shadow-none rounded-none">
        {activeTab === 'entries' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Course / Title</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2">Day & Slot</th>
                <th className="py-3 px-2">Venue</th>
                <th className="py-3 px-2">Lecturer</th>
                <th className="py-3 px-2">Conflict Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <div className="font-bold text-primary">{entry.courseCode}</div>
                    <div className="text-xs text-text-main">{entry.courseTitle}</div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={entry.type === 'exam' ? 'warning' : 'default'} className="capitalize">
                      {entry.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-xs">
                    <div className="font-semibold text-text-main">{entry.dayOfWeek || 'Mon-Fri'}</div>
                    <div className="text-text-muted">{entry.startTime} - {entry.endTime}</div>
                  </td>
                  <td className="py-3 px-2 font-semibold text-xs text-text-main">{entry.venueName}</td>
                  <td className="py-3 px-2 text-xs text-text-muted">{entry.lecturerName}</td>
                  <td className="py-3 px-2">
                    {entry.hasConflict ? (
                      <div className="flex items-center gap-1 text-danger text-xs font-bold">
                        <AlertTriangle size={14} /> Clash Detected
                      </div>
                    ) : (
                      <Badge variant="success">Clear (PROCEED)</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {activeTab === 'sessions' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Course Code & Title</th>
                <th className="py-3 px-2">Date & Time</th>
                <th className="py-3 px-2">Venue</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <div className="font-bold text-primary">{sess.courseCode}</div>
                    <div className="text-xs text-text-main">{sess.courseTitle}</div>
                  </td>
                  <td className="py-3 px-2 text-xs">
                    <div className="font-bold text-text-main">{sess.date}</div>
                    <div className="text-text-muted">{sess.startTime} - {sess.endTime}</div>
                  </td>
                  <td className="py-3 px-2 text-xs font-semibold">{sess.venueName}</td>
                  <td className="py-3 px-2">
                    <Badge variant={sess.status === 'scheduled' ? 'success' : 'warning'}>
                      {sess.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Button variant="outline" size="sm" onClick={() => onShiftSessionTrigger(sess)}>
                      Shift Instance
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {activeTab === 'exams' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Course & Exam Title</th>
                <th className="py-3 px-2">Venue</th>
                <th className="py-3 px-2">Date & Time</th>
                <th className="py-3 px-2">Candidates</th>
                <th className="py-3 px-2">Assigned Invigilators</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {examSittings.map((exam) => (
                <tr key={exam.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <div className="font-bold text-amber-600">{exam.courseCode}</div>
                    <div className="text-xs text-text-main">{exam.courseTitle}</div>
                  </td>
                  <td className="py-3 px-2 text-xs font-bold text-text-main">{exam.venueName}</td>
                  <td className="py-3 px-2 text-xs">
                    <div className="font-semibold text-text-main">{exam.date}</div>
                    <div className="text-text-muted">{exam.startTime} - {exam.endTime}</div>
                  </td>
                  <td className="py-3 px-2 text-xs font-bold text-primary">
                    {exam.registeredCandidatesCount} Students
                  </td>
                  <td className="py-3 px-2 text-xs font-medium text-text-muted">
                    {exam.invigilators.map((i) => i.name).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
