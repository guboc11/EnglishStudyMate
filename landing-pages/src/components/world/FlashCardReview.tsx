import { Link } from "react-router-dom";
import SectionWrapper from "./SectionWrapper";

/* ── Data ── */

const flashCards = [
  { word: "끝내주다", hint: "awesome / amazing", tag: "슬랭" },
  { word: "귀찮다", hint: "can't be bothered", tag: "감정" },
  { word: "혼쭐나다", hint: "get scolded hard", tag: "슬랭" },
];

const notifications = [
  {
    word: "동사무소",
    desc: "community service center",
    stage: 3,
    time: "2분 전",
    tag: "행정",
  },
  {
    word: "끝내주다",
    desc: "awesome / amazing",
    stage: 1,
    time: "15분 전",
    tag: "슬랭",
  },
  {
    word: "그러니까",
    desc: "so / that's what I mean",
    stage: 2,
    time: "1시간 전",
    tag: "회화",
  },
  {
    word: "세탁기",
    desc: "washing machine",
    stage: 2,
    time: "3시간 전",
    tag: "생활",
  },
  {
    word: "갑분싸",
    desc: "sudden mood kill",
    stage: 1,
    time: "어제",
    tag: "슬랭",
  },
];

const stageMeta: Record<number, { label: string; color: string; bg: string }> =
  {
    1: {
      label: "1단계",
      color: "text-sky-600",
      bg: "bg-sky-100",
    },
    2: {
      label: "2단계",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    3: {
      label: "3단계",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  };

const stats = [
  { emoji: "⚡", label: "Review time", value: "~10 sec" },
  { emoji: "🧠", label: "Review Success Rate", value: "87%" },
  { emoji: "📲", label: "Scheduling", value: "Automatic" },
];

/* ── Mini phone shell (matches LectureSection) ── */
function MiniPhone({
  children,
  label,
  dark,
}: {
  children: React.ReactNode;
  label: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 shrink-0 snap-center">
      <div
        className={`w-[280px] rounded-[2rem] border-[5px] border-gray-800 shadow-xl overflow-hidden ${dark ? "bg-gray-900" : "bg-white"}`}
      >
        {/* Notch */}
        <div className="relative bg-gray-800 h-6 flex items-end justify-center">
          <div className="w-24 h-4 bg-gray-800 rounded-b-2xl" />
        </div>
        {/* Screen */}
        <div
          className={`min-h-[420px] max-h-[480px] overflow-hidden ${dark ? "bg-gray-900" : "bg-white"}`}
        >
          {children}
        </div>
        {/* Home indicator */}
        <div
          className={`py-2 flex justify-center ${dark ? "bg-gray-900" : "bg-white"}`}
        >
          <div
            className={`w-24 h-1 rounded-full ${dark ? "bg-white/20" : "bg-gray-300"}`}
          />
        </div>
      </div>
      <span className="text-sm font-medium text-white/50">{label}</span>
    </div>
  );
}

/* ── Screen 1: Flash Card ── */
function FlashCardScreen() {
  const card = flashCards[0]; // 맨 앞 카드가 활성

  return (
    <div className="flex flex-col h-[420px]">
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-900">
          ⚡ Flash Review
        </span>
        <span className="text-xs font-mono text-red-500 font-bold animate-timer-pulse">
          0:07
        </span>
      </div>

      {/* Card area */}
      <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center px-5 py-4 relative">
        {/* Stacked cards behind (depth illusion) */}
        <div className="absolute top-[52px] w-[200px] h-[180px] bg-white rounded-2xl shadow-sm border border-gray-200 rotate-2 opacity-40" />
        <div className="absolute top-[48px] w-[210px] h-[185px] bg-white rounded-2xl shadow-sm border border-gray-200 -rotate-1 opacity-60" />

        {/* Active card — white paper card */}
        <div className="relative z-10 w-[220px] bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-8 flex flex-col items-center gap-4">
          {/* Tag */}
          <span className="text-[10px] font-medium text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">
            {card.tag}
          </span>

          {/* Word */}
          <p className="text-3xl font-bold text-gray-900 font-korean">
            {card.word}
          </p>

          {/* Divider */}
          <div className="w-12 h-px bg-gray-200" />

          {/* Hint (faded, tap to reveal feel) */}
          <p className="text-sm text-gray-400">{card.hint}</p>

          {/* Audio */}
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
        </div>

        {/* Swipe hint */}
        <p className="text-[10px] text-gray-400 mt-4">← swipe to next →</p>
      </div>

      {/* Bottom: card dots + progress */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border-t border-gray-100">
        <div className="flex gap-1.5">
          {flashCards.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full ${i === 0 ? "bg-violet-500 w-4" : "bg-gray-300 w-1.5"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">🔥</span>
          <span className="text-[11px] font-bold text-orange-500">
            12 streak
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Screen 2: Notification / Review alerts ── */
function NotificationScreen() {
  return (
    <div className="flex flex-col h-[420px] bg-gray-900 text-white">
      {/* Lock screen header */}
      <div className="text-center pt-4 pb-2">
        <p className="text-[10px] text-white/40">화요일, 2월 26일</p>
        <p className="text-2xl font-light text-white/90">오후 3:42</p>
      </div>

      {/* Notification list */}
      <div className="flex-1 px-3 space-y-2 overflow-hidden">
        {notifications.map((n, i) => {
          const s = stageMeta[n.stage];
          return (
            <div
              key={i}
              className="bg-white/10 backdrop-blur rounded-2xl px-3 py-2.5 border border-white/5"
            >
              {/* App icon + name + time */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center">
                  <span className="text-[8px]">🌏</span>
                </div>
                <span className="text-[10px] text-white/40 font-medium">
                  AI World
                </span>
                <span className="text-[10px] text-white/25 ml-auto">
                  {n.time}
                </span>
              </div>

              {/* Content */}
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-white/90 font-korean leading-snug">
                    '<span className="font-bold">{n.word}</span>' 기억나?{" "}
                    <span className="text-white/50">복습할 시간!</span>
                  </p>
                  <p className="text-[10px] text-white/35 mt-0.5">{n.desc}</p>
                </div>

                {/* Stage badge */}
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${s.bg} ${s.color}`}
                  >
                    {s.label}
                  </span>
                  {/* Stage dots */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((d) => (
                      <div
                        key={d}
                        className={`w-1 h-1 rounded-full ${d <= n.stage ? "bg-emerald-400" : "bg-white/15"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tag */}
              <div className="mt-1.5 flex items-center gap-1">
                <span className="text-[8px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded-full">
                  #{n.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom hint */}
      <div className="px-4 py-2.5 text-center">
        <p className="text-[10px] text-white/20">
          Tap a notification to start review
        </p>
      </div>
    </div>
  );
}

/* ── Main Section ── */
export default function FlashCardReview() {
  return (
    <SectionWrapper id="review" className="bg-navy text-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
        10 seconds. That's all it takes.
      </h2>
      <p className="text-center text-white/60 mb-12 max-w-md mx-auto">
        Flash card reviews that come to you. Spaced repetition science meets
        push notifications — your brain never forgets.
      </p>

      <div className="flex flex-col items-center gap-12">
        {/* 2 Phones — desktop: side by side, mobile: horizontal scroll */}
        <div className="hidden md:flex gap-8 justify-center">
          <MiniPhone label="① Flash Card">
            <FlashCardScreen />
          </MiniPhone>
          <MiniPhone label="② Review Alerts" dark>
            <NotificationScreen />
          </MiniPhone>
        </div>

        <div className="flex md:hidden overflow-x-auto gap-4 snap-x snap-mandatory w-full pb-4 px-2">
          <MiniPhone label="① Flash Card">
            <FlashCardScreen />
          </MiniPhone>
          <MiniPhone label="② Review Alerts" dark>
            <NotificationScreen />
          </MiniPhone>
        </div>

        <div className="flex justify-center">
          <Link
            to="/prototype/v2/review"
            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
            onClick={() => (window as any).gtag?.('event', 'prototype_click', { section: 'review' })}
          >
            Try it yourself →
          </Link>
        </div>

        {/* Bottom stats */}
        <div className="flex flex-wrap justify-center gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <span className="text-2xl block mb-1">{stat.emoji}</span>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
