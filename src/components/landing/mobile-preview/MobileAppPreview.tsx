import { Bell } from "lucide-react";
import { landingSessions } from "@/constants/landingDummy";
import MobileQuickAnalyticsCard from "./MobileQuickAnalyticsCard";
import MobileDateStrip from "./MobileDateStrip";
import MobileStatusChips from "./MobileStatusChips";
import MobileSessionCard from "./MobileSessionCard";

function AppScreen() {
	return (
		<div className="flex flex-col h-full bg-[#09090b] overflow-y-auto scrollbar-none">
			{/* Header */}
			<div className="px-4 pb-3 flex items-start justify-between">
				<div>
					<p className="text-[11px] text-[#71717a] font-medium">
						Good morning,
					</p>
					<p className="text-lg font-bold text-white leading-tight">Fatima</p>
					<p className="text-[11px] text-[#71717a] mt-0.5">
						Monday, 9 November 2026
					</p>
				</div>
				<div className="relative mt-1">
					<button className="w-9 h-9 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center">
						<Bell size={16} className="text-[#a1a1aa]" />
					</button>
					{/* Unread badge */}
					<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] flex items-center justify-center">
						<span className="text-[9px] font-bold text-white">3</span>
					</span>
				</div>
			</div>

			{/* Quick Analytics */}
			<MobileQuickAnalyticsCard />

			{/* Date Strip */}
			<MobileDateStrip />

			{/* Status Chips */}
			<MobileStatusChips />

			{/* Session list */}
			<div className="mt-2 pb-6">
				<div className="px-4 mb-2">
					<p className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">
						Today's Sessions
					</p>
				</div>
				{landingSessions.map((session) => (
					<MobileSessionCard key={session.id} session={session} />
				))}
			</div>
		</div>
	);
}

export default function MobileAppPreview() {
	return (
		<div className="relative flex justify-center items-start">
			{/* Phone frame */}
			<div className="relative bg-[#09090b] h-155 w-80 sm:w-75 rounded-[3rem] border-10 border-[#1a1a1a] shadow-2xl overflow-hidden">
				{/* Notch */}
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1a1a1a] rounded-b-2xl z-10" />

				{/* Inner screen */}
				<div className="relative w-full h-full overflow-hidden pt-5">
					<AppScreen />
				</div>
			</div>

			{/* Subtle glow behind phone */}
			<div
				className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
				style={{
					background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
				}}
			/>
		</div>
	);
}
