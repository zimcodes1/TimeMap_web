import { useState } from 'react';
import { TabSwitcher } from '@/components/ui/tabs';
import { MapPin, Tag } from 'lucide-react';
import VenuesHeader from '@/components/venues/VenuesHeader';
import VenuesTableSection from '@/components/venues/VenuesTableSection';
import FacilitiesGridSection from '@/components/venues/FacilitiesGridSection';
import { TableSkeleton } from '@/components/ui/skeleton';
import type { Venue, Facility } from '@/types';

interface VenuesViewProps {
  venues: Venue[];
  facilities: Facility[];
  isLoading?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
  onOpenCreateVenue: () => void;
  onOpenCreateFacility: () => void;
  onEditVenue: (venue: Venue) => void;
  onToggleStatusTrigger: (venue: Venue) => void;
}

export default function VenuesView({
  venues,
  facilities,
  isLoading,
  isRefetching,
  onRefresh,
  onOpenCreateVenue,
  onOpenCreateFacility,
  onEditVenue,
  onToggleStatusTrigger,
}: VenuesViewProps) {
  const [activeTab, setActiveTab] = useState<'venues' | 'facilities'>('venues');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <VenuesHeader
        onOpenCreateVenue={onOpenCreateVenue}
        onOpenCreateFacility={onOpenCreateFacility}
        onRefresh={onRefresh}
        isRefreshing={isRefetching}
      />

      {/* Primary Tab Switcher */}
      <TabSwitcher
        tabs={[
          { id: 'venues', label: 'Venues Registry', icon: MapPin, count: venues.length },
          { id: 'facilities', label: 'Facility Tags', icon: Tag, count: facilities.length },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as typeof activeTab)}
      />

      {/* Main Tab Content */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : activeTab === 'venues' ? (
        <VenuesTableSection
          venues={venues}
          facilities={facilities}
          onEditVenue={onEditVenue}
          onToggleStatusTrigger={onToggleStatusTrigger}
        />
      ) : (
        <FacilitiesGridSection
          facilities={facilities}
          onOpenCreateFacility={onOpenCreateFacility}
        />
      )}
    </div>
  );
}
