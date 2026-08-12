import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TabSwitcher } from "@/components/ui/tabs";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import {
  Plus,
  Share2,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Edit2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type { Course, CourseAccessGrant } from "@/types";

interface CoursesViewProps {
  courses: Course[];
  grants: CourseAccessGrant[];
  isLoading?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
  onOpenCreateCourse: () => void;
  onOpenOfferGrant: () => void;
  onOpenRequestGrant: () => void;
  onOpenRegisterStudent: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse?: (id: string) => void;
  onApproveGrant: (id: string) => void;
  onRejectGrant: (id: string) => void;
}

export default function CoursesView({
  courses,
  grants,
  isLoading = false,
  isRefetching = false,
  onRefresh,
  onOpenCreateCourse,
  onOpenOfferGrant,
  onOpenRequestGrant,
  onOpenRegisterStudent,
  onEditCourse,
  onDeleteCourse,
  onApproveGrant,
  onRejectGrant,
}: CoursesViewProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "grants" | "registrations">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
          <div className="flex items-center gap-2">
            <Text variant="h3" weight="bold" className="text-text-main">
              Courses & Access Sharing
            </Text>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefetching}
                title="Refresh Course & Grant Registry"
                className="h-8 w-8 p-0 rounded-full cursor-pointer text-text-muted hover:text-primary"
              >
                <RefreshCw size={15} className={isRefetching ? "animate-spin text-primary" : ""} />
              </Button>
            )}
          </div>
          <Text variant="body-sm" color="muted">
            Manage academic course catalog, student registrations, and cross-department access grants.
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenOfferGrant} className="cursor-pointer">
            <Share2 size={16} className="mr-1" /> Offer Grant
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenRequestGrant} className="cursor-pointer">
            <ShieldCheck size={16} className="mr-1" /> Request Access
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenCreateCourse} className="cursor-pointer">
            <Plus size={16} className="mr-1" /> Create Course
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <TabSwitcher
        tabs={[
          { id: "catalog", label: "Course Catalog", icon: BookOpen, count: courses.length },
          { id: "grants", label: "Access Grants Queue", icon: Share2, count: grants.length },
          { id: "registrations", label: "Student Registrations", icon: UserCheck },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab as typeof activeTab);
          setCurrentPage(1);
        }}
      />

      {/* Catalog View */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search course code, title, or department..."
            totalCount={courses.length}
            filteredCount={filteredCourses.length}
            filters={[
              {
                id: "level",
                label: "Level",
                value: levelFilter,
                onChange: setLevelFilter,
                options: [
                  { label: "100 Level", value: "100" },
                  { label: "200 Level", value: "200" },
                  { label: "300 Level", value: "300" },
                  { label: "400 Level", value: "400" },
                  { label: "500 Level", value: "500" },
                ],
              },
            ]}
            onResetFilters={() => {
              setSearchQuery("");
              setLevelFilter("");
            }}
          />

          {isLoading ? (
            <Card className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                </div>
              ))}
            </Card>
          ) : filteredCourses.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <BookOpen size={36} className="mx-auto text-text-muted opacity-40" />
              <Text variant="h6" weight="bold" className="text-center">
                No Courses Found
              </Text>
              <Text variant="body-sm" color="muted" className="text-center">
                {searchQuery || levelFilter
                  ? "No courses match your active filter criteria."
                  : "No academic courses have been created yet."}
              </Text>
              <Button variant="primary" size="sm" onClick={onOpenCreateCourse} className="mt-2 cursor-pointer">
                <Plus size={14} className="mr-1" /> Add First Course
              </Button>
            </Card>
          ) : (
            <DataTable
              columns={[
                {
                  header: "Course Code & Title",
                  accessor: (c: Course) => (
                    <div>
                      <div className="font-bold text-primary">{c.code}</div>
                      <div className="text-xs text-text-main font-medium">{c.title}</div>
                    </div>
                  ),
                },
                {
                  header: "Level / Units",
                  accessor: (c: Course) => (
                    <div className="text-xs">
                      <span className="font-bold">{c.level}L</span> • {c.creditUnits} Units
                    </div>
                  ),
                },
                {
                  header: "Department",
                  accessor: (c: Course) => (
                    <span className="text-xs font-semibold">{c.departmentName || "General / Central"}</span>
                  ),
                },
                {
                  header: "Owning Scope",
                  accessor: (c: Course) => <Badge className="capitalize">{c.owningLevel}</Badge>,
                },
                {
                  header: "Assigned Staff",
                  accessor: (c: Course) => (
                    <Badge variant="default" className="text-xs">
                      {c.lecturers?.length || 0} Lecturers
                    </Badge>
                  ),
                },
                {
                  header: "Students Registered",
                  accessor: (c: Course) => (
                    <span className="font-bold text-primary text-xs">
                      {c.registrationCount || 0} Students
                    </span>
                  ),
                },
                {
                  header: "Actions",
                  align: "right",
                  accessor: (c: Course) => (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditCourse(c)}
                        title={`Edit course details for ${c.code}`}
                        className="h-8 px-2 text-xs cursor-pointer"
                      >
                        <Edit2 size={13} className="mr-1" /> Edit
                      </Button>
                      {onDeleteCourse && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteCourse(c.id)}
                          title={`Delete course ${c.code}`}
                          className="h-8 px-2 text-xs cursor-pointer text-danger hover:bg-danger-surface border-danger-surface"
                        >
                          <Trash2 size={13} />
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
              data={filteredCourses}
              keyExtractor={(c) => c.id}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Access Grants Queue */}
      {activeTab === "grants" && (
        <div className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search grants by course or requester..."
            totalCount={grants.length}
            filteredCount={filteredGrants.length}
            filters={[
              {
                id: "status",
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: "Pending Approval", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                ],
              },
            ]}
            onResetFilters={() => {
              setSearchQuery("");
              setStatusFilter("");
            }}
          />

          {isLoading ? (
            <Card className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                </div>
              ))}
            </Card>
          ) : filteredGrants.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <Share2 size={36} className="mx-auto text-text-muted opacity-40" />
              <Text variant="h6" weight="bold">
                No Access Grants Found
              </Text>
              <Text variant="body-sm" color="muted">
                {searchQuery || statusFilter
                  ? "No course access grants match your active filters."
                  : "No cross-department course access sharing grants requested yet."}
              </Text>
              <Button variant="outline" size="sm" onClick={onOpenOfferGrant} className="mt-2 cursor-pointer">
                <Share2 size={14} className="mr-1" /> Offer First Access Grant
              </Button>
            </Card>
          ) : (
            <DataTable
              columns={[
                {
                  header: "Grant ID & Course",
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
                  header: "Grant Direction",
                  accessor: (g: CourseAccessGrant) => (
                    <Badge variant={g.direction === "offered" ? "primary" : "default"} className="capitalize">
                      {g.direction}
                    </Badge>
                  ),
                },
                {
                  header: "Target Scope / Dept",
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
                  header: "Requested By",
                  accessor: (g: CourseAccessGrant) => (
                    <span className="text-xs font-medium text-text-main">{g.requestedBy}</span>
                  ),
                },
                {
                  header: "Status",
                  accessor: (g: CourseAccessGrant) => (
                    <Badge
                      variant={
                        g.status === "approved"
                          ? "success"
                          : g.status === "rejected"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {g.status.toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  header: "Actions",
                  align: "right",
                  accessor: (g: CourseAccessGrant) => (
                    <div className="flex items-center justify-end gap-1">
                      {g.status === "pending" ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onApproveGrant(g.id)}
                            title={`Approve course sharing grant #${g.id}`}
                            className="h-8 px-2 text-xs cursor-pointer"
                          >
                            <CheckCircle size={14} className="mr-1" /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRejectGrant(g.id)}
                            title={`Reject course sharing grant #${g.id}`}
                            className="h-8 px-2 text-xs cursor-pointer text-danger hover:bg-danger-surface border-danger-surface"
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
          )}
        </div>
      )}

      {/* Student Registrations Overview */}
      {activeTab === "registrations" && (
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
            <Button variant="primary" size="sm" onClick={onOpenRegisterStudent} className="cursor-pointer">
              <UserCheck size={16} className="mr-1" /> Bulk Register Students
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center p-6 text-text-muted text-xs">
              No courses registered for student enrollments yet.
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  header: "Course Code & Title",
                  accessor: (c: Course) => (
                    <span className="font-bold text-primary">
                      {c.code} — {c.title}
                    </span>
                  ),
                },
                {
                  header: "Level",
                  accessor: (c: Course) => <span className="font-semibold text-xs">{c.level}L</span>,
                },
                {
                  header: "Total Enrolled",
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
          )}
        </Card>
      )}
    </div>
  );
}
