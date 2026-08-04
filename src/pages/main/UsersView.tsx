import { useState } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabSwitcher } from '@/components/ui/tabs';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Users as UsersIcon, ShieldAlert, KeyRound, Edit2, ShieldOff, CheckCircle } from 'lucide-react';
import type { User, UserRole } from '@/types';

interface UsersViewProps {
  admins: User[];
  lecturers: User[];
  students: User[];
  onOpenCreateUser: () => void;
  onEditUser: (user: User) => void;
  onOpenResetPassword: (user: User) => void;
  onToggleStatusTrigger: (user: User) => void;
}

export default function UsersView({
  admins,
  lecturers,
  students,
  onOpenCreateUser,
  onEditUser,
  onOpenResetPassword,
  onToggleStatusTrigger,
}: UsersViewProps) {
  const [activeTab, setActiveTab] = useState<UserRole>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const getDataset = () => {
    if (activeTab === 'admin') return admins;
    if (activeTab === 'lecturer') return lecturers;
    return students;
  };

  const rawDataset = getDataset();

  const filteredUsers = rawDataset.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.identifier || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScope = !scopeFilter || u.adminLevel === scopeFilter;
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? u.isActive : !u.isActive);

    return matchesSearch && matchesScope && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            User & Staff Directory
          </Text>
          <Text variant="body-sm" color="muted">
            Manage admin officers, lecturers, and student class rep accounts and role privileges.
          </Text>
        </div>
        <Button variant="primary" size="sm" onClick={onOpenCreateUser}>
          <Plus size={16} className="mr-1" /> Create User Account
        </Button>
      </div>

      {/* Tabs */}
      <TabSwitcher
        tabs={[
          { id: 'admin', label: 'Admin Officers', icon: ShieldAlert, count: admins.length },
          { id: 'lecturer', label: 'Lecturers', icon: UsersIcon, count: lecturers.length },
          { id: 'student', label: 'Students & Reps', icon: UsersIcon, count: students.length },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab as UserRole);
          setCurrentPage(1);
        }}
      />

      {/* Table Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Search ${activeTab}s by name, email, or ID...`}
        totalCount={rawDataset.length}
        filteredCount={filteredUsers.length}
        filters={[
          ...(activeTab === 'admin'
            ? [
                {
                  id: 'adminLevel',
                  label: 'Scope Level',
                  value: scopeFilter,
                  onChange: setScopeFilter,
                  options: [
                    { label: 'University', value: 'university' },
                    { label: 'School', value: 'school' },
                    { label: 'Faculty', value: 'faculty' },
                    { label: 'Department', value: 'department' },
                  ],
                },
              ]
            : []),
          {
            id: 'status',
            label: 'Account Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
        onResetFilters={() => {
          setSearchQuery('');
          setScopeFilter('');
          setStatusFilter('');
        }}
      />

      {/* User DataTable */}
      <DataTable
        columns={[
          {
            header: 'Identifier / Full Name',
            accessor: (u: User) => (
              <div>
                <div className="font-bold text-primary">{u.name}</div>
                <div className="text-xs text-text-muted flex items-center gap-1.5">
                  ID: {u.identifier}
                  {u.requiresPasswordReset && (
                    <Badge variant="warning" className="text-[9px] px-1 py-0">
                      Reset Req.
                    </Badge>
                  )}
                </div>
              </div>
            ),
          },
          {
            header: 'Email Address',
            accessor: (u: User) => <span className="text-xs font-medium">{u.email}</span>,
          },
          {
            header: activeTab === 'admin' ? 'Scope Level' : activeTab === 'lecturer' ? 'Department' : 'Dept / Level',
            accessor: (u: User) => (
              <div className="text-xs">
                {activeTab === 'admin' ? (
                  <Badge variant="default" className="capitalize">
                    {u.adminLevel || 'department'} Level
                  </Badge>
                ) : activeTab === 'lecturer' ? (
                  <span className="font-semibold">{u.departmentName || 'Computer Science'}</span>
                ) : (
                  <div>
                    <span className="font-semibold">{u.departmentName || 'CSC'}</span> •{' '}
                    <span className="font-bold">{u.level || 300}L</span>
                  </div>
                )}
              </div>
            ),
          },
          {
            header: 'Status',
            accessor: (u: User) => (
              <div className="flex items-center gap-1">
                <Badge variant={u.isActive ? 'success' : 'danger'}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {u.isClassRep && <Badge variant="primary">CLASS REP</Badge>}
              </div>
            ),
          },
          {
            header: 'Actions',
            align: 'right',
            accessor: (u: User) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="outline" size="sm" onClick={() => onEditUser(u)} className="h-8 px-2 text-xs">
                  <Edit2 size={14} className="mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenResetPassword(u)}
                  className="h-8 px-2 text-xs"
                >
                  <KeyRound size={14} className="mr-1" /> Reset Pwd
                </Button>
                <Button
                  variant={u.isActive ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => onToggleStatusTrigger(u)}
                  className="h-8 px-2 text-xs"
                >
                  {u.isActive ? <ShieldOff size={14} /> : <CheckCircle size={14} />}
                </Button>
              </div>
            ),
          },
        ]}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
