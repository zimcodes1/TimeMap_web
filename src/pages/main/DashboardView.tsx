import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
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
	Faculty,
	Program,
	Semester,
} from "@/types";
import type { DashboardSummaryCounts } from "@/api/main/dashboardAPI";
import HoldRateLineChart from "@/components/dashboard/HoldRateLineChart";
import VenueUtilizationCard from "@/components/dashboard/VenueUtilizationCard";
import DashboardScopeFilterBar from "@/components/dashboard/DashboardScopeFilterBar";
import DetailedAnalyticsBanner from "@/components/dashboard/DetailedAnalyticsBanner";

interface DashboardViewProps {
	holdRate?: HoldRateAnalytics;
	holdRateLoading?: boolean;
	utilization?: VenueUtilizationAnalytics;
	utilizationLoading?: boolean;
	discrepancies?: DiscrepancyAnalytics;
	discrepanciesLoading?: boolean;
	summaryCounts?: DashboardSummaryCounts;
	countsLoading?: boolean;
	departments: Department[];
	faculties: Faculty[];
	programs: Program[];
	adminLevel?: string;
	activeSemester?: Semester;

	selectedFacultyId: string;
	onFacultyChange: (id: string) => void;
	selectedDepartmentId: string;
	onDepartmentChange: (id: string) => void;
	selectedProgramId: string;
	onProgramChange: (id: string) => void;
	selectedLevel: string;
	onLevelChange: (lvl: string) => void;
	maxLevel?: number;
	currentWeekLabel?: string;
	onResetFilters: () => void;
}

const PIE_COLORS = ["#10b981", "#ef4444", "#f59e0b", "#64748b", "#3b82f6"];

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
	faculties = [],
	programs = [],
	adminLevel,
	activeSemester,
	selectedFacultyId,
	onFacultyChange,
	selectedDepartmentId,
	onDepartmentChange,
	selectedProgramId,
	onProgramChange,
	selectedLevel,
	onLevelChange,
	maxLevel,
	currentWeekLabel,
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

	const activeDept = departments.find(
		(d) => String(d.id) === String(selectedDepartmentId),
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<Text variant="h3" weight="bold" className="text-text-main">
						Dashboard & Academic Overview
					</Text>
					<Text variant="body-sm" color="muted">
						Administrative metrics and session compliance scoped to your
						institutional role.
					</Text>
				</div>
				<div className="flex items-center gap-3">
					{activeSemester && (
						<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border text-xs">
							<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
							<span className="font-semibold text-text-main">
								{activeSemester.sessionLabel
									? `${activeSemester.sessionLabel} • `
									: ""}
								{activeSemester.name === "first"
									? "1st Semester"
									: "2nd Semester"}
							</span>
							<Badge
								variant="success"
								className="text-[10px] uppercase font-bold py-0 px-1.5"
							>
								Active
							</Badge>
						</div>
					)}
					{isAnyLoading && (
						<div className="flex items-center gap-2 text-primary text-xs font-medium bg-primary-muted/20 px-3 py-1.5 rounded-full border border-primary/20">
							<Loader2 size={14} className="animate-spin text-primary" />
							<span>Refreshing...</span>
						</div>
					)}
				</div>
			</div>

			{/* 4 Primary Summary Metrics Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Card 1: Total Active Venues */}
				<Card className="p-4 space-y-2 border-l-4 border-primary/20 border-l-primary">
					<div className="flex items-center justify-between text-text-muted">
						<Text variant="overline" className="text-[11px]">
							Active Venues
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
							Active Courses
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
								Semester Scope
							</Text>
						</div>
					)}
				</Card>

				{/* Card 3: Pending Discrepancies */}
				<Card className="p-4 space-y-2 border-l-4 border-amber-500/20 border-l-amber-500">
					<div className="flex items-center justify-between text-text-muted">
						<Text variant="overline" className="text-[11px]">
							Discrepancy Queue
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
							Unreported Sessions
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

			{/* Scope-Level Aware Filter Bar */}
			<DashboardScopeFilterBar
				adminLevel={adminLevel}
				faculties={faculties}
				selectedFacultyId={selectedFacultyId}
				onFacultyChange={onFacultyChange}
				departments={departments}
				selectedDepartmentId={selectedDepartmentId}
				onDepartmentChange={onDepartmentChange}
				programs={programs}
				selectedProgramId={selectedProgramId}
				onProgramChange={onProgramChange}
				selectedLevel={selectedLevel}
				onLevelChange={onLevelChange}
				maxLevel={maxLevel}
				currentWeekLabel={currentWeekLabel}
				onResetFilters={onResetFilters}
			/>

			{/* Analytics Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* 1. Lecture-Hold Rate Line Chart */}
				<HoldRateLineChart holdRate={holdRate} isLoading={holdRateLoading} />

				{/* 2. Venue Utilization (Faculty aggregates for School Admin, Dept scoped otherwise) */}
				<VenueUtilizationCard
					utilization={utilization}
					isLoading={utilizationLoading}
					departmentName={activeDept ? activeDept.name : undefined}
					adminLevel={adminLevel}
				/>

				{/* 3. Discrepancy Resolution Breakdown */}
				<Card className="p-5 space-y-4 lg:col-span-2">
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
										outerRadius={80}
										paddingAngle={5}
										dataKey="value"
										label={({
											name,
											percent,
										}: {
											name?: string;
											percent?: number;
										}) =>
											`${name ?? ""}: ${((percent ?? 0) * 100).toFixed(0)}%`
										}
									>
										{pieData.map((_, index) => (
											<Cell
												key={`cell-${index}`}
												fill={PIE_COLORS[index % PIE_COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full w-full flex items-center justify-center text-text-subtle text-xs border border-dashed border-border/50 rounded-xl p-4 text-center">
								No discrepancy requests submitted in this period.
							</div>
						)}
					</div>
				</Card>
			</div>

			{/* Link to Detailed Analytics */}
			<DetailedAnalyticsBanner adminLevel={adminLevel} />
		</div>
	);
}
