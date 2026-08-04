import { useState } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabSwitcher } from '@/components/ui/tabs';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { DataTable } from '@/components/ui/data-table';
import { OrgTree } from '@/components/elements/OrgTree';
import { Plus, Building2, School as SchoolIcon, Network, GitMerge, Edit2, Trash2 } from 'lucide-react';
import type { School, Faculty, Department } from '@/types';

interface HierarchyViewProps {
  schools: School[];
  faculties: Faculty[];
  departments: Department[];
  onOpenCreateSchool: () => void;
  onOpenCreateFaculty: () => void;
  onOpenCreateDepartment: () => void;
  onEditSchool: (school: School) => void;
  onEditFaculty: (faculty: Faculty) => void;
  onEditDepartment: (dept: Department) => void;
  onDeleteTrigger: (id: string, name: string, type: 'School' | 'Faculty' | 'Department') => void;
}

export default function HierarchyView({
  schools,
  faculties,
  departments,
  onOpenCreateSchool,
  onOpenCreateFaculty,
  onOpenCreateDepartment,
  onEditSchool,
  onEditFaculty,
  onEditDepartment,
  onDeleteTrigger,
}: HierarchyViewProps) {
  const [activeTab, setActiveTab] = useState<'departments' | 'faculties' | 'schools' | 'tree'>('departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter lists based on search query
  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.facultyName && d.facultyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFaculties = faculties.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.schoolName && f.schoolName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Text variant="h3" weight="bold" className="text-text-main">
              Hierarchy Management
            </Text>
            <Badge variant="primary" className="text-xs">
              Scope: University Wide
            </Badge>
          </div>
          <Text variant="body-sm" color="muted">
            Institutional structure tree — Schools, Faculties, and Departments.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'schools' && (
            <Button variant="primary" size="sm" onClick={onOpenCreateSchool}>
              <Plus size={16} className="mr-1" /> Add School
            </Button>
          )}
          {activeTab === 'faculties' && (
            <Button variant="primary" size="sm" onClick={onOpenCreateFaculty}>
              <Plus size={16} className="mr-1" /> Add Faculty
            </Button>
          )}
          {activeTab === 'departments' && (
            <Button variant="primary" size="sm" onClick={onOpenCreateDepartment}>
              <Plus size={16} className="mr-1" /> Add Department
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs with styling */}
      <TabSwitcher
        tabs={[
          { id: 'departments', label: 'Departments', icon: Building2, count: departments.length },
          { id: 'faculties', label: 'Faculties', icon: Network, count: faculties.length },
          { id: 'schools', label: 'Schools', icon: SchoolIcon, count: schools.length },
          { id: 'tree', label: 'Organizational Tree View', icon: GitMerge },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab as typeof activeTab);
          setCurrentPage(1);
        }}
      />

      {/* Organizational Tree View */}
      {activeTab === 'tree' ? (
        <OrgTree schools={schools} faculties={faculties} departments={departments} />
      ) : (
        <div className="space-y-4">
          {/* Table Toolbar */}
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={`Search ${activeTab}...`}
            totalCount={
              activeTab === 'departments'
                ? departments.length
                : activeTab === 'faculties'
                  ? faculties.length
                  : schools.length
            }
            filteredCount={
              activeTab === 'departments'
                ? filteredDepartments.length
                : activeTab === 'faculties'
                  ? filteredFaculties.length
                  : filteredSchools.length
            }
          />

          {/* Departments Table */}
          {activeTab === 'departments' && (
            <DataTable
              columns={[
                {
                  header: 'Department Code',
                  accessor: (dept: Department) => (
                    <span className="font-bold text-primary">{dept.code}</span>
                  ),
                },
                {
                  header: 'Department Name',
                  accessor: (dept: Department) => <span className="font-medium">{dept.name}</span>,
                },
                {
                  header: 'Parent Faculty',
                  accessor: (dept: Department) => (
                    <span className="text-text-muted">{dept.facultyName || 'FNS'}</span>
                  ),
                },
                {
                  header: 'Actions',
                  align: 'right',
                  accessor: (dept: Department) => (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditDepartment(dept)}
                        className="h-8 px-2"
                      >
                        <Edit2 size={14} className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteTrigger(dept.id, dept.name, 'Department')}
                        className="h-8 px-2 text-danger hover:bg-danger-surface border-danger-surface"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={filteredDepartments}
              keyExtractor={(d) => d.id}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Faculties Table */}
          {activeTab === 'faculties' && (
            <DataTable
              columns={[
                {
                  header: 'Faculty Code',
                  accessor: (fac: Faculty) => (
                    <span className="font-bold text-primary">{fac.code}</span>
                  ),
                },
                {
                  header: 'Faculty Name',
                  accessor: (fac: Faculty) => <span className="font-medium">{fac.name}</span>,
                },
                {
                  header: 'Parent School',
                  accessor: (fac: Faculty) => (
                    <span className="text-text-muted">{fac.schoolName}</span>
                  ),
                },
                {
                  header: 'Actions',
                  align: 'right',
                  accessor: (fac: Faculty) => (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditFaculty(fac)}
                        className="h-8 px-2"
                      >
                        <Edit2 size={14} className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteTrigger(fac.id, fac.name, 'Faculty')}
                        className="h-8 px-2 text-danger hover:bg-danger-surface border-danger-surface"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={filteredFaculties}
              keyExtractor={(f) => f.id}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Schools Table */}
          {activeTab === 'schools' && (
            <DataTable
              columns={[
                {
                  header: 'School Code',
                  accessor: (sch: School) => (
                    <span className="font-bold text-primary">{sch.code}</span>
                  ),
                },
                {
                  header: 'School Name',
                  accessor: (sch: School) => <span className="font-medium">{sch.name}</span>,
                },
                {
                  header: 'Actions',
                  align: 'right',
                  accessor: (sch: School) => (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditSchool(sch)}
                        className="h-8 px-2"
                      >
                        <Edit2 size={14} className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteTrigger(sch.id, sch.name, 'School')}
                        className="h-8 px-2 text-danger hover:bg-danger-surface border-danger-surface"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={filteredSchools}
              keyExtractor={(s) => s.id}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
