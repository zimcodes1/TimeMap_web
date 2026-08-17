import type { User, UserRole } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, KeyRound, ShieldOff, CheckCircle } from "lucide-react";
import { getAdminLevelRank } from "@/lib/scopeUtils";

interface ActionGuardProps {
  user: User;
  loggedInRank: number;
  onEditUser: (user: User) => void;
  onOpenResetPassword: (user: User) => void;
  onToggleStatusTrigger: (user: User) => void;
}

function ActionGuard({
  user,
  loggedInRank,
  onEditUser,
  onOpenResetPassword,
  onToggleStatusTrigger,
}: ActionGuardProps) {
  const targetRank = getAdminLevelRank(user.role, user.adminLevel);
  const isRestricted = user.role === "admin" && targetRank >= loggedInRank;

  if (isRestricted) {
    return (
      <div className="flex items-center justify-end">
        <span className="text-xs text-text-muted italic px-2 py-1 bg-surface-raised rounded-md border border-border">
          Restricted Scope
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEditUser(user)}
        className="h-8 px-2 text-xs cursor-pointer"
        title="Edit User Details"
      >
        <Edit2 size={13} className="mr-1" /> Edit
      </Button>

      {!user.requiresPasswordReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenResetPassword(user)}
          className="h-8 px-2 text-xs cursor-pointer text-warning border-warning/30 hover:bg-warning/10"
          title="Force Password Reset"
        >
          <KeyRound size={13} className="mr-1" /> Reset Pass
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleStatusTrigger(user)}
        className={`h-8 px-2 text-xs cursor-pointer ${
          user.isActive
            ? "text-danger border-danger/30 hover:bg-danger/10"
            : "text-success border-success/30 hover:bg-success/10"
        }`}
        title={user.isActive ? "Disable Account" : "Enable Account"}
      >
        {user.isActive ? (
          <>
            <ShieldOff size={13} className="mr-1" /> Disable
          </>
        ) : (
          <>
            <CheckCircle size={13} className="mr-1" /> Enable
          </>
        )}
      </Button>
    </div>
  );
}

interface BuildColumnsProps {
  activeTab: UserRole;
  loggedInRank: number;
  selectedUserIds: string[];
  paginatedUsers: User[];
  onToggleSelectUser: (id: string) => void;
  onToggleSelectAll: () => void;
  onEditUser: (user: User) => void;
  onOpenResetPassword: (user: User) => void;
  onToggleStatusTrigger: (user: User) => void;
}

export function buildUsersColumns({
  activeTab,
  loggedInRank,
  selectedUserIds,
  paginatedUsers,
  onToggleSelectUser,
  onToggleSelectAll,
  onEditUser,
  onOpenResetPassword,
  onToggleStatusTrigger,
}: BuildColumnsProps) {
  const isAllPaginatedSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUserIds.includes(u.id));

  return [
    {
      header: (
        <input
          type="checkbox"
          checked={isAllPaginatedSelected}
          onChange={onToggleSelectAll}
          className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer align-middle"
          title="Select all on current page"
        />
      ),
      className: "w-10 text-center",
      accessor: (user: User) => (
        <input
          type="checkbox"
          checked={selectedUserIds.includes(user.id)}
          onChange={() => onToggleSelectUser(user.id)}
          className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer align-middle"
        />
      ),
    },
    {
      header: "User / Identity",
      accessor: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
            {(user.name || "U")[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-text-main text-sm flex items-center gap-1.5">
              <span>{user.name}</span>
              {user.requiresPasswordReset && (
                <Badge variant="warning" className="text-[10px] py-0 px-1.5 font-normal">
                  Reset
                </Badge>
              )}
            </div>
            <div className="text-xs text-text-muted">{user.email || "No email"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Identifier",
      accessor: (user: User) => (
        <div className="font-mono text-xs text-text-main font-semibold">
          {user.identifier || "N/A"}
        </div>
      ),
    },
    {
      header: "Scope / Department",
      accessor: (user: User) => (
        <div className="text-xs">
          {user.role === "admin" ? (
            <Badge variant="primary" className="capitalize text-[11px]">
              {user.adminLevel || "Department"} Scope
            </Badge>
          ) : (
            <span className="text-text-main font-medium">
              {user.departmentName || user.departmentId || "General Scope"}
            </span>
          )}
        </div>
      ),
    },
    ...(activeTab === "student"
      ? [
          {
            header: "Academic Level",
            accessor: (user: User) => (
              <Badge variant="outline" className="text-xs">
                {user.level ? `${user.level}L` : "Unassigned"}
              </Badge>
            ),
          },
          {
            header: "Role / Rep Status",
            accessor: (user: User) =>
              user.isClassRep ? (
                <Badge variant="success" className="text-xs font-semibold">
                  Class Rep
                </Badge>
              ) : (
                <span className="text-xs text-text-muted">Student</span>
              ),
          },
        ]
      : []),
    {
      header: "Account Status",
      accessor: (user: User) => (
        <Badge variant={user.isActive ? "success" : "danger"} className="text-xs">
          {user.isActive ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (user: User) => (
        <ActionGuard
          user={user}
          loggedInRank={loggedInRank}
          onEditUser={onEditUser}
          onOpenResetPassword={onOpenResetPassword}
          onToggleStatusTrigger={onToggleStatusTrigger}
        />
      ),
    },
  ];
}
