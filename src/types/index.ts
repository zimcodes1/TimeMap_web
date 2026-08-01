export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  // Student properties
  isClassRep?: boolean;
  matricNumber?: string;
  departmentId?: string;
  // Admin properties
  adminLevel?: 'department' | 'faculty' | 'school';
  adminScopeId?: string;
  // Staff
  staffId?: string;
}

export interface Facility {
  id: string;
  name: string;
  icon?: string;
}

export interface Venue {
  id: string;
  name: string;
  code: string;
  building: string;
  capacity: number;
  facilities: Facility[];
  owningLevel: 'department' | 'faculty' | 'school';
  isAvailable: boolean;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  creditUnits: number;
}

export type SessionType = 'lecture' | 'exam' | 'event';

export interface TimetableEntry {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  lecturerId: string;
  lecturerName: string;
  venueId: string;
  venueName: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  type: SessionType;
  recurrenceRule?: string;
  hasConflict?: boolean;
  conflictReason?: string;
}

export interface LectureSession {
  id: string;
  entryId: string;
  courseCode: string;
  courseTitle: string;
  lecturerName: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'disputed';
  hasReport?: boolean;
}

export type DiscrepancyType = 'shift' | 'cancellation' | 'postponement';
export type DiscrepancyStatus = 'pending' | 'approved' | 'rejected';

export interface DiscrepancyRequest {
  id: string;
  originalEntryId: string;
  courseCode: string;
  courseTitle: string;
  requestedBy: string;
  requestedByRole: string;
  reason: string;
  type: DiscrepancyType;
  requestedVenueId?: string;
  requestedVenueName?: string;
  requestedDate?: string;
  requestedTimeSlot?: string;
  status: DiscrepancyStatus;
  createdAt: string;
  targetLevel: 'department' | 'faculty' | 'school';
}

export interface ClassRepReport {
  id: string;
  sessionId: string;
  courseCode: string;
  courseTitle: string;
  held: boolean;
  reasonText?: string;
  reporterName: string;
  timestamp: string;
  windowExpiresAt: string;
  lecturerResponse?: string;
}
