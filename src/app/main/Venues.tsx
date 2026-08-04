import { useState } from 'react';
import VenuesView from '@/pages/main/VenuesView';
import CreateVenueModal from '@/components/modals/CreateVenueModal';
import CreateFacilityModal from '@/components/modals/CreateFacilityModal';
import ToggleVenueStatusModal from '@/components/modals/ToggleVenueStatusModal';
import EditVenueModal from '@/components/modals/EditVenueModal';
import { mockVenues, mockFacilities, mockDepartments } from '@/constants/mockData';
import type { Venue, Facility } from '@/types';

export default function VenuesContainer() {
  const [venues, setVenues] = useState<Venue[]>(mockVenues);
  const [facilities, setFacilities] = useState<Facility[]>(mockFacilities);

  const [isCreateVenueOpen, setIsCreateVenueOpen] = useState(false);
  const [isCreateFacilityOpen, setIsCreateFacilityOpen] = useState(false);
  const [toggleStatusTarget, setToggleStatusTarget] = useState<Venue | null>(null);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const handleCreateVenue = (data: Partial<Venue>) => {
    const newVenue: Venue = {
      id: `v_${Date.now()}`,
      name: data.name || 'New Hall',
      code: data.code || 'NH-01',
      capacity: data.capacity || 100,
      examCapacity: data.examCapacity || 50,
      building: data.building || 'Main Campus',
      facilities: data.facilities || [],
      owningLevel: data.owningLevel || 'department',
      owningDepartmentId: data.owningDepartmentId,
      isAvailable: true,
      venueType: data.venueType || 'lecture_hall',
    };
    setVenues((prev) => [newVenue, ...prev]);
  };

  const handleCreateFacility = (data: { name: string }) => {
    const newFac: Facility = {
      id: `fac_${Date.now()}`,
      name: data.name,
    };
    setFacilities((prev) => [...prev, newFac]);
  };

  const handleEditVenue = (id: string, updated: Partial<Venue>) => {
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  const handleToggleStatus = () => {
    if (!toggleStatusTarget) return;
    const targetId = toggleStatusTarget.id;
    const targetStatus = !toggleStatusTarget.isAvailable;
    setVenues((prev) =>
      prev.map((v) => (v.id === targetId ? { ...v, isAvailable: targetStatus } : v))
    );
    setToggleStatusTarget(null);
  };

  return (
    <>
      <VenuesView
        venues={venues}
        facilities={facilities}
        onOpenCreateVenue={() => setIsCreateVenueOpen(true)}
        onOpenCreateFacility={() => setIsCreateFacilityOpen(true)}
        onEditVenue={(v) => setEditingVenue(v)}
        onToggleStatusTrigger={(v) => setToggleStatusTarget(v)}
      />

      <CreateVenueModal
        isOpen={isCreateVenueOpen}
        onClose={() => setIsCreateVenueOpen(false)}
        onSubmit={handleCreateVenue}
        facilitiesList={facilities}
        departments={mockDepartments}
      />

      <CreateFacilityModal
        isOpen={isCreateFacilityOpen}
        onClose={() => setIsCreateFacilityOpen(false)}
        onSubmit={handleCreateFacility}
      />

      <EditVenueModal
        isOpen={Boolean(editingVenue)}
        onClose={() => setEditingVenue(null)}
        onSubmit={handleEditVenue}
        venue={editingVenue}
        facilitiesList={facilities}
      />

      <ToggleVenueStatusModal
        isOpen={Boolean(toggleStatusTarget)}
        onClose={() => setToggleStatusTarget(null)}
        onConfirm={handleToggleStatus}
        venue={toggleStatusTarget}
      />
    </>
  );
}
