import { useState, useMemo, useEffect } from "react";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Calendar,
	Plus,
	Sparkles,
	ChevronsUpDown,
	CalendarRange,
	Layers,
} from "lucide-react";
import type { AcademicSession, Semester } from "@/types";
import { SessionAccordionItem } from "./SessionAccordionItem";

export interface SessionsAndSemestersViewProps {
	sessions: AcademicSession[];
	semesters: Semester[];
	isLoading?: boolean;
	canManage: boolean;
	onOpenCreateSession: () => void;
	onOpenCreateSemester: (preselectedSessionId?: string) => void;
	onEditSession: (session: AcademicSession) => void;
	onSetCurrentSession: (id: string) => void;
	onDeleteSession: (id: string, label: string) => void;
	onEditSemester: (semester: Semester) => void;
	onActivateSemester: (id: string) => void;
	onDeleteSemester: (id: string, name: string) => void;
}

export function SessionsAndSemestersView({
	sessions,
	semesters,
	isLoading = false,
	canManage,
	onOpenCreateSession,
	onOpenCreateSemester,
	onEditSession,
	onSetCurrentSession,
	onDeleteSession,
	onEditSemester,
	onActivateSemester,
	onDeleteSemester,
}: SessionsAndSemestersViewProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(
		new Set(),
	);

	const currentSession = sessions.find((s) => s.isCurrent);
	const activeSemester = semesters.find((s) => s.isActive);

	// Expand the current active session by default when sessions load
	useEffect(() => {
		if (sessions.length > 0) {
			const current = sessions.find((s) => s.isCurrent);
			if (current) {
				setExpandedSessionIds((prev) => {
					if (prev.size === 0) {
						return new Set([current.id]);
					}
					return prev;
				});
			} else if (sessions.length > 0) {
				setExpandedSessionIds((prev) => {
					if (prev.size === 0) {
						return new Set([sessions[0].id]);
					}
					return prev;
				});
			}
		}
	}, [sessions]);

	// Auto-expand all sessions if user is actively searching
	useEffect(() => {
		if (searchQuery.trim()) {
			setExpandedSessionIds(new Set(sessions.map((s) => s.id)));
		}
	}, [searchQuery, sessions]);

	const toggleExpand = (sessionId: string) => {
		setExpandedSessionIds((prev) => {
			const next = new Set(prev);
			if (next.has(sessionId)) {
				next.delete(sessionId);
			} else {
				next.add(sessionId);
			}
			return next;
		});
	};

	const toggleExpandAll = () => {
		if (expandedSessionIds.size === sessions.length) {
			setExpandedSessionIds(new Set());
		} else {
			setExpandedSessionIds(new Set(sessions.map((s) => s.id)));
		}
	};

	// Map semesters by their parent sessionId
	const semestersBySessionId = useMemo(() => {
		const map = new Map<string, Semester[]>();
		for (const sem of semesters) {
			const list = map.get(String(sem.sessionId)) || [];
			list.push(sem);
			map.set(String(sem.sessionId), list);
		}
		return map;
	}, [semesters]);

	// Filter sessions and their child semesters based on search query
	const filteredSessions = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		if (!query) return sessions;

		return sessions.filter((session) => {
			const matchesSession =
				session.label.toLowerCase().includes(query) ||
				session.startDate?.includes(query) ||
				session.endDate?.includes(query) ||
				session.schoolName?.toLowerCase().includes(query);

			const sessionSemesters =
				semestersBySessionId.get(String(session.id)) || [];
			const matchesChildSemester = sessionSemesters.some(
				(sem) =>
					sem.displayName?.toLowerCase().includes(query) ||
					sem.name.toLowerCase().includes(query) ||
					sem.startDate?.includes(query) ||
					sem.endDate?.includes(query) ||
					sem.lectureStartDate?.includes(query) ||
					sem.lectureEndDate?.includes(query) ||
					sem.examStartDate?.includes(query) ||
					sem.examEndDate?.includes(query),
			);

			return matchesSession || matchesChildSemester;
		});
	}, [sessions, searchQuery, semestersBySessionId]);

	// Find orphaned semesters (those without a matching parent session)
	const sessionIds = useMemo(
		() => new Set(sessions.map((s) => String(s.id))),
		[sessions],
	);
	const orphanSemesters = useMemo(() => {
		return semesters.filter((sem) => !sessionIds.has(String(sem.sessionId)));
	}, [semesters, sessionIds]);

	return (
		<div className="space-y-6">
			{/* Current Academic Status Banner */}
			<div className="grid gap-4 sm:grid-cols-3">
				{/* Current Session */}
				<div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between shadow-xs">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
							<Calendar size={20} />
						</div>
						<div>
							<Text variant="caption" color="muted">
								Current Session
							</Text>
							<Text variant="body" weight="bold" className="text-text-main">
								{currentSession ? currentSession.label : "None Active"}
							</Text>
						</div>
					</div>
					{currentSession ? (
						<Badge
							variant="primary"
							className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
						>
							Current
						</Badge>
					) : (
						<Badge variant="outline" className="text-xs text-text-muted">
							Not set
						</Badge>
					)}
				</div>

				{/* Active Semester */}
				<div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between shadow-xs">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
							<Sparkles size={20} />
						</div>
						<div>
							<Text variant="caption" color="muted">
								Active Semester
							</Text>
							<Text variant="body" weight="bold" className="text-text-main">
								{activeSemester
									? activeSemester.displayName ||
										(activeSemester.name === "first"
											? "First Semester"
											: "Second Semester")
									: "No Active Semester"}
							</Text>
						</div>
					</div>
					{activeSemester ? (
						<Badge
							variant="primary"
							className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
						>
							Active
						</Badge>
					) : (
						<Badge variant="outline" className="text-xs text-text-muted">
							Not set
						</Badge>
					)}
				</div>

				{/* Overview Counts */}
				<div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between shadow-xs">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted">
							<Layers size={20} />
						</div>
						<div>
							<Text variant="caption" color="muted">
								Academic Scope
							</Text>
							<Text variant="body" weight="bold" className="text-text-main">
								{sessions.length}{" "}
								{sessions.length === 1 ? "Session" : "Sessions"} &bull;{" "}
								{semesters.length}{" "}
								{semesters.length === 1 ? "Semester" : "Semesters"}
							</Text>
						</div>
					</div>
					<Badge variant="secondary" className="text-xs">
						Overview
					</Badge>
				</div>
			</div>

			{/* Action Toolbar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<TableToolbar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					searchPlaceholder="Search sessions or semesters..."
					totalCount={sessions.length}
					filteredCount={filteredSessions.length}
				/>

				<div className="flex items-center gap-2 shrink-0">
					{sessions.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={toggleExpandAll}
							className="h-8 gap-1.5 text-xs cursor-pointer"
						>
							<ChevronsUpDown size={14} />
							<span>
								{expandedSessionIds.size === sessions.length
									? "Collapse All"
									: "Expand All"}
							</span>
						</Button>
					)}

					{canManage && (
						<>
							<Button
								variant="primary"
								size="sm"
								onClick={onOpenCreateSession}
								className="cursor-pointer"
							>
								<Plus size={15} className="mr-1" /> Add Session
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Main Content List */}
			{isLoading ? (
				<div className="space-y-4">
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className="bg-surface border border-border p-5 rounded-2xl space-y-3"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Skeleton className="w-8 h-8 rounded-lg" />
									<Skeleton className="w-10 h-10 rounded-xl" />
									<div className="space-y-1.5">
										<Skeleton className="h-5 w-44" />
										<Skeleton className="h-3.5 w-60" />
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Skeleton className="h-8 w-24 rounded-lg" />
									<Skeleton className="h-8 w-20 rounded-lg" />
								</div>
							</div>
						</div>
					))}
				</div>
			) : sessions.length === 0 ? (
				<div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
					<div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center text-text-subtle">
						<CalendarRange size={24} />
					</div>
					<Text variant="h6" weight="bold" className="text-text-main">
						No Academic Sessions Configured
					</Text>
					<Text variant="body-sm" color="muted" className="max-w-md">
						Create an academic session (e.g., 2026/2027) to define teaching
						semesters, timetable generation limits, and lecture schedules.
					</Text>
					{canManage && (
						<div className="flex items-center gap-2 mt-2">
							<Button
								variant="primary"
								size="sm"
								onClick={onOpenCreateSession}
								className="cursor-pointer"
							>
								<Plus size={16} className="mr-1" /> Create Academic Session
							</Button>
						</div>
					)}
				</div>
			) : filteredSessions.length === 0 ? (
				<div className="flex flex-col items-center justify-center p-10 text-center bg-surface border border-border rounded-2xl space-y-2">
					<Text variant="body" weight="medium" className="text-text-main">
						No academic sessions or semesters match your search
					</Text>
					<Text variant="caption" color="muted">
						Try searching with a different term or clear the filter.
					</Text>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setSearchQuery("")}
						className="mt-2 text-xs cursor-pointer"
					>
						Clear Search
					</Button>
				</div>
			) : (
				<div className="space-y-4">
					{filteredSessions.map((session) => (
						<SessionAccordionItem
							key={session.id}
							session={session}
							semesters={semestersBySessionId.get(String(session.id)) || []}
							isExpanded={expandedSessionIds.has(session.id)}
							onToggleExpand={() => toggleExpand(session.id)}
							canManage={canManage}
							onOpenCreateSemester={(sId) => onOpenCreateSemester(sId)}
							onEditSession={onEditSession}
							onSetCurrentSession={onSetCurrentSession}
							onDeleteSession={onDeleteSession}
							onEditSemester={onEditSemester}
							onActivateSemester={onActivateSemester}
							onDeleteSemester={onDeleteSemester}
						/>
					))}

					{/* Orphan Semesters (if any exist without a parent session) */}
					{orphanSemesters.length > 0 && (
						<div className="mt-8 pt-6 border-t border-border">
							<div className="mb-3">
								<Text variant="caption" weight="bold" color="muted">
									UNASSIGNED SEMESTERS ({orphanSemesters.length})
								</Text>
								<Text variant="caption" color="muted">
									Semesters not currently tied to any active academic session.
								</Text>
							</div>

							<div className="border border-border rounded-2xl bg-surface overflow-hidden">
								<table className="w-full text-left border-collapse text-xs">
									<thead>
										<tr className="border-b border-border bg-surface-raised/60 text-text-muted font-semibold">
											<th className="py-2.5 px-3">Semester</th>
											<th className="py-2.5 px-3">Calendar Dates</th>
											<th className="py-2.5 px-3">Lecture Period</th>
											{canManage && (
												<th className="py-2.5 px-3 text-right">Actions</th>
											)}
										</tr>
									</thead>
									<tbody className="divide-y divide-border/50">
										{orphanSemesters.map((sem) => (
											<tr key={sem.id} className="hover:bg-surface-raised/40">
												<td className="py-3 px-3">
													<div className="flex items-center gap-2">
														<span className="font-semibold text-text-main">
															{sem.displayName || sem.name}
														</span>
														{sem.isActive && (
															<Badge
																variant="primary"
																className="text-[10px] py-0 px-1.5 bg-emerald-500/20 text-emerald-400"
															>
																Active
															</Badge>
														)}
													</div>
												</td>
												<td className="py-3 px-3 text-text-main">
													{sem.startDate} &rarr; {sem.endDate}
												</td>
												<td className="py-3 px-3">
													{sem.lectureStartDate && sem.lectureEndDate ? (
														<span>
															{sem.lectureStartDate} &rarr; {sem.lectureEndDate}
														</span>
													) : (
														<span className="text-text-muted">Not set</span>
													)}
												</td>
												{canManage && (
													<td className="py-3 px-3 text-right">
														<div className="flex items-center justify-end gap-1.5">
															<Button
																variant="outline"
																size="sm"
																onClick={() => onEditSemester(sem)}
																className="h-7 px-2 text-xs"
															>
																Edit
															</Button>
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	onDeleteSemester(
																		sem.id,
																		sem.displayName || sem.name,
																	)
																}
																className="h-7 px-2 text-xs text-danger"
															>
																Delete
															</Button>
														</div>
													</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
