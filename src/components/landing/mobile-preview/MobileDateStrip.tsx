import { useState } from "react";

const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function toDateString(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

const ACTIVE_DATES = [
	"2026-11-09",
	"2026-11-10",
	"2026-11-12",
	"2026-11-13",
	"2026-11-14",
];

function buildDays(): { label: string; number: number; dateStr: string }[] {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return Array.from({ length: 14 }, (_, i) => {
		const d = new Date(today);
		d.setDate(today.getDate() + i);
		return {
			label: DAY_ABBREVS[d.getDay()],
			number: d.getDate(),
			dateStr: toDateString(d),
		};
	});
}

export default function MobileDateStrip() {
	const days = buildDays();
	const todayStr = toDateString(new Date());
	const [selectedDate, setSelectedDate] = useState(todayStr);

	const displayMonth = (() => {
		const selected = days.find((d) => d.dateStr === selectedDate) ?? days[0];
		const dt = new Date(selected.dateStr);
		return `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
	})();

	return (
		<div className="px-4 py-2">
			<p className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3">
				{displayMonth}
			</p>
			<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
				{days.map((day) => {
					const isSelected = day.dateStr === selectedDate;
					const isToday = day.dateStr === todayStr;
					const hasSession = ACTIVE_DATES.includes(day.dateStr);

					return (
						<button
							key={day.dateStr}
							onClick={() => setSelectedDate(day.dateStr)}
							className={[
								"flex flex-col items-center justify-center min-w-[46px] h-[62px] rounded-2xl border transition-all shrink-0",
								isSelected
									? "bg-[#10b981] border-[#10b981]"
									: isToday
										? "bg-[#18181b] border-[#10b981]"
										: "bg-[#18181b] border-[#27272a]",
							].join(" ")}
						>
							<span
								className={`text-[10px] font-semibold uppercase tracking-wide ${
									isSelected ? "text-white" : "text-[#71717a]"
								}`}
							>
								{day.label}
							</span>
							<span
								className={`text-base font-bold leading-tight ${
									isSelected ? "text-white" : "text-white"
								}`}
							>
								{day.number}
							</span>
							<span
								className={`w-1 h-1 rounded-full mt-0.5 ${
									hasSession
										? isSelected
											? "bg-white"
											: "bg-[#10b981]"
										: "bg-transparent"
								}`}
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}
