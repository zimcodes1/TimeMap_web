import { motion } from "framer-motion";
import { AlertTriangle, Building2, Monitor, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PainCard {
  accentClass: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
  title: string;
  description: string;
}

const PAIN_CARDS: PainCard[] = [
  {
    accentClass: "border-l-danger",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    Icon: AlertTriangle,
    title: "Clash-Prone Manual Scheduling",
    description:
      "Lecturers share venues, cohorts, and time slots across departments. One scheduling error cascades into dozens of conflicts that take days to untangle.",
  },
  {
    accentClass: "border-l-warning",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    Icon: Building2,
    title: "Venue Double-Booking",
    description:
      "The same hall gets assigned to two faculties simultaneously. By the time the error surfaces, students are already at the door.",
  },
  {
    accentClass: "border-l-info",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    Icon: Monitor,
    title: "CBT Lab Bottlenecks",
    description:
      "Computer-based exams have fixed seat counts. Without turn-based allocation, a 400-student course gets crushed into a lab built for 80.",
  },
  {
    accentClass: "border-l-primary",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    Icon: Clock,
    title: "Late-Surfacing Discrepancies",
    description:
      "A lecturer cancels without notice. The class rep files a report on paper. Admin finds out three weeks later during a review — if at all.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function ProblemSection() {
  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8">
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
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            Manual Scheduling Breaks Down{" "}
            <span className="text-primary">at Scale</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
            Institutions manage hundreds of courses, dozens of venues, and
            thousands of students. With spreadsheets, something always slips.
          </p>
        </motion.div>

        {/* Pain point cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {PAIN_CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              className={`bg-surface rounded-2xl border border-border border-l-4 ${card.accentClass} p-6 flex gap-5 shadow-sm`}
            >
              {/* Glassmorphic icon bubble */}
              <div
                className={`relative flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-2xl ${card.iconBg} ring-1 ring-inset ring-white/50 shadow-sm overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                <card.Icon size={22} className={`relative z-10 ${card.iconColor}`} />
              </div>

              <div>
                <h3 className="text-base font-bold text-text-main mb-1 leading-snug">
                  {card.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
