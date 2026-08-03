import DashboardView from '@/pages/main/DashboardView';
import {
  mockHoldRateAnalytics,
  mockVenueUtilizationAnalytics,
  mockDiscrepancyAnalytics,
} from '@/constants/mockData';

export default function DashboardContainer() {
  return (
    <DashboardView
      holdRate={mockHoldRateAnalytics}
      utilization={mockVenueUtilizationAnalytics}
      discrepancies={mockDiscrepancyAnalytics}
    />
  );
}
