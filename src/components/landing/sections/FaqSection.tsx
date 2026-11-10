import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Can the same course appear on two different exam days?",
    answer:
      "No. TimeMapper enforces a strict one-course-one-day rule across all departments and faculties. This applies to shared courses like GST — if Computer Science and Economics both register GST 101, that exam runs on a single day for all registered students.",
  },
  {
    question: "How are CBT exams with large cohorts handled?",
    answer:
      "CBT labs have fixed seat counts. For large cohorts, TimeMapper computes the number of turns required to seat all students and assigns each turn to a lab slot. Where available, multiple CBT labs may be used in parallel. Small exams from different courses can be safely joined into a single turn — capped at two courses per sitting.",
  },
  {
    question: "Who can change a published timetable?",
    answer:
      "Published timetables are locked for general users. Institution Admins and Faculty Admins can submit change requests, which are logged in the audit trail. Session-level shifts go through the discrepancy workflow and require approval before they take effect.",
  },
  {
    question: "What happens when no valid timetable can be generated?",
    answer:
      "The optimizer surfaces structured diagnostics rather than a generic failure message. Each unresolved constraint is listed with the course, the constraint type, and the venues or slots that were tried. Administrators can then adjust policies or manually resolve the conflict and re-run.",
  },
];

function FaqAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, ease: "easeOut" as const, delay: index * 0.08 }}
      className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-surface-raised transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-bold text-text-main leading-snug">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-shrink-0"
        >
          <ChevronDown size={18} className="text-text-subtle" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 pb-5 border-t border-border">
              <p className="text-sm text-text-muted leading-relaxed pt-4">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-background py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-primary-muted text-primary border border-primary/20">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
            Common <span className="text-primary">Questions</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-text-muted leading-relaxed">
            Quick answers to the questions administrators and developers ask most.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, index) => (
            <FaqAccordionItem
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
