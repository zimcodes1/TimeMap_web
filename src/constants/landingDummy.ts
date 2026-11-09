export interface LandingSession {
  id: string;
  course: { code: string; title: string };
  venue: { name: string };
  lecturers: { name: string }[];
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'shifted' | 'cancelled' | 'held' | 'not_held' | 'postponed';
  isExam?: boolean;
  reportWindowOpen?: boolean;
}

export const landingSessions: LandingSession[] = [
  {
    id: 's1',
    course: { code: 'CSC 301', title: 'Database Systems & Architecture' },
    venue: { name: 'SLT-A' },
    lecturers: [{ name: 'Dr. Amina Bello' }],
    date: '2026-11-09',
    startTime: '09:00',
    endTime: '11:00',
    status: 'scheduled',
    reportWindowOpen: false,
  },
  {
    id: 's2',
    course: { code: 'MTH 201', title: 'Linear Algebra & Numerical Methods' },
    venue: { name: 'LT-3B' },
    lecturers: [{ name: 'Prof. Yusuf Adamu' }],
    date: '2026-11-09',
    startTime: '11:00',
    endTime: '13:00',
    status: 'shifted',
    reportWindowOpen: true,
  },
  {
    id: 's3',
    course: { code: 'EEE 402', title: 'Power Systems Engineering' },
    venue: { name: 'ENG Lab 1' },
    lecturers: [{ name: 'Dr. Claude Shannon' }],
    date: '2026-11-09',
    startTime: '14:00',
    endTime: '16:00',
    status: 'scheduled',
    reportWindowOpen: false,
  },
  {
    id: 's4',
    course: { code: 'CSC 401', title: 'Software Engineering Principles' },
    venue: { name: 'SLT-B' },
    lecturers: [{ name: 'Dr. Ngozi Okonkwo' }],
    date: '2026-11-09',
    startTime: '16:00',
    endTime: '18:00',
    status: 'cancelled',
    reportWindowOpen: false,
  },
];

export const landingAnalytics = {
  holdRatePercentage: 83.3,
  heldCount: 10,
  totalSessions: 12,
};

export const landingActiveDates = [
  '2026-11-09',
  '2026-11-10',
  '2026-11-12',
  '2026-11-13',
  '2026-11-14',
];

export const adminStatCards = [
  {
    label: 'Active Venues',
    value: '47 Venues',
    badge: 'Operational',
    badgeVariant: 'success' as const,
    icon: 'Building2',
    accent: 'primary',
  },
  {
    label: 'Active Courses',
    value: '318 Courses',
    badge: 'Semester Scope',
    badgeVariant: 'outline' as const,
    icon: 'BookOpen',
    accent: 'info',
  },
  {
    label: 'Discrepancy Queue',
    value: '12 Pending',
    badge: 'Requires Action',
    badgeVariant: 'warning' as const,
    icon: 'Clock',
    accent: 'warning',
  },
  {
    label: 'Unreported Sessions',
    value: '7 Unresolved',
    badge: 'Flagged',
    badgeVariant: 'danger' as const,
    icon: 'AlertTriangle',
    accent: 'danger',
  },
];
