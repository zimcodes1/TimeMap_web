import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { Department, Faculty } from "@/types";

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { facultyId: string; name: string; code: string }) => void;
  faculties: Faculty[];
  initialData?: Department | null;
}

export default function CreateDepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  faculties,
  initialData,
}: CreateDepartmentModalProps) {
  const [facultyId, setFacultyId] = useState(initialData?.facultyId || "");
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");

  useEffect(() => {
    if (faculties.length > 0 && !facultyId) {
      setFacultyId(faculties[0].id);
    }
  }, [faculties, facultyId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeFacultyId = facultyId || faculties[0]?.id || "";
    if (!name.trim() || !code.trim() || !activeFacultyId) return;
    onSubmit({ facultyId: activeFacultyId, name: name.trim(), code: code.trim().toUpperCase() });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Department" : "Add New Department"}
      description="Select parent faculty and enter department information."
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="cursor-pointer">
            {initialData ? "Save Changes" : "Create Department"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Parent Faculty
          </Text>
          <Select
            value={facultyId || (faculties[0]?.id ?? "")}
            onChange={(e) => setFacultyId(e.target.value)}
            options={faculties.map((f) => ({ value: f.id, label: `${f.name} (${f.code})` }))}
            disabled={faculties.length <= 1}
          />
        </div>
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Department Name
          </Text>
          <Input
            placeholder="e.g. Computer Science"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Department Code
          </Text>
          <Input
            placeholder="e.g. CSC"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
