// User & Hierarchy Types
export type UserRole = 'admin' | 'lecturer' | 'student';
export type AdminLevel = 'university' | 'school' | 'faculty' | 'department';

export interface User {
  id: string;
  identifier: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  adminLevel?: AdminLevel;
  adminScopeId?: string;
  adminScopeName?: string;
  schoolId?: string;
  schoolName?: string;
  facultyId?: string;
  facultyName?: string;
  departmentId?: string;
  departmentName?: string;
  programId?: string;
  programName?: string;
  programCode?: string;
  staffId?: string;
  matricNumber?: string;
  level?: number;
  isClassRep?: boolean;
  isActive: boolean;
  requiresPasswordReset?: boolean;
}

export interface School {
  id: string;
  name: string;
  code: string;
  facultiesCount?: number;
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  schoolId: string;
  schoolName?: string;
  departmentsCount?: number;
}

export interface Program {
  id: string;
  departmentId: string;
  departmentName?: string;
  departmentCode?: string;
  facultyId?: string;
  facultyName?: string;
  schoolId?: string;
  schoolName?: string;
  name: string;
  code: string;
  maxLevel: number;
  isDefault: boolean;
  createdAt?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  facultyName?: string;
  max_level?: number;
  maxLevel?: number;
  programs?: Program[];
}

export interface AcademicSession {
  id: string;
  schoolId: string;
  schoolName?: string;
  schoolCode?: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  semesters?: Semester[];
  createdAt?: string;
}

export interface Semester {
  id: string;
  sessionId: string;
  sessionLabel?: string;
  schoolId?: string;
  schoolName?: string;
  name: 'first' | 'second';
  displayName?: string;
  startDate: string;
  endDate: string;
  durationType: 'weeks' | 'months' | 'fixed';
  durationValue?: number;
  lectureStartDate?: string;
  lectureEndDate?: string;
  examStartDate?: string;
  examEndDate?: string;
  isActive: boolean;
  createdByName?: string;
  createdAt?: string;
}

// Venue & Facility Types
export type VenueType = 'lecture_hall' | 'lab' | 'laboratory' | 'auditorium' | 'classroom' | 'multipurpose';

export interface Facility {
  id: string;
  name: string;
  description?: string;
}

export interface Venue {
  id: string;
  name: string;
  code?: string;
  venueType?: VenueType;
  capacity: number;
  examCapacity?: number;
  building?: string;
  owningLevel: AdminLevel;
  owningDepartmentId?: string;
  owningDepartmentName?: string;
  facilities: Facility[];
  isAvailable: boolean;
}

// Academic & Course Types
export interface Course {
  id: string;
  code: string;
  title: string;
  level: number;
  creditUnits?: number;
  departmentId: string | undefined;
  departmentName?: string;
  owningLevel: AdminLevel;
  owningSchool?: string;
  schoolName?: string;
  owningFaculty?: string;
  facultyName?: string;
  owningDepartment?: string;
  semesterId?: string;
  semesterName?: string;
  sessionLabel?: string;
  programScope?: 'general' | 'program';
  targetProgramId?: string;
  targetProgramName?: string;
  targetProgramCode?: string;
  lecturers: User[];
  lecturerIds?: string[];
  registrationCount?: number;
  courseType?: 'lecture' | 'practical';
  requiredOccurrencesPerWeek?: number;
}

export interface CourseAccessGrant {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  grantedToLevel: AdminLevel;
  grantedToDepartmentId?: string;
  grantedToDepartmentName?: string;
  grantedToFacultyId?: string;
  grantedToFacultyName?: string;
  grantedToSchoolId?: string;
  grantedToSchoolName?: string;
  grantScope?: 'general' | 'program';
  targetProgramId?: string;
  targetProgramName?: string;
  direction: 'offered' | 'requested';
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  createdAt: string;
}

// Scheduling & Conflict Types
export type SessionType = 'lecture' | 'exam' | 'event';

export interface TimetableEntry {
  id: string;
  entryType?: SessionType;
  title?: string;
  courseId?: string;
  courseCode: string;
  courseTitle: string;
  courseLevel?: number;
  courseType?: string;
  departmentId?: string | number;
  departmentName?: string;
  facultyId?: string | number;
  facultyName?: string;
  lecturerId?: string;
  lecturerName: string;
  lecturers?: string[];
  venueId: string;
  venueName: string;
  venueCapacity?: number;
  expectedStudents?: number;
  dayOfWeek?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  type: SessionType;
  semesterId?: string;
  semesterName?: string;
  sessionLabel?: string;
  programScope?: 'general' | 'program';
  targetProgramId?: string;
  targetProgramName?: string;
  academicSession?: string;
  academicSessionId?: string;
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
  timetableEntryId?: string;
  entryType?: SessionType;
  courseCode: string;
  courseTitle: string;
  courseLevel?: number;
  courseType?: string;
  departmentId?: string | number;
  departmentName?: string;
  facultyId?: string | number;
  facultyName?: string;
  lecturerName: string;
  lecturers?: string[];
  venueId: string;
  venueName: string;
  venueCapacity?: number;
  dayOfWeek?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  targetProgramId?: string;
  programName?: string;
  programCode?: string;
  programScope?: 'general' | 'program';
  hasReport?: boolean;
  canShift?: boolean;
  reportStatus?: 'held' | 'not_held' | 'unreported';
}

export interface ExamSitting {
  id: string;
  timetableEntryId?: string;
  courseId?: string;
  courseCode: string;
  courseTitle: string;
  venueId?: string;
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
  initiatedById?: string;
  routedToId?: string;
  courseCode: string;
  courseTitle: string;
  requestedBy: string;
  requestedByRole: string;
  requestedByScope?: string;
  reason: string;
  requestType: DiscrepancyRequestType;
  originalVenueName?: string;
  originalStartTime?: string;
  originalEndTime?: string;
  proposedVenueId?: string;
  proposedVenueName?: string;
  proposedDate?: string;
  proposedStartTime?: string;
  proposedEndTime?: string;
  status: DiscrepancyStatus;
  rejectionReason?: string;
  canWithdraw?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
  departmentId?: string;
  departmentName?: string;
  createdAt: string;
  targetLevel?: AdminLevel;
}

// Reporting & Flags Types
export interface ClassRepReport {
  id: string;
  sessionId: string;
  sessionDate?: string;
  courseCode: string;
  courseTitle: string;
  held: boolean;
  reasonText?: string;
  reporterName: string;
  timestamp: string;
  createdAt?: string;
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

// System & Analytics Types
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

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  notificationType: 'schedule_change' | 'approval_required' | 'flag_alert' | 'general' | 'discrepancy_approved' | 'session_shifted';
  isRead: boolean;
  createdAt: string;
  relatedModel?: string;
  relatedModelId?: string;
  relatedId?: string;
}

export interface AnalyticsSummary {
  totalVenues: number;
  activeCourses: number;
  pendingDiscrepancies: number;
  unreportedFlags: number;
}

export interface HoldRateAnalytics {
  summary: {
    totalReports: number;
    totalSessions?: number;
    heldCount: number;
    notHeldCount: number;
    unreportedCount?: number;
    holdRatePercentage: number;
  };
  breakdown: Array<{
    key?: string;
    label?: string;
    courseId?: string;
    courseCode?: string;
    courseTitle?: string;
    heldCount: number;
    notHeldCount?: number;
    unreportedCount?: number;
    totalCount?: number;
    totalReports?: number;
    totalSessions?: number;
    holdRatePercentage?: number;
  }>;
}

export interface VenueUtilizationAnalytics {
  summary: {
    totalBookedHours: number;
    totalVenues: number;
  };
  breakdown: Array<{
    venueId: string;
    venueName: string;
    totalBookedHours: number;
    utilizationPercentage?: number;
    totalSessions?: number;
  }>;
}

export interface DiscrepancyAnalytics {
  summary: {
    totalDiscrepancies: number;
    byStatus: {
      pending: number;
      approved: number;
      rejected: number;
      withdrawn?: number;
    };
    byRequestType?: Record<string, number>;
  };
  byType?: Record<string, number>;
}

// Timetable Generation Types
export type GenerationStatus = 'pending' | 'running' | 'completed' | 'failed';
export type GenerationResultStatus = 'optimal' | 'feasible' | 'best_available' | 'failed';

export interface GeneratedAssignment {
  occurrence_id: string;
  course_id: number | string;
  course_code: string;
  course_title: string;
  occurrence_index: number;
  course_type: string;
  day: string;
  day_name: string;
  period_index: number;
  start_time: string;
  end_time: string;
  venue_id: number | string;
  venue_name: string;
  expected_students: number;
  department_id?: number | string;
  department_name?: string;
  level?: number;
  programs?: Array<{ id: number | string; code: string; name: string; level?: number }>;
  program_ids?: Array<number | string>;
  program_names?: string[];
  lecturers?: string[];
  lecturer_ids?: Array<number | string>;
}

export interface ConflictItem {
  slot?: {
    day?: string;
    start_time?: string;
    end_time?: string;
    [key: string]: unknown;
  };
  day?: string;
  description?: string;
  deficit?: number | string;
  overflow?: number | string;
  course_code?: string;
  student_group?: string;
  [key: string]: unknown;
}

export interface GenerationConflictReport {
  status?: string;
  is_feasible?: boolean;
  occurrences_scheduled?: number;
  hard_conflicts_total?: number;
  summary?: {
    student_conflicts?: number;
    lecturer_conflicts?: number;
    venue_conflicts?: number;
    daily_limit_violations?: number;
    occurrence_day_violations?: number;
    capacity_penalty?: number;
    fitness_score?: number;
    quality_percentage?: number;
    raw_fitness?: number;
    [key: string]: unknown;
  };
  details?: {
    student_conflicts?: ConflictItem[];
    lecturer_conflicts?: ConflictItem[];
    venue_conflicts?: ConflictItem[];
    daily_limit_violations?: ConflictItem[];
    occurrence_day_violations?: ConflictItem[];
    capacity_overflows?: ConflictItem[];
    capacity_violations?: ConflictItem[];
    [key: string]: unknown;
  };
  student_conflicts?: ConflictItem[];
  lecturer_conflicts?: ConflictItem[];
  venue_conflicts?: ConflictItem[];
  daily_limit_violations?: ConflictItem[];
  occurrence_day_violations?: ConflictItem[];
  capacity_violations?: ConflictItem[];
  capacity_overflows?: ConflictItem[];
  [key: string]: unknown;
}

export interface GenerationMetrics {
  generations_run?: number;
  best_fitness?: number;
  elapsed_seconds?: number;
  runtime_seconds?: number;
  occurrences_total?: number;
  population_size?: number;
  termination_reason?: string;
  [key: string]: unknown;
}

export interface TimetableGenerationRun {
  id: string;
  semesterId: string;
  semesterName?: string;
  scopeType: 'school' | 'faculty' | 'department';
  scopeId: string;
  scopeName?: string;
  status: GenerationStatus;
  resultStatus: GenerationResultStatus;
  hardConflictsCount: number;
  studentConflictsCount: number;
  lecturerConflictsCount: number;
  venueConflictsCount: number;
  dailyLimitViolationsCount: number;
  occurrenceDayViolationsCount: number;
  capacityPenalty: number;
  fitnessScore: number;
  conflictReport: GenerationConflictReport;
  generationMetrics: GenerationMetrics;
  assignmentsPayload?: GeneratedAssignment[];
  isPublished: boolean;
  initiatedByName?: string;
  createdAt: string;
  completedAt?: string;
}

export interface GenerationScopePermission {
  id: string;
  schoolId: string;
  schoolName?: string;
  allowFacultyGeneration: boolean;
  allowDepartmentGeneration: boolean;
  updatedAt?: string;
}

export interface GenerateTimetablePayload {
  semester?: string | number;
  semester_id?: string | number;
  scope_type: 'school' | 'faculty' | 'department';
  scope_id: string | number;
  population_size?: number;
  max_generations?: number;
  mutation_rate?: number;
  stagnation_limit?: number;
  publish_immediately?: boolean;
}

export interface PublishRunResult {
  status: string;
  entries_created: number;
  sessions_materialized: number;
  entries_deleted: number;
}
