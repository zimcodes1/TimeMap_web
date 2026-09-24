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
			<div className="bg-surface border border-border p-3 rounded-xl shadow-xl text-xs space-y-2 min-w-44 z-50">
				<div className="border-b border-border/50 pb-1.5">
					<p className="font-bold text-text-main">{data.displayLabel}</p>
					{data.dateRange && (
						<p className="text-[11px] text-text-muted">{data.dateRange}</p>
					)}
				</div>
				<div className="space-y-1">
					<div className="flex justify-between items-center text-emerald-400">
						<span>Held:</span>
						<span className="font-semibold">{data.heldCount}</span>
					</div>
					<div className="flex justify-between items-center text-rose-400">
						<span>Not Held:</span>
						<span className="font-semibold">{data.notHeldCount}</span>
					</div>
					<div className="flex justify-between items-center text-amber-400">
						<span>Unreported:</span>
						<span className="font-semibold">{data.unreportedCount}</span>
					</div>
					<div className="flex justify-between items-center text-text-muted pt-1 border-t border-border/40">
						<span>Total Sessions:</span>
						<span className="font-semibold text-text-main">
							{data.totalSessions}
						</span>
					</div>
					<div className="flex justify-between items-center text-primary pt-0.5 font-bold">
						<span>Hold Rate:</span>
						<span>{data.holdRatePercentage}%</span>
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
		return {
			...item,
			displayLabel: label,
			holdRatePercentage: Number(item.holdRatePercentage ?? 0),
			totalSessions:
				item.totalSessions ||
				(item.heldCount ?? 0) +
					(item.notHeldCount ?? 0) +
					(item.unreportedCount ?? 0),
		};
	});

	const overallRate = holdRate?.summary?.holdRatePercentage ?? 0;
	const heldCount = holdRate?.summary?.heldCount ?? 0;
	const notHeldCount = holdRate?.summary?.notHeldCount ?? 0;
	const unreportedCount = holdRate?.summary?.unreportedCount ?? 0;
	const totalSessions = holdRate?.summary?.totalSessions ?? 0;

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
									{overallRate}% Overall
								</Badge>
							</div>
							<Text variant="caption" color="muted">
								Held: {heldCount} • Not Held: {notHeldCount} • Unreported:{" "}
								{unreportedCount} (Total: {totalSessions})
							</Text>
						</>
					)}
				</div>
			</div>

			<div className="h-64 w-full">
				{isLoading ? (
					<div className="h-full flex items-center justify-center">
						<Skeleton className="w-full h-4/5 rounded-xl" />
					</div>
				) : chartData.length > 0 ? (
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={chartData}
							margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" opacity={0.15} />
							<XAxis
								dataKey="displayLabel"
								tick={{ fontSize: 11, fill: "#94a3b8" }}
								tickLine={false}
							/>
							<YAxis
								domain={[0, 100]}
								tick={{ fontSize: 11, fill: "#94a3b8" }}
								tickLine={false}
								unit="%"
							/>
							<Tooltip content={<CustomTooltip />} />
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
								activeDot={{ r: 6, fill: "#34d399" }}
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
