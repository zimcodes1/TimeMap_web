import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import type { Venue, Facility, AdminLevel } from '@/types';

interface EditVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updatedVenue: Partial<Venue>) => void;
  venue: Venue | null;
  facilitiesList: Facility[];
}

export default function EditVenueModal({
  isOpen,
  onClose,
  onSubmit,
  venue,
  facilitiesList,
}: EditVenueModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [venueType, setVenueType] = useState<Venue['venueType']>('lecture_hall');
  const [capacity, setCapacity] = useState<number>(100);
  const [examCapacity, setExamCapacity] = useState<number>(50);
  const [owningLevel, setOwningLevel] = useState<AdminLevel>('department');
  const [building, setBuilding] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  useEffect(() => {
    if (venue) {
      setName(venue.name);
      setCode(venue.code || '');
      setVenueType(venue.venueType || 'lecture_hall');
      setCapacity(venue.capacity);
      setExamCapacity(venue.examCapacity || Math.floor(venue.capacity / 2));
      setOwningLevel(venue.owningLevel);
      setBuilding(venue.building || '');
      setSelectedFacilities(venue.facilities.map((f) => f.id));
    }
  }, [venue]);

  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId) ? prev.filter((id) => id !== facilityId) : [...prev, facilityId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (venue && name) {
      const updatedFacilities = facilitiesList.filter((f) => selectedFacilities.includes(f.id));
      onSubmit(venue.id, {
        name,
        code,
        venueType,
        capacity,
        examCapacity,
        owningLevel,
        building,
        facilities: updatedFacilities,
      });
      onClose();
    }
  };

  if (!venue) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Venue — ${venue.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Text variant="body-sm" color="muted">
          Update venue registry specifications and available facility tags.
        </Text>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Venue Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Venue Code</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. AUD-01" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Venue Type</label>
            <Select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value as Venue['venueType'])}
            >
              <option value="lecture_hall">Lecture Hall</option>
              <option value="lab">Laboratory</option>
              <option value="auditorium">Auditorium</option>
              <option value="classroom">Classroom</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Owning Scope Level</label>
            <Select
              value={owningLevel}
              onChange={(e) => setOwningLevel(e.target.value as AdminLevel)}
            >
              <option value="university">University Wide</option>
              <option value="school">School Level</option>
              <option value="faculty">Faculty Level</option>
              <option value="department">Department Level</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Lecture Capacity</label>
            <Input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              min={1}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Exam Capacity</label>
            <Input
              type="number"
              value={examCapacity}
              onChange={(e) => setExamCapacity(Number(e.target.value))}
              min={1}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main">Building / Location</label>
            <Input value={building} onChange={(e) => setBuilding(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-main">Facilities & Equipment</label>
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
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface text-text-muted border-border hover:bg-secondary'
                  }`}
                >
                  {fac.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Venue Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
