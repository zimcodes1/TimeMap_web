import React from "react";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts";
import {
	TrendingUp,
	CheckCircle2,
	XCircle,
	AlertTriangle,
	Calendar,
	Filter,
	Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, HoldRateAnalytics, Semester } from "@/types";

interface LecturerStatsSectionProps {
	holdRate?: HoldRateAnalytics;
	isLoading?: boolean;
	courses: Course[];
	selectedCourseId: string;
	onCourseChange: (courseId: string) => void;
	activeSemester?: Semester;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		value: number;
		dataKey: string;
		name: string;
		color: string;
		payload: {
			displayLabel: string;
			dateRange?: string;
			heldCount: number;
			notHeldCount: number;
			unreportedCount: number;
			totalSessions: number;
			holdRatePercentage: number;
		};
	}>;
}

function CustomStatsTooltip({ active, payload }: CustomTooltipProps) {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-surface border border-border p-3 rounded-xl shadow-xl text-xs space-y-2 min-w-48 z-50">
				<div className="border-b border-border/50 pb-1.5">
					<p className="font-bold text-text-main">{data.displayLabel}</p>
					{data.dateRange && (
						<p className="text-[11px] text-text-muted">{data.dateRange}</p>
					)}
				</div>
				<div className="space-y-1.5">
					<div className="flex justify-between items-center text-primary font-bold">
						<span>Hold Rate:</span>
						<span>{data.holdRatePercentage}%</span>
					</div>
					<div className="flex justify-between items-center text-emerald-400 font-semibold">
						<span className="flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
							Held:
						</span>
						<span>{data.heldCount}</span>
					</div>
					<div className="flex justify-between items-center text-rose-400 font-semibold">
						<span className="flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
							Not Held:
						</span>
						<span>{data.notHeldCount}</span>
					</div>
					<div className="flex justify-between items-center text-amber-400 font-semibold">
						<span className="flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
							Unreported:
						</span>
						<span>{data.unreportedCount}</span>
					</div>
					<div className="border-t border-border/40 pt-1 flex justify-between items-center text-text-muted">
						<span>Total Sessions:</span>
						<span>{data.totalSessions}</span>
					</div>
				</div>
			</div>
		);
	}
	return null;
}

export const LecturerStatsSection: React.FC<LecturerStatsSectionProps> = ({
	holdRate,
	isLoading = false,
	courses,
	selectedCourseId,
	onCourseChange,
	activeSemester,
}) => {
	const summary = holdRate?.summary;
	const overallRate = summary?.holdRatePercentage ?? 0;
	const totalSessions = summary?.totalSessions ?? 0;
	const heldCount = summary?.heldCount ?? 0;
	const notHeldCount = summary?.notHeldCount ?? 0;
	const unreportedCount = summary?.unreportedCount ?? 0;

	// Prepare data for line chart
	const chartData = (holdRate?.breakdown || []).map((item) => {
		const rawLabel = item.label || item.key || "";
		let displayLabel = rawLabel;
		if (rawLabel.startsWith("week_")) {
			displayLabel = `Week ${rawLabel.replace("week_", "")}`;
		} else if (rawLabel.startsWith("Week ")) {
			displayLabel = rawLabel;
		}

		return {
			displayLabel,
			dateRange: item.dateRange,
			holdRatePercentage: Number(item.holdRatePercentage ?? 0),
			heldCount: item.heldCount ?? 0,
			notHeldCount: item.notHeldCount ?? 0,
			unreportedCount: item.unreportedCount ?? 0,
			totalSessions: item.totalSessions ?? 0,
		};
	});

	const badgeVariant: "success" | "warning" | "danger" =
		overallRate >= 75 ? "success" : overallRate >= 50 ? "warning" : "danger";

	return (
		<div className="space-y-4">
			{/* Section Header with Course Filter */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/70 border border-border/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
						<TrendingUp size={18} />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<Text variant="h6" weight="bold" className="text-text-main">
								Lecture Hold Rate Performance
							</Text>
							{activeSemester && (
								<Badge
									variant="outline"
									className="text-[11px] font-medium hidden sm:inline-flex"
								>
									{activeSemester.sessionLabel
										? `${activeSemester.sessionLabel} • `
										: ""}
									{activeSemester.name === "first"
										? "1st Semester"
										: "2nd Semester"}
								</Badge>
							)}
						</div>
						<Text variant="caption" color="muted">
							Weekly lecture delivery trajectory, attendance audits, and
							compliance tracking.
						</Text>
					</div>
				</div>

				{/* Course Filter Dropdown */}
				<div className="flex items-center gap-2 self-start sm:self-auto">
					<Filter size={14} className="text-text-muted shrink-0" />
					<select
						value={selectedCourseId}
						onChange={(e) => onCourseChange(e.target.value)}
						className="text-xs bg-surface-raised border border-border rounded-xl px-3 py-2 text-text-main font-medium focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px]"
					>
						<option value="">All Assigned Courses</option>
						{courses.map((c) => (
							<option key={c.id} value={c.id}>
								{c.code} — {c.title}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Stat Cards */}
			<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
				{/* 1. Overall Hold Rate */}
				<Card className="p-3.5 space-y-1 border-l-4 border-l-primary">
					<Text variant="overline" className="text-[10px] text-text-muted">
						Delivery Hold Rate
					</Text>
					{isLoading ? (
						<Skeleton className="h-7 w-20" />
					) : (
						<div className="flex items-baseline justify-between">
							<Text variant="h4" weight="bold" className="text-primary">
								{overallRate}%
							</Text>
							<Badge variant={badgeVariant} className="text-[10px] py-0 px-1.5">
								{overallRate >= 75
									? "Optimal"
									: overallRate >= 50
										? "Average"
										: "Low"}
							</Badge>
						</div>
					)}
				</Card>

				{/* 2. Total Sessions */}
				<Card className="p-3.5 space-y-1 border-l-4 border-l-blue-500">
					<Text variant="overline" className="text-[10px] text-text-muted">
						Scheduled Sessions
					</Text>
					{isLoading ? (
						<Skeleton className="h-7 w-16" />
					) : (
						<div className="flex items-baseline justify-between">
							<Text variant="h4" weight="bold" className="text-text-main">
								{totalSessions}
							</Text>
							<Calendar size={14} className="text-blue-500" />
						</div>
					)}
				</Card>

				{/* 3. Held Sessions */}
				<Card className="p-3.5 space-y-1 border-l-4 border-l-emerald-500">
					<Text variant="overline" className="text-[10px] text-text-muted">
						Successfully Held
					</Text>
					{isLoading ? (
						<Skeleton className="h-7 w-16" />
					) : (
						<div className="flex items-baseline justify-between">
							<Text variant="h4" weight="bold" className="text-emerald-400">
								{heldCount}
							</Text>
							<CheckCircle2 size={14} className="text-emerald-500" />
						</div>
					)}
				</Card>

				{/* 4. Not Held Sessions */}
				<Card className="p-3.5 space-y-1 border-l-4 border-l-rose-500">
					<Text variant="overline" className="text-[10px] text-text-muted">
						Not Held / Missed
					</Text>
					{isLoading ? (
						<Skeleton className="h-7 w-16" />
					) : (
						<div className="flex items-baseline justify-between">
							<Text variant="h4" weight="bold" className="text-rose-400">
								{notHeldCount}
							</Text>
							<XCircle size={14} className="text-rose-500" />
						</div>
					)}
				</Card>

				{/* 5. Unreported Sessions */}
				<Card className="p-3.5 space-y-1 border-l-4 border-l-amber-500 col-span-2 lg:col-span-1">
					<Text variant="overline" className="text-[10px] text-text-muted">
						Unreported Sessions
					</Text>
					{isLoading ? (
						<Skeleton className="h-7 w-16" />
					) : (
						<div className="flex items-baseline justify-between">
							<Text variant="h4" weight="bold" className="text-amber-400">
								{unreportedCount}
							</Text>
							<Clock size={14} className="text-amber-500" />
						</div>
					)}
				</Card>
			</div>

			{/* Graph Card */}
			<Card className="p-5 space-y-4 border border-border/80 bg-surface/90 shadow-sm">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
					<div>
						<Text
							variant="h6"
							weight="bold"
							className="text-text-main text-sm sm:text-base"
						>
							Weekly Progression Trend
						</Text>
						<Text variant="caption" color="muted">
							Hold rate percentage trajectory across academic semester weeks.
						</Text>
					</div>

					<div className="flex items-center gap-3 text-xs text-text-muted font-medium">
						<span className="flex items-center gap-1.5">
							<span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
							Hold Rate %
						</span>
					</div>
				</div>

				{isLoading ? (
					<div className="h-64 w-full flex items-center justify-center">
						<Skeleton className="h-56 w-full rounded-xl" />
					</div>
				) : chartData.length === 0 || totalSessions === 0 ? (
					<div className="h-56 flex flex-col items-center justify-center text-center p-6 text-text-muted border border-dashed border-border/60 rounded-xl">
						<AlertTriangle
							size={32}
							className="text-amber-400 mb-2 opacity-80"
						/>
						<Text
							variant="body-sm"
							weight="semibold"
							className="text-text-main"
						>
							No Lecture Sessions Recorded Yet
						</Text>
						<Text
							variant="caption"
							color="muted"
							className="text-center max-w-md pt-1"
						>
							Weekly hold rate analytics will populate as timetable sessions
							take place and class rep reports are submitted.
						</Text>
					</div>
				) : (
					<div className="h-64 sm:h-72 w-full pt-2">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={chartData}
								margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#334155"
									opacity={0.3}
								/>
								<XAxis
									dataKey="displayLabel"
									stroke="#94a3b8"
									fontSize={11}
									tickLine={false}
									axisLine={{ stroke: "#334155" }}
								/>
								<YAxis
									stroke="#94a3b8"
									fontSize={11}
									domain={[0, 100]}
									tickFormatter={(val) => `${val}%`}
									tickLine={false}
									axisLine={{ stroke: "#334155" }}
								/>
								<Tooltip content={<CustomStatsTooltip />} />
								<Line
									type="monotone"
									dataKey="holdRatePercentage"
									name="Hold Rate"
									stroke="#10b981"
									strokeWidth={3}
									dot={{
										r: 4,
										fill: "#10b981",
										strokeWidth: 2,
										stroke: "#0f172a",
									}}
									activeDot={{
										r: 6,
										fill: "#10b981",
										stroke: "#fff",
										strokeWidth: 2,
									}}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				)}
			</Card>
		</div>
	);
};

export default LecturerStatsSection;
