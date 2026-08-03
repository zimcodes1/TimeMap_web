import { useState } from 'react';
import VenuesView from '@/pages/main/VenuesView';
import CreateVenueModal from '@/components/modals/CreateVenueModal';
import CreateFacilityModal from '@/components/modals/CreateFacilityModal';
import ToggleVenueStatusModal from '@/components/modals/ToggleVenueStatusModal';
import { mockVenues, mockFacilities, mockDepartments } from '@/constants/mockData';
import type { Venue, Facility } from '@/types';

export default function VenuesContainer() {
  const [venues, setVenues] = useState<Venue[]>(mockVenues);
  const [facilities, setFacilities] = useState<Facility[]>(mockFacilities);

  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [selectedVenueForStatus, setSelectedVenueForStatus] = useState<Venue | null>(null);

  const handleCreateVenue = (data: Partial<Venue>) => {
    const newVenue: Venue = {
      id: `ven_${Date.now()}`,
      name: data.name || 'New Venue',
      code: data.code,
      building: data.building,
      venueType: data.venueType || 'lecture_hall',
      capacity: data.capacity || 100,
      examCapacity: data.examCapacity || 50,
      facilities: data.facilities || [],
      owningLevel: data.owningLevel || 'department',
      owningDepartmentId: data.owningDepartmentId,
      isAvailable: true,
    };
    setVenues((prev) => [newVenue, ...prev]);
  };

  const handleCreateFacility = (data: { name: string }) => {
    const newFacility: Facility = {
      id: `fac_${Date.now()}`,
      name: data.name,
    };
    setFacilities((prev) => [...prev, newFacility]);
  };

  const handleToggleStatusConfirm = () => {
    if (!selectedVenueForStatus) return;
    setVenues((prev) =>
      prev.map((v) =>
        v.id === selectedVenueForStatus.id ? { ...v, isAvailable: !v.isAvailable } : v
      )
    );
    setSelectedVenueForStatus(null);
  };

  return (
    <>
      <VenuesView
        venues={venues}
        facilities={facilities}
        onOpenCreateVenue={() => setIsVenueModalOpen(true)}
        onOpenCreateFacility={() => setIsFacilityModalOpen(true)}
        onToggleStatusTrigger={(venue) => setSelectedVenueForStatus(venue)}
      />

      <CreateVenueModal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        onSubmit={handleCreateVenue}
        facilitiesList={facilities}
        departments={mockDepartments}
      />

      <CreateFacilityModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        onSubmit={handleCreateFacility}
      />

      <ToggleVenueStatusModal
        isOpen={!!selectedVenueForStatus}
        onClose={() => setSelectedVenueForStatus(null)}
        onConfirm={handleToggleStatusConfirm}
        venue={selectedVenueForStatus}
      />
    </>
  );
}
