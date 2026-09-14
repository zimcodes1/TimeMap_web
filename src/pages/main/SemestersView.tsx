import { RefreshCw, CalendarRange, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { SessionsAndSemestersView } from "@/components/semesters/SessionsAndSemestersView";
import type { AcademicSession, Semester, User } from "@/types";

export interface SemestersViewProps {
	sessions: AcademicSession[];
	sessionsLoading: boolean;
	semesters: Semester[];
	semestersLoading: boolean;
	isRefetching: boolean;
	onManualRefresh: () => void;
	onOpenCreateSession: () => void;
	onOpenCreateSemester: () => void;
	onEditSemester: (semester: Semester) => void;
	onActivateSemester: (id: string) => void;
	onDeleteSemester: (id: string, name: string) => void;
	currentUser?: User | null;
}

export default function SemestersView({
	sessions,
	sessionsLoading,
	semesters,
	semestersLoading,
	isRefetching,
	onManualRefresh,
	onOpenCreateSession,
	onOpenCreateSemester,
	onEditSemester,
	onActivateSemester,
	onDeleteSemester,
}: SemestersViewProps) {
	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
							<CalendarRange size={20} />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<Text variant="h3" weight="bold" className="text-text-main">
									Academic Sessions & Semesters
								</Text>
							</div>
							<Text variant="body-sm" color="muted">
								Manage your school's academic calendar, sessions, and semester
								timelines for scheduling.
							</Text>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onManualRefresh}
						disabled={isRefetching}
						className="h-8 gap-1.5 text-xs cursor-pointer"
					>
						<RefreshCw
							size={13}
							className={isRefetching ? "animate-spin text-primary" : ""}
						/>
						<span>{isRefetching ? "Refreshing..." : "Refresh"}</span>
					</Button>

					<Button
						variant="outline"
						size="sm"
						onClick={onOpenCreateSession}
						className="cursor-pointer"
					>
						<Plus size={15} className="mr-1" /> New Session
					</Button>

					<Button
						variant="primary"
						size="sm"
						onClick={onOpenCreateSemester}
						disabled={sessions.length === 0}
						className="cursor-pointer"
					>
						<Plus size={15} className="mr-1" /> New Semester
					</Button>
				</div>
			</div>

			{/* Sessions and Semesters Table and Overview */}
			<SessionsAndSemestersView
				sessions={sessions}
				semesters={semesters}
				isLoading={sessionsLoading || semestersLoading}
				canManage={true}
				onOpenCreateSession={onOpenCreateSession}
				onOpenCreateSemester={onOpenCreateSemester}
				onEditSemester={onEditSemester}
				onActivateSemester={onActivateSemester}
				onDeleteSemester={onDeleteSemester}
			/>
		</div>
	);
}
