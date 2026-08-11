import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Plus, Tag, RefreshCw } from 'lucide-react';

interface VenuesHeaderProps {
  onOpenCreateVenue: () => void;
  onOpenCreateFacility: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function VenuesHeader({
  onOpenCreateVenue,
  onOpenCreateFacility,
  onRefresh,
  isRefreshing,
}: VenuesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <Text variant="h3" weight="bold" className="text-text-main">
          Venues & Facilities Registry
        </Text>
        <Text variant="body-sm" color="muted">
          Manage lecture halls, laboratories, exam venues, and equipment facilities.
        </Text>
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Venues Data"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onOpenCreateFacility}>
          <Tag size={16} className="mr-1" /> Add Facility Tag
        </Button>
        <Button variant="primary" size="sm" onClick={onOpenCreateVenue}>
          <Plus size={16} className="mr-1" /> Create Venue
        </Button>
      </div>
    </div>
  );
}
