import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import VenuesView from '@/pages/main/VenuesView';
import CreateVenueModal from '@/components/modals/CreateVenueModal';
import CreateFacilityModal from '@/components/modals/CreateFacilityModal';
import ToggleVenueStatusModal from '@/components/modals/ToggleVenueStatusModal';
import EditVenueModal from '@/components/modals/EditVenueModal';
import {
  getVenues,
  getFacilities,
  createVenueAPI,
  updateVenueAPI,
  activateVenueAPI,
  deactivateVenueAPI,
  createFacilityAPI,
} from '@/api/main/venuesAPI';
import { getDepartmentsList } from '@/api/main/dashboardAPI';
import type { Venue } from '@/types';
import { toast } from 'sonner';

export default function VenuesContainer() {
  const queryClient = useQueryClient();

  // Modal Visibility States
  const [isCreateVenueOpen, setIsCreateVenueOpen] = useState(false);
  const [isCreateFacilityOpen, setIsCreateFacilityOpen] = useState(false);
  const [toggleStatusTarget, setToggleStatusTarget] = useState<Venue | null>(null);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  // React Query Fetching
  const {
    data: venuesData,
    isLoading: isVenuesLoading,
    isRefetching: isVenuesRefetching,
    refetch: refetchVenues,
  } = useQuery({
    queryKey: ['venues', 'list'],
    queryFn: getVenues,
  });

  const {
    data: facilitiesData,
    isLoading: isFacilitiesLoading,
    refetch: refetchFacilities,
  } = useQuery({
    queryKey: ['venues', 'facilities'],
    queryFn: getFacilities,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['hierarchy', 'departments'],
    queryFn: getDepartmentsList,
  });

  const venues = venuesData ?? [];
  const facilities = facilitiesData ?? [];
  const departments = departmentsData ?? [];
  const isLoading = isVenuesLoading || isFacilitiesLoading;

  // React Query Mutations
  const createVenueMutation = useMutation({
    mutationFn: (payload: Partial<Venue>) => createVenueAPI(payload),
    onSuccess: (newVenue) => {
      queryClient.setQueryData<Venue[]>(['venues', 'list'], (old = []) => [newVenue, ...old]);
      toast.success(`Venue "${newVenue.name}" created successfully.`);
    },
    onError: (err) => {
      toast.error('Failed to create venue.');
      console.error('createVenue error:', err);
    },
  });

  const editVenueMutation = useMutation({
    mutationFn: ({ id, updated }: { id: string; updated: Partial<Venue> }) =>
      updateVenueAPI(id, updated),
    onSuccess: (updatedVenue) => {
      queryClient.setQueryData<Venue[]>(['venues', 'list'], (old = []) =>
        old.map((v) => (v.id === updatedVenue.id ? { ...v, ...updatedVenue } : v))
      );
      toast.success(`Venue "${updatedVenue.name}" updated successfully.`);
    },
    onError: (err) => {
      toast.error('Failed to update venue.');
      console.error('editVenue error:', err);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (target: Venue) =>
      target.isAvailable ? deactivateVenueAPI(target.id) : activateVenueAPI(target.id),
    onSuccess: (_, target) => {
      const newStatus = !target.isAvailable;
      queryClient.setQueryData<Venue[]>(['venues', 'list'], (old = []) =>
        old.map((v) => (v.id === target.id ? { ...v, isAvailable: newStatus } : v))
      );
      toast.success(
        `Venue "${target.name}" has been ${newStatus ? 'activated' : 'deactivated'}.`
      );
      setToggleStatusTarget(null);
    },
    onError: (err) => {
      toast.error('Failed to update venue status.');
      console.error('toggleStatus error:', err);
    },
  });

  const createFacilityMutation = useMutation({
    mutationFn: (payload: { name: string }) => createFacilityAPI(payload),
    onSuccess: (newFac) => {
      queryClient.setQueryData<typeof facilities>(['venues', 'facilities'], (old = []) => [
        ...old,
        newFac,
      ]);
      toast.success(`Facility tag "${newFac.name}" added successfully.`);
    },
    onError: (err) => {
      toast.error('Failed to create facility tag.');
      console.error('createFacility error:', err);
    },
  });

  // Action Handlers
  const handleCreateVenue = (data: Partial<Venue>) => {
    createVenueMutation.mutate(data);
  };

  const handleCreateFacility = (data: { name: string }) => {
    createFacilityMutation.mutate(data);
  };

  const handleEditVenue = (id: string, updated: Partial<Venue>) => {
    editVenueMutation.mutate({ id, updated });
  };

  const handleToggleStatus = () => {
    if (toggleStatusTarget) {
      toggleStatusMutation.mutate(toggleStatusTarget);
    }
  };

  const handleRefresh = () => {
    refetchVenues();
    refetchFacilities();
  };

  return (
    <>
      <VenuesView
        venues={venues}
        facilities={facilities}
        isLoading={isLoading}
        isRefetching={isVenuesRefetching}
        onRefresh={handleRefresh}
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
        departments={departments}
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
