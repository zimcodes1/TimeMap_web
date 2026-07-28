import { useState } from 'react';
import {
  Calendar,
  Building2,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  UserCheck,
  ShieldCheck,
  Zap,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from '@/components/ui/toast';
import { FormField } from '@/components/ui/form';

import {
  mockCurrentUser,
  mockVenues,
  mockTimetableEntries,
  mockDiscrepancies,
  mockReports,
} from '@/constants/mockData';
import type { DiscrepancyRequest } from '@/types';

// Zod schema for demo form
const demoFormSchema = z.object({
  courseCode: z.string().min(3, 'Course code must be at least 3 characters'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  venue: z.string().min(1, 'Please select a venue'),
  day: z.string().min(1, 'Please select a day'),
});

type DemoFormValues = z.infer<typeof demoFormSchema>;

// Lightweight inline Zod resolver for react-hook-form
const zodResolver = (schema: z.ZodSchema<any>) => async (values: any) => {
  const result = schema.safeParse(values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }
  const errors: Record<string, any> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = { type: 'validation', message: issue.message };
  });
  return { values: {}, errors };
};

export function DemoPage() {
  const [activeTab, setActiveTab] = useState<'components' | 'venues' | 'timetable' | 'discrepancies' | 'reports'>('components');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discrepancyList, setDiscrepancyList] = useState<DiscrepancyRequest[]>(mockDiscrepancies);
  const [venueSearch, setVenueSearch] = useState('');

  // Form setup
  const methods = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      courseCode: '',
      title: '',
      venue: 'ven_1',
      day: 'Monday',
    },
  });

  const onFormSubmit = (data: DemoFormValues) => {
    toast.success('Form Submitted Successfully!', {
      description: `Entry for ${data.courseCode} (${data.title}) scheduled.`,
    });
    methods.reset();
  };

  const handleApproveDiscrepancy = (id: string, courseCode: string) => {
    setDiscrepancyList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'approved' } : d))
    );
    toast.success(`Discrepancy Approved`, {
      description: `Request for ${courseCode} has been approved and schedule updated.`,
    });
  };

  const handleRejectDiscrepancy = (id: string, courseCode: string) => {
    setDiscrepancyList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'rejected' } : d))
    );
    toast.error(`Discrepancy Rejected`, {
      description: `Request for ${courseCode} has been declined.`,
    });
  };

  const filteredVenues = mockVenues.filter(
    (v) =>
      v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
      v.code.toLowerCase().includes(venueSearch.toLowerCase()) ||
      v.building.toLowerCase().includes(venueSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* ─── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-4 z-40 flex items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">TimeMapper</h1>
              <Badge variant="primary" size="sm">v0.1 Scaffold</Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Timetable & Venue Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Toast Controls */}
          <div className="hidden md:flex items-center gap-1.5 border-r border-gray-200 dark:border-gray-800 pr-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.success('Action Completed!', { description: 'Resource saved cleanly.' })}
            >
              Success Toast
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.warning('Conflict Warning', { description: 'Venue double booking detected.' })}
            >
              Warning Toast
            </Button>
          </div>

          <ThemeToggle />

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
            <img
              src={mockCurrentUser.avatarUrl}
              alt={mockCurrentUser.name}
              className="h-8 w-8 rounded-full ring-2 ring-emerald-500/30"
            />
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{mockCurrentUser.name}</p>
              <p className="text-gray-500 dark:text-gray-400 capitalize">{mockCurrentUser.adminLevel} Admin</p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero Metric Cards ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Registered Venues
            </span>
            <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{mockVenues.length}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">1,125 Capacity Total</span>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent border-blue-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Active Entries
            </span>
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{mockTimetableEntries.length}</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">1 Conflict Flagged</span>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Discrepancies
            </span>
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {discrepancyList.filter((d) => d.status === 'pending').length}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pending Approval</span>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              Class Rep Logs
            </span>
            <FileCheck2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{mockReports.length}</span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">1 Disputed Session</span>
          </div>
        </Card>
      </section>

      {/* ─── Tab Switcher Navigation ───────────────────────────────────────── */}
      <nav className="flex items-center gap-2 p-1.5 bg-gray-200/60 dark:bg-gray-800/60 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('components')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'components'
              ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>UI Component Gallery</span>
        </button>

        <button
          onClick={() => setActiveTab('venues')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'venues'
              ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Venues Registry</span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'timetable'
              ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Timetable & Conflicts</span>
        </button>

        <button
          onClick={() => setActiveTab('discrepancies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'discrepancies'
              ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Discrepancy Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'reports'
              ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Class Rep Reports</span>
        </button>
      </nav>

      {/* ─── TAB 1: COMPONENTS SHOWCASE ────────────────────────────────────── */}
      {activeTab === 'components' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Section: Multivariant Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Multivariant Button Component</CardTitle>
              <CardDescription>
                Created with <code className="text-emerald-600 dark:text-emerald-400">cva</code>, supporting
                variants (primary, secondary, outline, ghost, danger, warning, muted), sizes, loading states, and icon slots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Emerald</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="muted">Muted Badge</Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium Default</Button>
                <Button variant="primary" size="lg">Large Button</Button>
                <Button variant="primary" size="md" isLoading>Saving...</Button>
                <Button variant="outline" size="md" leftIcon={<Plus className="h-4 w-4" />}>Add Course</Button>
                <Button variant="primary" size="md" rightIcon={<Zap className="h-4 w-4" />}>Instant Action</Button>
              </div>
            </CardContent>
          </Card>

          {/* Section: Badges & Chips */}
          <Card>
            <CardHeader>
              <CardTitle>Status Badges & Chips</CardTitle>
              <CardDescription>Contextual status indicators for schedule clashes, permissions, and report states.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Badge variant="primary" icon={<ShieldCheck className="h-3.5 w-3.5" />}>Department Admin</Badge>
              <Badge variant="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>Verified Schedule</Badge>
              <Badge variant="warning" icon={<AlertTriangle className="h-3.5 w-3.5" />}>Venue Clash Flag</Badge>
              <Badge variant="danger" icon={<X className="h-3.5 w-3.5" />}>Hard Rejected</Badge>
              <Badge variant="info" icon={<Clock className="h-3.5 w-3.5" />}>Pending Review</Badge>
              <Badge variant="outline">Unassigned</Badge>
            </CardContent>
          </Card>

          {/* Section: Form Component with Zod Validation */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components & Zod Validation</CardTitle>
              <CardDescription>
                Form inputs & select dropdowns integrated with <code className="text-emerald-600 dark:text-emerald-400">react-hook-form</code> and <code className="text-emerald-600 dark:text-emerald-400">zod</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onFormSubmit)} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField name="courseCode">
                      {({ value, onChange, onBlur, error }) => (
                        <Input
                          label="Course Code"
                          placeholder="e.g. CSC 301"
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          error={error}
                          leftIcon={<Layers className="h-4 w-4" />}
                        />
                      )}
                    </FormField>

                    <FormField name="title">
                      {({ value, onChange, onBlur, error }) => (
                        <Input
                          label="Course Title"
                          placeholder="e.g. Operating Systems"
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          error={error}
                        />
                      )}
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField name="venue">
                      {({ value, onChange, error }) => (
                        <Select
                          label="Assigned Venue"
                          value={value}
                          onChange={onChange}
                          error={error}
                          options={mockVenues.map((v) => ({
                            value: v.id,
                            label: `${v.code} - ${v.name} (${v.capacity} seats)`,
                          }))}
                        />
                      )}
                    </FormField>

                    <FormField name="day">
                      {({ value, onChange, error }) => (
                        <Select
                          label="Day of Week"
                          value={value}
                          onChange={onChange}
                          error={error}
                          options={[
                            { value: 'Monday', label: 'Monday' },
                            { value: 'Tuesday', label: 'Tuesday' },
                            { value: 'Wednesday', label: 'Wednesday' },
                            { value: 'Thursday', label: 'Thursday' },
                            { value: 'Friday', label: 'Friday' },
                          ]}
                        />
                      )}
                    </FormField>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" variant="primary">Create Schedule Entry</Button>
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(true)}>
                      Open Interactive Modal
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB 2: VENUES REGISTRY PREVIEW ───────────────────────────────── */}
      {activeTab === 'venues' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Input
              placeholder="Search venues by code, name, or building..."
              value={venueSearch}
              onChange={(e) => setVenueSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="max-w-md"
            />
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              Add Venue
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVenues.map((venue) => (
              <Card key={venue.id} className="hover:border-emerald-500/50 transition-all shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {venue.code}
                        </span>
                        <Badge variant={venue.isAvailable ? 'success' : 'danger'} size="sm">
                          {venue.isAvailable ? 'Available' : 'Maintenance'}
                        </Badge>
                      </div>
                      <CardTitle className="mt-1">{venue.name}</CardTitle>
                      <CardDescription>{venue.building}</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {venue.owningLevel} Level
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Seating Capacity: <strong>{venue.capacity} students</strong></span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {venue.facilities.map((fac) => (
                      <Badge key={fac.id} variant="primary" size="sm">
                        {fac.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>
                    Manage Venue
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: TIMETABLE & CONFLICT DETECTOR PREVIEW ──────────────────── */}
      {activeTab === 'timetable' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Timetable Entries & Conflict Detection Engine</CardTitle>
                  <CardDescription>
                    Interval-based conflict detection prevents double-booking across venues and lecturers.
                  </CardDescription>
                </div>
                <Badge variant="warning" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
                  1 Active Clash Flagged
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Day & Time</TableHead>
                    <TableHead>Lecturer</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Conflict Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTimetableEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-semibold">
                        <div>{entry.courseCode}</div>
                        <div className="text-xs font-normal text-gray-500 dark:text-gray-400">{entry.courseTitle}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{entry.dayOfWeek}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{entry.startTime} - {entry.endTime}</div>
                      </TableCell>
                      <TableCell>{entry.lecturerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.venueName}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{entry.type}</TableCell>
                      <TableCell>
                        {entry.hasConflict ? (
                          <Badge variant="danger" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
                            {entry.conflictReason}
                          </Badge>
                        ) : (
                          <Badge variant="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                            No Overlap
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB 4: DISCREPANCY APPROVAL QUEUE PREVIEW ─────────────────────── */}
      {activeTab === 'discrepancies' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Discrepancy Approval Queue</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Hierarchical override routing for schedule shifts, postponements, and cancellations.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {discrepancyList.map((disc) => (
              <Card key={disc.id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100">{disc.courseCode}</span>
                      <Badge
                        variant={
                          disc.type === 'shift'
                            ? 'warning'
                            : disc.type === 'postponement'
                            ? 'info'
                            : 'danger'
                        }
                        size="sm"
                        className="uppercase"
                      >
                        {disc.type}
                      </Badge>
                      <Badge
                        variant={
                          disc.status === 'approved'
                            ? 'success'
                            : disc.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                        className="capitalize"
                      >
                        {disc.status}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{disc.reason}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Requested by: <strong>{disc.requestedBy} ({disc.requestedByRole})</strong></span>
                      {disc.requestedVenueName && <span>New Venue: <strong>{disc.requestedVenueName}</strong></span>}
                      {disc.requestedTimeSlot && <span>Time Slot: <strong>{disc.requestedTimeSlot}</strong></span>}
                    </div>
                  </div>

                  {disc.status === 'pending' ? (
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Check className="h-4 w-4" />}
                        onClick={() => handleApproveDiscrepancy(disc.id, disc.courseCode)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<X className="h-4 w-4" />}
                        onClick={() => handleRejectDiscrepancy(disc.id, disc.courseCode)}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 font-mono self-end md:self-center">
                      Processed by {mockCurrentUser.adminLevel} Admin
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: CLASS REP REPORTS PREVIEW ─────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Class Rep Lecture Hold Reports</CardTitle>
              <CardDescription>
                Mobile-first rep reporting logs with automatic 24-hour verification windows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Hold Status</TableHead>
                    <TableHead>Class Rep</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Lecturer Dispute / Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReports.map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell className="font-semibold">{rep.courseCode}</TableCell>
                      <TableCell>
                        <Badge variant={rep.held ? 'success' : 'danger'}>
                          {rep.held ? 'Lecture Held' : 'Session Cancelled/Missed'}
                        </Badge>
                      </TableCell>
                      <TableCell>{rep.reporterName}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {new Date(rep.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {rep.lecturerResponse ? (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            {rep.lecturerResponse}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No dispute filed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── DEMO MODAL ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Manage Venue Configuration"
        description="Update capacity, facility tags, or availability status for this venue."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                toast.success('Venue Updated!', { description: 'Changes saved to database.' });
              }}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <Input label="Venue Name" defaultValue="Science Lecture Theatre A" />
          <Input label="Capacity" type="number" defaultValue="350" />
          <Select
            label="Owning Level"
            defaultValue="faculty"
            options={[
              { value: 'department', label: 'Department Level' },
              { value: 'faculty', label: 'Faculty Level' },
              { value: 'school', label: 'School / Central Level' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
