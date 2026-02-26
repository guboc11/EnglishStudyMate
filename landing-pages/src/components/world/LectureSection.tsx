import { Link } from "react-router-dom";
import SectionWrapper from "./SectionWrapper";

const topics = [
  { emoji: "📖", title: "한국어 어원", desc: "Where words come from" },
  { emoji: "🎬", title: "드라마 표현", desc: "Drama expressions decoded" },
  { emoji: "🗣️", title: "발음 비밀", desc: "Pronunciation secrets" },
];

/* ── Mini phone shell (280px — fits 3 across max-w-5xl) ── */
function MiniPhone({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 shrink-0 snap-center">
      <div className="w-[280px] rounded-[2rem] border-[5px] border-gray-800 bg-white shadow-xl overflow-hidden">
        {/* Notch */}
        <div className="relative bg-gray-800 h-6 flex items-end justify-center">
          <div className="w-24 h-4 bg-gray-800 rounded-b-2xl" />
        </div>
        {/* Screen */}
        <div className="bg-white min-h-[420px] max-h-[480px] overflow-hidden">
          {children}
        </div>
        {/* Home indicator */}
        <div className="bg-white py-2 flex justify-center">
          <div className="w-24 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
      <span className="text-sm font-medium text-gray-500">{label}</span>
    </div>
  );
}

/* ── Screen 1: Intro ── */
function IntroScreen() {
  return (
    <div className="flex flex-col h-[420px]">
      {/* Emerald header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">
            👩‍🏫
          </div>
          <span className="text-xs font-medium font-korean">마을 선생님</span>
        </div>
        <span className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full">
          Lesson 3
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
          👩‍🏫
        </div>

        {/* Divider + Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 justify-center text-emerald-400">
            <div className="w-8 h-px bg-emerald-300" />
            <span className="text-[10px] tracking-widest uppercase">
              Story
            </span>
            <div className="w-8 h-px bg-emerald-300" />
          </div>
          <p className="text-xl font-bold text-gray-900 font-korean">
            사랑의 이야기
          </p>
          <p className="text-sm text-gray-400">The Story of Love</p>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          From 춘향전 to modern K-Drama
        </p>

        {/* CTA */}
        <button className="mt-2 bg-emerald-500 text-white text-sm font-medium px-6 py-2.5 rounded-full flex items-center gap-1.5">
          <span>▶</span>
          <span className="font-korean">시작하기</span>
        </button>
      </div>
    </div>
  );
}

/* ── Village illustration (inline SVG) ── */
function VillageScene() {
  return (
    <svg
      viewBox="0 0 280 200"
      preserveAspectRatio="xMidYMax slice"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#312e81" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="vs-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Sky fill */}
      <rect width="280" height="200" fill="url(#vs-sky)" />

      {/* Moon */}
      <circle cx="230" cy="30" r="15" fill="#fef9c3" fillOpacity="0.4" />
      {/* ✦ Stars — bling bling (opacity + size pulse) */}
      {/* Star 1 — 4-point sparkle */}
      <g transform="translate(40,18)">
        <path d="M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1 Z" fill="white">
          <animate attributeName="opacity" values="0.9;0.15;0.9" dur="2s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </path>
      </g>
      {/* Star 2 */}
      <g transform="translate(120,12)">
        <path d="M0,-3.5 L0.8,-0.8 L3.5,0 L0.8,0.8 L0,3.5 L-0.8,0.8 L-3.5,0 L-0.8,-0.8 Z" fill="white">
          <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.6s" repeatCount="indefinite" begin="0.7s" />
          <animateTransform attributeName="transform" type="scale" values="1;0.3;1" dur="2.6s" repeatCount="indefinite" begin="0.7s" />
        </path>
      </g>
      {/* Star 3 — big sparkle */}
      <g transform="translate(185,30)">
        <path d="M0,-5 L1.2,-1.2 L5,0 L1.2,1.2 L0,5 L-1.2,1.2 L-5,0 L-1.2,-1.2 Z" fill="white">
          <animate attributeName="opacity" values="0.7;0.1;0.7" dur="3s" repeatCount="indefinite" begin="1.2s" />
          <animateTransform attributeName="transform" type="scale" values="1;0.3;1" dur="3s" repeatCount="indefinite" begin="1.2s" />
        </path>
      </g>
      {/* Star 4 */}
      <g transform="translate(65,38)">
        <path d="M0,-3 L0.7,-0.7 L3,0 L0.7,0.7 L0,3 L-0.7,0.7 L-3,0 L-0.7,-0.7 Z" fill="white">
          <animate attributeName="opacity" values="0.6;0.05;0.6" dur="2.2s" repeatCount="indefinite" begin="0.4s" />
          <animateTransform attributeName="transform" type="scale" values="1;0.2;1" dur="2.2s" repeatCount="indefinite" begin="0.4s" />
        </path>
      </g>
      {/* Star 5 */}
      <g transform="translate(260,15)">
        <path d="M0,-3.5 L0.8,-0.8 L3.5,0 L0.8,0.8 L0,3.5 L-0.8,0.8 L-3.5,0 L-0.8,-0.8 Z" fill="white">
          <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.8s" repeatCount="indefinite" begin="1.8s" />
          <animateTransform attributeName="transform" type="scale" values="1;0.3;1" dur="2.8s" repeatCount="indefinite" begin="1.8s" />
        </path>
      </g>
      {/* Star 6 — near moon */}
      <g transform="translate(205,20)">
        <path d="M0,-2.5 L0.6,-0.6 L2.5,0 L0.6,0.6 L0,2.5 L-0.6,0.6 L-2.5,0 L-0.6,-0.6 Z" fill="#fef9c3">
          <animate attributeName="opacity" values="0.7;0.15;0.7" dur="3.4s" repeatCount="indefinite" begin="0.5s" />
          <animateTransform attributeName="transform" type="scale" values="1;0.4;1" dur="3.4s" repeatCount="indefinite" begin="0.5s" />
        </path>
      </g>

      {/* ☁ Drifting clouds */}
      <g opacity="0.25">
        <ellipse cx="0" cy="48" rx="22" ry="7" fill="white" />
        <ellipse cx="-10" cy="45" rx="14" ry="5" fill="white" />
        <ellipse cx="10" cy="46" rx="12" ry="4" fill="white" />
        <animateTransform attributeName="transform" type="translate" values="-60,0;320,0" dur="25s" repeatCount="indefinite" />
      </g>
      <g opacity="0.15">
        <ellipse cx="0" cy="65" rx="18" ry="5" fill="white" />
        <ellipse cx="8" cy="63" rx="10" ry="4" fill="white" />
        <animateTransform attributeName="transform" type="translate" values="320,0;-60,0" dur="30s" repeatCount="indefinite" />
      </g>

      {/* Back mountain */}
      <polygon
        points="0,140 70,60 140,100 200,50 280,120 280,200 0,200"
        fill="#3730a3"
        fillOpacity="0.8"
      />
      {/* Front mountain */}
      <polygon
        points="0,170 100,100 180,130 280,160 280,200 0,200"
        fill="#4338ca"
        fillOpacity="0.6"
      />

      {/* Thatched house — roof */}
      <polygon
        points="100,120 140,95 180,120"
        fill="#92400e"
        fillOpacity="0.7"
      />
      {/* Eaves overhang */}
      <polygon
        points="96,120 140,93 184,120"
        fill="#92400e"
        fillOpacity="0.4"
      />
      {/* Wall */}
      <rect x="108" y="120" width="64" height="35" fill="#78350f" fillOpacity="0.5" rx="1" />
      {/* Door */}
      <rect x="130" y="130" width="20" height="25" fill="#451a03" fillOpacity="0.4" rx="1" />

      {/* Water / river — wave 1 */}
      <path
        d="M0,175 Q35,168 70,175 T140,175 T210,175 T280,175 L280,200 L0,200 Z"
        fill="#60a5fa"
        fillOpacity="0.2"
      />
      {/* Water — wave 2 */}
      <path
        d="M0,182 Q40,176 80,182 T160,182 T240,182 T280,182 L280,200 L0,200 Z"
        fill="#93c5fd"
        fillOpacity="0.15"
      />
    </svg>
  );
}

/* ── Screen 2: Story (narration slide) ── */
function StoryScreen() {
  const waveBars = [3, 5, 8, 12, 7, 10, 14, 9, 6, 11, 8, 13, 5, 9, 7, 12, 10, 6, 8, 4];

  return (
    <div className="flex flex-col h-[420px]">
      {/* Progress bar */}
      <div className="px-3 py-2 flex items-center justify-between bg-gray-50 border-b border-gray-100">
        <span className="text-[10px] font-medium text-gray-500">3 / 8</span>
        <div className="flex-1 mx-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-[38%] bg-emerald-500 rounded-full" />
        </div>
        <span className="text-[10px] text-gray-400">38%</span>
      </div>

      {/* Narration area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600 via-indigo-700 to-indigo-900" />
        {/* Village illustration — anchored to bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[60%]">
          <VillageScene />
        </div>
        {/* Content */}
        <div className="relative z-10 px-5 py-5 flex flex-col justify-between h-full">
        {/* Korean narration */}
        <div className="space-y-4 mt-2">
          <p className="text-white text-base font-korean leading-relaxed">
            "옛날 옛적에, 한 마을에 춘향이라는 아름다운 처녀가 살았습니다..."
          </p>
          <p className="text-white/50 text-xs leading-relaxed">
            Once upon a time, in a village lived a beautiful girl named
            Chunhyang...
          </p>
        </div>

        {/* Audio waveform — compact */}
        <div className="space-y-2 mb-10">
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg
                className="w-2 h-2 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
            <div className="flex items-center gap-[2px] flex-1">
              {waveBars.map((h, i) => (
                <div
                  key={i}
                  className="w-[2px] rounded-full bg-emerald-400/70"
                  style={{
                    height: `${Math.round(h * 0.7)}px`,
                    animation: `wave-bounce 1.2s ease-in-out ${i * 0.06}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <span className="text-[9px] text-white/50">0:12</span>
          </div>

          {/* Slide dots + nav */}
          <div className="flex items-center justify-between">
            <button className="text-white/40 text-sm">←</button>
            <div className="flex gap-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full ${
                    i === 2
                      ? "bg-emerald-400 w-2.5"
                      : "bg-white/30 w-1"
                  }`}
                />
              ))}
            </div>
            <button className="text-white/40 text-sm">→</button>
          </div>
        </div>

        </div>
        {/* Floating chat button */}
        <div className="absolute bottom-3 right-4 z-10 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs shadow-lg">
          💬
        </div>
      </div>
    </div>
  );
}

/* ── Screen 3: Q&A Chat ── */
function QAScreen() {
  return (
    <div className="flex flex-col h-[420px]">
      {/* Story background preview (shrunken + darkened) */}
      <div className="h-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600 via-indigo-700 to-indigo-900">
          <div className="absolute inset-x-0 bottom-0 h-[70%]">
            <VillageScene />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <p className="relative z-10 text-white/30 text-[10px] px-4 pt-3 font-korean">
          "옛날 옛적에, 한 마을에..."
        </p>
      </div>

      {/* Chat popup */}
      <div className="flex-1 bg-white rounded-t-2xl -mt-3 relative flex flex-col">
        {/* Popup header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            💬 질문하기
          </span>
          <button className="text-gray-400 text-sm">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-3 space-y-3 overflow-hidden">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-kakao text-amber-900 text-[11px] px-3 py-2 rounded-2xl rounded-tr-md max-w-[85%] leading-relaxed">
              What does 처녀 mean in this context?
            </div>
          </div>

          {/* Teacher message */}
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs shrink-0">
              👩‍🏫
            </div>
            <div className="bg-gray-100 text-gray-700 text-[11px] px-3 py-2 rounded-2xl rounded-tl-md max-w-[85%] font-korean leading-relaxed">
              '처녀'는 결혼하지 않은 젊은 여자를 뜻해요. 요즘은 잘 안 쓰는
              표현이에요~ 대신 '미혼 여성'이라고 해요 😊
            </div>
          </div>
        </div>

        {/* Input field */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="bg-gray-50 rounded-full px-4 py-2 text-[11px] text-gray-300">
            Type a question...
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Section ── */
export default function LectureSection() {
  return (
    <SectionWrapper id="school" className="bg-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
        Your village teacher is waiting.
      </h2>
      <p className="text-center text-gray-500 mb-12 max-w-md mx-auto">
        Interactive lectures on word origins, grammar secrets, and cultural
        stories. Tap through animated slides — ask questions anytime.
      </p>

      <div className="flex flex-col items-center gap-12">
        {/* 3 Phones — desktop: grid, mobile: horizontal scroll */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 w-full justify-items-center">
          <MiniPhone label="① Intro">
            <IntroScreen />
          </MiniPhone>
          <MiniPhone label="② Story">
            <StoryScreen />
          </MiniPhone>
          <MiniPhone label="③ Ask">
            <QAScreen />
          </MiniPhone>
        </div>

        <div className="flex lg:hidden overflow-x-auto gap-4 snap-x snap-mandatory w-full pb-4 px-2">
          <MiniPhone label="① Intro">
            <IntroScreen />
          </MiniPhone>
          <MiniPhone label="② Story">
            <StoryScreen />
          </MiniPhone>
          <MiniPhone label="③ Ask">
            <QAScreen />
          </MiniPhone>
        </div>

        {/* Topic cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {topics.map((topic, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-gray-50 rounded-xl px-5 py-4 min-w-[220px]"
            >
              <span className="text-2xl">{topic.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 font-korean">
                  {topic.title}
                </p>
                <p className="text-xs text-gray-400">{topic.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <Link
          to="/prototype/v2/lecture"
          className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
          onClick={() => (window as any).gtag?.('event', 'prototype_click', { section: 'lecture' })}
        >
          Try it yourself →
        </Link>
      </div>
    </SectionWrapper>
  );
}
