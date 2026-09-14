import { createFileRoute } from "@tanstack/react-router";
import StudentsContainer from "@/app/main/Students";

export const Route = createFileRoute("/_main/students")({ component: StudentsContainer, beforeLoad: () => { document.title = "Students | NSUK TimeMap"; } });
