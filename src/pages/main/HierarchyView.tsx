import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Plus, Building2, School as SchoolIcon, Network } from 'lucide-react';
import type { School, Faculty, Department } from '@/types';

interface HierarchyViewProps {
  schools: School[];
  faculties: Faculty[];
  departments: Department[];
  onOpenCreateSchool: () => void;
  onOpenCreateFaculty: () => void;
  onOpenCreateDepartment: () => void;
}

export default function HierarchyView({
  schools,
  faculties,
  departments,
  onOpenCreateSchool,
  onOpenCreateFaculty,
  onOpenCreateDepartment,
}: HierarchyViewProps) {
  const [activeTab, setActiveTab] = useState<'schools' | 'faculties' | 'departments'>('departments');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            Hierarchy Management
          </Text>
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

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'departments'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <Building2 size={16} /> Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('faculties')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'faculties'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <Network size={16} /> Faculties ({faculties.length})
        </button>
        <button
          onClick={() => setActiveTab('schools')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'schools'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <SchoolIcon size={16} /> Schools ({schools.length})
        </button>
      </div>

      {/* Content Tables */}
      <Card className="p-4 overflow-x-auto">
        {activeTab === 'departments' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Code</th>
                <th className="py-3 px-2">Department Name</th>
                <th className="py-3 px-2">Parent Faculty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-bold text-primary">{dept.code}</td>
                  <td className="py-3 px-2 font-medium">{dept.name}</td>
                  <td className="py-3 px-2 text-text-muted">{dept.facultyName || 'FNS'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {activeTab === 'faculties' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Code</th>
                <th className="py-3 px-2">Faculty Name</th>
                <th className="py-3 px-2">Parent School</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {faculties.map((fac) => (
                <tr key={fac.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-bold text-primary">{fac.code}</td>
                  <td className="py-3 px-2 font-medium">{fac.name}</td>
                  <td className="py-3 px-2 text-text-muted">{fac.schoolName}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {activeTab === 'schools' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Code</th>
                <th className="py-3 px-2">School Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {schools.map((sch) => (
                <tr key={sch.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-bold text-primary">{sch.code}</td>
                  <td className="py-3 px-2 font-medium">{sch.name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
