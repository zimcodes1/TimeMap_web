import { motion } from "framer-motion";
import { CalendarDays, Clock, Ruler, Flag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PolicyCard {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const POLICY_CARDS: PolicyCard[] = [
  {
    Icon: CalendarDays,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Configurable Operating Days & Hours",
    description:
      "Define which days lectures and exams run, what time the first slot starts, and when the last slot ends — per semester.",
  },
  {
    Icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    title: "Friday Prayer Blackout",
    description:
      "A built-in policy blocks exam and lecture scheduling during Friday Jumuah prayer time, respecting the institution's religious observance.",
  },
  {
    Icon: Ruler,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Duration Rules",
    description:
      "Minimum and maximum session durations are enforced per exam type and per course level. No course gets an unusually short or long slot by accident.",
  },
  {
    Icon: Flag,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "Local-First & Funded",
    description:
      "Designed, built, and maintained within the institution. No third-party licensing, no data leaving campus, no vendor lock-in.",
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

export default function NsukSection() {
  return (
    <section id="about" className="bg-surface py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
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
            Built for NSUK
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            Institution-Native,{" "}
            <span className="text-primary">Not One-Size-Fits-All</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
            TimeMapper was designed ground-up for Nasarawa State University,
            Keffi — with configurable policies that reflect how NSUK actually
            operates.
          </p>
        </motion.div>

        {/* Policy cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {POLICY_CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              className="bg-background rounded-2xl border border-border p-6 flex gap-5 shadow-sm"
            >
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
