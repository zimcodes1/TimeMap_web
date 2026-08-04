import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Share2, BookOpen, UserCheck, ShieldCheck } from 'lucide-react';
import type { Course, CourseAccessGrant } from '@/types';

interface CoursesViewProps {
  courses: Course[];
  grants: CourseAccessGrant[];
  onOpenCreateCourse: () => void;
  onOpenOfferGrant: () => void;
  onOpenRequestGrant: () => void;
  onOpenRegisterStudent: () => void;
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
  onApproveGrant,
  onRejectGrant,
}: CoursesViewProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'grants'>('catalog');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Courses & Course Sharing
          </Text>
          <Text variant="body-sm" color="muted">
            Manage academic course catalog and cross-department course access grants.
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenRegisterStudent}>
            <UserCheck size={16} className="mr-1" /> Student Registration
          </Button>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'catalog'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <BookOpen size={16} /> Course Catalog ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('grants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'grants'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <Share2 size={16} /> Access Grants Queue ({grants.length})
        </button>
      </div>

      {/* Content Tables */}
      <Card className="p-0 overflow-x-auto bg-transparent border-none shadow-none rounded-none">
        {activeTab === 'catalog' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Course Code & Title</th>
                <th className="py-3 px-2">Level / Units</th>
                <th className="py-3 px-2">Department</th>
                <th className="py-3 px-2">Owning Scope</th>
                <th className="py-3 px-2">Assigned Staff</th>
                <th className="py-3 px-2">Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <div className="font-bold text-primary">{course.code}</div>
                    <div className="text-xs text-text-main">{course.title}</div>
                  </td>
                  <td className="py-3 px-2 text-xs">
                    <div>Level: <span className="font-bold">{course.level || 300}L</span></div>
                    <div>Units: <span className="font-bold">{course.creditUnits || 3}</span></div>
                  </td>
                  <td className="py-3 px-2 text-xs font-medium text-text-muted">
                    {course.departmentName || 'Computer Science'}
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant="default" className="capitalize">
                      {course.owningLevel || 'department'}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-xs">
                    {course.lecturers && course.lecturers.length > 0 ? (
                      <span className="font-semibold">{course.lecturers.map((l) => l.name).join(', ')}</span>
                    ) : (
                      <span className="text-text-muted italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-xs font-bold text-text-main">
                    {course.registrationCount || 0} Enrolled
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {activeTab === 'grants' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Course</th>
                <th className="py-3 px-2">Target Department / Level</th>
                <th className="py-3 px-2">Direction</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Requested By</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {grants.map((grant) => (
                <tr key={grant.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <div className="font-bold text-primary">{grant.courseCode}</div>
                    <div className="text-xs text-text-muted">{grant.courseTitle}</div>
                  </td>
                  <td className="py-3 px-2 text-xs">
                    <div className="font-bold text-text-main">
                      {grant.grantedToDepartmentName || grant.grantedToLevel}
                    </div>
                    <div className="text-text-muted capitalize">Level: {grant.grantedToLevel}</div>
                  </td>
                  <td className="py-3 px-2 text-xs">
                    <Badge variant={grant.direction === 'offered' ? 'default' : 'warning'}>
                      {grant.direction.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <Badge
                      variant={
                        grant.status === 'approved'
                          ? 'success'
                          : grant.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {grant.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-xs text-text-muted">{grant.requestedBy}</td>
                  <td className="py-3 px-2 text-right">
                    {grant.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onRejectGrant(grant.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onApproveGrant(grant.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted italic">Resolved</span>
                    )}
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
