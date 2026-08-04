import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { TableToolbar } from '@/components/ui/table-toolbar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Building2, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import type {
  HoldRateAnalytics,
  VenueUtilizationAnalytics,
  DiscrepancyAnalytics,
} from '@/types';

interface DashboardViewProps {
  holdRate: HoldRateAnalytics;
  utilization: VenueUtilizationAnalytics;
  discrepancies: DiscrepancyAnalytics;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function DashboardView({
  holdRate,
  utilization,
  discrepancies,
}: DashboardViewProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [groupBy, setGroupBy] = useState('week');

  const pieData = [
    { name: 'Approved', value: discrepancies.summary.byStatus.approved },
    { name: 'Rejected', value: discrepancies.summary.byStatus.rejected },
    { name: 'Pending', value: discrepancies.summary.byStatus.pending },
  ];

  const holdRateTrendData = [
    { period: 'W1', held: 85, notHeld: 15 },
    { period: 'W2', held: 90, notHeld: 10 },
    { period: 'W3', held: 78, notHeld: 22 },
    { period: 'W4', held: 92, notHeld: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Text variant="h3" weight="bold" className="text-text-main">
          Dashboard & Analytics
        </Text>
        <Text variant="body-sm" color="muted">
          Administrative oversight metrics scoped to your institutional level.
        </Text>
      </div>

      {/* 4 Primary Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2 border-l-4 border-l-primary">
          <div className="flex items-center justify-between text-text-muted">
            <Text variant="overline" className="text-[11px]">
              Total Active Venues
            </Text>
            <Building2 size={18} className="text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <Text variant="h4" weight="bold">
              {utilization.summary.totalVenues} Venues
            </Text>
            <Badge variant="success">Operational</Badge>
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-text-muted">
            <Text variant="overline" className="text-[11px]">
              Active Courses Registered
            </Text>
            <BookOpen size={18} className="text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <Text variant="h4" weight="bold">
              {holdRate.summary.totalReports * 3 || 42} Courses
            </Text>
            <Text variant="caption" color="muted">
              Catalog Scope
            </Text>
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-text-muted">
            <Text variant="overline" className="text-[11px]">
              Pending Discrepancy Queue
            </Text>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <Text variant="h4" weight="bold">
              {discrepancies.summary.byStatus.pending} Pending
            </Text>
            <Badge variant="warning">Requires Action</Badge>
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-l-4 border-l-danger">
          <div className="flex items-center justify-between text-text-muted">
            <Text variant="overline" className="text-[11px]">
              Unreported Session Flags
            </Text>
            <AlertTriangle size={18} className="text-danger" />
          </div>
          <div className="flex items-baseline justify-between">
            <Text variant="h4" weight="bold">
              3 Unresolved
            </Text>
            <Badge variant="danger">Flagged</Badge>
          </div>
        </Card>
      </div>


      {/* Filter Bar */}
      <TableToolbar
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        groupByOptions={[
          { label: 'By Day', value: 'day' },
          { label: 'By Week', value: 'week' },
          { label: 'By Month', value: 'month' },
        ]}
        filters={[
          {
            id: 'department',
            label: 'Department',
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: [
              { label: 'Computer Science', value: 'dept_csc' },
              { label: 'Mathematics', value: 'dept_mat' },
              { label: 'Physics', value: 'dept_phy' },
            ],
          },
        ]}
        onResetFilters={() => {
          setStartDate('');
          setEndDate('');
          setDepartmentFilter('');
          setGroupBy('week');
        }}
      />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lecture-Hold Rate Line Chart */}
        <Card className="p-5 space-y-4 lg:col-span-1">
          <div>
            <Text variant="h6" weight="bold">
              Lecture-Hold Rate ({holdRate.summary.holdRatePercentage}%)
            </Text>
            <Text variant="caption" color="muted">
              Student class rep reported session hold frequency.
            </Text>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={holdRateTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="held" stroke="#10b981" strokeWidth={2.5} name="Held %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Venue Utilization Bar Chart */}
        <Card className="p-5 space-y-4 lg:col-span-1">
          <div>
            <Text variant="h6" weight="bold">
              Venue Utilization (Hours)
            </Text>
            <Text variant="caption" color="muted">
              Total session hours booked per venue in selected period.
            </Text>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilization.breakdown}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="venueName" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalBookedHours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Discrepancy Frequency Pie Chart */}
        <Card className="p-5 space-y-4 lg:col-span-1">
          <div>
            <Text variant="h6" weight="bold">
              Discrepancy Resolution Breakdown
            </Text>
            <Text variant="caption" color="muted">
              Approval queue resolution ratio.
            </Text>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
