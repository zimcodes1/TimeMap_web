import { motion } from "framer-motion";
import { Users, KeyRound, CalendarOff, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AttributeCard {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const ATTRIBUTE_CARDS: AttributeCard[] = [
  {
    Icon: Users,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Dual Capacity Model",
    description:
      "Lecture capacity and exam capacity are stored separately. A hall that seats 200 for lectures may only accommodate 120 exam seats.",
  },
  {
    Icon: KeyRound,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Ownership & Access Scope",
    description:
      "Venues belong to a faculty or department. Cross-faculty access is explicitly granted — the scheduler won't assign a venue outside its permitted scope.",
  },
  {
    Icon: CalendarOff,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    title: "Availability Windows",
    description:
      "Each venue has configurable blackout periods — maintenance, reservations, or institutional events. The scheduler respects them automatically.",
  },
  {
    Icon: GraduationCap,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "Exam Type Eligibility",
    description:
      "Written exams, CBT sessions, and lab practicals each require different facilities. Eligibility flags per venue ensure the right exam goes to the right room.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function VenueManagementSection() {
  return (
    <section id="venues" className="bg-surface py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
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
            Venue Management
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            Every Space,{" "}
            <span className="text-primary">Precisely Configured</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
            Venue records carry more than a name and a seat count. TimeMapper
            tracks everything the scheduler needs to make accurate decisions.
          </p>
        </motion.div>

        {/* Attribute cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {ATTRIBUTE_CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              className="bg-background rounded-2xl border border-border p-6 flex gap-5 shadow-sm"
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
