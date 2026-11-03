import { useState, useMemo } from "react";
import { Search, BookOpen, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { HoldRateBreakdownItem } from "@/types";

interface CourseHoldRateTableProps {
	courses: HoldRateBreakdownItem[];
	isLoading?: boolean;
}

export default function CourseHoldRateTable({
	courses = [],
	isLoading = false,
}: CourseHoldRateTableProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"rate" | "sessions">("rate");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const filteredCourses = useMemo(() => {
		let list = [...courses];
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(c) =>
					c.courseCode?.toLowerCase().includes(q) ||
					c.courseTitle?.toLowerCase().includes(q) ||
					c.label?.toLowerCase().includes(q),
			);
		}
		list.sort((a, b) => {
			const valA =
				sortBy === "rate"
					? (a.holdRatePercentage ?? 0)
					: (a.totalSessions ?? 0);
			const valB =
				sortBy === "rate"
					? (b.holdRatePercentage ?? 0)
					: (b.totalSessions ?? 0);
			return sortOrder === "desc" ? valB - valA : valA - valB;
		});
		return list;
	}, [courses, searchQuery, sortBy, sortOrder]);

	const toggleSort = (field: "rate" | "sessions") => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "desc" ? "asc" : "desc");
		} else {
			setSortBy(field);
			setSortOrder("desc");
		}
	};

	return (
		<Card className="p-5 space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
				<div>
					<Text variant="h6" weight="bold">
						Course Lecture Compliance
					</Text>
					<Text variant="caption" color="muted">
						Review session completion and delivery adherence per registered
						course.
					</Text>
				</div>

				<div className="relative w-full sm:w-64">
					<Search
						size={14}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
					/>
					<input
						type="text"
						placeholder="Search course code or title..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full text-xs bg-surface-raised border border-border rounded-xl pl-8 pr-3 py-2 text-text-main placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary"
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-14 w-full rounded-xl" />
					))}
				</div>
			) : filteredCourses.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="w-full text-xs text-left border-collapse">
						<thead>
							<tr className="border-b border-border text-text-muted">
								<th className="py-2.5 px-3 font-semibold">Course Code</th>
								<th className="py-2.5 px-3 font-semibold">Course Title</th>
								<th className="py-2.5 px-3 font-semibold">Level</th>
								<th
									className="py-2.5 px-3 font-semibold cursor-pointer select-none hover:text-text-main"
									onClick={() => toggleSort("sessions")}
								>
									<div className="flex items-center gap-1">
										<span>Total Sessions</span>
										<ArrowUpDown size={12} />
									</div>
								</th>
								<th className="py-2.5 px-3 font-semibold text-emerald-400">
									Held
								</th>
								<th className="py-2.5 px-3 font-semibold text-rose-400">
									Not Held
								</th>
								<th className="py-2.5 px-3 font-semibold text-amber-400">
									Unreported
								</th>
								<th
									className="py-2.5 px-3 font-semibold cursor-pointer select-none hover:text-text-main"
									onClick={() => toggleSort("rate")}
								>
									<div className="flex items-center gap-1">
										<span>Hold Rate</span>
										<ArrowUpDown size={12} />
									</div>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40">
							{filteredCourses.map((item, idx) => {
								const rate = Number(item.holdRatePercentage ?? 0);
								const total =
									item.totalSessions ||
									(item.heldCount ?? 0) +
										(item.notHeldCount ?? 0) +
										(item.unreportedCount ?? 0);
								const code = item.courseCode || item.label || "COURSE";
								const title =
									item.courseTitle || item.label || "Untitled Course";

								return (
									<tr
										key={item.courseId || item.key || idx}
										className="hover:bg-surface-raised/40 transition-colors"
									>
										<td className="py-3 px-3">
											<div className="flex items-center gap-1.5 font-bold font-mono text-primary">
												<BookOpen size={13} />
												<span>{code}</span>
											</div>
										</td>
										<td className="py-3 px-3 font-medium text-text-main max-w-xs truncate">
											{title}
										</td>
										<td className="py-3 px-3 text-text-muted">
											{item.level ? `${item.level}L` : "—"}
										</td>
										<td className="py-3 px-3 font-medium text-text-main">
											{total}
										</td>
										<td className="py-3 px-3 font-semibold text-emerald-400">
											{item.heldCount}
										</td>
										<td className="py-3 px-3 font-semibold text-rose-400">
											{item.notHeldCount}
										</td>
										<td className="py-3 px-3 font-semibold text-amber-400">
											{item.unreportedCount}
										</td>
										<td className="py-3 px-3 min-w-[130px]">
											<div className="flex items-center gap-2">
												<Badge
													variant={
														rate >= 80
															? "success"
															: rate >= 60
																? "warning"
																: "danger"
													}
													className="text-[11px] font-bold"
												>
													{rate}%
												</Badge>
												<div className="flex-1 bg-surface-raised h-1.5 rounded-full overflow-hidden">
													<div
														className={`h-full rounded-full ${
															rate >= 80
																? "bg-emerald-500"
																: rate >= 60
																	? "bg-amber-500"
																	: "bg-rose-500"
														}`}
														style={{
															width: `${Math.min(100, Math.max(0, rate))}%`,
														}}
													/>
												</div>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			) : (
				<div className="py-8 text-center text-text-subtle text-xs border border-dashed border-border/50 rounded-xl">
					<p className="font-semibold text-text-muted mb-1">
						No course hold records found
					</p>
					<p>No courses match the current filter criteria.</p>
				</div>
			)}
		</Card>
	);
}
