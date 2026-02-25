import HeroArrival from "../components/world/HeroArrival";
import ChatListMockup from "../components/world/ChatListMockup";
import ChatDetailMockup from "../components/world/ChatDetailMockup";
import WorldOverview from "../components/world/WorldOverview";
import JobsEconomy from "../components/world/JobsEconomy";
import RestaurantSimulation from "../components/world/RestaurantSimulation";
import AdministrativeLife from "../components/world/AdministrativeLife";
import LectureSection from "../components/world/LectureSection";
import FlashCardReview from "../components/world/FlashCardReview";
import ProficiencyTest from "../components/world/ProficiencyTest";
import AIPersonality from "../components/world/AIPersonality";
import ItemsGifts from "../components/world/ItemsGifts";
import ProgressionStory from "../components/world/ProgressionStory";
import CTAButton from "../components/CTAButton";
import FAQ from "../components/FAQ";

const faqItems = [
  {
    question: "Is this a game?",
    answer:
      "It's a web app that feels like a game. Think of it as a text-based immersive world — like a MUD game meets KakaoTalk. There are no graphics-heavy gameplay mechanics, just rich text interactions, UI-driven tasks, and AI characters with real personalities.",
  },
  {
    question: "What Korean level do I need to start?",
    answer:
      "Absolute zero. You arrive knowing nothing, and some characters will use English to help you get started. The world gradually shifts to more Korean as you progress. By the time you reach Level 1 certification, you'll be reading and writing fluently.",
  },
  {
    question: "How does the economy work?",
    answer:
      "You earn Korean Won (₩) by working part-time jobs — restaurant shifts, deliveries, cafe barista work. You spend it on daily life (taxes, exam fees) and gifts for friends. Every transaction requires reading and understanding Korean.",
  },
  {
    question: "Can the AI characters actually leave?",
    answer:
      "Yes. If you consistently ignore or mistreat a character, they can leave your chat permanently. These are AI characters with emotional states — they remember how you treat them. Building and maintaining relationships is part of the learning experience.",
  },
  {
    question: "How long does it take to reach Level 1?",
    answer:
      "It varies, but the typical journey is about 180 days of regular engagement. The progression mirrors real language learning — you'll go from complete beginner to having arguments in Korean. It's a marathon, not a sprint.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "We're launching as a web app first, optimized for mobile browsers. A native mobile app is planned for later. The experience is designed to feel like using your phone — chat interfaces, notifications, and phone calls all happen within the web app.",
  },
];

export default function V1Minimal() {
  return (
    <div className="bg-white text-gray-900">
      {/* §1 Hero — Arrival */}
      <HeroArrival />

      {/* §2 Chat List */}
      <ChatListMockup />

      {/* §3 Chat Detail */}
      <ChatDetailMockup />

      {/* §4 World Overview */}
      <WorldOverview />

      {/* §5 Jobs & Economy */}
      <JobsEconomy />

      {/* §6 Restaurant Simulation */}
      <RestaurantSimulation />

      {/* §7 Administrative Life */}
      <AdministrativeLife />

      {/* §8 Lecture */}
      <LectureSection />

      {/* §9 Flash Card Review */}
      <FlashCardReview />

      {/* §10 Proficiency Test */}
      <ProficiencyTest />

      {/* §11 AI Personality */}
      <AIPersonality />

      {/* §12 Items & Gifts */}
      <ItemsGifts />

      {/* §13 Progression Story */}
      <ProgressionStory />

      {/* §14 CTA */}
      <section className="px-6 py-20 bg-navy text-white text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Enter the world. Start your journey.
        </h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          A Korean-speaking world is waiting for you.
        </p>
        <div className="flex flex-col items-center gap-3">
          <CTAButton
            label="Get Early Access — $4.99/mo"
            sublabel="50% off forever for early members"
            className="bg-white text-navy hover:bg-gray-100"
          />
          <CTAButton
            label="Join the free waitlist instead"
            variant="secondary"
            className="text-white/70"
          />
        </div>
      </section>

      {/* §15 FAQ */}
      <FAQ items={faqItems} className="bg-white text-gray-900" />

      {/* §16 Final CTA + Footer */}
      <section className="px-6 py-16 bg-slate-50 text-center">
        <p className="text-lg font-korean text-gray-400 mb-2">
          당신의 한국어 여정이 시작됩니다.
        </p>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Your Korean journey starts now.
        </h2>
        <CTAButton
          label="Enter the World"
          className="bg-navy text-white hover:bg-navy-dark"
        />
      </section>

      <footer className="px-6 py-8 text-center text-xs text-gray-400">
        <p>&copy; 2026 Korean World. All rights reserved.</p>
      </footer>
    </div>
  );
}
