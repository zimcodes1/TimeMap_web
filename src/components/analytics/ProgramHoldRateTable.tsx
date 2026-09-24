import { useState, useMemo } from "react";
import { Search, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { HoldRateBreakdownItem } from "@/types";

interface ProgramHoldRateTableProps {
	programs: HoldRateBreakdownItem[];
	isLoading?: boolean;
}

export default function ProgramHoldRateTable({
	programs = [],
	isLoading = false,
}: ProgramHoldRateTableProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredPrograms = useMemo(() => {
		if (!searchQuery.trim()) return programs;
		const q = searchQuery.toLowerCase();
		return programs.filter(
			(p) =>
				p.programName?.toLowerCase().includes(q) ||
				p.programCode?.toLowerCase().includes(q) ||
				p.label?.toLowerCase().includes(q),
		);
	}, [programs, searchQuery]);

	return (
		<Card className="p-5 space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
				<div>
					<Text variant="h6" weight="bold">
						Program-Level Delivery Rates
					</Text>
					<Text variant="caption" color="muted">
						Hold rate and syllabus progression segregated by academic program.
					</Text>
				</div>

				<div className="relative w-full sm:w-64">
					<Search
						size={14}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
					/>
					<input
						type="text"
						placeholder="Search program..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full text-xs bg-surface-raised border border-border rounded-xl pl-8 pr-3 py-2 text-text-main placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary"
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-28 w-full rounded-xl" />
					))}
				</div>
			) : filteredPrograms.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{filteredPrograms.map((item, idx) => {
						const rate = Number(item.holdRatePercentage ?? 0);
						const total =
							item.totalSessions ||
							(item.heldCount ?? 0) +
								(item.notHeldCount ?? 0) +
								(item.unreportedCount ?? 0);
						const name = item.programName || item.label || "Program";
						const code = item.programCode || "PRG";

						return (
							<Card
								key={item.programId || item.key || idx}
								className="p-4 space-y-3 bg-surface-raised/40 hover:bg-surface-raised/70 transition-all border border-border/60"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex items-center gap-2">
										<div className="p-2 rounded-lg bg-primary/10 text-primary">
											<GraduationCap size={16} />
										</div>
										<div>
											<Text
												variant="body-sm"
												weight="bold"
												className="text-text-main"
											>
												{name}
											</Text>
											<Text
												variant="caption"
												color="muted"
												className="font-mono"
											>
												{code}
											</Text>
										</div>
									</div>
									<Badge
										variant={
											rate >= 80 ? "success" : rate >= 60 ? "warning" : "danger"
										}
										className="text-xs font-bold"
									>
										{rate}%
									</Badge>
								</div>

								{/* Progress Bar */}
								<div className="w-full bg-surface h-2 rounded-full overflow-hidden">
									<div
										className={`h-full rounded-full transition-all duration-300 ${
											rate >= 80
												? "bg-emerald-500"
												: rate >= 60
													? "bg-amber-500"
													: "bg-rose-500"
										}`}
										style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
									/>
								</div>

								<div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 text-text-muted">
									<span>
										Total: <strong className="text-text-main">{total}</strong>
									</span>
									<span className="text-emerald-400">
										Held: <strong>{item.heldCount}</strong>
									</span>
									<span className="text-rose-400">
										Not Held: <strong>{item.notHeldCount}</strong>
									</span>
									<span className="text-amber-400">
										Unreported: <strong>{item.unreportedCount}</strong>
									</span>
								</div>
							</Card>
						);
					})}
				</div>
			) : (
				<div className="py-8 text-center text-text-subtle text-xs border border-dashed border-border/50 rounded-xl">
					<p className="font-semibold text-text-muted mb-1">
						No program records found
					</p>
					<p>
						No programs have active lecture hold reports for this selection.
					</p>
				</div>
			)}
		</Card>
	);
}
