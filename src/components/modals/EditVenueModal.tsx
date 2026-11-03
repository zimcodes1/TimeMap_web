import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

interface EditVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updatedVenue: Partial<Venue> & { scopeId?: string }) => void;
  venue: Venue | null;
  facilitiesList: Facility[];
  departments?: Department[];
  faculties?: FacultyType[];
  schools?: School[];
}

export default function EditVenueModal({
  isOpen,
  onClose,
  onSubmit,
  venue,
  facilitiesList,
  departments = [],
  faculties = [],
  schools = [],
}: EditVenueModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [venueType, setVenueType] = useState<VenueType>("lecture_hall");
  const [capacity, setCapacity] = useState<number>(100);
  const [examCapacity, setExamCapacity] = useState<number>(50);
  const [owningLevel, setOwningLevel] = useState<AdminLevel>("department");
  const [scopeId, setScopeId] = useState<string>("");
  const [location, setLocation] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const isCbtCenter = venueType === "cbt_center" || venueType === "exam_hall";

  useEffect(() => {
    if (venue) {
      setName(venue.name || "");
      setCode(venue.code || "");
      const currentType = (venue.venueType as VenueType) || "lecture_hall";
      setVenueType(currentType);
      setCapacity(venue.capacity || 100);
      setExamCapacity(venue.examCapacity || (currentType === "cbt_center" ? venue.capacity : 50));
      setOwningLevel(venue.owningLevel || "department");
      setScopeId(
        venue.owningDepartmentId || venue.owningFacultyId || venue.owningSchoolId || ""
      );
      setLocation(venue.location || venue.building || "");
      setSelectedFacilities(venue.facilities?.map((f) => f.id) || []);
    }
  }, [venue]);

  useEffect(() => {
    if (!scopeId && owningLevel) {
      if (owningLevel === "school" && schools.length > 0) {
        setScopeId(schools[0].id);
      } else if (owningLevel === "faculty" && faculties.length > 0) {
        setScopeId(faculties[0].id);
      } else if (owningLevel === "department" && departments.length > 0) {
        setScopeId(departments[0].id);
      }
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

  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((id) => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !name.trim()) return;

    const activeScopeId =
      scopeId ||
      (owningLevel === "department"
        ? departments[0]?.id
        : owningLevel === "faculty"
        ? faculties[0]?.id
        : schools[0]?.id) ||
      "";

    const updatedFacilities = isCbtCenter
      ? []
      : facilitiesList.filter((f) => selectedFacilities.includes(f.id));

    const finalExamCapacity = Number(examCapacity);
    const finalCapacity = isCbtCenter ? finalExamCapacity : Number(capacity);

    onSubmit(venue.id, {
      name: name.trim(),
      code: code.trim(),
      venueType,
      capacity: finalCapacity,
      examCapacity: finalExamCapacity,
      owningLevel,
      scopeId: activeScopeId,
      owningDepartmentId: owningLevel === "department" ? activeScopeId : undefined,
      location: location.trim(),
      building: location.trim(),
      facilities: updatedFacilities,
    });
    onClose();
  };

  if (!venue) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Venue — ${venue.name}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={handleSubmit} className="cursor-pointer">
            Save Venue Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Text variant="body-sm" color="muted">
          Update venue registry specifications, capacities, and administrative scope ownership.
        </Text>

        {/* Name and Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Text variant="caption" className="font-semibold mb-1 block">
              Venue Name
            </Text>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                isCbtCenter ? "e.g. University ICT CBT Center A" : "e.g. Science Lecture Theatre 1"
              }
              required
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Venue Code
            </Text>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={isCbtCenter ? "e.g. CBT-01" : "e.g. AUD-01"}
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. ICT Center Complex, West Wing"
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
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  min={1}
                  required
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
                  value={examCapacity}
                  onChange={(e) => setExamCapacity(Number(e.target.value))}
                  min={1}
                  required
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
                min={1}
                required
              />
              <span className="text-[11px] text-text-muted mt-0.5 block">
                Maximum number of functional computer terminals available for candidate throughput calculation in each sitting.
              </span>
            </div>
          )}
        </div>

        {/* Owning Scope Hierarchy */}
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

        {/* Facilities & Equipment (Omitted for CBT Center) */}
        {!isCbtCenter && (
          <div>
            <Text variant="caption" className="font-semibold mb-2 block">
              Facilities & Equipment
            </Text>
            {facilitiesList.length === 0 ? (
              <p className="text-xs text-text-muted italic">
                No facility tags created yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 bg-surface-raised border border-border rounded-xl">
                {facilitiesList.map((fac) => {
                  const isSelected = selectedFacilities.includes(fac.id);
                  return (
                    <button
                      type="button"
                      key={fac.id}
                      onClick={() => toggleFacility(fac.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-surface text-text-muted border-border hover:bg-secondary"
                      }`}
                    >
                      {fac.name}
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
