import { useState, useMemo } from "react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabSwitcher } from "@/components/ui/tabs";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { Select } from "@/components/ui/select";
import {
  Plus,
  Users as UsersIcon,
  ShieldAlert,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";
import type { User, UserRole, Department } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import {
  filterDepartmentsByScope,
  getAdminLevelRank,
  getVisibleTabs,
} from "@/lib/scopeUtils";
import { buildUsersColumns } from "@/components/users/UsersTableColumns";
import { UsersBulkBar } from "@/components/users/UsersBulkBar";

interface UsersViewProps {
  admins: User[];
  adminsLoading?: boolean;
  lecturers: User[];
  lecturersLoading?: boolean;
  students: User[];
  studentsLoading?: boolean;
  departments?: Department[];
  isRefetching?: boolean;
  onManualRefresh: () => void;
  onOpenCreateUser: () => void;
  onEditUser: (user: User) => void;
  onOpenResetPassword: (user: User) => void;
  onToggleStatusTrigger: (user: User) => void;
  onBulkToggleStatus?: (users: User[], targetStatus: boolean) => Promise<void> | void;
  onBulkResetPassword?: (users: User[]) => Promise<void> | void;
}

export default function UsersView({
  admins,
  adminsLoading = false,
  lecturers,
  lecturersLoading = false,
  students,
  studentsLoading = false,
  departments = [],
  isRefetching = false,
  onManualRefresh,
  onOpenCreateUser,
  onEditUser,
  onOpenResetPassword,
  onToggleStatusTrigger,
  onBulkToggleStatus,
  onBulkResetPassword,
}: UsersViewProps) {
  const { user: currentUser } = useAuth();

  // ─── Scope Checks ──────────────────────────────────────────────────────────
  const adminLevel = currentUser?.adminLevel;
  const isDeptAdmin = currentUser?.role === "admin" && adminLevel === "department";
  const isFacultyAdmin = currentUser?.role === "admin" && adminLevel === "faculty";

  // The logged-in admin's rank for action restriction in table rows
  const loggedInRank = getAdminLevelRank(currentUser?.role, currentUser?.adminLevel);

  // Departments the current user is allowed to see (scoped)
  // Note: faculties are not passed here since Users.tsx only passes departments
  // scopeUtils handles dept-only filtering by adminScopeId matching
  const scopedDepts = useMemo(
    () => filterDepartmentsByScope(departments, currentUser),
    [departments, currentUser]
  );



  // ─── Visible Tabs ──────────────────────────────────────────────────────────
  const visibleTabIds = useMemo(() => getVisibleTabs(currentUser), [currentUser]);
  const defaultTab: UserRole = visibleTabIds[0] || "admin";
  const [activeTab, setActiveTab] = useState<UserRole>(defaultTab);

  // If currentUser changes or activeTab is not in visibleTabIds, reset to defaultTab
  const currentTab = visibleTabIds.includes(activeTab) ? activeTab : defaultTab;

  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [classRepFilter, setClassRepFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "level" | "department" | "isClassRep" | "identifier">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;


  const resetAllFilters = () => {
    setSearchQuery("");
    setScopeFilter("");
    setDepartmentFilter("");
    setLevelFilter("");
    setClassRepFilter("");
    setStatusFilter("");
    setSortBy("name");
    setSortOrder("asc");
    setSelectedUserIds([]);
    setCurrentPage(1);
  };

  // ─── Dataset Selection ─────────────────────────────────────────────────────
  const rawDataset: User[] = (() => {
    if (currentTab === "admin") return admins;
    if (currentTab === "lecturer") return lecturers;
    return students;
  })();

  const isCurrentTabLoading =
    currentTab === "admin"
      ? adminsLoading
      : currentTab === "lecturer"
        ? lecturersLoading
        : studentsLoading;

  // ─── Filter Logic ──────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return rawDataset.filter((u) => {
      // Always hide the current logged-in user from the list
      const isCurrentUser =
        (currentUser?.id && u.id === currentUser.id) ||
        (currentUser?.identifier &&
          u.identifier?.toUpperCase() === currentUser.identifier.toUpperCase());
      if (isCurrentUser) return false;

      // Search match
      const matchesSearch =
        (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.identifier || "").toLowerCase().includes(searchQuery.toLowerCase());

      // Admin scope level filter (admin tab only)
      const matchesScope = !scopeFilter || u.adminLevel === scopeFilter;

      // Department filter — compare by string ID
      let matchesDepartment = true;
      if (departmentFilter) {
        const userDeptId = u.departmentId || (u.role === "admin" && u.adminLevel === "department" ? u.adminScopeId : undefined);
        matchesDepartment = Boolean(userDeptId && String(userDeptId) === String(departmentFilter));
      }

      // Student academic level filter
      const matchesLevel = !levelFilter || String(u.level) === levelFilter;

      // Class rep filter
      let matchesClassRep = true;
      if (classRepFilter === "reps") matchesClassRep = Boolean(u.isClassRep);
      if (classRepFilter === "regular") matchesClassRep = !u.isClassRep;

      // Account status filter
      const matchesStatus =
        !statusFilter || (statusFilter === "active" ? u.isActive : !u.isActive);

      return (
        matchesSearch &&
        matchesScope &&
        matchesDepartment &&
        matchesLevel &&
        matchesClassRep &&
        matchesStatus
      );
    });
  }, [
    rawDataset,
    currentUser,
    searchQuery,
    scopeFilter,
    departmentFilter,
    levelFilter,
    classRepFilter,
    statusFilter,
  ]);

  // ─── Sort Logic ────────────────────────────────────────────────────────────
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      if (sortBy === "level") {
        valA = a.level || 0;
        valB = b.level || 0;
      } else if (sortBy === "department") {
        valA = a.departmentName || a.departmentId || "";
        valB = b.departmentName || b.departmentId || "";
      } else if (sortBy === "isClassRep") {
        valA = a.isClassRep ? 1 : 0;
        valB = b.isClassRep ? 1 : 0;
      } else if (sortBy === "identifier") {
        valA = a.identifier || "";
        valB = b.identifier || "";
      } else {
        valA = a.name || "";
        valB = b.name || "";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortBy, sortOrder]);

  // ─── Pagination ────────────────────────────────────────────────────────────
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + pageSize);

  // ─── Selection ─────────────────────────────────────────────────────────────
  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPaginated = () => {
    const pageIds = paginatedUsers.map((u) => u.id);
    const allSelected = pageIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const selectedUsersList = sortedUsers.filter((u) => selectedUserIds.includes(u.id));

  // ─── Bulk Actions ──────────────────────────────────────────────────────────
  const handleBulkDisable = () => {
    if (onBulkToggleStatus && selectedUsersList.length > 0) {
      onBulkToggleStatus(selectedUsersList, false);
      setSelectedUserIds([]);
    }
  };
  const handleBulkEnable = () => {
    if (onBulkToggleStatus && selectedUsersList.length > 0) {
      onBulkToggleStatus(selectedUsersList, true);
      setSelectedUserIds([]);
    }
  };
  const handleBulkReset = () => {
    if (onBulkResetPassword && selectedUsersList.length > 0) {
      onBulkResetPassword(selectedUsersList);
      setSelectedUserIds([]);
    }
  };

  // ─── Toolbar Filters ───────────────────────────────────────────────────────
  const adminScopeOptions = useMemo(() => {
    if (isFacultyAdmin) {
      return [{ label: "Department", value: "department" }];
    }
    if (adminLevel === "school") {
      return [{ label: "Faculty", value: "faculty" }];
    }
    if (adminLevel === "university") {
      return [{ label: "School", value: "school" }];
    }
    // Superuser sees all
    return [
      { label: "University", value: "university" },
      { label: "School", value: "school" },
      { label: "Faculty", value: "faculty" },
      { label: "Department", value: "department" },
    ];
  }, [isFacultyAdmin, adminLevel]);

  // Department toolbar filter: only show when there's more than 1 dept in scope
  const showDeptFilter = scopedDepts.length > 1;

  const toolbarFilters = useMemo(() => [
    ...(currentTab === "admin" && adminScopeOptions.length > 1
      ? [
        {
          id: "adminLevel",
          label: "Scope Level",
          value: scopeFilter,
          onChange: setScopeFilter,
          options: adminScopeOptions,
        },
      ]
      : []),
    ...(showDeptFilter
      ? [
        {
          id: "department",
          label: "Department",
          value: departmentFilter,
          onChange: setDepartmentFilter,
          options: scopedDepts.map((d) => ({
            label: `${d.name} (${d.code})`,
            value: String(d.id),
          })),
        },
      ]
      : []),
    ...(currentTab === "student"
      ? [
        {
          id: "level",
          label: "Academic Level",
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
        {
          id: "classRep",
          label: "Class Rep Status",
          value: classRepFilter,
          onChange: setClassRepFilter,
          options: [
            { label: "Class Reps Only", value: "reps" },
            { label: "Regular Students", value: "regular" },
          ],
        },
      ]
      : []),
    {
      id: "status",
      label: "Account Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ], [
    currentTab,
    scopeFilter,
    adminScopeOptions,
    showDeptFilter,
    departmentFilter,
    scopedDepts,
    levelFilter,
    classRepFilter,
    statusFilter,
  ]);

  // ─── Table Columns ─────────────────────────────────────────────────────────
  const columns = buildUsersColumns({
    activeTab: currentTab,
    loggedInRank,
    selectedUserIds,
    paginatedUsers,
    onToggleSelectUser: toggleSelectUser,
    onToggleSelectAll: toggleSelectAllPaginated,
    onEditUser,
    onOpenResetPassword,
    onToggleStatusTrigger,
  });

  // Construct tab objects according to visibleTabIds
  const allTabsList = [
    { id: "admin", label: "Admin Officers", icon: ShieldAlert, count: admins.length },
    { id: "lecturer", label: "Lecturers", icon: UsersIcon, count: lecturers.length },
    { id: "student", label: "Class Representatives", icon: UsersIcon, count: students.length },
  ];
  const activeTabsList = allTabsList.filter((tab) => visibleTabIds.includes(tab.id as UserRole));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Staff &amp; Class Rep Directory
          </Text>
          <Text variant="body-sm" color="muted">
            {isDeptAdmin
              ? "Manage lecturers and class representatives in your assigned department. Student population totals are managed on the Students page."
              : isFacultyAdmin || adminLevel === "school" || adminLevel === "university"
              ? "Manage administrative officer accounts for lower scope tiers."
              : "Manage admin officers, lecturers, and student accounts and role privileges."}
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

          <Button variant="primary" size="sm" onClick={onOpenCreateUser} className="cursor-pointer">
            <Plus size={16} className="mr-1" /> Create User Account
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <TabSwitcher
        tabs={activeTabsList}
        activeTab={currentTab}
        onChange={(tab) => {
          setActiveTab(tab as UserRole);
          setCurrentPage(1);
          resetAllFilters();
        }}
      />

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        searchPlaceholder={`Search ${currentTab}s by name, email, or ID...`}
        totalCount={rawDataset.length}
        filteredCount={sortedUsers.length}
        filters={toolbarFilters}
        onResetFilters={resetAllFilters}
      >
        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-text-muted font-semibold shrink-0">Sort By:</span>
          <Select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as "name" | "level" | "department" | "isClassRep" | "identifier"
              )
            }
            className="h-8 py-1 px-2 text-xs bg-surface-raised border-border"
            options={[
              { value: "name", label: "Full Name" },
              { value: "identifier", label: "Matric / Staff ID" },
              { value: "department", label: "Department" },
              ...(currentTab === "student"
                ? [
                  { value: "level", label: "Academic Level" },
                  { value: "isClassRep", label: "Class Rep Status" },
                ]
                : []),
            ]}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="h-8 px-2 text-xs cursor-pointer border-border"
            title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            <ArrowUpDown size={13} className={sortOrder === "desc" ? "rotate-180 transition-transform" : ""} />
            <span className="ml-1 uppercase text-[10px] font-bold">{sortOrder}</span>
          </Button>
        </div>
      </TableToolbar>


      {/* Bulk Action Bar */}
      <UsersBulkBar
        selectedCount={selectedUserIds.length}
        onBulkDisable={handleBulkDisable}
        onBulkEnable={handleBulkEnable}
        onBulkReset={handleBulkReset}
        onClearSelection={() => setSelectedUserIds([])}
        hasBulkToggle={Boolean(onBulkToggleStatus)}
        hasBulkReset={Boolean(onBulkResetPassword)}
      />

      {/* Table or skeleton or empty state */}
      {isCurrentTabLoading ? (
        <div className="space-y-3 bg-surface border border-border p-4 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-36 rounded-lg" />
            </div>
          ))}
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
          <div className="p-3 rounded-full bg-secondary text-text-subtle">
            <UsersIcon size={32} />
          </div>
          <Text variant="h4" weight="semibold" className="text-text-main">
            No {activeTab} accounts found
          </Text>
          <Text variant="body-sm" color="muted" className="max-w-md">
            {searchQuery || scopeFilter || departmentFilter || levelFilter || classRepFilter || statusFilter
              ? "No users match your active search or filter criteria. Try clearing filters."
              : `No ${activeTab} accounts have been created yet.`}
          </Text>
          {(searchQuery || scopeFilter || departmentFilter || levelFilter || classRepFilter || statusFilter) && (
            <Button variant="outline" size="sm" onClick={resetAllFilters} className="mt-2 cursor-pointer">
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={sortedUsers}
          keyExtractor={(user) => user.id}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
