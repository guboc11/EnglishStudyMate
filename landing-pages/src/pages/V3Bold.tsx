import Hero from "../components/Hero";
import ChatPreview from "../components/ChatPreview";
import ProblemSection from "../components/ProblemSection";
import SolutionSection from "../components/SolutionSection";
import CTAButton from "../components/CTAButton";
import FAQ from "../components/FAQ";

const boldMessages = [
  { sender: "ai" as const, text: "\uD83D\uDC4B \uC57C! \uC624\uB298 \uD55C\uAD6D\uC5B4 \uACF5\uBD80 \uD588\uC5B4?" },
  { sender: "user" as const, text: "Not yet... \uD83D\uDE05" },
  { sender: "ai" as const, text: "\uADF8\uB7FC \uC9C0\uAE08 \uD558\uC790! \uD83D\uDD25\n\u2018\uBC30\uACE0\uD30C\u2019 \uBB34\uC2A8 \uB73B\uC778\uC9C0 \uC54C\uC544?" },
  { sender: "user" as const, text: "Hmm... hungry?" },
  { sender: "ai" as const, text: "\uC624 \uB300\uBC15! \uB9DE\uC544! \uD83C\uDF89\n\uC5ED\uC2DC \uCC9C\uC7AC\uC778\uB370? \u314E\u314E" },
];

export default function V3Bold() {
  return (
    <div className="bg-gray-950 text-white">
      {/* HERO */}
      <Hero
        headline="Duolingo won't teach you Korean. A friend will."
        subline="We built AI friends who live in Korea, text you in Korean, and help you actually speak."
        className="bg-gradient-to-b from-gray-950 to-gray-900"
      >
        <div className="mt-10">
          <ChatPreview name="Jieun" messages={boldMessages} theme="dark" />
        </div>
        <div className="mt-10 flex flex-col items-center gap-3">
          <CTAButton
            label="Get Early Access — $4.99/mo"
            sublabel="50% off forever for early members"
            className="bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
          />
          <CTAButton
            label="Not ready? Join the free waitlist"
            variant="secondary"
            className="text-gray-500"
          />
        </div>
      </Hero>

      {/* PROBLEM */}
      <ProblemSection
        heading="Let's be honest about Korean learning"
        painPoints={[
          {
            icon: "\u{1F4A9}",
            title: "Language apps are broken",
            description:
              "You've \"learned\" 500 words on Duolingo but can't order coffee in Seoul.",
          },
          {
            icon: "\u{1F92B}",
            title: "Classrooms are outdated",
            description:
              "Formal Korean nobody uses. You sound like a textbook, not a human.",
          },
          {
            icon: "\u23F3",
            title: "Time keeps passing",
            description:
              "Another year of \"I'll start Korean soon.\" How many more?",
          },
        ]}
        className="bg-gray-900 text-white"
      />

      {/* SOLUTION */}
      <SolutionSection
        heading="A radically different approach"
        features={[
          {
            icon: "\u26A1",
            title: "No lessons. Just conversations.",
            description:
              "Your AI friend texts you daily in Korean. You reply. That's it. That's the whole method.",
          },
          {
            icon: "\u{1F9E0}",
            title: "AI that actually adapts",
            description:
              "Not a chatbot reading scripts. She remembers you, adjusts difficulty, and keeps it real.",
          },
          {
            icon: "\u{1F525}",
            title: "Real Korean, not textbook Korean",
            description:
              "Slang, emojis, abbreviations — the way actual Koreans text their friends.",
          },
        ]}
        className="bg-gray-950 text-white"
      />

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-b from-purple-900 to-gray-950 text-white text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Stop studying. Start talking.
        </h2>
        <p className="opacity-70 mb-8 max-w-md mx-auto">
          Your Korean friend is one tap away.
        </p>
        <div className="flex flex-col items-center gap-3">
          <CTAButton
            label="Get Early Access — $4.99/mo"
            sublabel="50% off forever for early members"
            className="bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
          />
          <CTAButton
            label="Join the free waitlist instead"
            variant="secondary"
            className="text-gray-500"
          />
        </div>
      </section>

      {/* FAQ */}
      <FAQ className="bg-gray-900 text-white" />

      {/* FINAL CTA */}
      <section className="px-6 py-16 bg-gray-950 text-center">
        <h2 className="text-2xl font-bold mb-6">
          Duolingo won't teach you Korean.
          <br />
          <span className="text-purple-400">A friend will.</span>
        </h2>
        <CTAButton
          label="Get Early Access"
          className="bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
        />
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-xs text-gray-600">
        <p>&copy; 2026 Korean Friend. All rights reserved.</p>
      </footer>
    </div>
  );
}
