import { createFileRoute } from "@tanstack/react-router";
import LecturerDetailsContainer from "@/app/main/LecturerDetails";

export const Route = createFileRoute("/_main/lecturers_/$lecturerId")({
	component: LecturerDetailsContainer,
	beforeLoad: () => {
		document.title = "Lecturer Details | NSUK TimeMap";
	},
});
