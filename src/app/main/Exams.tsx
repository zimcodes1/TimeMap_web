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
import { getFacultiesList, getDepartmentsList } from "@/api/main/hierarchyAPI";
import {
	getSemesters,
	setSemesterExamPeriod,
	getFacultyExamPeriods,
	setFacultyExamPeriod,
	deleteFacultyExamPeriod,
	getEffectiveExamPeriod,
} from "@/api/main/semestersAPI";
import {
	getGenerationPermissions,
	updateGenerationPermissions,
} from "@/api/main/generationAPI";
import type {
	TimetableEntry,
	LectureSession,
	ExamSitting,
	Course,
	Venue,
	User,
	Program,
	Department,
	Faculty,
	Semester,
	EffectiveExamPeriod,
	FacultyExamPeriod,
} from "@/types";
import {
	getCurrentWeekNumber,
	getTotalWeeks,
	getWeekRange,
	getWeekDayDates,
} from "@/utils/semesterWeeks";
import { useAuth } from "@/hooks/useAuth";
import ExamsView from "@/pages/main/ExamsView";
import CreateExamSittingModal from "@/components/modals/CreateExamSittingModal";
import ScheduleEntryModal from "@/components/modals/ScheduleEntryModal";
import SessionShiftModal from "@/components/modals/SessionShiftModal";
import ConflictFeedbackModal from "@/components/modals/ConflictFeedbackModal";
import SetExamPeriodModal from "@/components/modals/SetExamPeriodModal";
import SetFacultyExamPeriodModal from "@/components/modals/SetFacultyExamPeriodModal";

export default function ExamsContainer() {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	// Modals state
	const [isExamSittingOpen, setIsExamSittingOpen] = useState(false);
	const [isScheduleEntryOpen, setIsScheduleEntryOpen] = useState(false);
	const [isSetSchoolExamPeriodOpen, setIsSetSchoolExamPeriodOpen] = useState(false);
	const [isSetFacultyExamPeriodOpen, setIsSetFacultyExamPeriodOpen] = useState(false);
	const [selectedSessionForShift, setSelectedSessionForShift] =
		useState<LectureSession | null>(null);

	// Defaults when clicking a slot in the grid
	const [scheduleEntryDefaults, setScheduleEntryDefaults] = useState<{
		day?: string;
		date?: string;
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

	// Scope selection state
	const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("ALL");
	const [selectedProgramId, setSelectedProgramId] = useState<string>("ALL");
	const [selectedLevel, setSelectedLevel] = useState<number | "ALL">("ALL");
	const [currentWeek, setCurrentWeek] = useState<number>(1);

	// Hierarchy Queries
	const { data: facultiesData = [] } = useQuery<Faculty[]>({
		queryKey: ["hierarchy", "faculties"],
		queryFn: getFacultiesList,
	});

	const { data: departmentsData = [] } = useQuery<Department[]>({
		queryKey: ["hierarchy", "departments"],
		queryFn: getDepartmentsList,
	});

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

	// Auto-initialize selected faculty and department based on user scope
	useEffect(() => {
		if (user) {
			if (user.facultyId && !selectedFacultyId) {
				setSelectedFacultyId(user.facultyId);
			} else if (!selectedFacultyId && facultiesData.length > 0) {
				setSelectedFacultyId(String(facultiesData[0].id));
			}

			if (user.departmentId && selectedDepartmentId === "ALL" && user.adminLevel === "department") {
				setSelectedDepartmentId(user.departmentId);
			}
		} else if (!selectedFacultyId && facultiesData.length > 0) {
			setSelectedFacultyId(String(facultiesData[0].id));
		}
	}, [user, facultiesData, selectedFacultyId, selectedDepartmentId]);

	// Effective Exam Period Query
	const effectiveTargetFaculty = selectedFacultyId || user?.facultyId;
	const effectiveTargetDept = selectedDepartmentId !== "ALL" ? selectedDepartmentId : user?.departmentId;

	const { data: effectiveExamPeriod } = useQuery<EffectiveExamPeriod>({
		queryKey: [
			"scheduling",
			"effective-exam-period",
			activeSemester?.id,
			effectiveTargetFaculty,
			effectiveTargetDept,
		],
		queryFn: () =>
			getEffectiveExamPeriod(activeSemester!.id, {
				faculty: effectiveTargetFaculty || undefined,
				department: effectiveTargetDept || undefined,
			}),
		enabled: Boolean(activeSemester?.id),
	});

	// Generation & Exam Permissions Query
	const schoolId = user?.schoolId || activeSemester?.schoolId;
	const { data: permissionsData } = useQuery({
		queryKey: ["generation", "permissions", schoolId],
		queryFn: () => getGenerationPermissions(schoolId!),
		enabled: Boolean(schoolId),
	});

	// Faculty-specific exam periods for current faculty
	const { data: facultyExamPeriods = [] } = useQuery<FacultyExamPeriod[]>({
		queryKey: [
			"scheduling",
			"faculty-exam-periods",
			activeSemester?.id,
			effectiveTargetFaculty,
		],
		queryFn: () =>
			getFacultyExamPeriods(activeSemester!.id, effectiveTargetFaculty || undefined),
		enabled: Boolean(activeSemester?.id && effectiveTargetFaculty),
	});

	const currentFacultyPeriod = facultyExamPeriods.find(
		(fep) => String(fep.facultyId) === String(effectiveTargetFaculty),
	);

	// Total weeks and current week calculations using the effective exam period
	const examStartDate = effectiveExamPeriod?.effectiveStartDate || activeSemester?.examStartDate || activeSemester?.startDate;
	const examEndDate = effectiveExamPeriod?.effectiveEndDate || activeSemester?.examEndDate || activeSemester?.endDate;

	const totalWeeks = useMemo(() => {
		return getTotalWeeks(examStartDate, examEndDate, 4);
	}, [examStartDate, examEndDate]);

	const defaultCurrentWeek = useMemo(() => {
		return getCurrentWeekNumber(examStartDate, examEndDate, totalWeeks);
	}, [examStartDate, examEndDate, totalWeeks]);

	useEffect(() => {
		if (defaultCurrentWeek) {
			setCurrentWeek(defaultCurrentWeek);
		}
	}, [defaultCurrentWeek]);

	// Week range and day dates
	const weekRange = useMemo(() => {
		return getWeekRange(examStartDate, currentWeek);
	}, [examStartDate, currentWeek]);

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
			selectedFacultyId,
			selectedDepartmentId,
			selectedProgramId,
			selectedLevel,
		],
		queryFn: () =>
			getTimetableEntries({
				semester: activeSemester?.id,
				faculty: selectedFacultyId || undefined,
				department: selectedDepartmentId !== "ALL" ? selectedDepartmentId : undefined,
				program: selectedProgramId !== "ALL" ? selectedProgramId : undefined,
				level: selectedLevel !== "ALL" ? selectedLevel : undefined,
				entry_type: "exam",
			}),
		enabled: Boolean(activeSemester?.id),
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
			selectedFacultyId,
			selectedDepartmentId,
			selectedProgramId,
			selectedLevel,
			currentWeek,
			weekRange.startStr,
			weekRange.endStr,
		],
		queryFn: () =>
			getLectureSessions({
				semester: activeSemester?.id,
				faculty: selectedFacultyId || undefined,
				department: selectedDepartmentId !== "ALL" ? selectedDepartmentId : undefined,
				program: selectedProgramId !== "ALL" ? selectedProgramId : undefined,
				level: selectedLevel !== "ALL" ? selectedLevel : undefined,
				start_date: weekRange.startStr,
				end_date: weekRange.endStr,
				entry_type: "exam",
			}),
		enabled: Boolean(activeSemester?.id),
	});

	const isRefetching = entriesRefetching || sessionsRefetching;

	// Mutations
	const setSchoolExamPeriodMutation = useMutation({
		mutationFn: async (data: {
			exam_start_date: string;
			exam_end_date: string;
			allow_faculty_exam_period?: boolean;
		}) => {
			if (!activeSemester) throw new Error("No active semester.");
			await setSemesterExamPeriod(activeSemester.id, {
				exam_start_date: data.exam_start_date,
				exam_end_date: data.exam_end_date,
			});

			if (data.allow_faculty_exam_period !== undefined && schoolId) {
				await updateGenerationPermissions({
					school: schoolId,
					allow_faculty_exam_period: data.allow_faculty_exam_period,
				});
			}
		},
		onSuccess: () => {
			toast.success("School examination period and permissions updated!");
			setIsSetSchoolExamPeriodOpen(false);
			queryClient.invalidateQueries({ queryKey: ["semesters"] });
			queryClient.invalidateQueries({ queryKey: ["scheduling", "effective-exam-period"] });
			queryClient.invalidateQueries({ queryKey: ["generation", "permissions"] });
			queryClient.invalidateQueries({ queryKey: ["scheduling", "entries"] });
			queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.error || err?.message || "Failed to set exam period.");
		},
	});

	const setFacultyExamPeriodMutation = useMutation({
		mutationFn: async (data: { start_date: string; end_date: string }) => {
			if (!activeSemester) throw new Error("No active semester.");
			if (!effectiveTargetFaculty) throw new Error("No faculty selected.");
			return setFacultyExamPeriod(activeSemester.id, {
				faculty: effectiveTargetFaculty,
				start_date: data.start_date,
				end_date: data.end_date,
			});
		},
		onSuccess: () => {
			toast.success("Faculty examination period customized successfully!");
			setIsSetFacultyExamPeriodOpen(false);
			queryClient.invalidateQueries({ queryKey: ["scheduling", "effective-exam-period"] });
			queryClient.invalidateQueries({ queryKey: ["scheduling", "faculty-exam-periods"] });
			queryClient.invalidateQueries({ queryKey: ["scheduling", "entries"] });
			queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Failed to set faculty exam period.");
		},
	});

	const resetFacultyExamPeriodMutation = useMutation({
		mutationFn: async () => {
			if (!activeSemester || !effectiveTargetFaculty) return;
			await deleteFacultyExamPeriod(activeSemester.id, effectiveTargetFaculty);
		},
		onSuccess: () => {
			toast.success("Faculty exam period reset to school default.");
			setIsSetFacultyExamPeriodOpen(false);
			queryClient.invalidateQueries({ queryKey: ["scheduling", "effective-exam-period"] });
			queryClient.invalidateQueries({ queryKey: ["scheduling", "faculty-exam-periods"] });
			queryClient.invalidateQueries({ queryKey: ["scheduling", "entries"] });
			queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
		},
		onError: (err: any) => {
			toast.error(err?.message || "Failed to reset faculty exam period.");
		},
	});

	const createExamSittingMutation = useMutation({
		mutationFn: (data: {
			timetable_entry: string | number;
			invigilators: Array<string | number>;
		}) => createExamSittingAPI(data),
		onSuccess: () => {
			toast.success("Exam sitting created and invigilators assigned!");
			setIsExamSittingOpen(false);
			queryClient.invalidateQueries({ queryKey: ["scheduling", "exam-sittings"] });
			queryClient.invalidateQueries({ queryKey: ["scheduling", "sessions"] });
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
				queryClient.invalidateQueries({ queryKey: ["scheduling", "exam-sittings"] });
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
		onError: (error: any) => {
			const detail = error?.response?.data?.detail || error?.response?.data?.recurrence_start_date || error.message;
			toast.error(detail || "Failed to create exam entry.");
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
		queryClient.invalidateQueries({ queryKey: ["scheduling", "effective-exam-period"] });
		toast.info("Refreshing exam schedule data...");
	};

	const handleOpenCreateExamEntry = (
		defaultDay?: string,
		defaultDate?: string,
		defaultSlot?: { start: string; end: string },
	) => {
		setScheduleEntryDefaults({
			day: defaultDay,
			date: defaultDate,
			startTime: defaultSlot?.start,
			endTime: defaultSlot?.end,
		});
		setIsScheduleEntryOpen(true);
	};

	const handleCreateScheduleEntrySubmit = (data: Record<string, any>) => {
		createEntryMutation.mutate({
			entry_type: "exam",
			title: (data.title as string) || "Exam",
			course: data.courseId as string,
			venue: data.venueId as string,
			start_time: data.startTime as string,
			end_time: data.endTime as string,
			recurrence_rule: data.recurrenceRule as string | undefined,
			recurrence_start_date: (data.recurrence_start_date || data.startDate) as string | undefined,
			recurrence_end_date: (data.recurrence_end_date || data.endDate) as string | undefined,
			semester: data.semester as string | undefined,
			program: data.targetProgramId as string | undefined,
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

	const currentFacultyObj =
		facultiesData.find((f) => String(f.id) === String(selectedFacultyId)) || facultiesData[0];

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
				currentUser={user}
				effectiveExamPeriod={effectiveExamPeriod}
				faculties={facultiesData}
				selectedFacultyId={selectedFacultyId}
				onSelectFaculty={setSelectedFacultyId}
				departments={departmentsData}
				selectedDepartmentId={selectedDepartmentId}
				onSelectDepartment={setSelectedDepartmentId}
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
				onOpenSetSchoolExamPeriod={() => setIsSetSchoolExamPeriodOpen(true)}
				onOpenSetFacultyExamPeriod={() => setIsSetFacultyExamPeriodOpen(true)}
			/>

			{/* Set School Exam Period Modal */}
			<SetExamPeriodModal
				isOpen={isSetSchoolExamPeriodOpen}
				onClose={() => setIsSetSchoolExamPeriodOpen(false)}
				semester={activeSemester || null}
				currentAllowFacultyExamPeriod={Boolean(permissionsData?.allowFacultyExamPeriod)}
				onSubmit={(data: {
					exam_start_date: string;
					exam_end_date: string;
					allow_faculty_exam_period?: boolean;
				}) => setSchoolExamPeriodMutation.mutate(data)}
				isPending={setSchoolExamPeriodMutation.isPending}
			/>

			{/* Set Faculty Exam Period Modal */}
			<SetFacultyExamPeriodModal
				isOpen={isSetFacultyExamPeriodOpen}
				onClose={() => setIsSetFacultyExamPeriodOpen(false)}
				semester={activeSemester || null}
				facultyId={selectedFacultyId}
				facultyName={currentFacultyObj?.name || "Faculty"}
				currentPeriod={currentFacultyPeriod}
				onSubmit={(data: { start_date: string; end_date: string }) =>
					setFacultyExamPeriodMutation.mutate(data)
				}
				onResetToSchool={() => resetFacultyExamPeriodMutation.mutate()}
				isPending={setFacultyExamPeriodMutation.isPending || resetFacultyExamPeriodMutation.isPending}
			/>

			{/* Create Exam Sitting / Assign Invigilators Modal */}
			<CreateExamSittingModal
				isOpen={isExamSittingOpen}
				onClose={() => setIsExamSittingOpen(false)}
				onSubmit={handleCreateExamSittingSubmit}
				entries={entriesData ?? []}
				lecturers={lecturersData}
			/>

			{/* Schedule Entry Modal */}
			<ScheduleEntryModal
				isOpen={isScheduleEntryOpen}
				onClose={() => setIsScheduleEntryOpen(false)}
				onSubmit={handleCreateScheduleEntrySubmit}
				courses={coursesData}
				venues={venuesData}
				semesters={semestersData}
				programs={programsData}
				defaultEntryType="exam"
				defaultDay={scheduleEntryDefaults.day}
				defaultDate={scheduleEntryDefaults.date}
				defaultStartTime={scheduleEntryDefaults.startTime}
				defaultEndTime={scheduleEntryDefaults.endTime}
			/>

			{/* Shift Session Modal */}
			<SessionShiftModal
				isOpen={Boolean(selectedSessionForShift)}
				onClose={() => setSelectedSessionForShift(null)}
				onSubmit={(data) => {
					if (selectedSessionForShift) {
						shiftSessionMutation.mutate({
							id: selectedSessionForShift.id,
							venue: data.venueId,
							startTime: data.startTime,
							endTime: data.endTime,
						});
					}
				}}
				session={selectedSessionForShift}
				venues={venuesData}
			/>

			{/* Conflict Feedback Modal */}
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
