import Logo from "../elements/logo";
import { Text } from "../ui/text";
import {
	LocateFixed,
	CalendarCheck,
	AlertTriangle,
	MapPin,
	MoveRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Outlet } from "@tanstack/react-router";

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 24 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, ease: "easeOut" as const, delay },
});

const features = [
	{
		icon: CalendarCheck,
		title: "Smart Scheduling",
		desc: "View and manage timetables across all departments in one place.",
	},
	{
		icon: AlertTriangle,
		title: "Conflict Detection",
		desc: "Instantly flag clashes in venue bookings and lecture schedules.",
	},
	{
		icon: MapPin,
		title: "Venue Tracking",
		desc: "Track room availability and resolve discrepancies in real time.",
	},
];

export default function AuthSplitLayout() {
	return (
		<div className="relative w-full bg-primary h-screen flex overflow-hidden sm:pr-10">
			{/* Left Side — hidden on mobile */}
			<div className="hidden md:flex w-3/5 relative flex-col justify-end items-start h-full px-16 pb-12 gap-4 shrink-0">
				<motion.span
					{...fadeUp(0)}
					className="flex justify-start items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5"
				>
					<Logo color="#fff" size={18} />
					<Text className="text-white/80 text-sm font-light tracking-wide">
						NSUK TimeMap
					</Text>
				</motion.span>

				<motion.div {...fadeUp(0.1)}>
					<Text className="font-bold text-white text-5xl leading-tight">
						One platform for <br />
						<span className="text-white/50">every schedule,</span> every venue.
					</Text>
				</motion.div>

				<motion.div {...fadeUp(0.2)}>
					<Text className="text-white/50 font-light text-base max-w-md">
						Eliminate timetable conflicts and venue clashes across NSUK — before
						they become a problem.
					</Text>
				</motion.div>

				<motion.div
					{...fadeUp(0.35)}
					className="relative z-10 mt-2 backdrop-blur-lg w-9/10 rounded-4xl bg-white/10 border border-white/15 p-6 flex flex-col gap-5"
				>
					{features.map(({ icon: Icon, title, desc }) => (
						<div key={title} className="flex items-start gap-4">
							<div className="shrink-0 w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
								<Icon size={18} className="text-white" />
							</div>
							<div>
								<Text className="text-white font-semibold text-sm">
									{title}
								</Text>
								<Text className="text-white/60 font-light text-xs mt-0.5">
									{desc}
								</Text>
							</div>
						</div>
					))}
				</motion.div>

				<LocateFixed
					size={260}
					className="absolute -bottom-30 -left-30 text-primary-hover scale-150"
				/>
				<MoveRight
					size={100}
					className="absolute top-0 left-23 text-primary-hover scale-150"
				/>
			</div>

			{/* Right panel — full screen on mobile */}
			<div className="flex-1 bg-background md:rounded-t-4xl h-full md:mt-10 md:mr-4 overflow-y-auto">
				<Outlet />
			</div>
		</div>
	);
}
