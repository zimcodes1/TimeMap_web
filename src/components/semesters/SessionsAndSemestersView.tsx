import { useState } from "react";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Calendar,
	Plus,
	Edit2,
	Trash2,
	CheckCircle,
	Sparkles,
} from "lucide-react";
import type { AcademicSession, Semester } from "@/types";

export interface SessionsAndSemestersViewProps {
	sessions: AcademicSession[];
	semesters: Semester[];
	isLoading?: boolean;
	canManage: boolean;
	onOpenCreateSession: () => void;
	onOpenCreateSemester: () => void;
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
	onEditSemester,
	onActivateSemester,
	onDeleteSemester,
}: SessionsAndSemestersViewProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	const currentSession = sessions.find((s) => s.isCurrent);
	const activeSemester = semesters.find((s) => s.isActive);

	const filteredSemesters = semesters.filter(
		(s) =>
			s.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(s.sessionLabel &&
				s.sessionLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
			(s.schoolName &&
				s.schoolName.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	return (
		<div className="space-y-6">
			{/* Current Academic Status Banner */}
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
							<Calendar size={20} />
						</div>
						<div>
							<Text variant="caption" color="muted">
								Current Session
							</Text>
							<Text variant="body" weight="bold" className="text-text-main">
								{currentSession ? currentSession.label : "None active"}
							</Text>
						</div>
					</div>
					{currentSession && (
						<Badge variant="primary" className="text-xs">
							Current
						</Badge>
					)}
				</div>

				<div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between">
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
									? `${activeSemester.displayName || (activeSemester.name === "first" ? "First Semester" : "Second Semester")} (${activeSemester.sessionLabel || ""})`
									: "No semester active"}
							</Text>
						</div>
					</div>
					{activeSemester && (
						<Badge
							variant="primary"
							className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
						>
							Active
						</Badge>
					)}
				</div>
			</div>

			{/* Action Toolbar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<TableToolbar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					searchPlaceholder="Search semesters by session or name..."
					totalCount={semesters.length}
					filteredCount={filteredSemesters.length}
				/>

				{canManage && (
					<div className="flex items-center gap-2 shrink-0">
						<Button
							variant="outline"
							size="sm"
							onClick={onOpenCreateSession}
							className="cursor-pointer"
						>
							<Plus size={15} className="mr-1" /> Add Session
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={onOpenCreateSemester}
							disabled={sessions.length === 0}
							className="cursor-pointer"
						>
							<Plus size={15} className="mr-1" /> Add Semester
						</Button>
					</div>
				)}
			</div>

			{isLoading ? (
				<div className="space-y-3 bg-surface border border-border p-4 rounded-2xl">
					<div className="flex items-center justify-between pb-3 border-b border-border">
						<Skeleton className="h-5 w-36" />
						<Skeleton className="h-5 w-24" />
					</div>
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="flex items-center justify-between py-3 border-b border-border/50"
						>
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-44" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-7 w-28 rounded-lg" />
						</div>
					))}
				</div>
			) : filteredSemesters.length === 0 ? (
				<div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
					<div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center text-text-subtle">
						<Calendar size={24} />
					</div>
					<Text variant="h6" weight="bold" className="text-text-main">
						No semesters configured
					</Text>
					<Text variant="body-sm" color="muted">
						{sessions.length === 0
							? "Create an academic session first, then configure teaching semesters."
							: "No semesters have been scheduled for this school yet."}
					</Text>
					{canManage && (
						<div className="flex items-center gap-2 mt-2">
							<Button
								variant="outline"
								size="sm"
								onClick={onOpenCreateSession}
								className="cursor-pointer"
							>
								<Plus size={16} className="mr-1" /> Add Session
							</Button>
							<Button
								variant="primary"
								size="sm"
								onClick={onOpenCreateSemester}
								disabled={sessions.length === 0}
								className="cursor-pointer"
							>
								<Plus size={16} className="mr-1" /> Add Semester
							</Button>
						</div>
					)}
				</div>
			) : (
				<DataTable
					columns={[
						{
							header: "Semester",
							accessor: (sem: Semester) => (
								<div className="flex items-center gap-2">
									<span className="font-semibold text-text-main">
										{sem.displayName ||
											(sem.name === "first"
												? "First Semester"
												: "Second Semester")}
									</span>
									{sem.isActive && (
										<Badge
											variant="primary"
											className="text-[10px] py-0 px-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
										>
											Active
										</Badge>
									)}
								</div>
							),
						},
						{
							header: "Academic Session",
							accessor: (sem: Semester) => (
								<span className="font-medium text-primary">
									{sem.sessionLabel || "Session"}
								</span>
							),
						},
						{
							header: "Calendar Dates",
							accessor: (sem: Semester) => (
								<div className="text-xs space-y-0.5">
									<div className="text-text-main font-medium">
										{sem.startDate} &rarr; {sem.endDate}
									</div>
									{sem.durationValue ? (
										<div className="text-text-muted">
											Duration: {sem.durationValue} {sem.durationType}
										</div>
									) : null}
								</div>
							),
						},
						{
							header: "Teaching & Exams",
							accessor: (sem: Semester) => (
								<div className="text-xs space-y-0.5 text-text-muted">
									{sem.lectureStartDate && sem.lectureEndDate ? (
										<div>
											Lectures: {sem.lectureStartDate} - {sem.lectureEndDate}
										</div>
									) : (
										<div>Lectures: Not set</div>
									)}
									{sem.examStartDate && sem.examEndDate ? (
										<div>
											Exams: {sem.examStartDate} - {sem.examEndDate}
										</div>
									) : null}
								</div>
							),
						},
						...(canManage
							? [
									{
										header: "Actions",
										align: "right" as const,
										accessor: (sem: Semester) => (
											<div className="flex items-center justify-end gap-1.5">
												{!sem.isActive && (
													<Button
														variant="outline"
														size="sm"
														onClick={() => onActivateSemester(sem.id)}
														className="h-8 px-2 text-xs text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/30 cursor-pointer"
													>
														<CheckCircle size={13} className="mr-1" /> Activate
													</Button>
												)}
												<Button
													variant="outline"
													size="sm"
													onClick={() => onEditSemester(sem)}
													className="h-8 px-2 text-xs cursor-pointer"
												>
													<Edit2 size={13} className="mr-1" /> Edit
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
													className="h-8 px-2 text-xs text-danger hover:bg-danger-surface border-danger-surface cursor-pointer"
												>
													<Trash2 size={13} />
												</Button>
											</div>
										),
									},
								]
							: []),
					]}
					data={filteredSemesters}
					keyExtractor={(s) => s.id}
					currentPage={currentPage}
					onPageChange={setCurrentPage}
				/>
			)}
		</div>
	);
}
