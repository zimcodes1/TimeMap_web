import {
	Building2,
	BookOpen,
	Clock,
	AlertTriangle,
	LayoutDashboard,
	Users,
	CalendarDays,
	FileText,
	Settings,
	type LucideIcon,
} from "lucide-react";
import { adminStatCards } from "@/constants/landingDummy";

const ICON_MAP: Record<string, LucideIcon> = {
	Building2,
	BookOpen,
	Clock,
	AlertTriangle,
};

const ACCENT_COLORS: Record<
	string,
	{ bg: string; text: string; border: string }
> = {
	primary: {
		bg: "bg-emerald-50",
		text: "text-emerald-600",
		border: "border-emerald-200",
	},
	info: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
	warning: {
		bg: "bg-amber-50",
		text: "text-amber-600",
		border: "border-amber-200",
	},
	danger: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};

const BADGE_COLORS: Record<string, string> = {
	success: "bg-emerald-100 text-emerald-700 border-emerald-200",
	outline: "bg-gray-100 text-gray-600 border-gray-200",
	warning: "bg-amber-100 text-amber-700 border-amber-200",
	danger: "bg-red-100 text-red-700 border-red-200",
};

// Hardcoded SVG hold-rate trend line over 8 weeks
const TREND_POINTS = [
	[0, 65],
	[1, 72],
	[2, 68],
	[3, 78],
	[4, 75],
	[5, 80],
	[6, 83],
	[7, 83],
];
const W = 240;
const H = 60;
const PAD = 8;

function trendX(i: number) {
	return PAD + (i / (TREND_POINTS.length - 1)) * (W - PAD * 2);
}
function trendY(val: number) {
	return H - PAD - ((val - 60) / 30) * (H - PAD * 2);
}

const pathD = TREND_POINTS.map(
	([i, v], idx) =>
		`${idx === 0 ? "M" : "L"} ${trendX(i).toFixed(1)} ${trendY(v).toFixed(1)}`,
).join(" ");

const fillD = `${pathD} L ${trendX(TREND_POINTS.length - 1).toFixed(1)} ${H} L ${trendX(0).toFixed(1)} ${H} Z`;

const NAV_ITEMS = [
	{ icon: LayoutDashboard, active: true },
	{ icon: CalendarDays, active: false },
	{ icon: Users, active: false },
	{ icon: FileText, active: false },
	{ icon: Settings, active: false },
];

export default function AdminDashboardPreview() {
	return (
		<div className="w-120 lg:w-7/10 rounded-2xl bg-white shadow-xl overflow-hidden">
			{/* Browser chrome bar */}
			<div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
				<span className="w-3 h-3 rounded-full bg-red-400" />
				<span className="w-3 h-3 rounded-full bg-amber-400" />
				<span className="w-3 h-3 rounded-full bg-green-400" />
				<div className="flex-1 mx-3 h-6 bg-white border border-gray-200 rounded-md flex items-center px-3">
					<span className="text-[10px] text-gray-400 select-none">
						timemapper.nsuk.edu.ng/dashboard
					</span>
				</div>
			</div>

			{/* App shell */}
			<div className="flex" style={{ height: 420 }}>
				{/* Sidebar */}
				<div className="w-12 bg-[#111827] flex flex-col items-center py-4 gap-3 shrink-0">
					<div className="mb-3">
						<svg width={20} height={20} viewBox="0 0 24 24" fill="none">
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M8.07615 5.38268C8.23093 5.75636 8.59557 6 9.00003 6H10.5V10.5H6V9.00003C6 8.59557 5.75636 8.23093 5.38268 8.07615C5.00901 7.92137 4.57889 8.00692 4.29289 8.29292L1.29289 11.2929C0.902369 11.6834 0.902369 12.3166 1.29289 12.7071L4.29289 15.7071C4.57889 15.9931 5.00901 16.0787 5.38268 15.9239C5.75636 15.7691 6 15.4045 6 15V13.5H10.5V18H9.00003C8.59557 18 8.23093 18.2436 8.07615 18.6173C7.92137 18.991 8.00692 19.4211 8.29292 19.7071L11.2929 22.7071C11.6834 23.0976 12.3166 23.0976 12.7071 22.7071L15.7071 19.7071C15.9931 19.4211 16.0787 18.991 15.9239 18.6173C15.7691 18.2436 15.4045 18 15 18H13.5V13.5H18V15C18 15.4045 18.2436 15.7691 18.6173 15.9239C18.991 16.0787 19.4211 15.9931 19.7071 15.7071L22.7071 12.7071C23.0976 12.3166 23.0976 11.6834 22.7071 11.2929L19.7071 8.29292C19.4211 8.00692 18.991 7.92137 18.6173 8.07615C18.2436 8.23093 18 8.59557 18 9.00003V10.5H13.5V6H15C15.4045 6 15.7691 5.75636 15.9239 5.38268C16.0787 5.00901 15.9931 4.57889 15.7071 4.29289L12.7071 1.29289C12.3166 0.902369 11.6834 0.902369 11.2929 1.29289L8.29292 4.29289C8.00692 4.57889 7.92137 5.00901 8.07615 5.38268Z"
								fill="#10b981"
							/>
						</svg>
					</div>
					{NAV_ITEMS.map(({ icon: Icon, active }, i) => (
						<div
							key={i}
							className={`w-9 h-9 rounded-xl flex items-center justify-center ${
								active ? "bg-[#10b981]/20" : "hover:bg-white/5"
							}`}
						>
							<Icon
								size={16}
								className={active ? "text-[#10b981]" : "text-gray-500"}
							/>
						</div>
					))}
				</div>

				{/* Main content */}
				<div className="flex-1 bg-gray-50 overflow-y-auto  scrollbar-thin p-4">
					{/* Page header */}
					<div className="flex items-center justify-between mb-4">
						<div>
							<h2 className="text-sm font-bold text-gray-900">
								Dashboard & Academic Overview
							</h2>
							<p className="text-[11px] text-gray-500">
								Monday, 9 November 2026
							</p>
						</div>
						<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">
							School Admin
						</span>
					</div>

					{/* Stat cards grid */}
					<div className="grid grid-cols-2 gap-2 mb-4">
						{adminStatCards.map((card) => {
							const Icon = ICON_MAP[card.icon];
							const accent =
								ACCENT_COLORS[card.accent] ?? ACCENT_COLORS.primary;
							const badgeCls =
								BADGE_COLORS[card.badgeVariant] ?? BADGE_COLORS.outline;
							return (
								<div
									key={card.label}
									className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm"
								>
									<div className="flex items-start justify-between mb-2">
										<div
											className={`p-1.5 rounded-lg border ${accent.bg} ${accent.border}`}
										>
											{Icon && <Icon size={13} className={accent.text} />}
										</div>
										<span
											className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${badgeCls}`}
										>
											{card.badge}
										</span>
									</div>
									<p className="text-xs font-bold text-gray-900">
										{card.value}
									</p>
									<p className="text-[10px] text-gray-500">{card.label}</p>
								</div>
							);
						})}
					</div>

					{/* Hold Rate Trend chart */}
					<div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
						<div className="flex items-center justify-between mb-3">
							<p className="text-xs font-bold text-gray-900">Hold Rate Trend</p>
							<span className="text-[10px] text-gray-400">Last 8 weeks</span>
						</div>
						<svg
							width={W}
							height={H}
							viewBox={`0 0 ${W} ${H}`}
							className="w-full"
						>
							{/* Fill */}
							<defs>
								<linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
									<stop offset="100%" stopColor="#10b981" stopOpacity="0" />
								</linearGradient>
							</defs>
							<path d={fillD} fill="url(#trendFill)" />
							<path
								d={pathD}
								fill="none"
								stroke="#10b981"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							{/* Dots */}
							{TREND_POINTS.map(([i, v]) => (
								<circle
									key={i}
									cx={trendX(i)}
									cy={trendY(v)}
									r={2.5}
									fill="white"
									stroke="#10b981"
									strokeWidth="1.5"
								/>
							))}
						</svg>
						{/* Week labels */}
						<div className="flex justify-between mt-1 px-1">
							{["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"].map((w) => (
								<span key={w} className="text-[9px] text-gray-400">
									{w}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
