import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TableToolbar } from "@/components/ui/table-toolbar";
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
} from "recharts";
import {
	Building2,
	BookOpen,
	Clock,
	AlertTriangle,
	Loader2,
} from "lucide-react";
import type {
	HoldRateAnalytics,
	VenueUtilizationAnalytics,
	DiscrepancyAnalytics,
	Department,
} from "@/types";
import type { DashboardSummaryCounts } from "@/api/main/dashboardAPI";

interface DashboardViewProps {
	holdRate?: HoldRateAnalytics;
	holdRateLoading?: boolean;
	utilization?: VenueUtilizationAnalytics;
	utilizationLoading?: boolean;
	discrepancies?: DiscrepancyAnalytics;
	discrepanciesLoading?: boolean;
	summaryCounts?: DashboardSummaryCounts;
	countsLoading?: boolean;
	departments?: Department[];
	adminLevel?: string;

	startDate: string;
	onStartDateChange: (val: string) => void;
	endDate: string;
	onEndDateChange: (val: string) => void;
	departmentFilter: string;
	onDepartmentFilterChange: (val: string) => void;
	groupBy: string;
	onGroupByChange: (val: string) => void;
	onResetFilters: () => void;
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#64748b", "#3b82f6"];

export default function DashboardView({
	holdRate,
	holdRateLoading = false,
	utilization,
	utilizationLoading = false,
	discrepancies,
	discrepanciesLoading = false,
	summaryCounts,
	countsLoading = false,
	departments = [],
	adminLevel,
	startDate,
	onStartDateChange,
	endDate,
	onEndDateChange,
	departmentFilter,
	onDepartmentFilterChange,
	groupBy,
	onGroupByChange,
	onResetFilters,
}: DashboardViewProps) {
	const isAnyLoading =
		holdRateLoading ||
		utilizationLoading ||
		discrepanciesLoading ||
		countsLoading;

	const pieData = [
		{
			name: "Approved",
			value: discrepancies?.summary?.byStatus?.approved ?? 0,
		},
		{
			name: "Rejected",
			value: discrepancies?.summary?.byStatus?.rejected ?? 0,
		},
		{ name: "Pending", value: discrepancies?.summary?.byStatus?.pending ?? 0 },
		{
			name: "Withdrawn",
			value: discrepancies?.summary?.byStatus?.withdrawn ?? 0,
		},
	];

	const totalPieValues = pieData.reduce((acc, curr) => acc + curr.value, 0);

	const holdRateBreakdown = holdRate?.breakdown || [];
	const utilizationBreakdown = utilization?.breakdown || [];

	const chartHoldRateData = holdRateBreakdown.map((item) => ({
		...item,
		displayLabel: item.label || item.courseCode || item.key || "Session",
	}));

	const isDeptAdmin = adminLevel === "department";

	const departmentOptions = departments.map((dept) => ({
		label: `${dept.code} - ${dept.name}`,
		value: dept.id,
	}));

	const departmentFilters = !isDeptAdmin
		? [
				{
					id: "department",
					label: "Department",
					value: departmentFilter,
					onChange: onDepartmentFilterChange,
					options: departmentOptions,
				},
			]
		: [];

	const groupByOptions = [
		{ label: "By Course", value: "course" },
		{ label: "By Day", value: "day" },
		{ label: "By Week", value: "week" },
		{ label: "By Month", value: "month" },
		...(!isDeptAdmin ? [{ label: "By Department", value: "department" }] : []),
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<Text variant="h3" weight="bold" className="text-text-main">
						Dashboard & Analytics
					</Text>
					<Text variant="body-sm" color="muted">
						Administrative oversight metrics scoped to your institutional level.
					</Text>
				</div>
				{isAnyLoading && (
					<div className="flex items-center gap-2 text-primary text-xs font-medium bg-primary-muted/20 px-3 py-1.5 rounded-full border border-primary/20">
						<Loader2 size={14} className="animate-spin text-primary" />
						<span>Fetching analytics...</span>
					</div>
				)}
			</div>

			{/* 4 Primary Summary Metrics Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Card 1: Total Active Venues */}
				<Card className="p-4 space-y-2 border-l-4 border-primary/20 border-l-primary">
					<div className="flex items-center justify-between text-text-muted">
						<Text variant="overline" className="text-[11px]">
							Total Active Venues
						</Text>
						<Building2 size={18} className="text-primary" />
					</div>
					{countsLoading ? (
						<div className="flex items-baseline justify-between pt-1">
							<Skeleton className="h-7 w-24" />
							<Skeleton className="h-5 w-16" />
						</div>
					) : (
						<div className="flex items-baseline justify-between">
							<Text variant="h4" weight="bold">
								{summaryCounts?.totalVenues ??
									utilization?.summary?.totalVenues ??
									0}{" "}
								Venues
							</Text>
							<Badge variant="success">Operational</Badge>
						</div>
					)}
				</Card>

				{/* Card 2: Active Courses Registered */}
				<Card className="p-4 space-y-2 border-l-4 border-blue-600/20 border-l-blue-600">
					<div className="flex items-center justify-between text-text-muted">
						<Text variant="overline" className="text-[11px]">
							Active Courses Registered
						</Text>
						<BookOpen size={18} className="text-blue-600" />
					</div>
					{countsLoading ? (
						<div className="flex items-baseline justify-between pt-1">
							<Skeleton className="h-7 w-24" />
							<Skeleton className="h-5 w-16" />
						</div>
					) : (
						<div className="flex items-baseline justify-between">
							<Text variant="h4" weight="bold">
								{summaryCounts?.activeCourses ?? 0} Courses
							</Text>
							<Text variant="caption" color="muted">
								Catalog Scope
							</Text>
						</div>
					)}
				</Card>

				{/* Card 3: Pending Discrepancy Queue */}
				<Card className="p-4 space-y-2 border-l-4 border-amber-500/20 border-l-amber-500">
					<div className="flex items-center justify-between text-text-muted">
						<Text variant="overline" className="text-[11px]">
							Pending Discrepancy Queue
						</Text>
						<Clock size={18} className="text-amber-500" />
					</div>
					{countsLoading ? (
						<div className="flex items-baseline justify-between pt-1">
							<Skeleton className="h-7 w-24" />
							<Skeleton className="h-5 w-16" />
						</div>
					) : (
						<div className="flex items-baseline justify-between">
							<Text variant="h4" weight="bold">
								{summaryCounts?.pendingDiscrepancies ??
									discrepancies?.summary?.byStatus?.pending ??
									0}{" "}
								Pending
							</Text>
							<Badge variant="warning">Requires Action</Badge>
						</div>
					)}
				</Card>

				{/* Card 4: Unreported Session Flags */}
				<Card className="p-4 space-y-2 border-l-4 border-danger/20 border-l-danger">
					<div className="flex items-center justify-between text-text-muted">
						<Text variant="overline" className="text-[11px]">
							Unreported Session Flags
						</Text>
						<AlertTriangle size={18} className="text-danger" />
					</div>
					{countsLoading ? (
						<div className="flex items-baseline justify-between pt-1">
							<Skeleton className="h-7 w-24" />
							<Skeleton className="h-5 w-16" />
						</div>
					) : (
						<div className="flex items-baseline justify-between">
							<Text variant="h4" weight="bold">
								{summaryCounts?.unreportedFlags ?? 0} Unresolved
							</Text>
							<Badge variant="danger">Flagged</Badge>
						</div>
					)}
				</Card>
			</div>

			{/* Filter Bar */}
			<TableToolbar
				startDate={startDate}
				onStartDateChange={onStartDateChange}
				endDate={endDate}
				onEndDateChange={onEndDateChange}
				groupBy={groupBy}
				onGroupByChange={onGroupByChange}
				groupByOptions={groupByOptions}
				filters={departmentFilters}
				onResetFilters={onResetFilters}
			/>

			{/* Analytics Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Lecture-Hold Rate Chart */}
				<Card className="p-5 space-y-4 lg:col-span-1">
					<div>
						{holdRateLoading ? (
							<div className="space-y-1">
								<Skeleton className="h-6 w-48" />
								<Skeleton className="h-4 w-64" />
							</div>
						) : (
							<>
								<Text variant="h6" weight="bold">
									Lecture-Hold Rate (
									{holdRate?.summary?.holdRatePercentage ?? 0}%)
								</Text>
								<Text variant="caption" color="muted">
									Held: {holdRate?.summary?.heldCount ?? 0} | Not Held:{" "}
									{holdRate?.summary?.notHeldCount ?? 0} | Undefined:{" "}
									{holdRate?.summary?.unreportedCount ?? 0}
								</Text>
							</>
						)}
					</div>
					<div className="h-64">
						{holdRateLoading ? (
							<div className="h-full flex items-end gap-3 px-4 pt-4">
								<Skeleton className="w-full h-2/3" />
								<Skeleton className="w-full h-4/5" />
								<Skeleton className="w-full h-1/2" />
								<Skeleton className="w-full h-3/4" />
								<Skeleton className="w-full h-3/5" />
							</div>
						) : chartHoldRateData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={chartHoldRateData}>
									<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
									<XAxis dataKey="displayLabel" tick={{ fontSize: 11 }} />
									<YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
									<Tooltip />
									<Bar
										dataKey="heldCount"
										name="Held"
										fill="#10b981"
										radius={[4, 4, 0, 0]}
									/>
									<Bar
										dataKey="notHeldCount"
										name="Not Held"
										fill="#ef4444"
										radius={[4, 4, 0, 0]}
									/>
									<Bar
										dataKey="unreportedCount"
										name="Undefined / Unreported"
										fill="#f59e0b"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full flex items-center justify-center text-text-subtle text-xs border border-dashed border-border/50 rounded-xl">
								No past lecture sessions recorded in this period.
							</div>
						)}
					</div>
				</Card>

				{/* Venue Utilization Bar Chart */}
				<Card className="p-5 space-y-4 lg:col-span-1">
					<div>
						{utilizationLoading ? (
							<div className="space-y-1">
								<Skeleton className="h-6 w-48" />
								<Skeleton className="h-4 w-64" />
							</div>
						) : (
							<>
								<Text variant="h6" weight="bold">
									Venue Utilization (
									{utilization?.summary?.totalBookedHours ?? 0} Total Hours)
								</Text>
								<Text variant="caption" color="muted">
									Total session hours booked per venue in selected period.
								</Text>
							</>
						)}
					</div>
					<div className="h-64">
						{utilizationLoading ? (
							<div className="h-full flex items-end gap-4 px-4 pt-4">
								<Skeleton className="w-full h-1/3" />
								<Skeleton className="w-full h-2/3" />
								<Skeleton className="w-full h-full" />
								<Skeleton className="w-full h-1/2" />
								<Skeleton className="w-full h-3/4" />
							</div>
						) : utilizationBreakdown.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={utilizationBreakdown}>
									<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
									<XAxis dataKey="venueName" tick={{ fontSize: 10 }} />
									<YAxis tick={{ fontSize: 11 }} />
									<Tooltip />
									<Bar
										dataKey="totalBookedHours"
										fill="#3b82f6"
										radius={[6, 6, 0, 0]}
										name="Booked Hours"
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full flex items-center justify-center text-text-subtle text-xs border border-dashed border-border/50 rounded-xl">
								No venue utilization records found in this period.
							</div>
						)}
					</div>
				</Card>

				{/* Discrepancy Frequency Pie Chart */}
				<Card className="p-5 space-y-4 lg:col-span-1">
					<div>
						{discrepanciesLoading ? (
							<div className="space-y-1">
								<Skeleton className="h-6 w-56" />
								<Skeleton className="h-4 w-40" />
							</div>
						) : (
							<>
								<Text variant="h6" weight="bold">
									Discrepancy Resolution Breakdown (
									{discrepancies?.summary?.totalDiscrepancies ?? 0} Total)
								</Text>
								<Text variant="caption" color="muted">
									Approved: {discrepancies?.summary?.byStatus?.approved ?? 0} |
									Rejected: {discrepancies?.summary?.byStatus?.rejected ?? 0} |
									Pending: {discrepancies?.summary?.byStatus?.pending ?? 0} |
									Withdrawn: {discrepancies?.summary?.byStatus?.withdrawn ?? 0}
								</Text>
							</>
						)}
					</div>
					<div className="h-64 flex items-center justify-center">
						{discrepanciesLoading ? (
							<div className="h-full w-full flex items-center justify-center">
								<Skeleton className="w-36 h-36 rounded-full" />
							</div>
						) : totalPieValues > 0 ? (
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
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full w-full flex items-center justify-center text-text-subtle text-xs border border-dashed border-border/50 rounded-xl">
								No discrepancy requests submitted in this period.
							</div>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
