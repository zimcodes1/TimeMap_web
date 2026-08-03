import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Users as UsersIcon, ShieldAlert, KeyRound } from 'lucide-react';
import type { User, UserRole } from '@/types';

interface UsersViewProps {
  admins: User[];
  lecturers: User[];
  students: User[];
  onOpenCreateUser: () => void;
  onOpenResetPassword: (user: User) => void;
}

export default function UsersView({
  admins,
  lecturers,
  students,
  onOpenCreateUser,
  onOpenResetPassword,
}: UsersViewProps) {
  const [activeTab, setActiveTab] = useState<UserRole>('admin');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="h3" weight="bold" className="text-text-main">
            User & Staff Directory
          </Text>
          <Text variant="body-sm" color="muted">
            Manage admin officers, lecturers, and student class rep accounts.
          </Text>
        </div>
        <Button variant="primary" size="sm" onClick={onOpenCreateUser}>
          <Plus size={16} className="mr-1" /> Create User Account
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'admin'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <ShieldAlert size={16} /> Admins ({admins.length})
        </button>
        <button
          onClick={() => setActiveTab('lecturer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'lecturer'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <UsersIcon size={16} /> Lecturers ({lecturers.length})
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'student'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
            }`}
        >
          <UsersIcon size={16} /> Students & Reps ({students.length})
        </button>
      </div>

      {/* Table */}
      <Card className="p-4 overflow-x-auto">
        {activeTab === 'admin' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Identifier / Name</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Scope Level</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {admins.map((usr) => (
                <tr key={usr.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <div className="font-bold text-primary">{usr.name}</div>
                    <div className="text-xs text-text-muted">{usr.identifier}</div>
                  </td>
                  <td className="py-3 px-2 text-xs text-text-main">{usr.email}</td>
                  <td className="py-3 px-2">
                    <Badge variant="default" className="capitalize">
                      {usr.adminLevel || 'department'}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={usr.isActive ? 'success' : 'danger'}>
                      {usr.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Button variant="outline" size="sm" onClick={() => onOpenResetPassword(usr)}>
                      <KeyRound size={14} className="mr-1" /> Reset Password
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {activeTab === 'lecturer' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Staff ID / Name</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Department</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {lecturers.map((usr) => (
                <tr key={usr.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <div className="font-bold text-primary">{usr.name}</div>
                    <div className="text-xs text-text-muted">{usr.staffId || usr.identifier}</div>
                  </td>
                  <td className="py-3 px-2 text-xs text-text-main">{usr.email}</td>
                  <td className="py-3 px-2 text-xs font-semibold text-text-main">
                    {usr.departmentName || 'Computer Science'}
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={usr.isActive ? 'success' : 'danger'}>
                      {usr.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Button variant="outline" size="sm" onClick={() => onOpenResetPassword(usr)}>
                      <KeyRound size={14} className="mr-1" /> Reset Password
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {activeTab === 'student' && (
          <Table>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-2">Matric No / Name</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Department / Level</th>
                <th className="py-3 px-2">Class Rep Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {students.map((usr) => (
                <tr key={usr.id} className="hover:bg-surface-raised transition-colors">
                  <td className="py-3 px-2 font-medium">
                    <div className="font-bold text-primary">{usr.name}</div>
                    <div className="text-xs text-text-muted">{usr.matricNumber || usr.identifier}</div>
                  </td>
                  <td className="py-3 px-2 text-xs text-text-main">{usr.email}</td>
                  <td className="py-3 px-2 text-xs font-semibold text-text-main">
                    {usr.departmentName || 'CSC'} • {usr.level || 300}L
                  </td>
                  <td className="py-3 px-2">
                    {usr.isClassRep ? (
                      <Badge variant="success">CLASS REP</Badge>
                    ) : (
                      <Badge variant="default">STUDENT</Badge>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Button variant="outline" size="sm" onClick={() => onOpenResetPassword(usr)}>
                      <KeyRound size={14} className="mr-1" /> Reset Password
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
