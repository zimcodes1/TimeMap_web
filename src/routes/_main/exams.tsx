import { createFileRoute } from "@tanstack/react-router";
import ExamsContainer from "@/app/main/Exams";

export const Route = createFileRoute("/_main/exams")({
	component: ExamsContainer,
	beforeLoad: () => {
		document.title = "Exam Timetable | NSUK TimeMap";
	},
});
