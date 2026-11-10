import { motion } from "framer-motion";
import { ShieldCheck, ListChecks, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TrustCard {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const TRUST_CARDS: TrustCard[] = [
  {
    Icon: ShieldCheck,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Independent Validator",
    description:
      "Before any timetable draft is surfaced to administrators, an independent validation pass re-checks every assignment for hard violations. Only clean timetables proceed.",
  },
  {
    Icon: ListChecks,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Structured Diagnostics",
    description:
      "When the optimizer can't find a valid assignment, it surfaces precise diagnostics — which course, which constraint, and which venues were tried. Never a bare 'optimization failed'.",
  },
  {
    Icon: Lightbulb,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    title: "Explainability",
    description:
      "Administrators can inspect why a session was assigned to a specific venue, why two small exams were joined, or why a date was chosen — all from the same interface.",
  },
];

export default function TrustSection() {
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
            Trust & Transparency
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            No Silent Failures,{" "}
            <span className="text-primary">No Guesswork</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
            Every timetable TimeMapper produces is independently verified before
            it reaches administrators. And when something can't be scheduled,
            you'll know exactly why.
          </p>
        </motion.div>

        {/* Trust cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRUST_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut" as const, delay: index * 0.1 }}
              className="bg-surface rounded-2xl border border-border p-6 flex flex-col gap-4 shadow-sm"
            >
              <div
                className={`relative inline-flex items-center justify-center w-12 h-12 rounded-2xl ${card.iconBg} ring-1 ring-inset ring-white/50 shadow-sm overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
                <card.Icon size={22} className={`relative z-10 ${card.iconColor}`} />
              </div>
              <h3 className="text-base font-bold text-text-main">{card.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
