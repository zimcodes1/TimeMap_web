import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { User, UserRole, Department, Faculty, School, AdminLevel } from "@/types";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User> & { scopeId?: string }) => void;
  departments: Department[];
  faculties?: Faculty[];
  schools?: School[];
  initialData?: User | null;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  departments,
  faculties = [],
  schools = [],
  initialData,
}: CreateUserModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [identifier, setIdentifier] = useState(initialData?.identifier || "");
  const [role, setRole] = useState<UserRole>(initialData?.role || "student");

  // Admin Scope Level & Selected Scope ID
  const [adminLevel, setAdminLevel] = useState<AdminLevel>(initialData?.adminLevel || "department");
  const [scopeId, setScopeId] = useState<string>(initialData?.departmentId || initialData?.adminScopeId || "");

  // Student specific fields
  const [level, setLevel] = useState(initialData?.level || 100);
  const [isClassRep, setIsClassRep] = useState(initialData?.isClassRep || false);

  // Sync initial scope target based on current selection
  useEffect(() => {
    if (role === "admin") {
      if (adminLevel === "school" && schools.length > 0 && !scopeId) {
        setScopeId(schools[0].id);
      } else if (adminLevel === "faculty" && faculties.length > 0 && !scopeId) {
        setScopeId(faculties[0].id);
      } else if (adminLevel === "department" && departments.length > 0 && !scopeId) {
        setScopeId(departments[0].id);
      }
    } else if (departments.length > 0 && !scopeId) {
      setScopeId(departments[0].id);
    }
  }, [adminLevel, role, departments, faculties, schools, scopeId]);

  // When admin level changes, reset scopeId to first matching option
  const handleAdminLevelChange = (newLevel: AdminLevel) => {
    setAdminLevel(newLevel);
    if (newLevel === "school" && schools.length > 0) {
      setScopeId(schools[0].id);
    } else if (newLevel === "faculty" && faculties.length > 0) {
      setScopeId(faculties[0].id);
    } else if (newLevel === "department" && departments.length > 0) {
      setScopeId(departments[0].id);
    } else {
      setScopeId("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !identifier.trim() || !email.trim()) return;

    if (role === "admin") {
      onSubmit({
        name: name.trim(),
        email: email.trim(),
        identifier: identifier.trim().toUpperCase(),
        role: "admin",
        adminLevel,
        scopeId,
        departmentId: adminLevel === "department" ? scopeId : undefined,
        isActive: true,
        requiresPasswordReset: true,
      });
    } else {
      const dept = departments.find((d) => d.id === scopeId) || departments[0];
      onSubmit({
        name: name.trim(),
        email: email.trim(),
        identifier: identifier.trim().toUpperCase(),
        role,
        departmentId: dept?.id || scopeId,
        departmentName: dept?.name,
        level: Number(level),
        isClassRep,
        isActive: true,
        requiresPasswordReset: true,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit User Account" : "Create User Account"}
      description="Register student, lecturer, or admin officer credentials."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="cursor-pointer">
            {initialData ? "Save User" : "Create Account"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Role & Identifier */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              User Role
            </Text>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: "student", label: "Student / Class Rep" },
                { value: "lecturer", label: "Lecturer / Teaching Staff" },
                { value: "admin", label: "Admin Officer" },
              ]}
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Unique Identifier
            </Text>
            <Input
              placeholder={role === "student" ? "Matric Number (e.g. NSUK/CSC/2021/001)" : "Staff ID (e.g. NSUK/STAFF/0100)"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Row 2: Full Name & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Full Name
            </Text>
            <Input
              placeholder="e.g. Alice Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Email Address
            </Text>
            <Input
              type="email"
              placeholder="e.g. admin@timemap.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Admin Specific Section: Level FIRST, Scope Entity SECOND */}
        {role === "admin" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text variant="caption" className="font-semibold mb-1 block">
                Admin Scope Level
              </Text>
              <Select
                value={adminLevel}
                onChange={(e) => handleAdminLevelChange(e.target.value as AdminLevel)}
                options={[
                  { value: "department", label: "Department Admin" },
                  { value: "faculty", label: "Faculty Admin" },
                  { value: "school", label: "School Admin" },
                ]}
              />
            </div>

            <div>
              <Text variant="caption" className="font-semibold mb-1 block">
                {adminLevel === "school"
                  ? "Assigned Scope School"
                  : adminLevel === "faculty"
                  ? "Assigned Scope Faculty"
                  : "Assigned Scope Department"}
              </Text>

              {adminLevel === "school" && (
                <Select
                  value={scopeId || (schools[0]?.id ?? "")}
                  onChange={(e) => setScopeId(e.target.value)}
                  options={
                    schools.length > 0
                      ? schools.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))
                      : [{ value: "", label: "No schools available" }]
                  }
                />
              )}

              {adminLevel === "faculty" && (
                <Select
                  value={scopeId || (faculties[0]?.id ?? "")}
                  onChange={(e) => setScopeId(e.target.value)}
                  options={
                    faculties.length > 0
                      ? faculties.map((f) => ({ value: f.id, label: `${f.code} - ${f.name}` }))
                      : [{ value: "", label: "No faculties available" }]
                  }
                />
              )}

              {adminLevel === "department" && (
                <Select
                  value={scopeId || (departments[0]?.id ?? "")}
                  onChange={(e) => setScopeId(e.target.value)}
                  options={
                    departments.length > 0
                      ? departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))
                      : [{ value: "", label: "No departments available" }]
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* Lecturer / Student Section */}
        {role !== "admin" && (
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Department
            </Text>
            <Select
              value={scopeId || (departments[0]?.id ?? "")}
              onChange={(e) => setScopeId(e.target.value)}
              options={departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
            />
          </div>
        )}

        {/* Student Specific Level & Class Rep checkbox */}
        {role === "student" && (
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <Text variant="caption" className="font-semibold mb-1 block">
                Academic Level
              </Text>
              <Select
                value={String(level)}
                onChange={(e) => setLevel(Number(e.target.value))}
                options={[
                  { value: "100", label: "100 Level" },
                  { value: "200", label: "200 Level" },
                  { value: "300", label: "300 Level" },
                  { value: "400", label: "400 Level" },
                  { value: "500", label: "500 Level" },
                ]}
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isClassRep"
                checked={isClassRep}
                onChange={(e) => setIsClassRep(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isClassRep" className="text-xs font-semibold text-text-main cursor-pointer select-none">
                Designate as Class Representative
              </label>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
