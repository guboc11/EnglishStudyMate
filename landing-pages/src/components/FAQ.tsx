import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items?: FAQItem[];
  className?: string;
}

const defaultItems: FAQItem[] = [
  {
    question: "Is this a real person or AI?",
    answer:
      "Your Korean friend is powered by AI, but the conversations feel real. She remembers your interests, adjusts to your level, and chats like a genuine friend would.",
  },
  {
    question: "What level of Korean do I need?",
    answer:
      "Complete beginners welcome! Your friend will start with mostly English and gradually introduce more Korean as you improve. No prior knowledge needed.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, cancel anytime with one click. No contracts, no hidden fees. If you join during early access, your discounted price is locked in forever.",
  },
];

export default function FAQ({ items = defaultItems, className = "" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={`px-6 py-20 ${className}`}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="border border-current/10 rounded-xl overflow-hidden"
            >
              <button
                className="w-full text-left px-6 py-4 flex justify-between items-center font-medium cursor-pointer"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {item.question}
                <span
                  className={`ml-4 transition-transform duration-200 ${
                    openIndex === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4 opacity-70 leading-relaxed text-sm">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
