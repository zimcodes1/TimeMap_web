import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getTimetableEntries,
	getLectureSessions,
	getCoursesOptions,
	getVenuesOptions,
	createTimetableEntry,
	updateLectureSessionAPI,
	type CreateScheduleEntryPayload,
} from "@/api/main/schedulesAPI";
import { getPrograms } from "@/api/main/programsAPI";
import { getSemesters } from "@/api/main/semestersAPI";
import type {
	TimetableEntry,
	LectureSession,
	Course,
	Venue,
	Program,
	Semester,
} from "@/types";
import {
	getCurrentWeekNumber,
	getTotalWeeks,
	getWeekRange,
	getWeekDayDates,
} from "@/utils/semesterWeeks";
import SchedulesView from "@/pages/main/SchedulesView";
import ScheduleEntryModal from "@/components/modals/ScheduleEntryModal";
import SessionShiftModal from "@/components/modals/SessionShiftModal";
import ConflictFeedbackModal from "@/components/modals/ConflictFeedbackModal";

export default function SchedulesContainer() {
	const queryClient = useQueryClient();

	// Modals state
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
			type: string;
			venueName?: string;
			date?: string;
			startTime?: string;
			endTime?: string;
			conflictingTitle?: string;
		}>
	>([]);

	// Base Data Queries
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

	// Identify active semester
	const activeSemester = useMemo(() => {
		return semestersData.find((s) => s.isActive) || semestersData[0];
	}, [semestersData]);

	// Compute semester weeks
	const totalWeeks = useMemo(() => {
		return getTotalWeeks(
			activeSemester?.lectureStartDate,
			activeSemester?.lectureEndDate,
			15,
		);
	}, [activeSemester]);

	const defaultCurrentWeek = useMemo(() => {
		return getCurrentWeekNumber(
			activeSemester?.lectureStartDate,
			activeSemester?.lectureEndDate,
			totalWeeks,
		);
	}, [activeSemester, totalWeeks]);

	// Program, Level, and Week state
	const [selectedProgramId, setSelectedProgramId] = useState<string>("");
	const [selectedLevel, setSelectedLevel] = useState<number>(100);
	const [currentWeek, setCurrentWeek] = useState<number>(1);

	// Initialize selectedProgramId once programsData is loaded
	useEffect(() => {
		if (programsData.length > 0 && !selectedProgramId) {
			const defaultProg =
				programsData.find((p) => p.isDefault) || programsData[0];
			if (defaultProg) {
				setSelectedProgramId(defaultProg.id);
			}
		}
	}, [programsData, selectedProgramId]);

	// Sync currentWeek with defaultCurrentWeek when semester is detected
	useEffect(() => {
		if (defaultCurrentWeek) {
			setCurrentWeek(defaultCurrentWeek);
		}
	}, [defaultCurrentWeek]);

	// Week range and day dates calculation
	const weekRange = useMemo(() => {
		return getWeekRange(activeSemester?.lectureStartDate, currentWeek);
	}, [activeSemester, currentWeek]);

	const weekDayDates = useMemo(() => {
		return getWeekDayDates(weekRange.startDate);
	}, [weekRange]);

	const isCurrentWeekActive = currentWeek === defaultCurrentWeek;

	// Timetable Entries Query (filtered by active semester, program, level, and entry_type="lecture")
	const {
		data: entriesData,
		isLoading: entriesLoading,
		isRefetching: entriesRefetching,
		refetch: refetchEntries,
	} = useQuery<TimetableEntry[]>({
		queryKey: [
			"scheduling",
			"entries",
			activeSemester?.id,
			selectedProgramId,
			selectedLevel,
		],
		queryFn: () =>
			getTimetableEntries({
				semester: activeSemester?.id,
				program: selectedProgramId || undefined,
				level: selectedLevel || undefined,
				entry_type: "lecture",
			}),
	});

	// Lecture Sessions Query (filtered by week date range, active semester, program, level)
	const {
		data: sessionsData,
		isLoading: sessionsLoading,
		isRefetching: sessionsRefetching,
		refetch: refetchSessions,
	} = useQuery<LectureSession[]>({
		queryKey: [
			"scheduling",
			"sessions",
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
				entry_type: "lecture",
			}),
	});

	const isRefetching = entriesRefetching || sessionsRefetching;

	// Mutation: Create Timetable Entry
	const createEntryMutation = useMutation({
		mutationFn: (payload: CreateScheduleEntryPayload) =>
			createTimetableEntry(payload),
		onSuccess: (result) => {
			if (result.outcome === "PROCEED") {
				toast.success("Schedule entry created successfully!");
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
						type: c.type || "VENUE_CLASH",
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
			toast.error(error.message || "Failed to create schedule entry.");
		},
	});

	// Mutation: Shift a single session instance
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
			toast.success("Session instance shifted successfully.");
			setSelectedSessionForShift(null);
			queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to shift session.");
		},
	});

	// Navigation handlers
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
		toast.info("Refreshing schedule data...");
	};

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

	const handleCreateScheduleEntrySubmit = (data: Record<string, any>) => {
		createEntryMutation.mutate({
			entry_type: (data.entryType as "lecture" | "exam" | "event") || "lecture",
			title: data.title as string | undefined,
			course: data.courseId as string,
			venue: data.venueId as string,
			start_time: data.startTime as string,
			end_time: data.endTime as string,
			recurrence_rule: data.recurrenceRule as string | undefined,
			recurrence_start_date: data.startDate as string | undefined,
			recurrence_end_date: data.endDate as string | undefined,
			semester: data.semesterId as string | undefined,
			program: data.targetProgramId as string | undefined,
		});
	};

	const handleShiftSessionSubmit = (data: {
		venueId: string;
		startTime: string;
		endTime: string;
	}) => {
		if (!selectedSessionForShift) return;
		shiftSessionMutation.mutate({
			id: selectedSessionForShift.id,
			venue: data.venueId,
			startTime: data.startTime,
			endTime: data.endTime,
		});
	};

	return (
		<>
			<SchedulesView
				entries={entriesData}
				entriesLoading={entriesLoading}
				sessions={sessionsData}
				sessionsLoading={sessionsLoading}
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
				onOpenScheduleEntry={handleOpenScheduleEntry}
				onShiftSessionTrigger={(s) => setSelectedSessionForShift(s)}
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
				onSubmit={handleShiftSessionSubmit}
				session={selectedSessionForShift}
				venues={venuesData}
			/>

			{conflictOutcome && (
				<ConflictFeedbackModal
					isOpen={isConflictModalOpen}
					onClose={() => setIsConflictModalOpen(false)}
					outcomeType={conflictOutcome}
					detailMessage={conflictDetailMsg}
					conflicts={conflictsList}
				/>
			)}
		</>
	);
}
