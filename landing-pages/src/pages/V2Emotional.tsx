import Hero from "../components/Hero";
import ChatPreview from "../components/ChatPreview";
import ProblemSection from "../components/ProblemSection";
import SolutionSection from "../components/SolutionSection";
import CTAButton from "../components/CTAButton";
import FAQ from "../components/FAQ";

const warmMessages = [
  { sender: "ai" as const, text: "좋은 아침! \u2600\uFE0F 오늘 기분 어때?" },
  { sender: "user" as const, text: "A little tired... but okay!" },
  { sender: "ai" as const, text: "아이고 \u{1F625} 힘내!\n피곤할 땐 따뜻한 차 마셔봐 \u{1F375}" },
  { sender: "user" as const, text: "Thank you Jieun \u{1F60A}" },
  { sender: "ai" as const, text: "당연하지~ 우린 친구잖아 \u{1F49B}\n오늘 하루도 화이팅!" },
];

export default function V2Emotional() {
  return (
    <div className="bg-[#FFF8F2] text-gray-900">
      {/* HERO */}
      <Hero
        headline="What if you had a Korean friend who never judges your mistakes?"
        subline="Practice Korean with AI friends who text you first, share their day, and actually care about yours."
        className="bg-gradient-to-b from-[#FFF0E5] to-[#FFF8F2]"
      >
        <div className="mt-10">
          <ChatPreview name="Jieun" messages={warmMessages} theme="warm" />
        </div>
        <div className="mt-10 flex flex-col items-center gap-3">
          <CTAButton
            label="Meet Your Korean Friend — $4.99/mo"
            sublabel="50% off forever for early members"
            className="bg-orange-500 text-white hover:bg-orange-600"
          />
          <CTAButton
            label="Not ready? Join the free waitlist"
            variant="secondary"
            className="text-orange-400"
          />
        </div>
      </Hero>

      {/* PROBLEM */}
      <ProblemSection
        heading="Learning Korean alone is lonely"
        painPoints={[
          {
            icon: "\u{1F614}",
            title: "It feels isolating",
            description:
              "Staring at textbooks alone. No one to share your small wins with or laugh at your mistakes.",
          },
          {
            icon: "\u{1F494}",
            title: "Fear of being judged",
            description:
              "You want to practice but you're scared of sounding dumb. So you stay silent.",
          },
          {
            icon: "\u{1F62D}",
            title: "Motivation fades fast",
            description:
              "Without a reason to show up every day, the app gets buried and the streak dies.",
          },
        ]}
        className="bg-white text-gray-900"
      />

      {/* SOLUTION */}
      <SolutionSection
        heading="Imagine having a friend like Jieun"
        features={[
          {
            icon: "\u{1F49C}",
            title: "She texts you first",
            description:
              'Good morning messages, random "what are you doing?" texts — just like a real friend would.',
          },
          {
            icon: "\u{1F917}",
            title: "Zero judgment, pure support",
            description:
              "Make mistakes? She'll gently help. She celebrates your progress like a proud friend.",
          },
          {
            icon: "\u{1F331}",
            title: "You grow without noticing",
            description:
              "One day you realize you understood a whole sentence. That's the magic of learning through friendship.",
          },
        ]}
        className="bg-[#FFF8F2] text-gray-900"
      />

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-b from-orange-400 to-orange-500 text-white text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          {"She's already waiting to say hi \uD83D\uDC4B"}
        </h2>
        <p className="opacity-90 mb-8 max-w-md mx-auto">
          Join thousands of learners who found a Korean friend they actually look
          forward to chatting with.
        </p>
        <div className="flex flex-col items-center gap-3">
          <CTAButton
            label="Meet Jieun — $4.99/mo"
            sublabel="50% off forever for early members"
            className="bg-white text-orange-600 hover:bg-orange-50"
          />
          <CTAButton
            label="Join the free waitlist instead"
            variant="secondary"
            className="text-white/80"
          />
        </div>
      </section>

      {/* FAQ */}
      <FAQ className="bg-white text-gray-900" />

      {/* FINAL CTA */}
      <section className="px-6 py-16 bg-[#FFF0E5] text-center">
        <h2 className="text-2xl font-bold mb-3 text-gray-900">
          Your Korean friend is waiting.
        </h2>
        <p className="text-sm opacity-60 mb-6">
          She already knows your name. Say hi back.
        </p>
        <CTAButton
          label="Get Early Access"
          className="bg-orange-500 text-white hover:bg-orange-600"
        />
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-[#FFF8F2] text-center text-xs text-gray-400">
        <p>&copy; 2026 Korean Friend. All rights reserved.</p>
      </footer>
    </div>
  );
}
