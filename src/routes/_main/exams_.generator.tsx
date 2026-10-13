import { createFileRoute } from "@tanstack/react-router";
import ExamOptimizerGenerator from "@/app/main/ExamOptimizerGenerator";

export const Route = createFileRoute("/_main/exams_/generator")({
	component: ExamOptimizerGenerator,
	beforeLoad: () => { document.title = "Exam Timetable Generator | NSUK TimeMap"; },
});
