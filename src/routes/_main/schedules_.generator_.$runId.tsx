import { createFileRoute } from "@tanstack/react-router";
import ScheduleRunInspectionContainer from "@/app/main/ScheduleRunInspection";

export const Route = createFileRoute("/_main/schedules_/generator_/$runId")({
	component: ScheduleRunInspectionContainer,
	beforeLoad: () => {
		document.title = "Inspect Timetable Run | NSUK TimeMap";
	},
});
