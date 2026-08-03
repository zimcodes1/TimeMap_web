import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import type { Venue, Facility, AdminLevel, VenueType, Department } from '@/types';

interface CreateVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Venue>) => void;
  facilitiesList: Facility[];
  departments: Department[];
  initialData?: Venue | null;
}

export default function CreateVenueModal({
  isOpen,
  onClose,
  onSubmit,
  facilitiesList,
  departments,
  initialData,
}: CreateVenueModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [building, setBuilding] = useState(initialData?.building || '');
  const [venueType, setVenueType] = useState<VenueType>(initialData?.venueType || 'lecture_hall');
  const [capacity, setCapacity] = useState(initialData?.capacity || 100);
  const [examCapacity, setExamCapacity] = useState(initialData?.examCapacity || 50);
  const [owningLevel, setOwningLevel] = useState<AdminLevel>(initialData?.owningLevel || 'department');
  const [owningDepartmentId, setOwningDepartmentId] = useState(initialData?.owningDepartmentId || departments[0]?.id || '');
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>(
    initialData?.facilities.map((f) => f.id) || []
  );

  const toggleFacility = (id: string) => {
    setSelectedFacilityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const selectedFacilities = facilitiesList.filter((f) => selectedFacilityIds.includes(f.id));
    onSubmit({
      name,
      code,
      building,
      venueType,
      capacity: Number(capacity),
      examCapacity: Number(examCapacity),
      owningLevel,
      owningDepartmentId,
      facilities: selectedFacilities,
      isAvailable: true,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Venue' : 'Create New Venue'}
      description="Register venue specification, capacity, and facility tags."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Create Venue'}
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
              Venue Code
            </Text>
            <Input
              placeholder="e.g. LT-1"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Venue Type
            </Text>
            <Select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value as VenueType)}
              options={[
                { value: 'lecture_hall', label: 'Lecture Hall' },
                { value: 'laboratory', label: 'Laboratory' },
                { value: 'exam_hall', label: 'Exam Hall' },
                { value: 'multipurpose', label: 'Multipurpose Auditorium' },
              ]}
            />
          </div>
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Building / Complex
            </Text>
            <Input
              placeholder="e.g. Faculty of Science Wing"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
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
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text variant="caption" className="font-semibold mb-1 block">
              Owning Level
            </Text>
            <Select
              value={owningLevel}
              onChange={(e) => setOwningLevel(e.target.value as AdminLevel)}
              options={[
                { value: 'department', label: 'Department Owned' },
                { value: 'faculty', label: 'Faculty Shared' },
                { value: 'school', label: 'School Central' },
              ]}
            />
          </div>
          {owningLevel === 'department' && (
            <div>
              <Text variant="caption" className="font-semibold mb-1 block">
                Owning Department
              </Text>
              <Select
                value={owningDepartmentId}
                onChange={(e) => setOwningDepartmentId(e.target.value)}
                options={departments.map((d) => ({ value: d.id, label: d.name }))}
              />
            </div>
          )}
        </div>

        <div>
          <Text variant="caption" className="font-semibold mb-2 block">
            Available Facilities
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
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-text-muted border-border hover:bg-surface-raised'
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
