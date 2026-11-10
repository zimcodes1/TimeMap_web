import { motion } from "framer-motion";

interface RoadmapItem {
  text: string;
}

interface RoadmapColumn {
  status: string;
  headerBg: string;
  headerText: string;
  dotColor: string;
  items: RoadmapItem[];
}

const ROADMAP_COLUMNS: RoadmapColumn[] = [
  {
    status: "Live",
    headerBg: "bg-emerald-100",
    headerText: "text-emerald-700",
    dotColor: "bg-emerald-500",
    items: [
      { text: "Lecture timetable generation" },
      { text: "Exam timetable generation (written, CBT, lab)" },
      { text: "Venue management and eligibility rules" },
      { text: "Discrepancy reporting via mobile app" },
      { text: "Push notifications" },
      { text: "Role-based admin dashboard" },
    ],
  },
  {
    status: "In Progress",
    headerBg: "bg-amber-100",
    headerText: "text-amber-700",
    dotColor: "bg-amber-500",
    items: [
      { text: "Exam seat assignment per student" },
      { text: "Invigilator allocation and scheduling" },
      { text: "Advanced analytics per program" },
      { text: "Mobile offline mode" },
    ],
  },
  {
    status: "Planned",
    headerBg: "bg-surface-raised",
    headerText: "text-text-muted",
    dotColor: "bg-text-subtle",
    items: [
      { text: "Automated invigilator conflict detection" },
      { text: "Student self-service seat lookup" },
      { text: "Integration with NSUK student portal" },
      { text: "Multi-session academic year support" },
    ],
  },
];

export default function RoadmapSection() {
  return (
    <section className="bg-surface py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-primary-muted text-primary border border-primary/20">
            Status & Roadmap
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            What's Live,{" "}
            <span className="text-primary">What's Coming</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
            TimeMapper is in active development at NSUK. Here's where things
            stand.
          </p>
        </motion.div>

        {/* Roadmap columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROADMAP_COLUMNS.map((col, colIndex) => (
            <motion.div
              key={col.status}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut" as const, delay: colIndex * 0.1 }}
              className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              {/* Column header */}
              <div className={`px-5 py-3 ${col.headerBg} border-b border-border`}>
                <span className={`text-sm font-bold ${col.headerText}`}>
                  {col.status}
                </span>
              </div>

              {/* Items list */}
              <div className="px-5 py-4 flex flex-col gap-3">
                {col.items.map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span
                      className={`flex-shrink-0 mt-1.5 w-2 h-2 rounded-full ${col.dotColor}`}
                    />
                    <span className="text-sm text-text-muted leading-relaxed">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
