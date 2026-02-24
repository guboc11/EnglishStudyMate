interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface SolutionSectionProps {
  heading?: string;
  features?: Feature[];
  className?: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: "\u{1F4AC}",
    title: "Your AI friend texts you first",
    description:
      "No awkward ice-breaking. Jieun messages you about her day, asks about yours, and keeps the conversation flowing.",
  },
  {
    icon: "\u{1F3AF}",
    title: "Adapts to your level",
    description:
      "Beginner? She'll mix in English. Getting better? She'll push you with more Korean. It feels natural, not forced.",
  },
  {
    icon: "\u{1F680}",
    title: "Learning disguised as chatting",
    description:
      "New vocab, grammar, and culture — all woven into real conversations you actually enjoy having.",
  },
];

export default function SolutionSection({
  heading = "Meet your Korean friend",
  features = defaultFeatures,
  className = "",
}: SolutionSectionProps) {
  return (
    <section className={`px-6 py-20 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
          {heading}
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="opacity-70 leading-relaxed text-sm">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
