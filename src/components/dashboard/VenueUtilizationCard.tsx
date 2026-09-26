import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts";
import type { VenueUtilizationAnalytics } from "@/types";

interface VenueUtilizationCardProps {
	utilization?: VenueUtilizationAnalytics;
	isLoading?: boolean;
	departmentName?: string;
	adminLevel?: string;
}

export default function VenueUtilizationCard({
	utilization,
	isLoading = false,
	departmentName,
	adminLevel,
}: VenueUtilizationCardProps) {
	const isSchoolAdmin = adminLevel === "school";
	const breakdown = utilization?.breakdown || [];
	const totalBookedHours = utilization?.summary?.totalBookedHours ?? 0;
	const totalVenues = utilization?.summary?.totalVenues ?? breakdown.length;

	return (
		<Card className="p-5 space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
				<div>
					{isLoading ? (
						<div className="space-y-1.5">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-4 w-64" />
						</div>
					) : (
						<>
							<div className="flex items-center gap-2">
								<Text variant="h6" weight="bold">
									{isSchoolAdmin
										? "Faculty Venue Utilization"
										: "Venue Utilization"}
								</Text>
								{!isSchoolAdmin && departmentName && (
									<Badge variant="default" className="text-[11px] font-medium">
										{departmentName}
									</Badge>
								)}
								{isSchoolAdmin && (
									<Badge variant="outline" className="text-[11px] font-medium">
										Faculty Aggregates
									</Badge>
								)}
							</div>
							<Text variant="caption" color="muted">
								{isSchoolAdmin
									? `Total Booked: ${totalBookedHours} hrs across ${breakdown.length} faculties in this school`
									: `Total Booked: ${totalBookedHours} hrs across ${totalVenues} venues in this department`}
							</Text>
						</>
					)}
				</div>
				{!isLoading && (
					<Badge
						variant="outline"
						className="text-xs shrink-0 self-start sm:self-auto"
					>
						{isSchoolAdmin ? "School Scoped" : "Department Scoped"}
					</Badge>
				)}
			</div>

			<div className="h-64 w-full">
				{isLoading ? (
					<div className="h-full flex items-end gap-4 px-4 pt-4">
						<Skeleton className="w-full h-1/3" />
						<Skeleton className="w-full h-2/3" />
						<Skeleton className="w-full h-full" />
						<Skeleton className="w-full h-1/2" />
						<Skeleton className="w-full h-3/4" />
					</div>
				) : breakdown.length > 0 ? (
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={breakdown}
							margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" opacity={0.15} />
							<XAxis
								dataKey={isSchoolAdmin ? "facultyCode" : "venueName"}
								tick={{ fontSize: 10, fill: "#94a3b8" }}
								interval={0}
							/>
							<YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} unit="h" />
							<Tooltip
								content={({ active, payload }) => {
									if (active && payload && payload.length) {
										const data = payload[0].payload;
										const label =
											data.facultyName || data.venueName || data.facultyCode;
										return (
											<div className="bg-surface border border-border p-2.5 rounded-xl shadow-xl text-xs space-y-1">
												<p className="font-bold text-text-main">{label}</p>
												<p className="text-blue-400">
													Booked:{" "}
													<span className="font-semibold">
														{data.totalBookedHours} hrs
													</span>
												</p>
												{data.totalSessions !== undefined && (
													<p className="text-text-muted">
														Sessions:{" "}
														<span className="font-semibold text-text-main">
															{data.totalSessions}
														</span>
													</p>
												)}
											</div>
										);
									}
									return null;
								}}
							/>
							<Bar
								dataKey="totalBookedHours"
								fill="#3b82f6"
								radius={[6, 6, 0, 0]}
								name="Booked Hours"
							/>
						</BarChart>
					</ResponsiveContainer>
				) : (
					<div className="h-full flex flex-col items-center justify-center text-text-subtle text-xs border border-dashed border-border/50 rounded-xl p-4 text-center">
						<p className="font-semibold text-text-muted mb-1">
							No venue utilization records
						</p>
						<p>
							{isSchoolAdmin
								? "No lectures were booked for venues in faculties under this school."
								: "No lectures were booked for venues in this department during this period."}
						</p>
					</div>
				)}
			</div>
		</Card>
	);
}
