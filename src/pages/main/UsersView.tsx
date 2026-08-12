import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TabSwitcher } from "@/components/ui/tabs";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import {
  Plus,
  Users as UsersIcon,
  ShieldAlert,
  KeyRound,
  Edit2,
  ShieldOff,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import type { User, UserRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface UsersViewProps {
  admins: User[];
  adminsLoading?: boolean;
  lecturers: User[];
  lecturersLoading?: boolean;
  students: User[];
  studentsLoading?: boolean;
  isRefetching?: boolean;
  onManualRefresh: () => void;
  onOpenCreateUser: () => void;
  onEditUser: (user: User) => void;
  onOpenResetPassword: (user: User) => void;
  onToggleStatusTrigger: (user: User) => void;
}

export default function UsersView({
  admins,
  adminsLoading = false,
  lecturers,
  lecturersLoading = false,
  students,
  studentsLoading = false,
  isRefetching = false,
  onManualRefresh,
  onOpenCreateUser,
  onEditUser,
  onOpenResetPassword,
  onToggleStatusTrigger,
}: UsersViewProps) {
  const [activeTab, setActiveTab] = useState<UserRole>("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const getDataset = () => {
    if (activeTab === "admin") return admins;
    if (activeTab === "lecturer") return lecturers;
    return students;
  };

  const isCurrentTabLoading =
    activeTab === "admin"
      ? adminsLoading
      : activeTab === "lecturer"
      ? lecturersLoading
      : studentsLoading;

  const rawDataset = getDataset();

  const { user: currentUser } = useAuth();

  const filteredUsers = rawDataset.filter((u) => {
    const isCurrentUser =
      (currentUser?.identifier && u.identifier?.toUpperCase() === currentUser.identifier.toUpperCase()) ||
      (currentUser?.email && u.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      u.id === currentUser?.id;

    if (isCurrentUser) return false;

    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.identifier || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScope = !scopeFilter || u.adminLevel === scopeFilter;
    const matchesStatus = !statusFilter || (statusFilter === "active" ? u.isActive : !u.isActive);

    return matchesSearch && matchesScope && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            User & Staff Directory
          </Text>
          <Text variant="body-sm" color="muted">
            Manage admin officers, lecturers, and student class rep accounts and role privileges.
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

      {/* Tabs */}
      <TabSwitcher
        tabs={[
          { id: "admin", label: "Admin Officers", icon: ShieldAlert, count: admins.length },
          { id: "lecturer", label: "Lecturers", icon: UsersIcon, count: lecturers.length },
          { id: "student", label: "Students & Reps", icon: UsersIcon, count: students.length },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab as UserRole);
          setCurrentPage(1);
        }}
      />

      {/* Table Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Search ${activeTab}s by name, email, or ID...`}
        totalCount={rawDataset.length}
        filteredCount={filteredUsers.length}
        filters={[
          ...(activeTab === "admin"
            ? [
                {
                  id: "adminLevel",
                  label: "Scope Level",
                  value: scopeFilter,
                  onChange: setScopeFilter,
                  options: [
                    { label: "University", value: "university" },
                    { label: "School", value: "school" },
                    { label: "Faculty", value: "faculty" },
                    { label: "Department", value: "department" },
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
        ]}
        onResetFilters={() => {
          setSearchQuery("");
          setScopeFilter("");
          setStatusFilter("");
        }}
      />

      {/* Loading Skeleton State */}
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
      ) : filteredUsers.length === 0 ? (
        /* Empty State Placeholder */
        <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center text-text-subtle">
            <UsersIcon size={24} />
          </div>
          <Text variant="h6" weight="bold" className="text-text-main">
            No {activeTab} accounts found
          </Text>
          <Text variant="body-sm" color="muted" className="max-w-md">
            There are no registered accounts in this category matching your search criteria.
          </Text>
          <Button variant="primary" size="sm" onClick={onOpenCreateUser} className="mt-2 cursor-pointer">
            <Plus size={16} className="mr-1" /> Add New Account
          </Button>
        </div>
      ) : (
        /* User DataTable */
        <DataTable
          columns={[
            {
              header: "Identifier / Full Name",
              accessor: (u: User) => (
                <div>
                  <div className="font-bold text-primary">{u.name}</div>
                  <div className="text-xs text-text-muted flex items-center gap-1.5">
                    ID: {u.identifier}
                    {u.requiresPasswordReset && (
                      <Badge variant="warning" className="text-[9px] px-1 py-0">
                        Reset Req.
                      </Badge>
                    )}
                  </div>
                </div>
              ),
            },
            {
              header: "Email Address",
              accessor: (u: User) => (
                <span className="text-xs font-medium">{u.email || "—"}</span>
              ),
            },
            {
              header:
                activeTab === "admin"
                  ? "Scope Level"
                  : activeTab === "lecturer"
                  ? "Department"
                  : "Dept / Level",
              accessor: (u: User) => (
                <div className="text-xs">
                  {activeTab === "admin" ? (
                    <Badge variant="default" className="capitalize">
                      {u.adminLevel || "department"} Level
                    </Badge>
                  ) : activeTab === "lecturer" ? (
                    <span className="font-semibold">{u.departmentName || "Department Scope"}</span>
                  ) : (
                    <div>
                      <span className="font-semibold">{u.departmentName || "Dept"}</span> •{" "}
                      <span className="font-bold">{u.level || 100}L</span>
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: "Status",
              accessor: (u: User) => (
                <div className="flex items-center gap-1">
                  <Badge variant={u.isActive ? "success" : "danger"}>
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {u.isClassRep && <Badge variant="primary">CLASS REP</Badge>}
                </div>
              ),
            },
            {
              header: "Actions",
              align: "right",
              accessor: (u: User) => (
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditUser(u)}
                    title={`Edit profile details for ${u.name}`}
                    className="h-8 px-2 text-xs cursor-pointer"
                  >
                    <Edit2 size={13} className="mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenResetPassword(u)}
                    disabled={u.requiresPasswordReset}
                    title={
                      u.requiresPasswordReset
                        ? "Password reset flag already issued for this user account"
                        : `Reset password to default (12345678) for ${u.name}`
                    }
                    className="h-8 px-2 text-xs cursor-pointer"
                  >
                    <KeyRound size={13} className="mr-1" /> Reset Pwd
                  </Button>
                  <Button
                    variant={u.isActive ? "outline" : "primary"}
                    size="sm"
                    onClick={() => onToggleStatusTrigger(u)}
                    title={
                      u.isActive
                        ? `Deactivate account access for ${u.name}`
                        : `Activate account access for ${u.name}`
                    }
                    className="h-8 px-2 text-xs cursor-pointer"
                  >
                    {u.isActive ? (
                      <>
                        <ShieldOff size={13} className="mr-1 text-danger" /> Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle size={13} className="mr-1 text-white" /> Activate
                      </>
                    )}
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredUsers}
          keyExtractor={(u) => u.id}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
