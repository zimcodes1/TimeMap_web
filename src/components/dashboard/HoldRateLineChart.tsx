import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from "recharts";
import type { HoldRateAnalytics } from "@/types";

interface HoldRateLineChartProps {
	holdRate?: HoldRateAnalytics;
	isLoading?: boolean;
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

function CustomTooltip({ active, payload }: CustomTooltipProps) {
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
					<div className="flex justify-between items-center text-amber-400 font-semibold">
						<span className="flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
							Unreported:
						</span>
						<span>{data.unreportedCount}</span>
					</div>
					<div className="flex justify-between items-center text-blue-400">
						<span className="flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
							Held:
						</span>
						<span>{data.heldCount}</span>
					</div>
					<div className="flex justify-between items-center text-rose-400">
						<span className="flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
							Not Held:
						</span>
						<span>{data.notHeldCount}</span>
					</div>
					<div className="flex justify-between items-center text-text-muted pt-1 border-t border-border/40">
						<span>Evaluated Past Sessions:</span>
						<span className="font-semibold text-text-main">
							{data.totalSessions}
						</span>
					</div>
				</div>
			</div>
		);
	}
	return null;
}

export default function HoldRateLineChart({
	holdRate,
	isLoading = false,
}: HoldRateLineChartProps) {
	const rawBreakdown = holdRate?.breakdown || [];

	const chartData = rawBreakdown.map((item, idx) => {
		const weekNum = item.weekNumber ?? idx + 1;
		const label = item.label || `Week ${weekNum}`;
		const held = item.heldCount ?? 0;
		const notHeld = item.notHeldCount ?? 0;
		const unreported = item.unreportedCount ?? 0;
		const total = item.totalSessions || held + notHeld + unreported;
		return {
			...item,
			displayLabel: label,
			heldCount: held,
			notHeldCount: notHeld,
			unreportedCount: unreported,
			holdRatePercentage: Number(item.holdRatePercentage ?? 0),
			totalSessions: total,
		};
	});

	const overallRate = holdRate?.summary?.holdRatePercentage ?? 0;
	const heldCount = holdRate?.summary?.heldCount ?? 0;
	const notHeldCount = holdRate?.summary?.notHeldCount ?? 0;
	const unreportedCount = holdRate?.summary?.unreportedCount ?? 0;
	const totalSessions =
		holdRate?.summary?.totalSessions ??
		heldCount + notHeldCount + unreportedCount;

	return (
		<Card className="p-5 space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
				<div>
					{isLoading ? (
						<div className="space-y-1.5">
							<Skeleton className="h-6 w-52" />
							<Skeleton className="h-4 w-72" />
						</div>
					) : (
						<>
							<div className="flex items-center gap-2">
								<Text variant="h6" weight="bold">
									Lecture-Hold Rate Trend
								</Text>
								<Badge
									variant={
										overallRate >= 75
											? "success"
											: overallRate >= 50
												? "warning"
												: "danger"
									}
									className="text-xs px-2 py-0.5 font-bold"
								>
									{overallRate}% Hold Rate
								</Badge>
							</div>
							<Text variant="caption" color="muted">
								Held: {heldCount} • Not Held: {notHeldCount} •{" "}
								<span className="text-amber-400 font-semibold">
									Unreported: {unreportedCount}
								</span>{" "}
								(Past Sessions: {totalSessions})
							</Text>
						</>
					)}
				</div>
			</div>

			<div className="h-72 w-full">
				{isLoading ? (
					<div className="h-full flex items-center justify-center">
						<Skeleton className="w-full h-4/5 rounded-xl" />
					</div>
				) : chartData.length > 0 ? (
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={chartData}
							margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" opacity={0.15} />
							<XAxis
								dataKey="displayLabel"
								tick={{ fontSize: 11, fill: "#94a3b8" }}
								tickLine={false}
							/>
							{/* Left YAxis: Counts (Unreported, Held, Not Held) */}
							<YAxis
								yAxisId="count"
								orientation="left"
								allowDecimals={false}
								tick={{ fontSize: 11, fill: "#94a3b8" }}
								tickLine={false}
							/>
							{/* Right YAxis: Percentage (0 - 100%) */}
							<YAxis
								yAxisId="rate"
								orientation="right"
								domain={[0, 100]}
								tick={{ fontSize: 11, fill: "#94a3b8" }}
								tickLine={false}
								unit="%"
							/>
							<Tooltip content={<CustomTooltip />} />
							<Legend
								verticalAlign="top"
								align="right"
								wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
							/>
							{/* Hold Rate % Line */}
							<Line
								yAxisId="rate"
								type="monotone"
								dataKey="holdRatePercentage"
								name="Hold Rate (%)"
								stroke="#10b981"
								strokeWidth={3}
								dot={{
									r: 4,
									fill: "#10b981",
									strokeWidth: 2,
									stroke: "#0f172a",
								}}
								activeDot={{ r: 6, fill: "#34d399" }}
							/>
							{/* Unreported Schedules Line (prominently plotted in amber) */}
							<Line
								yAxisId="count"
								type="monotone"
								dataKey="unreportedCount"
								name="Unreported"
								stroke="#f59e0b"
								strokeWidth={2.5}
								dot={{
									r: 4,
									fill: "#f59e0b",
									strokeWidth: 2,
									stroke: "#0f172a",
								}}
								activeDot={{ r: 6, fill: "#fbbf24" }}
							/>
							{/* Held Schedules Line */}
							<Line
								yAxisId="count"
								type="monotone"
								dataKey="heldCount"
								name="Held"
								stroke="#3b82f6"
								strokeWidth={1.5}
								strokeDasharray="4 4"
								dot={{
									r: 3,
									fill: "#3b82f6",
									strokeWidth: 1,
									stroke: "#0f172a",
								}}
								activeDot={{ r: 5, fill: "#60a5fa" }}
							/>
							{/* Not Held Schedules Line */}
							<Line
								yAxisId="count"
								type="monotone"
								dataKey="notHeldCount"
								name="Not Held"
								stroke="#ef4444"
								strokeWidth={1.5}
								strokeDasharray="4 4"
								dot={{
									r: 3,
									fill: "#ef4444",
									strokeWidth: 1,
									stroke: "#0f172a",
								}}
								activeDot={{ r: 5, fill: "#f87171" }}
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<div className="h-full flex flex-col items-center justify-center text-text-subtle text-xs border border-dashed border-border/50 rounded-xl p-4 text-center">
						<p className="font-semibold text-text-muted mb-1">
							No session records available
						</p>
						<p>
							There are no past lecture reports or scheduled occurrences
							recorded for this scope.
						</p>
					</div>
				)}
			</div>
		</Card>
	);
}
