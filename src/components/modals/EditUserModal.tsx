import { useState, useEffect, useMemo } from "react";
import { Modal } from "../ui/modal";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import type { User, UserRole, AdminLevel, Department, Faculty, School } from "@/types";
import { useAuth } from "@/hooks/useAuth";

import { filterDepartmentsByScope, filterFacultiesByScope, filterSchoolsByScope } from "@/lib/scopeUtils";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updated: Partial<User> & { scopeId?: string }) => void;
  user: User | null;
  departments: Department[];
  faculties?: Faculty[];
  schools?: School[];
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  departments,
  faculties = [],
  schools = [],
}: EditUserModalProps) {
  const { user: currentUser } = useAuth();
  const adminLevel = currentUser?.adminLevel;
  const isDeptAdmin = currentUser?.role === "admin" && adminLevel === "department";
  const isFacultyAdmin = currentUser?.role === "admin" && adminLevel === "faculty";
  const isSchoolAdmin = currentUser?.role === "admin" && adminLevel === "school";

  const scopedDepts = useMemo(
    () => filterDepartmentsByScope(departments, currentUser, faculties),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [departments, faculties, currentUser?.id, currentUser?.adminLevel, currentUser?.adminScopeId]
  );
  const scopedFacs = useMemo(
    () => filterFacultiesByScope(faculties, currentUser, departments),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [faculties, departments, currentUser?.id, currentUser?.adminLevel, currentUser?.adminScopeId]
  );
  const scopedSchs = useMemo(
    () => filterSchoolsByScope(schools, currentUser),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schools, currentUser?.id, currentUser?.adminLevel, currentUser?.adminScopeId]
  );


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [selectedAdminLevel, setAdminLevel] = useState<AdminLevel>("department");
  const [scopeId, setScopeId] = useState("");
  const [level, setLevel] = useState<number>(100);
  const [isClassRep, setIsClassRep] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setIdentifier(user.identifier || "");
      setRole(user.role || "admin");
      setAdminLevel((user.adminLevel as AdminLevel) || "department");

      // Robust Auto-fill scopeId / department select resolution
      let matchedScopeId =
        user.departmentId ||
        (user as { department_id?: string | number }).department_id ||
        user.adminScopeId ||
        "";

      if (matchedScopeId) {
        const foundById = scopedDepts.find((d) => String(d.id) === String(matchedScopeId));
        if (foundById) matchedScopeId = foundById.id;
      }

      if (!matchedScopeId && user.departmentName) {
        const d = scopedDepts.find(
          (dept) =>
            String(dept.id) === String(user.departmentName) ||
            dept.name.toLowerCase() === user.departmentName?.toLowerCase() ||
            dept.code.toLowerCase() === user.departmentName?.toLowerCase()
        );
        if (d) matchedScopeId = d.id;
      }

      if (!matchedScopeId && (user as { department?: string | number }).department) {
        const deptVal = String((user as { department?: string | number }).department);
        const d = scopedDepts.find(
          (dept) =>
            String(dept.id) === deptVal ||
            dept.name.toLowerCase() === deptVal.toLowerCase() ||
            dept.code.toLowerCase() === deptVal.toLowerCase()
        );
        if (d) matchedScopeId = d.id;
      }

      setScopeId(String(matchedScopeId));
      setLevel(user.level || 100);
      setIsClassRep(Boolean(user.isClassRep));
    }
  // Only re-populate when the target user changes, not when the scoped
  // dept list re-renders (which would reset the form mid-edit).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selectedDept = scopedDepts.find((d) => String(d.id) === String(scopeId));
  const deptMaxLevel = selectedDept?.max_level || selectedDept?.maxLevel || 400;

  const handleAdminLevelChange = (newLevel: AdminLevel) => {
    setAdminLevel(newLevel);
    if (newLevel === "school" && scopedSchs.length > 0) {
      setScopeId(String(scopedSchs[0].id));
    } else if (newLevel === "faculty" && scopedFacs.length > 0) {
      setScopeId(String(scopedFacs[0].id));
    } else if (newLevel === "department" && scopedDepts.length > 0) {
      setScopeId(String(scopedDepts[0].id));
    } else {
      setScopeId("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && name && identifier) {
      const targetDept = scopedDepts.find((d) => String(d.id) === String(scopeId));

      onSubmit(user.id, {
        name,
        email,
        identifier,
        role,
        adminLevel: role === "admin" ? selectedAdminLevel : undefined,
        scopeId,
        departmentId: role !== "admin" || selectedAdminLevel === "department" ? scopeId : undefined,
        departmentName: targetDept?.name,
        level: role === "student" ? level : undefined,
        isClassRep: role === "student" ? isClassRep : false,
      });
      onClose();
    }
  };

  if (!user) return null;

  // Level options up to department max_level
  const levelOptions = [];
  for (let l = 100; l <= deptMaxLevel; l += 100) {
    levelOptions.push({ value: l, label: `${l} Level` });
  }

  const roleOptions = [
    ...(!isDeptAdmin ? [{ value: "admin", label: "Admin Officer" }] : []),
    { value: "lecturer", label: "Lecturer" },
    { value: "student", label: "Student / Class Rep" },
  ];

  const adminLevelSelectOptions = [
    { value: "department", label: "Department Admin" },
    ...(!isFacultyAdmin && !isSchoolAdmin ? [{ value: "faculty", label: "Faculty Admin" }] : []),
    ...(!isFacultyAdmin && !isSchoolAdmin ? [{ value: "school", label: "School Admin" }] : []),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit User Account — ${user.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Text variant="body-sm" color="muted">
          Update user profile credentials, assigned scope, and access permissions.
        </Text>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Unique Identifier</label>
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">User Account Role</label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={roleOptions}
            />
          </div>
        </div>

        {/* Admin Specific Section */}
        {role === "admin" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-main">Admin Scope Level</label>
              <Select
                value={selectedAdminLevel}
                onChange={(e) => handleAdminLevelChange(e.target.value as AdminLevel)}
                options={adminLevelSelectOptions}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-main">
                {selectedAdminLevel === "school"
                  ? "Assigned Scope School"
                  : selectedAdminLevel === "faculty"
                    ? "Assigned Scope Faculty"
                    : "Assigned Scope Department"}
              </label>

              {selectedAdminLevel === "school" && (
                <Select
                  value={scopeId}
                  onChange={(e) => setScopeId(e.target.value)}
                  options={scopedSchs.map((s) => ({ value: String(s.id), label: `${s.name} (${s.code})` }))}
                />
              )}

              {selectedAdminLevel === "faculty" && (
                <Select
                  value={scopeId}
                  onChange={(e) => setScopeId(e.target.value)}
                  options={scopedFacs.map((f) => ({ value: String(f.id), label: `${f.name} (${f.code})` }))}
                />
              )}

              {selectedAdminLevel === "department" && (
                <Select
                  value={scopeId}
                  onChange={(e) => setScopeId(e.target.value)}
                  options={scopedDepts.map((d) => ({ value: String(d.id), label: `${d.name} (${d.code})` }))}
                />
              )}
            </div>
          </div>
        )}

        {role !== "admin" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Assigned Department</label>
            <Select
              value={scopeId}
              disabled={isDeptAdmin && scopedDepts.length === 1}
              onChange={(e) => setScopeId(e.target.value)}
              options={[
                ...(!isDeptAdmin ? [{ value: "", label: "-- Select Department --" }] : []),
                ...scopedDepts.map((d) => ({
                  value: String(d.id),
                  label: `${d.name} (${d.code})`,
                })),
              ]}
              helperText={isDeptAdmin ? `Locked to your assigned department scope (${selectedDept?.code || ""})` : undefined}
            />
          </div>
        )}

        {role === "student" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-surface-raised border border-border rounded-xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-main">Academic Level</label>
              <Select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                options={levelOptions}
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isClassRepEdit"
                checked={isClassRep}
                onChange={(e) => setIsClassRep(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border focus:ring-ring cursor-pointer"
              />
              <label
                htmlFor="isClassRepEdit"
                className="text-xs font-semibold text-text-main cursor-pointer select-none"
              >
                Designate as Class Rep
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" type="submit" className="cursor-pointer">
            Save User Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
