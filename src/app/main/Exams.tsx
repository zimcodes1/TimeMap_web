import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getTimetableEntries,
	getLectureSessions,
	getExamSittings,
	getCoursesOptions,
	getVenuesOptions,
	getLecturersOptions,
	createExamSittingAPI,
	createTimetableEntry,
	updateLectureSessionAPI,
	type CreateScheduleEntryPayload,
} from "@/api/main/schedulesAPI";
import { getPrograms } from "@/api/main/programsAPI";
import { getSemesters } from "@/api/main/semestersAPI";
import type {
	TimetableEntry,
	LectureSession,
	ExamSitting,
	Course,
	Venue,
	User,
	Program,
	Semester,
} from "@/types";
import {
	getCurrentWeekNumber,
	getTotalWeeks,
	getWeekRange,
	getWeekDayDates,
} from "@/utils/semesterWeeks";
import ExamsView from "@/pages/main/ExamsView";
import CreateExamSittingModal from "@/components/modals/CreateExamSittingModal";
import ScheduleEntryModal from "@/components/modals/ScheduleEntryModal";
import SessionShiftModal from "@/components/modals/SessionShiftModal";
import ConflictFeedbackModal from "@/components/modals/ConflictFeedbackModal";

export default function ExamsContainer() {
	const queryClient = useQueryClient();

	// Modals state
	const [isExamSittingOpen, setIsExamSittingOpen] = useState(false);
	const [isScheduleEntryOpen, setIsScheduleEntryOpen] = useState(false);
	const [selectedSessionForShift, setSelectedSessionForShift] =
		useState<LectureSession | null>(null);

	// Defaults when clicking a slot in the grid
	const [scheduleEntryDefaults, setScheduleEntryDefaults] = useState<{
		day?: string;
		startTime?: string;
		endTime?: string;
	}>({});

	// Conflict modal state
	const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
	const [conflictOutcome, setConflictOutcome] = useState<
		"ROUTE_APPROVAL" | "HARD_REJECT" | null
	>(null);
	const [conflictDetailMsg, setConflictDetailMsg] = useState("");
	const [conflictsList, setConflictsList] = useState<
		Array<{
			venueName?: string;
			date?: string;
			startTime?: string;
			endTime?: string;
			conflictingTitle?: string;
		}>
	>([]);

	// Base Queries
	const { data: programsData = [] } = useQuery<Program[]>({
		queryKey: ["programs", "list"],
		queryFn: () => getPrograms(),
	});

	const { data: semestersData = [] } = useQuery<Semester[]>({
		queryKey: ["semesters", "list"],
		queryFn: () => getSemesters(),
	});

	const { data: coursesData = [] } = useQuery<Course[]>({
		queryKey: ["courses", "list"],
		queryFn: getCoursesOptions,
	});

	const { data: venuesData = [] } = useQuery<Venue[]>({
		queryKey: ["venues", "list"],
		queryFn: getVenuesOptions,
	});

	const { data: lecturersData = [] } = useQuery<User[]>({
		queryKey: ["auth", "lecturers"],
		queryFn: getLecturersOptions,
	});

	const {
		data: examSittingsData = [],
		isLoading: examSittingsLoading,
		refetch: refetchExams,
	} = useQuery<ExamSitting[]>({
		queryKey: ["scheduling", "exam-sittings"],
		queryFn: getExamSittings,
	});

	// Active semester
	const activeSemester = useMemo(() => {
		return semestersData.find((s) => s.isActive) || semestersData[0];
	}, [semestersData]);

	// Exam period weeks calculation (uses examStartDate & examEndDate, or defaults to 4 weeks)
	const totalWeeks = useMemo(() => {
		return getTotalWeeks(
			activeSemester?.examStartDate || activeSemester?.startDate,
			activeSemester?.examEndDate || activeSemester?.endDate,
			4,
		);
	}, [activeSemester]);

	const defaultCurrentWeek = useMemo(() => {
		return getCurrentWeekNumber(
			activeSemester?.examStartDate || activeSemester?.startDate,
			activeSemester?.examEndDate || activeSemester?.endDate,
			totalWeeks,
		);
	}, [activeSemester, totalWeeks]);

	// Program, Level, and Week state
	const [selectedProgramId, setSelectedProgramId] = useState<string>("");
	const [selectedLevel, setSelectedLevel] = useState<number>(100);
	const [currentWeek, setCurrentWeek] = useState<number>(1);

	useEffect(() => {
		if (programsData.length > 0 && !selectedProgramId) {
			const defaultProg =
				programsData.find((p) => p.isDefault) || programsData[0];
			if (defaultProg) {
				setSelectedProgramId(defaultProg.id);
			}
		}
	}, [programsData, selectedProgramId]);

	useEffect(() => {
		if (defaultCurrentWeek) {
			setCurrentWeek(defaultCurrentWeek);
		}
	}, [defaultCurrentWeek]);

	// Week range and day dates
	const weekRange = useMemo(() => {
		return getWeekRange(
			activeSemester?.examStartDate || activeSemester?.startDate,
			currentWeek,
		);
	}, [activeSemester, currentWeek]);

	const weekDayDates = useMemo(() => {
		return getWeekDayDates(weekRange.startDate);
	}, [weekRange]);

	const isCurrentWeekActive = currentWeek === defaultCurrentWeek;

	// Exam Timetable Entries Query (entry_type="exam")
	const {
		data: entriesData,
		isLoading: entriesLoading,
		isRefetching: entriesRefetching,
		refetch: refetchEntries,
	} = useQuery<TimetableEntry[]>({
		queryKey: [
			"scheduling",
			"entries",
			"exam",
			activeSemester?.id,
			selectedProgramId,
			selectedLevel,
		],
		queryFn: () =>
			getTimetableEntries({
				semester: activeSemester?.id,
				program: selectedProgramId || undefined,
				level: selectedLevel || undefined,
				entry_type: "exam",
			}),
	});

	// Exam Sessions Query (entry_type="exam")
	const {
		data: sessionsData,
		isLoading: sessionsLoading,
		isRefetching: sessionsRefetching,
		refetch: refetchSessions,
	} = useQuery<LectureSession[]>({
		queryKey: [
			"scheduling",
			"sessions",
			"exam",
			activeSemester?.id,
			selectedProgramId,
			selectedLevel,
			currentWeek,
			weekRange.startStr,
			weekRange.endStr,
		],
		queryFn: () =>
			getLectureSessions({
				semester: activeSemester?.id,
				program: selectedProgramId || undefined,
				level: selectedLevel || undefined,
				start_date: weekRange.startStr,
				end_date: weekRange.endStr,
				entry_type: "exam",
			}),
	});

	const isRefetching = entriesRefetching || sessionsRefetching;

	// Mutations
	const createExamSittingMutation = useMutation({
		mutationFn: (data: {
			timetable_entry: string | number;
			invigilators: Array<string | number>;
		}) => createExamSittingAPI(data),
		onSuccess: () => {
			toast.success("Exam sitting created and invigilators assigned!");
			setIsExamSittingOpen(false);
			queryClient.invalidateQueries({
				queryKey: ["scheduling", "exam-sittings"],
			});
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to create exam sitting.");
		},
	});

	const createEntryMutation = useMutation({
		mutationFn: (payload: CreateScheduleEntryPayload) =>
			createTimetableEntry(payload),
		onSuccess: (result) => {
			if (result.outcome === "PROCEED") {
				toast.success("Exam schedule entry created successfully!");
				setIsScheduleEntryOpen(false);
				queryClient.invalidateQueries({ queryKey: ["scheduling", "entries"] });
				queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
			} else if (result.outcome === "ROUTE_APPROVAL") {
				setIsScheduleEntryOpen(false);
				setConflictOutcome("ROUTE_APPROVAL");
				setConflictDetailMsg(result.message);
				setConflictsList([]);
				setIsConflictModalOpen(true);
				queryClient.invalidateQueries({ queryKey: ["scheduling", "entries"] });
			} else if (result.outcome === "HARD_REJECT") {
				setConflictOutcome("HARD_REJECT");
				setConflictDetailMsg(result.detail);
				setConflictsList(
					result.conflicts.map((c) => ({
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
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create exam entry.");
		},
	});

	const shiftSessionMutation = useMutation({
		mutationFn: ({
			id,
			venue,
			startTime,
			endTime,
		}: {
			id: string;
			venue?: string;
			startTime?: string;
			endTime?: string;
		}) =>
			updateLectureSessionAPI(id, {
				venue: venue ? Number(venue) : undefined,
				session_start_time: startTime,
				session_end_time: endTime,
				status: "shifted",
			}),
		onSuccess: () => {
			toast.success("Exam session shifted successfully.");
			setSelectedSessionForShift(null);
			queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to shift exam session.");
		},
	});

	const handlePreviousWeek = () => {
		setCurrentWeek((prev) => Math.max(1, prev - 1));
	};

	const handleNextWeek = () => {
		setCurrentWeek((prev) => Math.min(totalWeeks, prev + 1));
	};

	const handleResetToCurrentWeek = () => {
		setCurrentWeek(defaultCurrentWeek);
	};

	const handleManualRefresh = () => {
		refetchEntries();
		refetchSessions();
		refetchExams();
		toast.info("Refreshing exam schedule data...");
	};

	const handleOpenCreateExamEntry = (
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

	const handleCreateScheduleEntrySubmit = (data: {
		entryType: "lecture" | "exam" | "event";
		title?: string;
		courseId: string;
		venueId: string;
		dayOfWeek?: string;
		startTime: string;
		endTime: string;
		recurrenceRule?: string;
		startDate?: string;
		endDate?: string;
		semesterId?: string;
		targetProgramId?: string;
	}) => {
		createEntryMutation.mutate({
			entry_type: "exam",
			title: data.title || "Exam",
			course: data.courseId,
			venue: data.venueId,
			start_time: data.startTime,
			end_time: data.endTime,
			recurrence_rule: data.recurrenceRule,
			recurrence_start_date: data.startDate,
			recurrence_end_date: data.endDate,
			semester: data.semesterId,
			program: data.targetProgramId,
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
			<ExamsView
				entries={entriesData}
				entriesLoading={entriesLoading}
				sessions={sessionsData}
				sessionsLoading={sessionsLoading}
				examSittings={examSittingsData}
				examSittingsLoading={examSittingsLoading}
				isRefetching={isRefetching}
				programs={programsData}
				selectedProgramId={selectedProgramId}
				onSelectProgram={setSelectedProgramId}
				selectedLevel={selectedLevel}
				onSelectLevel={setSelectedLevel}
				currentWeek={currentWeek}
				totalWeeks={totalWeeks}
				onPreviousWeek={handlePreviousWeek}
				onNextWeek={handleNextWeek}
				onResetToCurrentWeek={handleResetToCurrentWeek}
				isCurrentWeekActive={isCurrentWeekActive}
				weekRange={weekRange}
				weekDayDates={weekDayDates}
				activeSemester={activeSemester}
				onManualRefresh={handleManualRefresh}
				onOpenCreateExamEntry={handleOpenCreateExamEntry}
				onOpenExamSitting={() => setIsExamSittingOpen(true)}
				onShiftSessionTrigger={(s) => setSelectedSessionForShift(s)}
			/>

			<CreateExamSittingModal
				isOpen={isExamSittingOpen}
				onClose={() => setIsExamSittingOpen(false)}
				onSubmit={handleCreateExamSittingSubmit}
				entries={entriesData ?? []}
				lecturers={lecturersData}
			/>

			<ScheduleEntryModal
				isOpen={isScheduleEntryOpen}
				onClose={() => setIsScheduleEntryOpen(false)}
				onSubmit={handleCreateScheduleEntrySubmit}
				courses={coursesData}
				venues={venuesData}
				semesters={semestersData}
				programs={programsData}
				defaultDay={scheduleEntryDefaults.day}
				defaultStartTime={scheduleEntryDefaults.startTime}
				defaultEndTime={scheduleEntryDefaults.endTime}
			/>

			<SessionShiftModal
				isOpen={Boolean(selectedSessionForShift)}
				onClose={() => setSelectedSessionForShift(null)}
				onSubmit={(data) =>
					shiftSessionMutation.mutate({
						id: data.sessionId,
						venue: data.venueId,
						startTime: data.startTime,
						endTime: data.endTime,
					})
				}
				session={selectedSessionForShift}
				venues={venuesData}
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
