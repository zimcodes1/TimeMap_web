import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Plus } from 'lucide-react';
import type { Facility } from '@/types';

interface FacilitiesGridSectionProps {
  facilities: Facility[];
  onOpenCreateFacility: () => void;
}

export default function FacilitiesGridSection({
  facilities,
  onOpenCreateFacility,
}: FacilitiesGridSectionProps) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Text variant="h6" weight="bold">
            Available Facility Tags ({facilities.length})
          </Text>
          <Text variant="caption" color="muted">
            Registry of equipment and features assignable to venues.
          </Text>
        </div>
        <Button variant="primary" size="sm" onClick={onOpenCreateFacility}>
          <Plus size={16} className="mr-1" /> Add New Facility Tag
        </Button>
      </div>

      {facilities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="p-3 bg-surface-raised border border-border rounded-xl flex items-center justify-between hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Tag size={16} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-text-main truncate">{fac.name}</div>
                  <div className="text-[11px] text-text-muted">ID: {fac.id}</div>
                </div>
              </div>
              <Badge variant="default" className="shrink-0">
                Tag
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 px-4 text-center">
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
            <div className="p-3 rounded-full bg-surface-raised border border-border text-text-subtle">
              <Tag size={32} />
            </div>
            <Text variant="h6" weight="bold" className="text-text-main">
              No Facility Tags Found
            </Text>
            <Text variant="body-sm" color="muted">
              No facility tags have been created yet. Click 'Add New Facility Tag' to create one.
            </Text>
          </div>
        </div>
      )}
    </Card>
  );
}
