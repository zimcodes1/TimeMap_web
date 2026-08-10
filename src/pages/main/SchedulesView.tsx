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
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Layers,
  UserCheck,
  LayoutGrid,
  List,
  RefreshCw,
  Edit,
  Inbox,
} from "lucide-react";
import type { TimetableEntry, LectureSession, ExamSitting } from "@/types";

interface SchedulesViewProps {
  entries: TimetableEntry[] | undefined;
  entriesLoading?: boolean;
  sessions: LectureSession[] | undefined;
  sessionsLoading?: boolean;
  examSittings: ExamSitting[] | undefined;
  examSittingsLoading?: boolean;
  isRefetching?: boolean;
  onManualRefresh: () => void;
  onOpenScheduleEntry: () => void;
  onOpenExamSitting: () => void;
  onShiftSessionTrigger: (session: LectureSession) => void;
  onMaterializeTrigger: (entry: TimetableEntry) => void;
}

export default function SchedulesView({
  entries,
  entriesLoading = false,
  sessions,
  sessionsLoading = false,
  examSittings,
  examSittingsLoading = false,
  isRefetching = false,
  onManualRefresh,
  onOpenScheduleEntry,
  onOpenExamSitting,
  onShiftSessionTrigger,
  onMaterializeTrigger,
}: SchedulesViewProps) {
  const [activeTab, setActiveTab] = useState<"entries" | "sessions" | "exams">("entries");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [entryTypeFilter, setEntryTypeFilter] = useState("");
  const [venueFilter, setVenueFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter entries
  const filteredEntries = entries?.filter((e) => {
    const matchesSearch =
      e.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venueName && e.venueName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.lecturerName && e.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = !entryTypeFilter || e.type === entryTypeFilter;
    const matchesVenue = !venueFilter || e.venueName === venueFilter;

    return matchesSearch && matchesType && matchesVenue;
  });

  const isCurrentTabLoading =
    activeTab === "entries"
      ? entriesLoading
      : activeTab === "sessions"
        ? sessionsLoading
        : examSittingsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Timetables & Scheduling
          </Text>
          <Text variant="body-sm" color="muted">
            Manage recurring lectures, dated sessions, and exam sittings with Conflict Detection Engine integration.
          </Text>
        </div>
        <div className="flex flex-col items-end gap-2 justify-center">
          {/* View mode toggle & Manual Refresh button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onManualRefresh}
              disabled={isRefetching}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw size={13} className={isRefetching ? "animate-spin text-primary" : ""} />
              <span>{isRefetching ? "Refreshing..." : "Refresh"}</span>
            </Button>

            <div className="flex items-center bg-surface-raised border border-border p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${viewMode === "list"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-muted hover:text-text-main"
                  }`}
              >
                <List size={14} /> List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${viewMode === "grid"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-muted hover:text-text-main"
                  }`}
              >
                <LayoutGrid size={14} /> Grid Preview
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onOpenExamSitting}>
              <UserCheck size={16} className="mr-1" /> Create Exam Sitting
            </Button>
            <Button variant="primary" size="sm" onClick={onOpenScheduleEntry}>
              <Plus size={16} className="mr-1" /> Schedule Entry
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabSwitcher
        tabs={[
          { id: "entries", label: "All Schedule Patterns", icon: CalendarIcon, count: entries?.length },
          { id: "sessions", label: "Dated Sessions", icon: Layers, count: sessions?.length },
          { id: "exams", label: "Exam Sittings", icon: Clock, count: examSittings?.length },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab as typeof activeTab);
          setCurrentPage(1);
        }}
      />

      {/* Table Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by course, venue, lecturer..."
        totalCount={
          activeTab === "entries"
            ? entries?.length
            : activeTab === "sessions"
              ? sessions?.length
              : examSittings?.length
        }
        filteredCount={
          activeTab === "entries"
            ? filteredEntries?.length
            : activeTab === "sessions"
              ? sessions?.length
              : examSittings?.length
        }
        filters={[
          {
            id: "type",
            label: "Entry Type",
            value: entryTypeFilter,
            onChange: setEntryTypeFilter,
            options: [
              { label: "Lecture", value: "lecture" },
              { label: "Exam", value: "exam" },
              { label: "Event", value: "event" },
            ],
          },
        ]}
        onResetFilters={() => {
          setSearchQuery("");
          setEntryTypeFilter("");
          setVenueFilter("");
        }}
      />

      {/* Loading Skeleton State */}
      {isCurrentTabLoading ? (
        viewMode === "grid" && activeTab === "entries" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4 space-y-3 border-l-4 border-l-border/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="p-2.5 bg-surface-raised border border-border rounded-xl space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-4/5" />
                  <Skeleton className="h-3.5 w-2/3" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-7 w-24 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3 bg-surface border border-border p-4 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-24" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        )
      ) : viewMode === "grid" && activeTab === "entries" ? (
        /* Grid Mode View */
        !filteredEntries || filteredEntries.length === 0 ? (
          <Card className="p-12 text-center border-dashed flex flex-col items-center justify-center space-y-3 bg-surface border-border">
            <div className="p-3 rounded-full bg-surface-raised border border-border text-text-subtle">
              <Inbox size={32} />
            </div>
            <div className="space-y-1 flex flex-col gap-2">
              <Text variant="h6" weight="bold" className="text-text-main text-center">
                No records found
              </Text>
              <Text variant="body-sm" color="muted">
                There are no schedule entries matching your criteria.
              </Text>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className={`p-4 space-y-3 relative border-l-4 ${(entry.hasConflict) ? "border-red-500/20 border-l-red-500" : "border-l-primary"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-extrabold text-primary text-base">{entry.courseCode}</div>
                    <div className="text-xs text-text-main font-semibold line-clamp-1">{entry.courseTitle}</div>
                  </div>
                  <Badge variant={entry.type === "exam" ? "warning" : "default"} className="capitalize text-[10px]">
                    {entry.type}
                  </Badge>
                </div>

                <div className="p-2.5 bg-surface-raised border border-border rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Day & Slot:</span>
                    <span className="font-bold text-text-main">
                      {entry.dayOfWeek} ({entry.startTime} - {entry.endTime})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Venue:</span>
                    <span className="font-semibold text-text-main">{entry.venueName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Lecturer:</span>
                    <span className="text-text-main">{entry.lecturerName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {entry.hasConflict ? (
                    <span className="text-xs font-bold text-danger flex items-center gap-1">
                      <AlertTriangle size={14} /> Clash Detected
                    </span>
                  ) : (
                    <Badge variant="success">Clear (PROCEED)</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMaterializeTrigger(entry)}
                    className="h-7 text-xs px-2 cursor-pointer"
                  >
                    <RefreshCw size={12} className="mr-1" /> Materialize
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* List Mode View */
        <div>
          {activeTab === "entries" && (
            <DataTable
              columns={[
                {
                  header: "Course / Title",
                  accessor: (entry: TimetableEntry) => (
                    <div>
                      <div className="font-bold text-primary">{entry.courseCode}</div>
                      <div className="text-xs text-text-main font-medium">{entry.courseTitle}</div>
                    </div>
                  ),
                },
                {
                  header: "Type",
                  accessor: (entry: TimetableEntry) => (
                    <Badge variant={entry.type === "exam" ? "warning" : "default"} className="capitalize">
                      {entry.type}
                    </Badge>
                  ),
                },
                {
                  header: "Day & Time Slot",
                  accessor: (entry: TimetableEntry) => (
                    <div className="text-xs">
                      <div className="font-bold text-text-main">{entry.dayOfWeek || "Mon-Fri"}</div>
                      <div className="text-text-muted">
                        {entry.startTime} - {entry.endTime}
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Venue",
                  accessor: (entry: TimetableEntry) => (
                    <span className="font-bold text-xs text-text-main">{entry.venueName}</span>
                  ),
                },
                {
                  header: "Lecturer",
                  accessor: (entry: TimetableEntry) => (
                    <span className="text-xs text-text-muted">{entry.lecturerName}</span>
                  ),
                },
                {
                  header: "Conflict Status",
                  accessor: (entry: TimetableEntry) =>
                    entry.hasConflict ? (
                      <div className="flex items-center gap-1 text-danger text-xs font-bold">
                        <AlertTriangle size={14} /> Clash Detected
                      </div>
                    ) : (
                      <Badge variant="success">Clear (PROCEED)</Badge>
                    ),
                },
                {
                  header: "Actions",
                  align: "right",
                  accessor: (entry: TimetableEntry) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMaterializeTrigger(entry)}
                      className="h-8 px-2 text-xs cursor-pointer"
                    >
                      <RefreshCw size={12} className="mr-1" /> Materialize
                    </Button>
                  ),
                },
              ]}
              data={filteredEntries}
              keyExtractor={(e) => e.id}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}

          {activeTab === "sessions" && (
            <DataTable
              columns={[
                {
                  header: "Course Code & Title",
                  accessor: (sess: LectureSession) => (
                    <div>
                      <div className="font-bold text-primary">{sess.courseCode}</div>
                      <div className="text-xs text-text-main font-medium">{sess.courseTitle}</div>
                    </div>
                  ),
                },
                {
                  header: "Date & Time Slot",
                  accessor: (sess: LectureSession) => (
                    <div className="text-xs">
                      <div className="font-bold text-text-main">{sess.date}</div>
                      <div className="text-text-muted">
                        {sess.startTime} - {sess.endTime}
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Venue",
                  accessor: (sess: LectureSession) => (
                    <span className="font-bold text-xs text-text-main">{sess.venueName}</span>
                  ),
                },
                {
                  header: "Status",
                  accessor: (sess: LectureSession) => (
                    <Badge variant={sess.status === "scheduled" ? "success" : "warning"}>
                      {sess.status.toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  header: "Actions",
                  align: "right",
                  accessor: (sess: LectureSession) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShiftSessionTrigger(sess)}
                      className="h-8 px-2.5 text-xs cursor-pointer"
                    >
                      <Edit size={12} className="mr-1" /> Shift Instance
                    </Button>
                  ),
                },
              ]}
              data={sessions}
              keyExtractor={(s) => s.id}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}

          {activeTab === "exams" && (
            <DataTable
              columns={[
                {
                  header: "Course & Exam Title",
                  accessor: (exam: ExamSitting) => (
                    <div>
                      <div className="font-bold text-amber-600">{exam.courseCode}</div>
                      <div className="text-xs text-text-main font-medium">{exam.courseTitle}</div>
                    </div>
                  ),
                },
                {
                  header: "Exam Venue",
                  accessor: (exam: ExamSitting) => (
                    <span className="font-bold text-xs text-text-main">{exam.venueName}</span>
                  ),
                },
                {
                  header: "Date & Time",
                  accessor: (exam: ExamSitting) => (
                    <div className="text-xs">
                      <div className="font-bold text-text-main">{exam.date}</div>
                      <div className="text-text-muted">
                        {exam.startTime} - {exam.endTime}
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Candidates",
                  accessor: (exam: ExamSitting) => (
                    <Badge variant="primary" className="text-xs">
                      {exam.registeredCandidatesCount} Candidates
                    </Badge>
                  ),
                },
                {
                  header: "Invigilators",
                  accessor: (exam: ExamSitting) => (
                    <span className="text-xs text-text-muted">
                      {exam.invigilators.map((i) => i.name).join(", ")}
                    </span>
                  ),
                },
              ]}
              data={examSittings}
              keyExtractor={(e) => e.id}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
