import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { Venue, Facility, AdminLevel, VenueType, Department, Faculty as FacultyType, School } from "@/types";

interface CreateVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Venue> & { scopeId?: string }) => void;
  facilitiesList: Facility[];
  departments: Department[];
  faculties?: FacultyType[];
  schools?: School[];
  initialData?: Venue | null;
}

export default function CreateVenueModal({
  isOpen,
  onClose,
  onSubmit,
  facilitiesList,
  departments,
  faculties = [],
  schools = [],
  initialData,
}: CreateVenueModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [venueType, setVenueType] = useState<VenueType>(initialData?.venueType || "lecture_hall");
  const [capacity, setCapacity] = useState(initialData?.capacity || 100);
  const [examCapacity, setExamCapacity] = useState(initialData?.examCapacity || 50);
  const [owningLevel, setOwningLevel] = useState<AdminLevel>(initialData?.owningLevel || "department");
  const [scopeId, setScopeId] = useState<string>(initialData?.owningDepartmentId || "");
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>(
    initialData?.facilities.map((f) => f.id) || []
  );

  useEffect(() => {
    if (owningLevel === "school" && schools.length > 0 && !scopeId) {
      setScopeId(schools[0].id);
    } else if (owningLevel === "faculty" && faculties.length > 0 && !scopeId) {
      setScopeId(faculties[0].id);
    } else if (owningLevel === "department" && departments.length > 0 && !scopeId) {
      setScopeId(departments[0].id);
    }
  }, [owningLevel, departments, faculties, schools, scopeId]);

  const handleOwningLevelChange = (newLevel: AdminLevel) => {
    setOwningLevel(newLevel);
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

  const toggleFacility = (id: string) => {
    setSelectedFacilityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const activeScopeId = scopeId || (owningLevel === "department" ? departments[0]?.id : owningLevel === "faculty" ? faculties[0]?.id : schools[0]?.id) || "";
    const selectedFacilities = facilitiesList.filter((f) => selectedFacilityIds.includes(f.id));

    onSubmit({
      name: name.trim(),
      venueType,
      capacity: Number(capacity),
      examCapacity: Number(examCapacity),
      owningLevel,
      scopeId: activeScopeId,
      owningDepartmentId: owningLevel === "department" ? activeScopeId : undefined,
      facilities: selectedFacilities,
      isAvailable: true,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Venue" : "Create New Venue"}
      description="Register venue specification, capacity, and facility tags."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="cursor-pointer">
            {initialData ? "Save Changes" : "Create Venue"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Venue Name
            </Text>
            <Input
              placeholder="e.g. Lecture Theatre 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Venue Type
            </Text>
            <Select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value as VenueType)}
              options={[
                { value: "lecture_hall", label: "Lecture Hall" },
                { value: "laboratory", label: "Laboratory" },
                { value: "exam_hall", label: "Exam Hall" },
                { value: "multipurpose", label: "Multipurpose Auditorium" },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Lecture Capacity
            </Text>
            <Input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              required
              min={1}
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Exam Capacity
            </Text>
            <Input
              type="number"
              value={examCapacity}
              onChange={(e) => setExamCapacity(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Owning Scope Level
            </Text>
            <Select
              value={owningLevel}
              onChange={(e) => handleOwningLevelChange(e.target.value as AdminLevel)}
              options={[
                { value: "department", label: "Department Owned" },
                { value: "faculty", label: "Faculty Shared" },
                { value: "school", label: "School Central" },
              ]}
            />
          </div>

          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              {owningLevel === "school"
                ? "Owning School"
                : owningLevel === "faculty"
                ? "Owning Faculty"
                : "Owning Department"}
            </Text>

            {owningLevel === "school" && (
              <Select
                value={scopeId || (schools[0]?.id ?? "")}
                onChange={(e) => setScopeId(e.target.value)}
                options={schools.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
              />
            )}

            {owningLevel === "faculty" && (
              <Select
                value={scopeId || (faculties[0]?.id ?? "")}
                onChange={(e) => setScopeId(e.target.value)}
                options={faculties.map((f) => ({ value: f.id, label: `${f.code} - ${f.name}` }))}
              />
            )}

            {owningLevel === "department" && (
              <Select
                value={scopeId || (departments[0]?.id ?? "")}
                onChange={(e) => setScopeId(e.target.value)}
                options={departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              />
            )}
          </div>
        </div>

        <div>
          <Text variant="caption" className="font-semibold mb-2 block">
            Available Facility Tags
          </Text>
          <div className="flex flex-wrap gap-2">
            {facilitiesList.map((facility) => {
              const selected = selectedFacilityIds.includes(facility.id);
              return (
                <button
                  type="button"
                  key={facility.id}
                  onClick={() => toggleFacility(facility.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selected
                      ? "bg-primary text-white border-primary"
                      : "bg-surface text-text-muted border-border hover:bg-surface-raised"
                  }`}
                >
                  {facility.name}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
