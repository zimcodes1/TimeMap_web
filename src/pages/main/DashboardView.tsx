import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
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
} from 'recharts';
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

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b'];

export default function DashboardView({
  holdRate,
  utilization,
  discrepancies,
}: DashboardViewProps) {
  const pieData = [
    { name: 'Approved', value: discrepancies.summary.byStatus.approved },
    { name: 'Rejected', value: discrepancies.summary.byStatus.rejected },
    { name: 'Pending', value: discrepancies.summary.byStatus.pending },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Text variant="h3" weight="bold" className="text-text-main">
          Dashboard & Analytics
        </Text>
        <Text variant="body-sm" color="muted">
          Administrative oversight metrics scoped to your organizational level.
        </Text>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2 border-l-4 border-l-primary">
          <Text variant="overline" color="muted" className="text-[11px]">
            Lecture-Hold Rate
          </Text>
          <div className="flex items-baseline justify-between">
            <Text variant="h4" weight="bold">
              {holdRate.summary.holdRatePercentage}%
            </Text>
            <Badge variant="success">
              {holdRate.summary.heldCount}/{holdRate.summary.totalReports} Held
            </Badge>
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-l-4 border-l-blue-600">
          <Text variant="overline" color="muted" className="text-[11px]">
            Total Booked Hours
          </Text>
          <div className="flex items-baseline justify-between">
            <Text variant="h4" weight="bold">
              {utilization.summary.totalBookedHours} hrs
            </Text>
            <Text variant="caption" color="muted">
              {utilization.summary.totalVenues} Venues
            </Text>
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-l-4 border-l-amber-500">
          <Text variant="overline" color="muted" className="text-[11px]">
            Discrepancy Requests
          </Text>
          <div className="flex items-baseline justify-between">
            <Text variant="h4" weight="bold">
              {discrepancies.summary.totalDiscrepancies}
            </Text>
            <Badge variant="warning">
              {discrepancies.summary.byStatus.pending} Pending
            </Badge>
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-l-4 border-l-emerald-600">
          <Text variant="overline" color="muted" className="text-[11px]">
            System Status
          </Text>
          <div className="flex items-baseline justify-between">
            <Text variant="h5" weight="bold" className="text-emerald-600">
              Operational
            </Text>
          </div>
        </Card>
      </div>

      {/* Analytics Visualization Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Venue Utilization Bar Chart */}
        <Card className="p-5 space-y-4">
          <div>
            <Text variant="h6" weight="bold">
              Venue Utilization (Booked Hours)
            </Text>
            <Text variant="caption" color="muted">
              Total session hours booked per venue in current period.
            </Text>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilization.breakdown}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="venueName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalBookedHours" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Discrepancy Breakdown Pie Chart */}
        <Card className="p-5 space-y-4">
          <div>
            <Text variant="h6" weight="bold">
              Discrepancies by Status
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
                  innerRadius={50}
                  outerRadius={80}
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
