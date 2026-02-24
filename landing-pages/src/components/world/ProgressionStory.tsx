import SectionWrapper from "./SectionWrapper";

interface TimelineStep {
  day: string;
  title: string;
  description: string;
  icon: string;
}

const steps: TimelineStep[] = [
  {
    day: "Day 1",
    title: "도착",
    description: "You arrive knowing nothing. The world speaks Korean.",
    icon: "🛬",
  },
  {
    day: "Day 7",
    title: "첫 알바",
    description: "Your first job. You mess up orders and learn from mistakes.",
    icon: "🏪",
  },
  {
    day: "Day 30",
    title: "주문 성공",
    description: '"부대찌개 2인분 주세요" — your first flawless order.',
    icon: "🍜",
  },
  {
    day: "Day 60",
    title: "3급 합격",
    description: "Bronze-level certification. New doors open.",
    icon: "🥉",
  },
  {
    day: "Day 120",
    title: "첫 말다툼",
    description: "Your first argument — entirely in Korean.",
    icon: "😤",
  },
  {
    day: "Day 180",
    title: "1급 합격",
    description: "Gold-level mastery. The real world is next.",
    icon: "🏆",
  },
];

export default function ProgressionStory() {
  return (
    <SectionWrapper className="bg-slate-50">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
        From lost to fluent.
      </h2>
      <p className="text-center text-gray-500 mb-16 max-w-md mx-auto">
        Your journey through the world.
      </p>

      {/* Timeline */}
      <div className="relative max-w-3xl mx-auto">
        {/* Vertical line (mobile) / Horizontal line (desktop) */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 md:hidden" />
        <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-gray-200" />

        <div className="grid md:grid-cols-6 gap-8 md:gap-4">
          {steps.map((step, i) => (
            <div key={i} className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-2">
              {/* Node */}
              <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-xl shadow-sm">
                {step.icon}
              </div>

              {/* Content */}
              <div className="md:text-center">
                <p className="text-xs font-bold text-navy uppercase tracking-wider">
                  {step.day}
                </p>
                <p className="text-sm font-semibold text-gray-900 font-korean mt-0.5">
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
