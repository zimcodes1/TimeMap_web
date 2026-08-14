import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TabSwitcher } from "@/components/ui/tabs";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { OrgTree } from "@/components/elements/OrgTree";
import {
  Plus,
  Building2,
  School as SchoolIcon,
  Network,
  GitMerge,
  Edit2,
  Trash2,
  RefreshCw,
  Monitor,
} from "lucide-react";
import type { School, Faculty, Department } from "@/types";

interface HierarchyViewProps {
  schools: School[];
  schoolsLoading?: boolean;
  faculties: Faculty[];
  facultiesLoading?: boolean;
  departments: Department[];
  departmentsLoading?: boolean;
  isRefetching?: boolean;
  onManualRefresh: () => void;
  onOpenCreateSchool: () => void;
  onOpenCreateFaculty: () => void;
  onOpenCreateDepartment: () => void;
  onEditSchool: (school: School) => void;
  onEditFaculty: (faculty: Faculty) => void;
  onEditDepartment: (dept: Department) => void;
  onDeleteTrigger: (id: string, name: string, type: "School" | "Faculty" | "Department") => void;
}

export default function HierarchyView({
  schools,
  schoolsLoading = false,
  faculties,
  facultiesLoading = false,
  departments,
  departmentsLoading = false,
  isRefetching = false,
  onManualRefresh,
  onOpenCreateSchool,
  onOpenCreateFaculty,
  onOpenCreateDepartment,
  onEditSchool,
  onEditFaculty,
  onEditDepartment,
  onDeleteTrigger,
}: HierarchyViewProps) {
  const [activeTab, setActiveTab] = useState<"departments" | "faculties" | "schools" | "tree">("departments");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter lists based on search query
  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.facultyName && d.facultyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFaculties = faculties.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.schoolName && f.schoolName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isCurrentTabLoading =
    activeTab === "departments"
      ? departmentsLoading
      : activeTab === "faculties"
      ? facultiesLoading
      : activeTab === "schools"
      ? schoolsLoading
      : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Text variant="h3" weight="bold" className="text-text-main">
              Hierarchy Management
            </Text>
            <Badge variant="primary" className="text-xs">
              Scope: University Wide
            </Badge>
          </div>
          <Text variant="body-sm" color="muted">
            Institutional structure tree — Schools, Faculties, and Departments.
          </Text>
        </div>
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

          {activeTab === "schools" && (
            <Button variant="primary" size="sm" onClick={onOpenCreateSchool} className="cursor-pointer">
              <Plus size={16} className="mr-1" /> Add School
            </Button>
          )}
          {activeTab === "faculties" && (
            <Button variant="primary" size="sm" onClick={onOpenCreateFaculty} className="cursor-pointer">
              <Plus size={16} className="mr-1" /> Add Faculty
            </Button>
          )}
          {activeTab === "departments" && (
            <Button variant="primary" size="sm" onClick={onOpenCreateDepartment} className="cursor-pointer">
              <Plus size={16} className="mr-1" /> Add Department
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <TabSwitcher
        tabs={[
          { id: "departments", label: "Departments", icon: Building2, count: departments.length },
          { id: "faculties", label: "Faculties", icon: Network, count: faculties.length },
          { id: "schools", label: "Schools", icon: SchoolIcon, count: schools.length },
          { id: "tree", label: "Organizational Tree View", icon: GitMerge },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab as typeof activeTab);
          setCurrentPage(1);
        }}
      />

      {/* Organizational Tree View */}
      {activeTab === "tree" ? (
        <>
          {/* Mobile Fallback Card */}
          <div className="block md:hidden flex flex-col items-center justify-center p-8 text-center bg-surface border border-border rounded-2xl space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Monitor size={28} />
            </div>
            <Text variant="h6" weight="bold" className="text-text-main">
              Use a PC to view
            </Text>
            <Text variant="body-sm" color="muted" className="max-w-xs">
              The interactive organizational tree diagram requires a desktop monitor or larger screen display for full structural visualization.
            </Text>
          </div>

          {/* Desktop Org Tree */}
          <div className="hidden md:block">
            <OrgTree schools={schools} faculties={faculties} departments={departments} />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {/* Table Toolbar */}
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={`Search ${activeTab}...`}
            totalCount={
              activeTab === "departments"
                ? departments.length
                : activeTab === "faculties"
                ? faculties.length
                : schools.length
            }
            filteredCount={
              activeTab === "departments"
                ? filteredDepartments.length
                : activeTab === "faculties"
                ? filteredFaculties.length
                : filteredSchools.length
            }
          />

          {/* Loading Skeleton */}
          {isCurrentTabLoading ? (
            <div className="space-y-3 bg-surface border border-border p-4 rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-24" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/50">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-7 w-28 rounded-lg" />
                </div>
              ))}
            </div>
          ) : activeTab === "departments" ? (
            /* Departments Table */
            filteredDepartments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center text-text-subtle">
                  <Building2 size={24} />
                </div>
                <Text variant="h6" weight="bold" className="text-text-main">
                  No departments found
                </Text>
                <Text variant="body-sm" color="muted">
                  There are no academic departments matching your criteria.
                </Text>
                <Button variant="primary" size="sm" onClick={onOpenCreateDepartment} className="mt-2 cursor-pointer">
                  <Plus size={16} className="mr-1" /> Add Department
                </Button>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    header: "Department Code",
                    accessor: (dept: Department) => (
                      <span className="font-bold text-primary">{dept.code}</span>
                    ),
                  },
                  {
                    header: "Department Name",
                    accessor: (dept: Department) => <span className="font-medium">{dept.name}</span>,
                  },
                  {
                    header: "Parent Faculty",
                    accessor: (dept: Department) => (
                      <span className="text-text-muted">{dept.facultyName || "Main Faculty"}</span>
                    ),
                  },
                  {
                    header: "Actions",
                    align: "right",
                    accessor: (dept: Department) => (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditDepartment(dept)}
                          className="h-8 px-2 text-xs cursor-pointer"
                        >
                          <Edit2 size={13} className="mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteTrigger(dept.id, dept.name, "Department")}
                          className="h-8 px-2 text-xs text-danger hover:bg-danger-surface border-danger-surface cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={filteredDepartments}
                keyExtractor={(d) => d.id}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )
          ) : activeTab === "faculties" ? (
            /* Faculties Table */
            filteredFaculties.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center text-text-subtle">
                  <Network size={24} />
                </div>
                <Text variant="h6" weight="bold" className="text-text-main">
                  No faculties found
                </Text>
                <Text variant="body-sm" color="muted">
                  There are no faculties matching your criteria.
                </Text>
                <Button variant="primary" size="sm" onClick={onOpenCreateFaculty} className="mt-2 cursor-pointer">
                  <Plus size={16} className="mr-1" /> Add Faculty
                </Button>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    header: "Faculty Code",
                    accessor: (fac: Faculty) => (
                      <span className="font-bold text-primary">{fac.code}</span>
                    ),
                  },
                  {
                    header: "Faculty Name",
                    accessor: (fac: Faculty) => <span className="font-medium">{fac.name}</span>,
                  },
                  {
                    header: "Parent School",
                    accessor: (fac: Faculty) => (
                      <span className="text-text-muted">{fac.schoolName || "Main School"}</span>
                    ),
                  },
                  {
                    header: "Actions",
                    align: "right",
                    accessor: (fac: Faculty) => (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditFaculty(fac)}
                          className="h-8 px-2 text-xs cursor-pointer"
                        >
                          <Edit2 size={13} className="mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteTrigger(fac.id, fac.name, "Faculty")}
                          className="h-8 px-2 text-xs text-danger hover:bg-danger-surface border-danger-surface cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={filteredFaculties}
                keyExtractor={(f) => f.id}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )
          ) : (
            /* Schools Table */
            filteredSchools.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center text-text-subtle">
                  <SchoolIcon size={24} />
                </div>
                <Text variant="h6" weight="bold" className="text-text-main">
                  No schools found
                </Text>
                <Text variant="body-sm" color="muted">
                  There are no schools matching your criteria.
                </Text>
                <Button variant="primary" size="sm" onClick={onOpenCreateSchool} className="mt-2 cursor-pointer">
                  <Plus size={16} className="mr-1" /> Add School
                </Button>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    header: "School Code",
                    accessor: (sch: School) => (
                      <span className="font-bold text-primary">{sch.code}</span>
                    ),
                  },
                  {
                    header: "School Name",
                    accessor: (sch: School) => <span className="font-medium">{sch.name}</span>,
                  },
                  {
                    header: "Actions",
                    align: "right",
                    accessor: (sch: School) => (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditSchool(sch)}
                          className="h-8 px-2 text-xs cursor-pointer"
                        >
                          <Edit2 size={13} className="mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteTrigger(sch.id, sch.name, "School")}
                          className="h-8 px-2 text-xs text-danger hover:bg-danger-surface border-danger-surface cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={filteredSchools}
                keyExtractor={(s) => s.id}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
