import { Link } from "@tanstack/react-router";
import {
	GraduationCap,
	ArrowRight,
	MapPin,
	Calendar,
	Users,
	UserCheck,
	Building2,
	Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExamAnalyticsResponse, Semester } from "@/types";

interface ExamOfficerDashboardSectionProps {
	examAnalytics?: ExamAnalyticsResponse;
	isLoading?: boolean;
	activeSemester?: Semester;
}

export default function ExamOfficerDashboardSection({
	examAnalytics,
	isLoading = false,
	activeSemester,
}: ExamOfficerDashboardSectionProps) {
	const summary = examAnalytics?.summary;
	const dailyBreakdown = examAnalytics?.daily_breakdown || [];

	return (
		<div className="space-y-6">
			{/* 1. Exam Coordination Hero Banner */}
			<Card className="p-6 bg-gradient-to-r from-indigo-500/10 via-surface to-surface-raised border border-indigo-500/25 relative overflow-hidden">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
					<div className="space-y-2 max-w-2xl">
						<div className="flex items-center gap-2">
							<span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
								<GraduationCap size={22} />
							</span>
							<Text variant="h5" weight="bold" className="text-text-main">
								Exam Operations & Timetable Coordination
							</Text>
						</div>
						<Text variant="body-sm" color="muted" className="leading-relaxed">
							Dedicated exam administration workspace. Schedule examination sittings, resolve venue capacities, assign academic invigilators, and oversee student candidate allotments.
						</Text>

						<div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-text-muted">
							<span className="flex items-center gap-1.5">
								<Calendar size={14} className="text-indigo-400" />
								{activeSemester
									? `${activeSemester.sessionLabel || ""} ${activeSemester.name === "first" ? "1st" : "2nd"} Semester Exam Period`
									: "Exam Session Scope"}
							</span>
							<span className="flex items-center gap-1.5">
								<UserCheck size={14} className="text-emerald-400" />
								Invigilation Roster
							</span>
							<span className="flex items-center gap-1.5">
								<Building2 size={14} className="text-primary" />
								Venue Allocation
							</span>
						</div>
					</div>

					<div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
						<Link to={"/venues" as any}>
							<Button variant="outline" className="flex items-center gap-2 whitespace-nowrap">
								<MapPin size={16} />
								<span>Inspect Venues</span>
							</Button>
						</Link>
						<Link to={"/exams" as any}>
							<Button className="flex items-center gap-2 whitespace-nowrap shadow-md shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white border-none">
								<span>Manage Exam Timetable</span>
								<ArrowRight size={16} />
							</Button>
						</Link>
					</div>
				</div>
			</Card>

			{/* 2. Daily Exam Schedule Breakdown & Operations Overview */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left: Daily Sitting Distribution Table (2 cols) */}
				<Card className="p-5 space-y-4 lg:col-span-2">
					<div className="flex items-center justify-between">
						<div>
							<Text variant="h6" weight="bold" className="text-text-main">
								Exam Schedule & Daily Sitting Distribution
							</Text>
							<Text variant="caption" color="muted">
								Scheduled sittings and candidate attendance by examination date.
							</Text>
						</div>
						<Badge variant="outline" className="text-xs">
							{dailyBreakdown.length} Active Days
						</Badge>
					</div>

					{isLoading ? (
						<div className="space-y-3 pt-2">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					) : dailyBreakdown.length === 0 ? (
						<div className="py-12 flex flex-col items-center justify-center text-center space-y-3 border border-dashed border-border/60 rounded-xl bg-surface/50">
							<div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
								<Clock size={24} />
							</div>
							<div className="space-y-1">
								<Text variant="body-sm" weight="semibold" className="text-text-main">
									No Exam Sittings Scheduled
								</Text>
								<Text variant="caption" color="muted" className="max-w-md">
									Exam sittings for this semester have not been created yet. Navigate to the Exam Timetable page to schedule individual sittings or assign venues and invigilators.
								</Text>
							</div>
							<Link to={"/exams" as any}>
								<Button size="sm" className="mt-2 text-xs">
									Open Exam Timetable
								</Button>
							</Link>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-xs">
								<thead>
									<tr className="border-b border-border text-text-muted">
										<th className="py-2.5 px-3 font-semibold">Date</th>
										<th className="py-2.5 px-3 font-semibold">Sittings</th>
										<th className="py-2.5 px-3 font-semibold">Candidates</th>
										<th className="py-2.5 px-3 font-semibold text-right">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/60">
									{dailyBreakdown.map((row) => (
										<tr key={row.date} className="hover:bg-surface-raised/50 transition-colors">
											<td className="py-3 px-3 font-medium text-text-main flex items-center gap-2">
												<Calendar size={14} className="text-indigo-400 shrink-0" />
												<span>{row.date}</span>
											</td>
											<td className="py-3 px-3 text-text-muted">
												<span className="font-semibold text-text-main">{row.sittings}</span> sitting{row.sittings !== 1 ? "s" : ""}
											</td>
											<td className="py-3 px-3 text-text-muted">
												<span className="font-semibold text-text-main">{row.candidates.toLocaleString()}</span> students
											</td>
											<td className="py-3 px-3 text-right">
												<Badge variant="success" size="sm">
													Scheduled
												</Badge>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Card>

				{/* Right: Quick Operational Summary (1 col) */}
				<div className="space-y-4">
					<Card className="p-5 space-y-3 border-l-4 border-l-indigo-500">
						<div className="flex items-center justify-between text-text-muted">
							<Text variant="overline" className="text-[11px] font-semibold uppercase">
								Exam Readiness
							</Text>
							<GraduationCap size={18} className="text-indigo-500" />
						</div>
						<div className="space-y-1">
							<Text variant="h4" weight="bold" className="text-text-main">
								{summary?.total_sittings || 0} Sittings
							</Text>
							<Text variant="caption" color="muted" className="block text-[11px]">
								{summary?.total_venues || 0} venues currently allotted
							</Text>
						</div>
						<div className="pt-2 border-t border-border/60">
							<div className="flex items-center justify-between text-xs text-text-muted">
								<span>Invigilator Coverage</span>
								<span className="font-semibold text-text-main">
									{summary?.total_invigilators || 0} Lecturers
								</span>
							</div>
						</div>
					</Card>

					<Card className="p-5 space-y-3 border-l-4 border-l-blue-500">
						<div className="flex items-center justify-between text-text-muted">
							<Text variant="overline" className="text-[11px] font-semibold uppercase">
								Student Enrollment
							</Text>
							<Users size={18} className="text-blue-500" />
						</div>
						<div className="space-y-1">
							<Text variant="h4" weight="bold" className="text-text-main">
								{(summary?.total_candidates || 0).toLocaleString()} Candidates
							</Text>
							<Text variant="caption" color="muted" className="block text-[11px]">
								Registered for examination sessions
							</Text>
						</div>
						<div className="pt-2 border-t border-border/60">
							<Link to={"/exams" as any} className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
								<span>View Exam Schedule details</span>
								<ArrowRight size={13} />
							</Link>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}

