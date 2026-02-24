interface PainPoint {
  icon: string;
  title: string;
  description: string;
}

interface ProblemSectionProps {
  heading?: string;
  painPoints?: PainPoint[];
  className?: string;
}

const defaultPainPoints: PainPoint[] = [
  {
    icon: "\u{1F4DA}",
    title: "Textbooks feel lifeless",
    description:
      "You memorize grammar rules but freeze in real conversations.",
  },
  {
    icon: "\u{1F971}",
    title: "Apps are boring",
    description:
      "Flashcards and multiple choice won't teach you how Koreans actually talk.",
  },
  {
    icon: "\u{1F630}",
    title: "No one to practice with",
    description:
      "Finding a language partner is awkward, and they're not always available.",
  },
];

export default function ProblemSection({
  heading = "Why is learning Korean so hard?",
  painPoints = defaultPainPoints,
  className = "",
}: ProblemSectionProps) {
  return (
    <section className={`px-6 py-20 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
          {heading}
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {painPoints.map((p, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-4">{p.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
              <p className="opacity-70 leading-relaxed text-sm">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
