import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { Faculty, School } from "@/types";

interface CreateFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { schoolId: string; name: string; code: string }) => void;
  schools: School[];
  initialData?: Faculty | null;
}

export default function CreateFacultyModal({
  isOpen,
  onClose,
  onSubmit,
  schools,
  initialData,
}: CreateFacultyModalProps) {
  const [schoolId, setSchoolId] = useState(initialData?.schoolId || "");
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");

  useEffect(() => {
    if (schools.length > 0 && !schoolId) {
      setSchoolId(schools[0].id);
    }
  }, [schools, schoolId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSchoolId = schoolId || schools[0]?.id || "";
    if (!name.trim() || !code.trim() || !activeSchoolId) return;
    onSubmit({ schoolId: activeSchoolId, name: name.trim(), code: code.trim().toUpperCase() });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Faculty" : "Add New Faculty"}
      description="Select school and enter faculty details."
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="cursor-pointer">
            {initialData ? "Save Changes" : "Create Faculty"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Parent School
          </Text>
          <Select
            value={schoolId || (schools[0]?.id ?? "")}
            onChange={(e) => setSchoolId(e.target.value)}
            options={schools.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }))}
            disabled={schools.length <= 1}
          />
        </div>
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Faculty Name
          </Text>
          <Input
            placeholder="e.g. Faculty of Natural & Applied Sciences"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Text variant="caption" className="font-semibold mb-1 block">
            Faculty Code
          </Text>
          <Input
            placeholder="e.g. FNS"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
