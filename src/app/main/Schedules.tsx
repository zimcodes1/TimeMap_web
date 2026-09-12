import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SchedulesView from "@/pages/main/SchedulesView";
import ScheduleEntryModal from "@/components/modals/ScheduleEntryModal";
import ConflictFeedbackModal from "@/components/modals/ConflictFeedbackModal";
import SessionShiftModal from "@/components/modals/SessionShiftModal";
import CreateExamSittingModal from "@/components/modals/CreateExamSittingModal";
import {
	getTimetableEntries,
	createTimetableEntry,
	getLectureSessions,
	updateLectureSessionAPI,
	getExamSittings,
	createExamSittingAPI,
	getCoursesOptions,
	getVenuesOptions,
	getLecturersOptions,
	type CreateScheduleEntryPayload,
} from "@/api/main/schedulesAPI";
import { getPrograms } from "@/api/main/programsAPI";
import { getSemesters } from "@/api/main/semestersAPI";
import type {
	TimetableEntry,
	LectureSession,
	ExamSitting,
	ConflictOutcomeType,
} from "@/types";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export default function SchedulesContainer() {
	const queryClient = useQueryClient();

	const [isScheduleEntryOpen, setIsScheduleEntryOpen] = useState(false);
	const [scheduleEntryDefaults, setScheduleEntryDefaults] = useState<{
		day?: string;
		startTime?: string;
		endTime?: string;
	}>({});
	const [isExamSittingOpen, setIsExamSittingOpen] = useState(false);
	const [selectedSessionForShift, setSelectedSessionForShift] =
		useState<LectureSession | null>(null);

	// Conflict Feedback Modal State
	const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
	const [conflictOutcome, setConflictOutcome] =
		useState<ConflictOutcomeType>("PROCEED");
	const [conflictDetailMsg, setConflictDetailMsg] = useState("");
	const [conflictsList, setConflictsList] = useState<
		Array<{
			type: string;
			venueName?: string;
			date?: string;
			startTime?: string;
			endTime?: string;
			conflictingTitle?: string;
		}>
	>([]);

	// React Query Data Fetching
	const {
		data: entriesData,
		isLoading: entriesLoading,
		isRefetching: entriesRefetching,
		refetch: refetchEntries,
	} = useQuery({
		queryKey: ["scheduling", "entries"],
		queryFn: () => getTimetableEntries(),
	});

	const {
		data: sessionsData,
		isLoading: sessionsLoading,
		isRefetching: sessionsRefetching,
		refetch: refetchSessions,
	} = useQuery({
		queryKey: ["scheduling", "sessions"],
		queryFn: () => getLectureSessions(),
	});

	const {
		data: examSittingsData,
		isLoading: examSittingsLoading,
		isRefetching: examSittingsRefetching,
		refetch: refetchExams,
	} = useQuery({
		queryKey: ["scheduling", "exam-sittings"],
		queryFn: getExamSittings,
	});

	const { data: coursesData } = useQuery({
		queryKey: ["courses", "list"],
		queryFn: getCoursesOptions,
	});

	const { data: venuesData } = useQuery({
		queryKey: ["venues", "list"],
		queryFn: getVenuesOptions,
	});

	const { data: lecturersData } = useQuery({
		queryKey: ["auth", "lecturers"],
		queryFn: getLecturersOptions,
	});

	const { data: programsData } = useQuery({
		queryKey: ["programs", "list"],
		queryFn: () => getPrograms(),
	});

	const { data: semestersData } = useQuery({
		queryKey: ["semesters", "list"],
		queryFn: () => getSemesters(),
	});

	// Combine with mock fallback if backend list is empty during dev setup
	const entries: TimetableEntry[] | undefined = entriesData;
	const sessions: LectureSession[] | undefined = sessionsData;
	const examSittings: ExamSitting[] | undefined = examSittingsData;

	const courses = coursesData ?? [];
	const venues = venuesData ?? [];
	const lecturers = lecturersData ?? [];
	const programs = programsData ?? [];
	const semesters = semestersData ?? [];

	const isRefetching =
		entriesRefetching || sessionsRefetching || examSittingsRefetching;

	// Manual Refresh Handler
	const handleManualRefresh = async () => {
		await Promise.all([refetchEntries(), refetchSessions(), refetchExams()]);
		toast.success("Schedule data refreshed successfully");
	};

	// Mutations
	const createEntryMutation = useMutation({
		mutationFn: (payload: CreateScheduleEntryPayload) =>
			createTimetableEntry(payload),
		onSuccess: (result) => {
			if (result.outcome === "PROCEED") {
				toast.success("Schedule entry created successfully (201 PROCEED)");
				setIsScheduleEntryOpen(false);
				queryClient.invalidateQueries({ queryKey: ["scheduling", "entries"] });
				queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
			} else if (result.outcome === "ROUTE_APPROVAL") {
				setConflictOutcome("ROUTE_APPROVAL");
				setConflictDetailMsg(
					result.message ||
						"Booking touches a venue outside your scope and has been routed for approval.",
				);
				setConflictsList([]);
				setIsConflictModalOpen(true);
				setIsScheduleEntryOpen(false);
			} else if (result.outcome === "HARD_REJECT") {
				setConflictOutcome("HARD_REJECT");
				setConflictDetailMsg(
					result.detail ||
						"Booking clashes with existing schedule entries/duties.",
				);
				setConflictsList(
					(result.conflicts || []).map((c) => ({
						type: c.type,
						venueName: c.venue_name,
						date: c.date,
						startTime: c.start_time,
						endTime: c.end_time,
						conflictingTitle: c.conflicting_title,
					})),
				);
				setIsConflictModalOpen(true);
			}
		},
		onError: () => {
			toast.error("Failed to create schedule entry");
		},
	});

	const shiftSessionMutation = useMutation({
		mutationFn: ({
			sessionId,
			venueId,
			startTime,
			endTime,
		}: {
			sessionId: string;
			venueId: string;
			startTime: string;
			endTime: string;
		}) =>
			updateLectureSessionAPI(sessionId, {
				venue: venueId,
				session_start_time: startTime,
				session_end_time: endTime,
				status: "shifted",
			}),
		onSuccess: (_, variables) => {
			toast.success(
				`Session shifted (${variables.startTime} - ${variables.endTime})`,
			);
			setSelectedSessionForShift(null);
			queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
		},
		onError: (err: unknown) => {
			const error = err as AxiosError<{ detail?: string; message?: string }>;
			const detail =
				error.response?.data?.detail || error.response?.data?.message;
			if (detail) {
				toast.error(detail);
			} else {
				toast.error("Failed to shift session instance");
			}
		},
	});

	const createExamSittingMutation = useMutation({
		mutationFn: (payload: {
			timetable_entry: string;
			invigilators: string[];
		}) =>
			createExamSittingAPI({
				timetable_entry: payload.timetable_entry,
				invigilators: payload.invigilators,
			}),
		onSuccess: () => {
			toast.success("Exam sitting created successfully");
			setIsExamSittingOpen(false);
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "exam-sittings"],
			});
		},
		onError: () => {
			toast.error("Failed to create exam sitting");
		},
	});

	const handleOpenScheduleEntry = (
		defaultDay?: string,
		defaultSlot?: { start: string; end: string },
	) => {
		setScheduleEntryDefaults({
			day: defaultDay,
			startTime: defaultSlot?.start,
			endTime: defaultSlot?.end,
		});
		setIsScheduleEntryOpen(true);
	};

	const handleCreateScheduleEntrySubmit = (data: Record<string, unknown>) => {
		createEntryMutation.mutate({
			entry_type:
				(data.entry_type as CreateScheduleEntryPayload["entry_type"]) ||
				"lecture",
			title: (data.title as string) || "Lecture",
			course: (data.course as string) || "",
			venue: (data.venue as string) || "",
			start_time: (data.start_time as string) || "08:00:00",
			end_time: (data.end_time as string) || "10:00:00",
			recurrence_rule: (data.recurrence_rule as string) || "weekly:monday",
			recurrence_start_date:
				(data.recurrence_start_date as string) ||
				new Date().toISOString().split("T")[0],
			recurrence_end_date: (data.recurrence_end_date as string) || "",
			academic_session: (data.academic_session as string) || undefined,
			semester: (data.semester as string) || undefined,
			program: (data.target_program as string) || undefined,
		});
	};

	const handleShiftSessionSubmit = (data: {
		venueId: string;
		startTime: string;
		endTime: string;
	}) => {
		if (!selectedSessionForShift) return;
		shiftSessionMutation.mutate({
			sessionId: selectedSessionForShift.id,
			venueId: data.venueId,
			startTime: data.startTime,
			endTime: data.endTime,
		});
	};

	const handleCreateExamSittingSubmit = (data: {
		timetableEntryId: string;
		invigilatorIds: string[];
	}) => {
		createExamSittingMutation.mutate({
			timetable_entry: data.timetableEntryId,
			invigilators: data.invigilatorIds,
		});
	};

	return (
		<>
			<SchedulesView
				entries={entries}
				entriesLoading={entriesLoading}
				sessions={sessions}
				sessionsLoading={sessionsLoading}
				examSittings={examSittings}
				examSittingsLoading={examSittingsLoading}
				isRefetching={isRefetching}
				programs={programs}
				semesters={semesters}
				onManualRefresh={handleManualRefresh}
				onOpenScheduleEntry={handleOpenScheduleEntry}
				onOpenExamSitting={() => setIsExamSittingOpen(true)}
				onShiftSessionTrigger={(s) => setSelectedSessionForShift(s)}
			/>

			<ScheduleEntryModal
				isOpen={isScheduleEntryOpen}
				onClose={() => setIsScheduleEntryOpen(false)}
				onSubmit={handleCreateScheduleEntrySubmit}
				courses={courses}
				venues={venues}
				semesters={semesters}
				programs={programs}
				defaultDay={scheduleEntryDefaults.day}
				defaultStartTime={scheduleEntryDefaults.startTime}
				defaultEndTime={scheduleEntryDefaults.endTime}
			/>

			<SessionShiftModal
				isOpen={Boolean(selectedSessionForShift)}
				onClose={() => setSelectedSessionForShift(null)}
				onSubmit={handleShiftSessionSubmit}
				session={selectedSessionForShift}
				venues={venues}
			/>

			<CreateExamSittingModal
				isOpen={isExamSittingOpen}
				onClose={() => setIsExamSittingOpen(false)}
				onSubmit={handleCreateExamSittingSubmit}
				entries={entries ?? []}
				lecturers={lecturers}
			/>

			<ConflictFeedbackModal
				isOpen={isConflictModalOpen}
				onClose={() => setIsConflictModalOpen(false)}
				outcomeType={conflictOutcome}
				detailMessage={conflictDetailMsg}
				conflicts={conflictsList}
			/>
		</>
	);
}
