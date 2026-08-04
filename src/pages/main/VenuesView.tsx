import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabSwitcher } from '@/components/ui/tabs';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Tag, MapPin, Edit2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { Venue, Facility } from '@/types';

interface VenuesViewProps {
  venues: Venue[];
  facilities: Facility[];
  onOpenCreateVenue: () => void;
  onOpenCreateFacility: () => void;
  onEditVenue: (venue: Venue) => void;
  onToggleStatusTrigger: (venue: Venue) => void;
}

export default function VenuesView({
  venues,
  facilities,
  onOpenCreateVenue,
  onOpenCreateFacility,
  onEditVenue,
  onToggleStatusTrigger,
}: VenuesViewProps) {
  const [activeTab, setActiveTab] = useState<'venues' | 'facilities'>('venues');
  const [searchQuery, setSearchQuery] = useState('');
  const [venueTypeFilter, setVenueTypeFilter] = useState('');
  const [owningLevelFilter, setOwningLevelFilter] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter venues
  const filteredVenues = venues.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.code && v.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.building && v.building.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = !venueTypeFilter || v.venueType === venueTypeFilter;
    const matchesLevel = !owningLevelFilter || v.owningLevel === owningLevelFilter;
    const matchesFacility =
      !facilityFilter || v.facilities.some((f) => f.id === facilityFilter || f.name === facilityFilter);

    return matchesSearch && matchesType && matchesLevel && matchesFacility;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Button variant="outline" size="sm" onClick={onOpenCreateFacility}>
            <Tag size={16} className="mr-1" /> Add Facility Tag
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenCreateVenue}>
            <Plus size={16} className="mr-1" /> Create Venue
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <TabSwitcher
        tabs={[
          { id: 'venues', label: 'Venues Registry', icon: MapPin, count: venues.length },
          { id: 'facilities', label: 'Facility Tags', icon: Tag, count: facilities.length },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab as typeof activeTab);
          setCurrentPage(1);
        }}
      />

      {activeTab === 'venues' ? (
        <div className="space-y-4">
          {/* Table Toolbar */}
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search venue by name, code, or building..."
            totalCount={venues.length}
            filteredCount={filteredVenues.length}
            filters={[
              {
                id: 'venueType',
                label: 'Type',
                value: venueTypeFilter,
                onChange: setVenueTypeFilter,
                options: [
                  { label: 'Lecture Hall', value: 'lecture_hall' },
                  { label: 'Laboratory', value: 'lab' },
                  { label: 'Auditorium', value: 'auditorium' },
                  { label: 'Classroom', value: 'classroom' },
                ],
              },
              {
                id: 'owningLevel',
                label: 'Owning Scope',
                value: owningLevelFilter,
                onChange: setOwningLevelFilter,
                options: [
                  { label: 'University Wide', value: 'university' },
                  { label: 'School Level', value: 'school' },
                  { label: 'Faculty Level', value: 'faculty' },
                  { label: 'Department Level', value: 'department' },
                ],
              },
              {
                id: 'facility',
                label: 'Facility',
                value: facilityFilter,
                onChange: setFacilityFilter,
                options: facilities.map((f) => ({ label: f.name, value: f.id })),
              },
            ]}
            onResetFilters={() => {
              setSearchQuery('');
              setVenueTypeFilter('');
              setOwningLevelFilter('');
              setFacilityFilter('');
            }}
          />

          {/* Venues DataTable */}
          <DataTable
            columns={[
              {
                header: 'Venue Code & Name',
                accessor: (v: Venue) => (
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary-muted text-primary shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-text-main">{v.name}</div>
                      <div className="text-xs text-text-muted">{v.code || 'No Code'}</div>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Type & Location',
                accessor: (v: Venue) => (
                  <div className="text-xs">
                    <div className="font-semibold text-text-main capitalize">
                      {v.venueType?.replace('_', ' ') || 'Lecture Hall'}
                    </div>
                    <div className="text-text-muted">{v.building || 'Main Campus'}</div>
                  </div>
                ),
              },
              {
                header: 'Capacities',
                accessor: (v: Venue) => (
                  <div className="text-xs">
                    <div>
                      Lecture: <span className="font-bold">{v.capacity}</span>
                    </div>
                    <div>
                      Exam: <span className="font-bold">{v.examCapacity || v.capacity}</span>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Owning Scope',
                accessor: (v: Venue) => <Badge className="capitalize">{v.owningLevel}</Badge>,
              },
              {
                header: 'Facilities',
                accessor: (v: Venue) => (
                  <div className="flex flex-wrap gap-1">
                    {v.facilities.map((f) => (
                      <span
                        key={f.id}
                        className="px-2 py-0.5 rounded bg-surface-raised border border-border text-[10px] font-semibold text-text-muted"
                      >
                        {f.name}
                      </span>
                    ))}
                  </div>
                ),
              },
              {
                header: 'Status',
                accessor: (v: Venue) => (
                  <Badge variant={v.isAvailable ? 'success' : 'danger'}>
                    {v.isAvailable ? 'Active' : 'Inactive'}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                align: 'right',
                accessor: (v: Venue) => (
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditVenue(v)}
                      className="h-8 px-2"
                    >
                      <Edit2 size={14} className="mr-1" /> Edit
                    </Button>
                    <Button
                      variant={v.isAvailable ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => onToggleStatusTrigger(v)}
                      className="h-8 px-2.5"
                    >
                      {v.isAvailable ? (
                        <>
                          <ShieldAlert size={14} className="mr-1 text-danger" /> Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} className="mr-1" /> Activate
                        </>
                      )}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={filteredVenues}
            keyExtractor={(v) => v.id}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        /* Facilities Tag Registry Grid */
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="h6" weight="bold">
                Available Facility Tags
              </Text>
              <Text variant="caption" color="muted">
                Registry of equipment and features assignable to venues.
              </Text>
            </div>
            <Button variant="primary" size="sm" onClick={onOpenCreateFacility}>
              <Plus size={16} className="mr-1" /> Add New Facility Tag
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {facilities.map((fac) => (
              <div
                key={fac.id}
                className="p-3 bg-surface-raised border border-border rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Tag size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-text-main">{fac.name}</div>
                    <div className="text-[11px] text-text-muted">ID: {fac.id}</div>
                  </div>
                </div>
                <Badge variant="default">Tag</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
