import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Monitor } from "lucide-react";
import type {
  Venue,
  Facility,
  AdminLevel,
  VenueType,
  Department,
  Faculty as FacultyType,
  School,
} from "@/types";

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
  const [code, setCode] = useState(initialData?.code || "");
  const [location, setLocation] = useState(
    initialData?.location || initialData?.building || ""
  );
  const [venueType, setVenueType] = useState<VenueType>(
    initialData?.venueType || "lecture_hall"
  );
  const [capacity, setCapacity] = useState(initialData?.capacity || 100);
  const [examCapacity, setExamCapacity] = useState(
    initialData?.examCapacity || 50
  );
  const [owningLevel, setOwningLevel] = useState<AdminLevel>(
    initialData?.owningLevel || "department"
  );
  const [scopeId, setScopeId] = useState<string>(
    initialData?.owningDepartmentId || ""
  );
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>(
    initialData?.facilities.map((f) => f.id) || []
  );

  const isCbtCenter = venueType === "cbt_center" || venueType === "exam_hall";

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCode(initialData.code || "");
      setLocation(initialData.location || initialData.building || "");
      setVenueType(initialData.venueType || "lecture_hall");
      setCapacity(initialData.capacity || 100);
      setExamCapacity(
        initialData.examCapacity || (initialData.venueType === "cbt_center" ? initialData.capacity : 50)
      );
      setOwningLevel(initialData.owningLevel || "department");
      setScopeId(initialData.owningDepartmentId || "");
      setSelectedFacilityIds(initialData.facilities.map((f) => f.id) || []);
    } else {
      setName("");
      setCode("");
      setLocation("");
      setVenueType("lecture_hall");
      setCapacity(100);
      setExamCapacity(50);
      setOwningLevel("department");
      setScopeId(departments[0]?.id || "");
      setSelectedFacilityIds([]);
    }
  }, [initialData, departments]);

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

    const activeScopeId =
      scopeId ||
      (owningLevel === "department"
        ? departments[0]?.id
        : owningLevel === "faculty"
        ? faculties[0]?.id
        : schools[0]?.id) ||
      "";

    // CBT centers don't have facility tags or separate lecture capacity
    const selectedFacilities = isCbtCenter
      ? []
      : facilitiesList.filter((f) => selectedFacilityIds.includes(f.id));

    const finalExamCapacity = Number(examCapacity);
    const finalCapacity = isCbtCenter ? finalExamCapacity : Number(capacity);

    onSubmit({
      name: name.trim(),
      code: code.trim(),
      venueType,
      capacity: finalCapacity,
      examCapacity: finalExamCapacity,
      location: location.trim(),
      building: location.trim(),
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
      description="Register venue specifications, seating capacities, and administrative ownership."
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
        {/* Name and Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Text variant="caption" className="font-semibold mb-1 block">
              Venue Name
            </Text>
            <Input
              placeholder={
                isCbtCenter ? "e.g. University ICT CBT Center A" : "e.g. Science Lecture Theatre 1"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Venue Code
            </Text>
            <Input
              placeholder={isCbtCenter ? "e.g. CBT-01" : "e.g. SLT-01"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>

        {/* Venue Type and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Venue Type
            </Text>
            <Select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value as VenueType)}
              options={[
                { value: "lecture_hall", label: "Lecture Hall" },
                { value: "cbt_center", label: "CBT Exam Center" },
                { value: "laboratory", label: "Laboratory" },
                { value: "auditorium", label: "Auditorium" },
                { value: "multipurpose", label: "Multipurpose Hall" },
              ]}
            />
          </div>

          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Building / Location
            </Text>
            <Input
              placeholder="e.g. ICT Center Complex, West Wing"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Contextual Banner for CBT Center */}
        {isCbtCenter && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-400">
            <Monitor size={16} className="shrink-0 mt-0.5 text-amber-500" />
            <div>
              <span className="font-semibold block text-text-main">
                CBT Exam Center Configuration
              </span>
              CBT centers are strictly dedicated to computer-based testing. They do not have lecture capacities or equipment facility tags. Their scheduling capacity represents operational computer workstations per exam sitting.
            </div>
          </div>
        )}

        {/* Capacities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!isCbtCenter ? (
            <>
              <div>
                <Text variant="caption" className="font-semibold mb-1 block">
                  Lecture Capacity
                </Text>
                <Input
                  type="number"
                  placeholder="e.g. 200"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                  min={1}
                />
                <span className="text-[11px] text-text-muted mt-0.5 block">
                  Standard class attendance seating
                </span>
              </div>
              <div>
                <Text variant="caption" className="font-semibold mb-1 block">
                  Exam Seating Capacity
                </Text>
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={examCapacity}
                  onChange={(e) => setExamCapacity(Number(e.target.value))}
                  min={1}
                />
                <span className="text-[11px] text-text-muted mt-0.5 block">
                  Spaced seating for written examinations
                </span>
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <Text variant="caption" className="font-semibold mb-1 block">
                One-Time Sitting Capacity (Workstations)
              </Text>
              <Input
                type="number"
                placeholder="e.g. 250"
                value={examCapacity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setExamCapacity(val);
                  setCapacity(val);
                }}
                required
                min={1}
              />
              <span className="text-[11px] text-text-muted mt-0.5 block">
                Maximum number of functional computer terminals available for candidate throughput calculation in each sitting.
              </span>
            </div>
          )}
        </div>

        {/* Ownership Hierarchy */}
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

        {/* Facility Tags (Omitted for CBT Centers) */}
        {!isCbtCenter && (
          <div>
            <Text variant="caption" className="font-semibold mb-2 block">
              Available Facility Tags
            </Text>
            {facilitiesList.length === 0 ? (
              <p className="text-xs text-text-muted italic">
                No facility tags created yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 bg-surface-raised border border-border rounded-xl">
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
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
