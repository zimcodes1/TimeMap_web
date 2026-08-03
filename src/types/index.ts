export type UserRole = 'student' | 'lecturer' | 'admin';
export type AdminLevel = 'department' | 'faculty' | 'school';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  identifier?: string;
  avatarUrl?: string;
  requiresPasswordReset?: boolean;
  isActive?: boolean;
  // Student properties
  isClassRep?: boolean;
  matricNumber?: string;
  departmentId?: string;
  departmentName?: string;
  level?: number;
  // Admin properties
  adminLevel?: AdminLevel;
  adminScopeId?: string;
  adminScopeName?: string;
  // Staff
  staffId?: string;
}

// Hierarchy Types
export interface School {
  id: string;
  name: string;
  code: string;
  facultiesCount?: number;
}

export interface Faculty {
  id: string;
  schoolId: string;
  schoolName?: string;
  name: string;
  code: string;
  departmentsCount?: number;
}

export interface Department {
  id: string;
  facultyId: string;
  facultyName?: string;
  name: string;
  code: string;
}

// Venue Types
export interface Facility {
  id: string;
  name: string;
  icon?: string;
}

export type VenueType = 'lecture_hall' | 'laboratory' | 'exam_hall' | 'multipurpose';

export interface Venue {
  id: string;
  name: string;
  code?: string;
  venueType?: VenueType;
  building?: string;
  capacity: number;
  examCapacity?: number;
  facilities: Facility[];
  owningLevel: AdminLevel;
  owningDepartmentId?: string;
  owningDepartmentName?: string;
  isAvailable: boolean;
}

// Course & Sharing Types
export interface Course {
  id: string;
  code: string;
  title: string;
  level?: number;
  departmentId: string;
  departmentName?: string;
  creditUnits?: number;
  owningLevel?: AdminLevel | 'general';
  lecturers?: User[];
  registrationCount?: number;
}

export type GrantDirection = 'offered' | 'requested';
export type GrantStatus = 'pending' | 'approved' | 'rejected';

export interface CourseAccessGrant {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  grantedToLevel: AdminLevel;
  grantedToDepartmentId?: string;
  grantedToDepartmentName?: string;
  direction: GrantDirection;
  status: GrantStatus;
  requestedBy: string;
  createdAt: string;
}

export interface CourseRegistration {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  academicSession: string;
}

// Scheduling & Conflict Types
export type SessionType = 'lecture' | 'exam' | 'event';

export interface TimetableEntry {
  id: string;
  courseId?: string;
  courseCode: string;
  courseTitle: string;
  lecturerId?: string;
  lecturerName: string;
  venueId: string;
  venueName: string;
  dayOfWeek?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  type: SessionType;
  academicSession?: string;
  recurrenceRule?: string;
  recurrenceStartDate?: string;
  recurrenceEndDate?: string;
  hasConflict?: boolean;
  conflictReason?: string;
}

export type SessionStatus = 'scheduled' | 'shifted' | 'postponed' | 'cancelled' | 'held' | 'not_held';

export interface LectureSession {
  id: string;
  entryId: string;
  courseCode: string;
  courseTitle: string;
  lecturerName: string;
  venueId: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  hasReport?: boolean;
}

export interface ExamSitting {
  id: string;
  timetableEntryId: string;
  courseCode: string;
  courseTitle: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  registeredCandidatesCount: number;
  invigilators: User[];
}

export type ConflictOutcomeType = 'PROCEED' | 'HARD_REJECT' | 'ROUTE_APPROVAL';

export interface ConflictDetail {
  type: string;
  venueId?: string;
  venueName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  conflictingTitle?: string;
}

// Discrepancy Types
export type DiscrepancyRequestType = 'shift_venue' | 'shift_time' | 'postpone' | 'cancel' | 'create_booking';
export type DiscrepancyStatus = 'pending' | 'approved' | 'rejected' | 'applied' | 'withdrawn';

export interface DiscrepancyRequest {
  id: string;
  timetableEntryId?: string;
  lectureSessionId?: string;
  courseCode: string;
  courseTitle: string;
  requestedBy: string;
  requestedByRole: string;
  reason: string;
  requestType: DiscrepancyRequestType;
  proposedVenueId?: string;
  proposedVenueName?: string;
  proposedDate?: string;
  proposedStartTime?: string;
  proposedEndTime?: string;
  status: DiscrepancyStatus;
  createdAt: string;
  targetLevel: AdminLevel;
}

// Reporting & Flags Types
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

export interface UnreportedSessionFlag {
  id: string;
  sessionId: string;
  courseCode: string;
  timetableEntryTitle: string;
  sessionDate: string;
  flaggedAt: string;
  isAcknowledged: boolean;
  acknowledgedByName?: string;
  acknowledgedAt?: string;
}

// Notifications Types
export type NotificationType = 'discrepancy_approved' | 'discrepancy_rejected' | 'session_shifted' | 'session_cancelled' | 'session_unreported';

export interface NotificationItem {
  id: string;
  notificationType: NotificationType;
  title: string;
  body: string;
  relatedModel?: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

// Audit Logs Types
export interface AuditLogEntry {
  id: string;
  actorIdentifier: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  targetModel: string;
  targetId: string;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
  timestamp: string;
}

// Analytics Types
export interface HoldRateAnalytics {
  summary: {
    totalReports: number;
    heldCount: number;
    notHeldCount: number;
    holdRatePercentage: number;
  };
  breakdown: Array<{
    courseId: string;
    courseCode: string;
    courseTitle: string;
    totalReports: number;
    heldCount: number;
    notHeldCount: number;
    holdRatePercentage: number;
  }>;
}

export interface VenueUtilizationAnalytics {
  summary: {
    totalVenues: number;
    totalBookedHours: number;
  };
  breakdown: Array<{
    venueId: string;
    venueName: string;
    totalBookedHours: number;
    totalSessions: number;
  }>;
}

export interface DiscrepancyAnalytics {
  summary: {
    totalDiscrepancies: number;
    byStatus: {
      approved: number;
      rejected: number;
      pending: number;
    };
    byRequestType: {
      shift_venue: number;
      cancel: number;
      shift_time: number;
    };
  };
}
