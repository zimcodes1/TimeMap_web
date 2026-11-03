import { createFileRoute } from "@tanstack/react-router";
import ExamOptimizerRunInspection from "@/app/main/ExamOptimizerRunInspection";

export const Route = createFileRoute("/_main/exams_/generator_/$runId")({
	component: ExamOptimizerRunInspection,
	beforeLoad: () => { document.title = "Inspect Exam Timetable | NSUK TimeMap"; },
});
