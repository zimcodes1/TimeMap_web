import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { History, Search, Clock, Eye, CalendarDays } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import type { ExamOptimizerResult } from "@/api/main/examOptimizerAPI";

interface ExamGenerationHistoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	runs: ExamOptimizerResult[];
	isLoading?: boolean;
}

export const ExamGenerationHistoryModal: React.FC<
	ExamGenerationHistoryModalProps
> = ({ isOpen, onClose, runs = [], isLoading = false }) => {
	const [statusFilter, setStatusFilter] = useState<string>("ALL");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredRuns = useMemo(() => {
		return runs.filter((run) => {
			if (statusFilter !== "ALL" && run.status !== statusFilter) {
				return false;
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchesScope = run.scope_name?.toLowerCase().includes(q);
				const matchesType = run.scope_type?.toLowerCase().includes(q);
				const matchesId = String(run.run_id).toLowerCase().includes(q);
				if (!matchesScope && !matchesType && !matchesId) {
					return false;
				}
			}
			return true;
		});
	}, [runs, statusFilter, searchQuery]);

	const getStatusBadge = (status?: string) => {
		if (status === "published") {
			return (
				<Badge
					variant="success"
					className="text-[10px] py-0.5 px-2 font-bold uppercase"
				>
					Published
				</Badge>
			);
		}
		if (status === "approved") {
			return (
				<Badge
					variant="info"
					className="text-[10px] py-0.5 px-2 font-bold uppercase"
				>
					Approved
				</Badge>
			);
		}
		return (
			<Badge
				variant="warning"
				className="text-[10px] py-0.5 px-2 font-bold uppercase"
			>
				Draft
			</Badge>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			title={
				<div className="flex items-center gap-2">
					<History size={18} className="text-primary" />
					<span>Exam Timetable Generation History</span>
				</div>
			}
			description="Audit past optimization runs, review constraint reports, and select runs to inspect or publish."
			footer={
				<Button variant="outline" size="sm" onClick={onClose} className="px-5">
					Close
				</Button>
			}
		>
			<div className="space-y-4 py-1">
				{/* Search & Filter Bar */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface-raised border border-border rounded-xl">
					<div className="relative flex-1">
						<Search
							size={14}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
						/>
						<Input
							placeholder="Search by scope name, type, or run ID..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8 h-9 text-xs"
						/>
					</div>

					<div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-xl text-xs">
						{[
							{ id: "ALL", label: "All Runs" },
							{ id: "published", label: "Published" },
							{ id: "approved", label: "Approved" },
							{ id: "draft", label: "Drafts" },
						].map((tab) => {
							const isSelected = statusFilter === tab.id;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => setStatusFilter(tab.id)}
									className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
										isSelected
											? "bg-primary text-white font-bold"
											: "text-text-muted hover:text-text-main"
									}`}
								>
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Runs List */}
				<div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1">
					{isLoading ? (
						<div className="py-16 text-center text-xs text-text-muted animate-pulse">
							Loading generation history...
						</div>
					) : filteredRuns.length === 0 ? (
						<div className="py-16 text-center space-y-2">
							<CalendarDays
								size={22}
								className="mx-auto text-text-muted opacity-50"
							/>
							<Text variant="caption" color="muted">
								No matching exam generation runs found.
							</Text>
						</div>
					) : (
						filteredRuns.map((run) => {
							const dateObj = run.created_at ? new Date(run.created_at) : null;
							const formattedDate = dateObj
								? dateObj.toLocaleDateString(undefined, {
										month: "short",
										day: "numeric",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})
								: "";

							const scheduledCount = Number(
								run.metrics?.courses_scheduled ?? run.events.length,
							);
							const totalCount = Number(
								run.metrics?.courses_total ??
									scheduledCount + (run.diagnostics?.unscheduled?.length || 0),
							);
							const hardConflicts = Number(run.metrics?.hard_conflicts || 0);

							return (
								<div
									key={String(run.run_id)}
									className="p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-hover/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
								>
									<div className="space-y-1">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-bold text-sm text-text-main">
												{run.scope_name || `${run.scope_type} #${run.scope_id}`}
											</span>
											<Badge
												variant="outline"
												className="text-[10px] py-0 px-1.5 uppercase font-semibold"
											>
												{run.scope_type}
											</Badge>
											{getStatusBadge(run.status)}
											<span className="text-xs text-text-muted font-mono">
												Run #{String(run.run_id).slice(0, 8)}
											</span>
										</div>

										<div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
											<span>
												<strong>{scheduledCount}</strong> / {totalCount} courses
											</span>
											<span>•</span>
											<span
												className={
													hardConflicts === 0
														? "text-emerald-400 font-medium"
														: "text-danger font-medium"
												}
											>
												{hardConflicts === 0
													? "0 Hard Conflicts"
													: `${hardConflicts} Conflicts`}
											</span>
											{run.created_by_name && (
												<>
													<span>•</span>
													<span>By {run.created_by_name}</span>
												</>
											)}
											{formattedDate && (
												<>
													<span>•</span>
													<span className="inline-flex items-center gap-1">
														<Clock size={11} /> {formattedDate}
													</span>
												</>
											)}
										</div>
									</div>

									<div className="shrink-0 flex items-center gap-2">
										<Link
											to="/exams/generator/$runId"
											params={{ runId: String(run.run_id) }}
											onClick={onClose}
										>
											<Button
												variant="primary"
												size="sm"
												className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
											>
												<Eye size={13} />
												<span>Inspect</span>
											</Button>
										</Link>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</Modal>
	);
};
