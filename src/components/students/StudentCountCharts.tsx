import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ChartDatum {
	name: string;
	value: number;
}
const COLOURS = [
	"#4f46e5",
	"#ff0000",
	"#16a34a",
	"#d97706",
	"#db2777",
	"#7c3aed",
];

export function StudentCountBarChart({
	title,
	description,
	data,
}: {
	title: string;
	description: string;
	data: ChartDatum[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="h-72">
				{data.length ? (
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={data} margin={{ left: -14 }}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="name"
								tick={{ fontSize: 11 }}
								interval={0}
								angle={data.length > 4 ? -20 : 0}
								textAnchor={data.length > 4 ? "end" : "middle"}
								height={data.length > 4 ? 58 : 30}
							/>
							<YAxis allowDecimals={false} />
							<Tooltip
								formatter={(value) => [
									Number(value).toLocaleString(),
									"Students",
								]}
							/>
							<Bar dataKey="value" radius={[5, 5, 0, 0]} fill="#4f46e5" />
						</BarChart>
					</ResponsiveContainer>
				) : (
					<EmptyChart />
				)}
			</CardContent>
		</Card>
	);
}

export function StudentCountPieChart({
	title = "Distribution by faculty",
	description = "How the recorded population is distributed across faculties.",
	data,
}: {
	title?: string;
	description?: string;
	data: ChartDatum[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="h-72">
				{data.length ? (
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={data}
								dataKey="value"
								nameKey="name"
								innerRadius={55}
								outerRadius={85}
								paddingAngle={2}
							>
								{data.map((item, index) => (
									<Cell
										key={item.name}
										fill={COLOURS[index % COLOURS.length]}
									/>
								))}
							</Pie>
							<Tooltip
								formatter={(value) => [
									Number(value).toLocaleString(),
									"Students",
								]}
							/>
						</PieChart>
					</ResponsiveContainer>
				) : (
					<EmptyChart />
				)}
			</CardContent>
		</Card>
	);
}

function EmptyChart() {
	return (
		<div className="flex h-full items-center justify-center text-sm text-text-muted">
			No student totals match these filters yet.
		</div>
	);
}
