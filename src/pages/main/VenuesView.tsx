import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag, MapPin } from 'lucide-react';
import type { Venue, Facility } from '@/types';

interface VenuesViewProps {
  venues: Venue[];
  facilities: Facility[];
  onOpenCreateVenue: () => void;
  onOpenCreateFacility: () => void;
  onToggleStatusTrigger: (venue: Venue) => void;
}

export default function VenuesView({
  venues,
  facilities,
  onOpenCreateVenue,
  onOpenCreateFacility,
  onToggleStatusTrigger,
}: VenuesViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Venues & Facilities
          </Text>
          <Text variant="body-sm" color="muted">
            Manage lecture halls, laboratories, exam venues, and equipment facilities.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenCreateFacility}>
            <Tag size={16} className="mr-1" /> Add Facility Tag
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenCreateVenue}>
            <Plus size={16} className="mr-1" /> Create Venue
          </Button>
        </div>
      </div>

      {/* Facilities Pills Bar */}
      <div className="p-3 bg-surface-raised rounded-2xl border border-border flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-bold uppercase text-text-muted shrink-0">Facilities:</span>
        <div className="flex items-center gap-2">
          {facilities.map((fac) => (
            <Badge key={fac.id} className="shrink-0">
              {fac.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Venues Table */}
      <Card className="p-0 overflow-x-auto bg-transparent border-none shadow-none rounded-none">
        <Table>
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
              <th className="py-3 px-2">Venue Code / Name</th>
              <th className="py-3 px-2">Type & Building</th>
              <th className="py-3 px-2">Capacities</th>
              <th className="py-3 px-2">Owning Level</th>
              <th className="py-3 px-2">Facilities</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {venues.map((venue) => (
              <tr key={venue.id} className="hover:bg-surface-raised transition-colors">
                <td className="py-3 px-2 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary-muted text-primary">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-text-main">{venue.name}</div>
                      <div className="text-xs text-text-muted">{venue.code || 'No Code'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-xs">
                  <div className="font-semibold text-text-main capitalize">
                    {venue.venueType?.replace('_', ' ') || 'Lecture Hall'}
                  </div>
                  <div className="text-text-muted">{venue.building || 'Main Campus'}</div>
                </td>
                <td className="py-3 px-2 text-xs">
                  <div>Lecture: <span className="font-bold">{venue.capacity}</span></div>
                  <div>Exam: <span className="font-bold">{venue.examCapacity || venue.capacity}</span></div>
                </td>
                <td className="py-3 px-2 text-xs">
                  <Badge className="capitalize">
                    {venue.owningLevel}
                  </Badge>
                </td>
                <td className="py-3 px-2">
                  <div className="flex flex-wrap gap-1">
                    {venue.facilities.map((f) => (
                      <span
                        key={f.id}
                        className="px-2 py-0.5 rounded bg-surface-raised border border-border text-[10px] font-semibold text-text-muted"
                      >
                        {f.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <Badge variant={venue.isAvailable ? 'success' : 'danger'}>
                    {venue.isAvailable ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-right">
                  <Button
                    variant={venue.isAvailable ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => onToggleStatusTrigger(venue)}
                  >
                    {venue.isAvailable ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
