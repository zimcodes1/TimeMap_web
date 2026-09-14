import { createFileRoute } from "@tanstack/react-router";
import SemestersContainer from "@/app/main/Semesters";

export const Route = createFileRoute("/_main/semesters")({
	component: SemestersContainer,
	beforeLoad: () =>
		(document.title = "Academic Sessions & Semesters | NSUK TimeMap"),
});
