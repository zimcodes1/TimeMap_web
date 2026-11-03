import { createFileRoute } from "@tanstack/react-router";
import ScheduleGeneratorContainer from "@/app/main/ScheduleGenerator";

export const Route = createFileRoute("/_main/schedules_/generator")({
	component: ScheduleGeneratorContainer,
	beforeLoad: () => {
		document.title = "Timetable Generator | NSUK TimeMap";
	},
});
