import { useState, useMemo } from "react";
import { Search, Building2, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { HoldRateBreakdownItem } from "@/types";

interface FacultyTotalsTableProps {
	faculties: HoldRateBreakdownItem[];
	isLoading?: boolean;
	onSelectFaculty?: (facultyId: string) => void;
}

export default function FacultyTotalsTable({
	faculties = [],
	isLoading = false,
	onSelectFaculty,
}: FacultyTotalsTableProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"rate" | "sessions">("sessions");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const filteredFaculties = useMemo(() => {
		let list = [...faculties];
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(f) =>
					f.facultyName?.toLowerCase().includes(q) ||
					f.facultyCode?.toLowerCase().includes(q) ||
					f.label?.toLowerCase().includes(q),
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
	}, [faculties, searchQuery, sortBy, sortOrder]);

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
							Faculty Compliance Totals
						</Text>
						<Badge variant="outline" className="text-xs">
							School-Wide Aggregates
						</Badge>
					</div>
					<Text variant="caption" color="muted">
						Compare aggregate lecture delivery, hold rates, and session
						compliance across all faculties under the school.
					</Text>
				</div>

				<div className="relative w-full sm:w-64">
					<Search
						size={14}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
					/>
					<input
						type="text"
						placeholder="Search faculty..."
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
			) : filteredFaculties.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="w-full text-xs text-left border-collapse">
						<thead>
							<tr className="border-b border-border text-text-muted">
								<th className="py-2.5 px-3 font-semibold">Faculty</th>
								<th className="py-2.5 px-3 font-semibold">Code</th>
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
								{onSelectFaculty && (
									<th className="py-2.5 px-3 font-semibold text-right">
										Action
									</th>
								)}
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40">
							{filteredFaculties.map((item, idx) => {
								const rate = Number(item.holdRatePercentage ?? 0);
								return (
									<tr
										key={item.facultyId || item.key || idx}
										className="hover:bg-surface-raised/40 transition-colors"
									>
										<td className="py-3 px-3">
											<div className="flex items-center gap-2">
												<div className="p-1.5 rounded-lg bg-primary/10 text-primary">
													<Building2 size={13} />
												</div>
												<span className="font-semibold text-text-main">
													{item.facultyName || item.label}
												</span>
											</div>
										</td>
										<td className="py-3 px-3 font-mono text-text-muted">
											{item.facultyCode || "FAC"}
										</td>
										<td className="py-3 px-3 font-semibold">
											{item.totalSessions ?? 0}
										</td>
										<td className="py-3 px-3 text-emerald-400 font-semibold">
											{item.heldCount ?? 0}
										</td>
										<td className="py-3 px-3 text-rose-400 font-semibold">
											{item.notHeldCount ?? 0}
										</td>
										<td className="py-3 px-3 text-amber-400 font-semibold">
											{item.unreportedCount ?? 0}
										</td>
										<td className="py-3 px-3">
											<div className="flex items-center gap-2">
												<div className="w-16 h-1.5 bg-surface-raised rounded-full overflow-hidden border border-border">
													<div
														className={`h-full transition-all ${
															rate >= 75
																? "bg-emerald-500"
																: rate >= 50
																	? "bg-amber-500"
																	: "bg-rose-500"
														}`}
														style={{ width: `${Math.min(100, rate)}%` }}
													/>
												</div>
												<span
													className={`font-bold ${
														rate >= 75
															? "text-emerald-400"
															: rate >= 50
																? "text-amber-400"
																: "text-rose-400"
													}`}
												>
													{rate.toFixed(1)}%
												</span>
											</div>
										</td>
										{onSelectFaculty && (
											<td className="py-3 px-3 text-right">
												{item.facultyId || item.key ? (
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															onSelectFaculty(
																String(item.facultyId || item.key),
															)
														}
														className="h-7 text-xs text-primary hover:bg-primary/10 px-2"
													>
														View Trend
													</Button>
												) : null}
											</td>
										)}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			) : (
				<div className="py-12 text-center text-text-muted text-xs border border-dashed border-border/60 rounded-xl">
					No faculty compliance records found matching your filters.
				</div>
			)}
		</Card>
	);
}
