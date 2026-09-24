import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { HoldRateBreakdownItem } from "@/types";

interface LecturerHoldRateTableProps {
	lecturers: HoldRateBreakdownItem[];
	isLoading?: boolean;
	departmentName?: string;
}

export default function LecturerHoldRateTable({
	lecturers = [],
	isLoading = false,
	departmentName,
}: LecturerHoldRateTableProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"rate" | "sessions">("rate");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const filteredLecturers = useMemo(() => {
		let list = [...lecturers];
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(l) =>
					l.lecturerName?.toLowerCase().includes(q) ||
					l.staffId?.toLowerCase().includes(q) ||
					l.label?.toLowerCase().includes(q),
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
	}, [lecturers, searchQuery, sortBy, sortOrder]);

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
					<div className="flex items-center gap-2">
						<Text variant="h6" weight="bold">
							Lecturer Lecture-Hold Rates
						</Text>
						{departmentName && (
							<Badge variant="outline" className="text-xs">
								{departmentName}
							</Badge>
						)}
					</div>
					<Text variant="caption" color="muted">
						Track lecture delivery performance, reported sessions, and hold
						percentages for department lecturers.
					</Text>
				</div>

				{/* Search Bar */}
				<div className="relative w-full sm:w-64">
					<Search
						size={14}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
					/>
					<input
						type="text"
						placeholder="Search lecturer or staff ID..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full text-xs bg-surface-raised border border-border rounded-xl pl-8 pr-3 py-2 text-text-main placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary"
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-14 w-full rounded-xl" />
					))}
				</div>
			) : filteredLecturers.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="w-full text-xs text-left border-collapse">
						<thead>
							<tr className="border-b border-border text-text-muted">
								<th className="py-2.5 px-3 font-semibold">Lecturer</th>
								<th className="py-2.5 px-3 font-semibold">Staff ID</th>
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
							{filteredLecturers.map((item, idx) => {
								const rate = Number(item.holdRatePercentage ?? 0);
								const total =
									item.totalSessions ||
									(item.heldCount ?? 0) +
										(item.notHeldCount ?? 0) +
										(item.unreportedCount ?? 0);
								const name = item.lecturerName || item.label || "Lecturer";
								const staffId = item.staffId || "N/A";

								return (
									<tr
										key={item.lecturerId || item.key || idx}
										className="hover:bg-surface-raised/40 transition-colors"
									>
										<td className="py-3 px-3">
											<div className="flex items-center gap-2">
												<div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[11px]">
													{name.charAt(0).toUpperCase()}
												</div>
												<span className="font-semibold text-text-main">
													{name}
												</span>
											</div>
										</td>
										<td className="py-3 px-3 text-text-muted font-mono">
											{staffId}
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
										<td className="py-3 px-3 min-w-[120px]">
											<div className="space-y-1">
												<div className="flex justify-between items-center text-[11px] font-bold">
													<span
														className={
															rate >= 80
																? "text-emerald-400"
																: rate >= 60
																	? "text-amber-400"
																	: "text-rose-400"
														}
													>
														{rate}%
													</span>
												</div>
												<div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden">
													<div
														className={`h-full rounded-full transition-all duration-300 ${
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
						No lecturer hold rate records found
					</p>
					<p>
						No lecturers match the current filter or have scheduled sessions
						recorded.
					</p>
				</div>
			)}
		</Card>
	);
}
