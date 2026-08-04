import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabSwitcher } from '@/components/ui/tabs';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Share2, BookOpen, UserCheck, ShieldCheck, Edit2, CheckCircle, XCircle } from 'lucide-react';
import type { Course, CourseAccessGrant } from '@/types';

interface CoursesViewProps {
  courses: Course[];
  grants: CourseAccessGrant[];
  onOpenCreateCourse: () => void;
  onOpenOfferGrant: () => void;
  onOpenRequestGrant: () => void;
  onOpenRegisterStudent: () => void;
  onEditCourse: (course: Course) => void;
  onApproveGrant: (id: string) => void;
  onRejectGrant: (id: string) => void;
}

export default function CoursesView({
  courses,
  grants,
  onOpenCreateCourse,
  onOpenOfferGrant,
  onOpenRequestGrant,
  onOpenRegisterStudent,
  onEditCourse,
  onApproveGrant,
  onRejectGrant,
}: CoursesViewProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'grants' | 'registrations'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter catalog
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.departmentName && c.departmentName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = !levelFilter || c.level === Number(levelFilter);

    return matchesSearch && matchesLevel;
  });

  // Filter grants
  const filteredGrants = grants.filter((g) => {
    const matchesSearch =
      g.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || g.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Courses & Access Sharing
          </Text>
          <Text variant="body-sm" color="muted">
            Manage academic course catalog, student registrations, and cross-department access grants.
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenOfferGrant}>
            <Share2 size={16} className="mr-1" /> Offer Grant
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenRequestGrant}>
            <ShieldCheck size={16} className="mr-1" /> Request Access
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenCreateCourse}>
            <Plus size={16} className="mr-1" /> Create Course
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <TabSwitcher
        tabs={[
          { id: 'catalog', label: 'Course Catalog', icon: BookOpen, count: courses.length },
          { id: 'grants', label: 'Access Grants Queue', icon: Share2, count: grants.length },
          { id: 'registrations', label: 'Student Registrations', icon: UserCheck },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab as typeof activeTab);
          setCurrentPage(1);
        }}
      />

      {/* Catalog View */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search course code, title, or department..."
            totalCount={courses.length}
            filteredCount={filteredCourses.length}
            filters={[
              {
                id: 'level',
                label: 'Level',
                value: levelFilter,
                onChange: setLevelFilter,
                options: [
                  { label: '100 Level', value: '100' },
                  { label: '200 Level', value: '200' },
                  { label: '300 Level', value: '300' },
                  { label: '400 Level', value: '400' },
                  { label: '500 Level', value: '500' },
                ],
              },
            ]}
            onResetFilters={() => {
              setSearchQuery('');
              setLevelFilter('');
            }}
          />

          <DataTable
            columns={[
              {
                header: 'Course Code & Title',
                accessor: (c: Course) => (
                  <div>
                    <div className="font-bold text-primary">{c.code}</div>
                    <div className="text-xs text-text-main font-medium">{c.title}</div>
                  </div>
                ),
              },
              {
                header: 'Level / Units',
                accessor: (c: Course) => (
                  <div className="text-xs">
                    <span className="font-bold">{c.level}L</span> • {c.creditUnits} Units
                  </div>
                ),
              },
              {
                header: 'Department',
                accessor: (c: Course) => (
                  <span className="text-xs font-semibold">{c.departmentName || 'CSC'}</span>
                ),
              },
              {
                header: 'Owning Scope',
                accessor: (c: Course) => <Badge className="capitalize">{c.owningLevel}</Badge>,
              },
              {
                header: 'Assigned Staff',
                accessor: (c: Course) => (
                  <Badge variant="default" className="text-xs">
                    {c.lecturers?.length || 0} Lecturers
                  </Badge>
                ),
              },
              {
                header: 'Students Registered',
                accessor: (c: Course) => (
                  <span className="font-bold text-primary text-xs">
                    {c.registrationCount || 0} Students
                  </span>
                ),
              },
              {
                header: 'Actions',
                align: 'right',
                accessor: (c: Course) => (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCourse(c)}
                    className="h-8 px-2"
                  >
                    <Edit2 size={14} className="mr-1" /> Edit Course
                  </Button>
                ),
              },
            ]}
            data={filteredCourses}
            keyExtractor={(c) => c.id}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Access Grants Queue */}
      {activeTab === 'grants' && (
        <div className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search grants by course or requester..."
            totalCount={grants.length}
            filteredCount={filteredGrants.length}
            filters={[
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'Pending Approval', value: 'pending' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Rejected', value: 'rejected' },
                ],
              },
            ]}
            onResetFilters={() => {
              setSearchQuery('');
              setStatusFilter('');
            }}
          />

          <DataTable
            columns={[
              {
                header: 'Grant ID & Course',
                accessor: (g: CourseAccessGrant) => (
                  <div>
                    <div className="font-bold text-primary">#{g.id}</div>
                    <div className="text-xs font-semibold text-text-main">
                      {g.courseCode} — {g.courseTitle}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Grant Direction',
                accessor: (g: CourseAccessGrant) => (
                  <Badge variant={g.direction === 'offered' ? 'primary' : 'default'} className="capitalize">
                    {g.direction}
                  </Badge>
                ),
              },
              {
                header: 'Target Scope / Dept',
                accessor: (g: CourseAccessGrant) => (
                  <div className="text-xs">
                    <span className="font-semibold capitalize">{g.grantedToLevel} Level</span>
                    {g.grantedToDepartmentName && (
                      <div className="text-text-muted">{g.grantedToDepartmentName}</div>
                    )}
                  </div>
                ),
              },
              {
                header: 'Requested By',
                accessor: (g: CourseAccessGrant) => (
                  <span className="text-xs font-medium text-text-main">{g.requestedBy}</span>
                ),
              },
              {
                header: 'Status',
                accessor: (g: CourseAccessGrant) => (
                  <Badge
                    variant={
                      g.status === 'approved'
                        ? 'success'
                        : g.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {g.status.toUpperCase()}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                align: 'right',
                accessor: (g: CourseAccessGrant) => (
                  <div className="flex items-center justify-end gap-1">
                    {g.status === 'pending' ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onApproveGrant(g.id)}
                          className="h-8 px-2 text-xs"
                        >
                          <CheckCircle size={14} className="mr-1" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRejectGrant(g.id)}
                          className="h-8 px-2 text-xs text-danger hover:bg-danger-surface border-danger-surface"
                        >
                          <XCircle size={14} className="mr-1" /> Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-text-muted italic">Processed</span>
                    )}
                  </div>
                ),
              },
            ]}
            data={filteredGrants}
            keyExtractor={(g) => g.id}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Student Registrations Overview */}
      {activeTab === 'registrations' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="h6" weight="bold">
                Student Course Enrollment Registry
              </Text>
              <Text variant="caption" color="muted">
                Summary of student registrations per course for current academic session.
              </Text>
            </div>
            <Button variant="primary" size="sm" onClick={onOpenRegisterStudent}>
              <UserCheck size={16} className="mr-1" /> Bulk Register Students
            </Button>
          </div>

          <DataTable
            columns={[
              {
                header: 'Course Code & Title',
                accessor: (c: Course) => (
                  <span className="font-bold text-primary">
                    {c.code} — {c.title}
                  </span>
                ),
              },
              {
                header: 'Level',
                accessor: (c: Course) => <span className="font-semibold text-xs">{c.level}L</span>,
              },
              {
                header: 'Total Enrolled',
                accessor: (c: Course) => (
                  <Badge variant="success" className="text-xs">
                    {c.registrationCount || 0} Registered Students
                  </Badge>
                ),
              },
            ]}
            data={courses}
            keyExtractor={(c) => c.id}
          />
        </Card>
      )}
    </div>
  );
}
