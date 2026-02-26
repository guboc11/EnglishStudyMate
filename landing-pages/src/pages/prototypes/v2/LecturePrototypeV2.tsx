import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "sonner";

/* ── Types ── */

type Tab = "timetable" | "lecture" | "homework" | "feedback";

type Period = {
  num: number;
  icon: string;
  subject: string;
  topic: string;
  status: "done" | "current" | "upcoming";
};

type Slide = {
  type: "cover" | "content" | "summary";
  emoji: string;
  korean: string[];
  english: string;
  vocab?: { word: string; reading: string; meaning: string }[];
};

type Message = { sender: "user" | "teacher"; text: string };

/* ── Data ── */

const PERIODS: Period[] = [
  { num: 1, icon: "📖", subject: "국어", topic: "한글의 탄생",               status: "done"     },
  { num: 2, icon: "📖", subject: "국어", topic: "사랑의 이야기: 춘향전",     status: "current"  },
  { num: 3, icon: "🔬", subject: "과학", topic: "날씨와 계절",               status: "upcoming" },
  { num: 4, icon: "📜", subject: "역사", topic: "세종대왕",                  status: "upcoming" },
];

/* 주간 시간표 — 오늘: 수요일(col 2), 현재 수업: 2교시(row 1) */
const DAYS = ["월", "화", "수", "목", "금"];
const TODAY_COL = 2;   // 수요일
const CURRENT_ROW = 1; // 2교시 (0-indexed)
const WEEK_TIMETABLE = [
  //  월       화       수       목       금
  ["국어",  "수학",  "국어",  "체육",  "국어" ], // 1교시
  ["수학",  "과학",  "국어",  "국어",  "수학" ], // 2교시
  ["사회",  "국어",  "과학",  "음악",  "과학" ], // 3교시
  ["미술",  "사회",  "역사",  "수학",  "사회" ], // 4교시
  ["",      "음악",  "",      "",      ""     ], // 5교시 — 화요일만
  ["",      "",      "",      "",      ""     ], // 6교시
];

const SLIDES: Slide[] = [
  {
    type: "cover",
    emoji: "🌸",
    korean: ["사랑의 이야기", "춘향전"],
    english: "The Story of Love",
  },
  {
    type: "content",
    emoji: "📖",
    korean: [
      '"옛날 옛적에,',
      "한 마을에 춘향이라는",
      '아름다운 처녀가 살았습니다."',
    ],
    english: "Once upon a time, a beautiful girl named Chunhyang lived in a village...",
  },
  {
    type: "content",
    emoji: "💌",
    korean: [
      "이몽룡은 한양으로 떠나야 했습니다.",
      "",
      '"반드시 돌아오겠소."',
    ],
    english: 'Yi Mong-ryong had to leave for Seoul. "I will surely return."',
  },
  {
    type: "content",
    emoji: "⚖️",
    korean: [
      "변사또가 수청을 강요했지만,",
      "춘향은 거부했습니다.",
      "",
      '"죽어도 싫소."',
    ],
    english: 'The corrupt official demanded obedience. "I refuse, even in death."',
  },
  {
    type: "summary",
    emoji: "📌",
    korean: ["오늘의 핵심 표현"],
    english: "Key vocabulary",
    vocab: [
      { word: "처녀",  reading: "cheo-nyeo",  meaning: "Unmarried young woman" },
      { word: "수청",  reading: "su-cheong",  meaning: "Serving an official" },
      { word: "반드시", reading: "ban-deu-si", meaning: "Surely, without fail" },
    ],
  },
];

const WAVE_BARS = [3, 5, 8, 12, 7, 10, 14, 9, 6, 11, 8, 13, 5, 9, 7, 12, 10, 6, 8, 4];

/* ── Auto-response ── */

function getAutoResponse(text: string): string {
  if (text.includes("처녀")) {
    return "처녀(處女)는 아직 결혼하지 않은 젊은 여성을 뜻해요. 옛날에는 춘향처럼 신분과 상관없이 쓰던 말이에요 😊";
  }
  if (text.includes("수청")) {
    return "수청(守廳)은 관리의 시중을 드는 일이에요. 변사또가 춘향에게 강요한 것이 바로 수청이에요. 춘향은 이를 거부했죠 ⚖️";
  }
  if (text.includes("반드시")) {
    return "'반드시'는 '꼭, 틀림없이'라는 뜻이에요. 이몽룡이 '반드시 돌아오겠소'라고 한 건 굳은 약속을 뜻해요 💌";
  }
  return "좋은 질문이에요! 다음 시간에 더 자세히 배울 거예요 😊";
}

/* ── Village Scene SVG ── */

function VillageScene() {
  return (
    <svg
      viewBox="0 0 280 200"
      preserveAspectRatio="xMidYMax slice"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#312e81" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="280" height="200" fill="url(#lp-sky)" />
      <circle cx="230" cy="30" r="15" fill="#fef9c3" fillOpacity="0.4" />
      <g transform="translate(40,18)">
        <path d="M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1 Z" fill="white">
          <animate attributeName="opacity" values="0.9;0.15;0.9" dur="2s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(120,12)">
        <path d="M0,-3.5 L0.8,-0.8 L3.5,0 L0.8,0.8 L0,3.5 L-0.8,0.8 L-3.5,0 L-0.8,-0.8 Z" fill="white">
          <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.6s" repeatCount="indefinite" begin="0.7s" />
          <animateTransform attributeName="transform" type="scale" values="1;0.3;1" dur="2.6s" repeatCount="indefinite" begin="0.7s" />
        </path>
      </g>
      <g transform="translate(185,30)">
        <path d="M0,-5 L1.2,-1.2 L5,0 L1.2,1.2 L0,5 L-1.2,1.2 L-5,0 L-1.2,-1.2 Z" fill="white">
          <animate attributeName="opacity" values="0.7;0.1;0.7" dur="3s" repeatCount="indefinite" begin="1.2s" />
          <animateTransform attributeName="transform" type="scale" values="1;0.3;1" dur="3s" repeatCount="indefinite" begin="1.2s" />
        </path>
      </g>
      <g opacity="0.25">
        <ellipse cx="0" cy="48" rx="22" ry="7" fill="white" />
        <ellipse cx="-10" cy="45" rx="14" ry="5" fill="white" />
        <ellipse cx="10" cy="46" rx="12" ry="4" fill="white" />
        <animateTransform attributeName="transform" type="translate" values="-60,0;320,0" dur="25s" repeatCount="indefinite" />
      </g>
      <polygon points="0,140 70,60 140,100 200,50 280,120 280,200 0,200" fill="#3730a3" fillOpacity="0.8" />
      <polygon points="0,170 100,100 180,130 280,160 280,200 0,200" fill="#4338ca" fillOpacity="0.6" />
      <polygon points="100,120 140,95 180,120" fill="#92400e" fillOpacity="0.7" />
      <polygon points="96,120 140,93 184,120" fill="#92400e" fillOpacity="0.4" />
      <rect x="108" y="120" width="64" height="35" fill="#78350f" fillOpacity="0.5" rx="1" />
      <rect x="130" y="130" width="20" height="25" fill="#451a03" fillOpacity="0.4" rx="1" />
      <path d="M0,175 Q35,168 70,175 T140,175 T210,175 T280,175 L280,200 L0,200 Z" fill="#60a5fa" fillOpacity="0.2" />
      <path d="M0,182 Q40,176 80,182 T160,182 T240,182 T280,182 L280,200 L0,200 Z" fill="#93c5fd" fillOpacity="0.15" />
    </svg>
  );
}

/* ── Scene: 처녀 등장 — 춘향, 벚꽃 그네 (slide 2) ── */

function SceneChunhyang() {
  return (
    <svg viewBox="0 0 280 200" preserveAspectRatio="xMidYMax slice" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sch-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#f9a8d4" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="sch-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#14532d" stopOpacity="0.65" />
        </linearGradient>
      </defs>

      <rect width="280" height="200" fill="url(#sch-bg)" />
      <path d="M0,185 Q70,172 140,185 T280,178 L280,200 L0,200 Z" fill="url(#sch-grass)" />

      {/* Tree trunk */}
      <path d="M112,200 C113,185 115,170 118,155 C121,138 124,122 126,105"
            stroke="#a16207" strokeWidth="11" fill="none" strokeLinecap="round" />
      {/* Branches */}
      <path d="M123,120 C108,108 85,105 62,110" stroke="#a16207" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M126,112 C140,98 162,90 185,86" stroke="#a16207" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M126,118 C120,98 116,80 118,60" stroke="#a16207" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M118,60 C112,48 118,36 121,26" stroke="#a16207" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M118,60 C124,50 134,43 142,38" stroke="#a16207" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M62,110 C50,98 40,88 30,80" stroke="#a16207" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Cherry blossom clusters */}
      <circle cx="120" cy="24" r="17" fill="#fda4af" fillOpacity="0.75" />
      <circle cx="140" cy="33" r="14" fill="#fb7185" fillOpacity="0.65" />
      <circle cx="104" cy="38" r="13" fill="#fecdd3" fillOpacity="0.72" />
      <circle cx="118" cy="55" r="14" fill="#fda4af" fillOpacity="0.68" />
      <circle cx="25" cy="74" r="18" fill="#fb7185" fillOpacity="0.62" />
      <circle cx="48" cy="62" r="16" fill="#fda4af" fillOpacity="0.70" />
      <circle cx="68" cy="103" r="22" fill="#fecdd3" fillOpacity="0.68" />
      <circle cx="88" cy="92" r="17" fill="#fda4af" fillOpacity="0.65" />
      <circle cx="183" cy="82" r="19" fill="#fb7185" fillOpacity="0.65" />
      <circle cx="202" cy="75" r="15" fill="#fda4af" fillOpacity="0.72" />
      <circle cx="165" cy="92" r="14" fill="#fecdd3" fillOpacity="0.62" />
      <circle cx="218" cy="82" r="12" fill="#fda4af" fillOpacity="0.55" />

      {/* Swing group — pendulum animation */}
      <g>
        <animateTransform attributeName="transform" type="rotate"
          values="7,177,92;-7,177,92;7,177,92"
          dur="2.8s" repeatCount="indefinite"
          calcMode="spline" keyTimes="0;0.5;1"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
        <line x1="177" y1="92" x2="169" y2="153" stroke="#ca8a04" strokeWidth="2" />
        <line x1="177" y1="92" x2="191" y2="153" stroke="#ca8a04" strokeWidth="2" />
        <rect x="166" y="151" width="27" height="5" rx="2.5" fill="#92400e" fillOpacity="0.88" />
        {/* Skirt — hanbok */}
        <path d="M179,151 L161,192 L199,192 Z" fill="#fbbf24" fillOpacity="0.88" />
        {/* Jacket */}
        <rect x="172" y="136" width="13" height="17" rx="4" fill="#f9a8d4" fillOpacity="0.92" />
        {/* Head */}
        <circle cx="178" cy="130" r="9" fill="#fde68a" fillOpacity="0.96" />
        {/* Hair */}
        <path d="M170,127 Q178,118 186,127" fill="#292524" fillOpacity="0.78" />
        <circle cx="178" cy="120" r="5" fill="#292524" fillOpacity="0.68" />
        <ellipse cx="178" cy="118" rx="4" ry="2" fill="#f43f5e" fillOpacity="0.72" />
        {/* Arms */}
        <path d="M172,140 L169,150" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
        <path d="M185,140 L191,150" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Falling petals */}
      <circle cx="40" cy="18" r="3.5" fill="#fda4af" fillOpacity="0.75">
        <animateTransform attributeName="transform" type="translate" values="0,0;12,85;5,170" dur="4.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.75;0.5;0" dur="4.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="8" r="3" fill="#fb7185" fillOpacity="0.65">
        <animateTransform attributeName="transform" type="translate" values="0,0;-10,75;-4,150" dur="5.5s" repeatCount="indefinite" begin="1.5s" />
        <animate attributeName="opacity" values="0.65;0.4;0" dur="5.5s" repeatCount="indefinite" begin="1.5s" />
      </circle>
      <circle cx="205" cy="12" r="3" fill="#fecdd3" fillOpacity="0.70">
        <animateTransform attributeName="transform" type="translate" values="0,0;-18,80;-8,162" dur="6.5s" repeatCount="indefinite" begin="0.8s" />
        <animate attributeName="opacity" values="0.7;0.45;0" dur="6.5s" repeatCount="indefinite" begin="0.8s" />
      </circle>
      <circle cx="245" cy="30" r="2.5" fill="#fda4af" fillOpacity="0.60">
        <animateTransform attributeName="transform" type="translate" values="0,0;8,95;3,170" dur="5s" repeatCount="indefinite" begin="2.8s" />
        <animate attributeName="opacity" values="0.6;0.3;0" dur="5s" repeatCount="indefinite" begin="2.8s" />
      </circle>
      <circle cx="158" cy="5" r="3" fill="#fb7185" fillOpacity="0.65">
        <animateTransform attributeName="transform" type="translate" values="0,0;6,110;14,190" dur="7s" repeatCount="indefinite" begin="3.5s" />
        <animate attributeName="opacity" values="0.65;0.35;0" dur="7s" repeatCount="indefinite" begin="3.5s" />
      </circle>
    </svg>
  );
}

/* ── Scene: 이별과 약속 — 달밤, 두 사람 (slide 3) ── */

function SceneFarewell() {
  return (
    <svg viewBox="0 0 280 200" preserveAspectRatio="xMidYMax slice" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sfar-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.62" />
        </linearGradient>
        <radialGradient id="sfar-moonGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.28" />
          <stop offset="75%" stopColor="#fef3c7" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="280" height="200" fill="url(#sfar-sky)" />

      {/* Twinkling stars — 안전 영역(x 42~238) 안에 배치 */}
      <circle cx="48" cy="18" r="1.5" fill="white" fillOpacity="0.70">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="75" cy="10" r="1" fill="white" fillOpacity="0.55">
        <animate attributeName="opacity" values="0.55;0.1;0.55" dur="2.4s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <circle cx="115" cy="14" r="1.5" fill="white" fillOpacity="0.60">
        <animate attributeName="opacity" values="0.6;0.15;0.6" dur="3.8s" repeatCount="indefinite" begin="1.1s" />
      </circle>
      <circle cx="155" cy="8" r="1" fill="white" fillOpacity="0.50">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.9s" repeatCount="indefinite" begin="1.8s" />
      </circle>
      <circle cx="60" cy="28" r="1" fill="white" fillOpacity="0.45" />
      <circle cx="228" cy="18" r="1.5" fill="white" fillOpacity="0.65">
        <animate attributeName="opacity" values="0.65;0.15;0.65" dur="4.1s" repeatCount="indefinite" begin="0.9s" />
      </circle>
      <circle cx="210" cy="32" r="1" fill="white" fillOpacity="0.40">
        <animate attributeName="opacity" values="0.4;0.08;0.4" dur="3.5s" repeatCount="indefinite" begin="2.2s" />
      </circle>
      <circle cx="185" cy="22" r="1" fill="white" fillOpacity="0.50">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.7s" repeatCount="indefinite" begin="0.4s" />
      </circle>

      {/* Moon glow + disc — cx=208 (우측 끝 228, 안전 영역 내) */}
      <circle cx="208" cy="42" r="46" fill="url(#sfar-moonGlow)" />
      <circle cx="208" cy="42" r="20" fill="#fef9c3" fillOpacity="0.82" />
      <circle cx="201" cy="39" r="17" fill="#1e1b4b" fillOpacity="0.32" />

      {/* Mountains — distant silhouette */}
      <polygon points="0,125 45,72 92,112 148,62 200,98 252,58 280,88 280,140 0,140" fill="#312e81" fillOpacity="0.65" />
      <polygon points="0,145 58,98 118,128 178,88 248,118 280,102 280,158 0,158" fill="#3730a3" fillOpacity="0.55" />

      {/* Road — converging perspective */}
      <path d="M75,200 L128,135 L158,135 L208,200 Z" fill="#e0e7ff" fillOpacity="0.17" />
      <line x1="128" y1="135" x2="75" y2="200" stroke="#c7d2fe" strokeWidth="1" strokeOpacity="0.25" />
      <line x1="158" y1="135" x2="208" y2="200" stroke="#c7d2fe" strokeWidth="1" strokeOpacity="0.25" />

      {/* Ground */}
      <path d="M0,162 Q70,152 140,162 T280,155 L280,200 L0,200 Z" fill="#1e1b4b" fillOpacity="0.75" />
      {/* Moonlight on road */}
      <ellipse cx="143" cy="168" rx="22" ry="4.5" fill="#fef9c3" fillOpacity="0.1" />

      {/* Chunhyang — cx=60 부근으로 안쪽 배치 */}
      <path d="M62,200 L53,162 L73,162 Z" fill="#fbbf24" fillOpacity="0.82" />
      <rect x="55" y="150" width="13" height="14" rx="3" fill="#fb7185" fillOpacity="0.88" />
      <circle cx="61" cy="144" r="8.5" fill="#fde68a" fillOpacity="0.92" />
      <path d="M53,141 Q61,133 69,141" fill="#292524" fillOpacity="0.75" />
      <circle cx="61" cy="135" r="4.5" fill="#292524" fillOpacity="0.65" />
      {/* Arm reaching out — 좌측 끝을 x=44 이상으로 */}
      <path d="M55,155 L44,148" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />

      {/* Mong-ryong — center-right, walking away */}
      <path d="M175,200 L168,162 L188,162 Z" fill="#a5b4fc" fillOpacity="0.72" />
      <rect x="169" y="150" width="13" height="14" rx="3" fill="#818cf8" fillOpacity="0.78" />
      <circle cx="175" cy="144" r="8" fill="#fde68a" fillOpacity="0.82" />
      {/* Gat (Joseon scholar hat) */}
      <rect x="167" y="138" width="16" height="4" rx="1" fill="#1c1917" fillOpacity="0.80" />
      <rect x="171" y="130" width="8" height="9" rx="2" fill="#1c1917" fillOpacity="0.75" />
      {/* Walking stick */}
      <line x1="188" y1="162" x2="195" y2="200" stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Scene: 항거 — 변사또 앞의 춘향 (slide 4) ── */

function SceneDefiance() {
  return (
    <svg viewBox="0 0 280 200" preserveAspectRatio="xMidYMax slice" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sdef-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#450a0a" stopOpacity="0.58" />
        </linearGradient>
        <radialGradient id="sdef-t1" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sdef-t2" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="280" height="200" fill="url(#sdef-bg)" />
      {/* Stone wall texture */}
      <rect x="0" y="30" width="280" height="140" fill="#7f1d1d" fillOpacity="0.1" />
      <line x1="0" y1="55" x2="280" y2="55" stroke="#92400e" strokeWidth="0.6" strokeOpacity="0.18" />
      <line x1="0" y1="80" x2="280" y2="80" stroke="#92400e" strokeWidth="0.6" strokeOpacity="0.15" />
      <line x1="0" y1="108" x2="280" y2="108" stroke="#92400e" strokeWidth="0.6" strokeOpacity="0.15" />

      {/* Left torch — cx=60으로 안쪽 이동 (원래 cx=38) */}
      <circle cx="60" cy="82" r="38" fill="url(#sdef-t1)" />
      <rect x="57" y="80" width="6" height="32" rx="2" fill="#92400e" fillOpacity="0.75" />
      {/* Left flame */}
      <path d="M60,80 Q54,66 60,58 Q66,66 60,80" fill="#fbbf24" fillOpacity="0.88">
        <animate attributeName="d"
          values="M60,80 Q54,66 60,58 Q66,66 60,80;M60,80 Q52,64 59,55 Q67,65 60,80;M60,80 Q55,67 61,57 Q66,63 60,80"
          dur="0.75s" repeatCount="indefinite" />
      </path>
      <path d="M60,78 Q56,68 60,62 Q64,68 60,78" fill="#f97316" fillOpacity="0.72">
        <animate attributeName="d"
          values="M60,78 Q56,68 60,62 Q64,68 60,78;M60,78 Q54,66 59,60 Q65,67 60,78;M60,78 Q57,69 61,61 Q64,66 60,78"
          dur="0.6s" repeatCount="indefinite" begin="0.1s" />
      </path>

      {/* Right torch — cx=220으로 안쪽 이동 (원래 cx=248) */}
      <circle cx="220" cy="78" r="35" fill="url(#sdef-t2)" />
      <rect x="217" y="76" width="6" height="30" rx="2" fill="#92400e" fillOpacity="0.75" />
      {/* Right flame */}
      <path d="M220,76 Q214,62 220,54 Q226,62 220,76" fill="#fbbf24" fillOpacity="0.85">
        <animate attributeName="d"
          values="M220,76 Q214,62 220,54 Q226,62 220,76;M220,76 Q212,60 219,51 Q227,61 220,76;M220,76 Q215,63 221,53 Q226,60 220,76"
          dur="0.85s" repeatCount="indefinite" begin="0.2s" />
      </path>
      <path d="M220,74 Q216,64 220,58 Q224,64 220,74" fill="#f97316" fillOpacity="0.70">
        <animate attributeName="d"
          values="M220,74 Q216,64 220,58 Q224,64 220,74;M220,74 Q214,62 219,56 Q225,63 220,74;M220,74 Q217,65 221,57 Q224,62 220,74"
          dur="0.65s" repeatCount="indefinite" begin="0.15s" />
      </path>

      {/* Ground */}
      <path d="M0,172 Q70,162 140,172 T280,165 L280,200 L0,200 Z" fill="#450a0a" fillOpacity="0.65" />

      {/* Official's raised platform */}
      <rect x="166" y="158" width="72" height="12" rx="1" fill="#78350f" fillOpacity="0.62" />
      <rect x="172" y="146" width="66" height="14" rx="1" fill="#92400e" fillOpacity="0.55" />
      <rect x="178" y="135" width="60" height="13" rx="1" fill="#a16207" fillOpacity="0.50" />
      {/* Throne */}
      <rect x="198" y="95" width="36" height="42" rx="3" fill="#7f1d1d" fillOpacity="0.65" />
      <rect x="200" y="88" width="30" height="10" rx="2" fill="#9f1239" fillOpacity="0.60" />
      <rect x="204" y="72" width="22" height="20" rx="2" fill="#881337" fillOpacity="0.55" />
      {/* Official silhouette */}
      <path d="M198,135 L188,162 L238,162 L228,135 Z" fill="#1c1917" fillOpacity="0.75" />
      <rect x="201" y="112" width="24" height="25" rx="3" fill="#1c1917" fillOpacity="0.78" />
      <circle cx="213" cy="106" r="10" fill="#1c1917" fillOpacity="0.72" />
      <rect x="205" y="98" width="16" height="5" rx="1" fill="#1c1917" fillOpacity="0.85" />
      <rect x="208" y="88" width="10" height="12" rx="1" fill="#1c1917" fillOpacity="0.80" />

      {/* Chunhyang — standing defiantly, center-left */}
      {/* Symbolic binding on wrist */}
      <path d="M75,166 Q63,160 67,152 Q73,148 80,155 Q83,162 75,166 Z" fill="#78350f" fillOpacity="0.52" />
      {/* Skirt */}
      <path d="M85,200 L75,162 L97,162 Z" fill="#fbbf24" fillOpacity="0.88" />
      {/* Body */}
      <rect x="78" y="146" width="14" height="18" rx="3" fill="#fb7185" fillOpacity="0.92" />
      {/* Head */}
      <circle cx="85" cy="140" r="9" fill="#fde68a" fillOpacity="0.96" />
      {/* Hair */}
      <path d="M77,137 Q85,128 93,137" fill="#292524" fillOpacity="0.78" />
      <circle cx="85" cy="130" r="5" fill="#292524" fillOpacity="0.68" />
      {/* Arms — defiant posture */}
      <path d="M78,152 L67,148" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M92,152 L97,145" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />

      {/* Torch light rays — 새 횃불 위치 기준 */}
      <line x1="60" y1="82" x2="83" y2="172" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.06" />
      <line x1="60" y1="82" x2="135" y2="178" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.04" />
      <line x1="220" y1="78" x2="175" y2="168" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.06" />
      <line x1="220" y1="78" x2="140" y2="175" stroke="#f97316" strokeWidth="1" strokeOpacity="0.04" />
    </svg>
  );
}

/* ── StatusBar ── */

function StatusBar() {
  return (
    <div className="shrink-0 h-[52px] px-8 flex justify-between items-end pb-2 bg-white relative z-10">
      <span className="text-[13px] font-bold text-gray-900">9:41</span>
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-[2px]">
          {[4, 7, 10, 13].map((h, i) => (
            <div key={i} className={`w-[3px] bg-gray-900 rounded-[1px] ${i === 3 ? "opacity-25" : ""}`} style={{ height: h }} />
          ))}
        </div>
        <svg width="16" height="12" viewBox="0 0 16 12" className="text-gray-900" fill="currentColor">
          <circle cx="8" cy="11" r="1.3" />
          <path d="M4.8 8C5.7 7.1 6.8 6.6 8 6.6s2.3.5 3.2 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <path d="M2 5.2C3.5 3.7 5.6 2.8 8 2.8s4.5.9 6 2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.35" />
        </svg>
        <div className="flex items-center">
          <div className="w-[22px] h-[11px] border border-gray-900 rounded-[2px] p-[1.5px]">
            <div className="w-[14px] h-full bg-gray-900 rounded-[1px]" />
          </div>
          <div className="w-[2px] h-[5px] bg-gray-900 rounded-r-[1px]" />
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */

export default function LecturePrototypeV2() {
  const [activeTab, setActiveTab] = useState<Tab>("timetable");

  // lecture
  const [slideIdx, setSlideIdx] = useState(0);
  const [lectureComplete, setLectureComplete] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [homeworkBadge, setHomeworkBadge] = useState(false);
  const [feedbackBadge, setFeedbackBadge] = useState(false);

  // Q&A chat
  const [messages, setMessages] = useState<Message[]>([
    { sender: "teacher", text: "안녕하세요! 궁금한 점을 자유롭게 물어보세요 😊" },
    { sender: "user",    text: "처녀가 뭐예요?" },
    { sender: "teacher", text: "'처녀'는 결혼하지 않은 젊은 여자를 뜻해요. 요즘은 잘 안 쓰는 표현이에요. 대신 '미혼 여성'이라고 해요 😊" },
    { sender: "user",    text: "이몽룡은 왜 떠났어요?" },
    { sender: "teacher", text: "이몽룡 아버지가 한양으로 발령을 받았어요. 그래서 이몽룡도 함께 떠나야 했답니다. 하지만 춘향에게 '반드시 돌아오겠소'라고 굳게 약속했어요 💌" },
  ]);
  const [qaInput, setQaInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // homework
  const [hwAText, setHwAText] = useState("");
  const [hwADone, setHwADone] = useState(false);
  const [hwBPhoto, setHwBPhoto] = useState(false);
  const [hwBName, setHwBName] = useState("");
  const [hwBDone, setHwBDone] = useState(false);

  const slide = SLIDES[slideIdx];
  const isLastSlide = slideIdx === SLIDES.length - 1;

  useEffect(() => {
    if (!drawerOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handlePeriodClick(period: Period) {
    if (period.status === "done") {
      toast("이미 완료된 수업이에요 ✅", { duration: 2000 });
    } else if (period.status === "upcoming") {
      toast("아직 시작 전이에요", { description: "이전 수업을 먼저 완료해주세요", duration: 2000 });
    } else {
      setActiveTab("lecture");
    }
  }

  function handleLectureComplete() {
    setLectureComplete(true);
    setHomeworkBadge(true);
    toast("강의를 완료했어요! 숙제를 확인해보세요 📝", { duration: 3000 });
  }

  function sendQaMessage() {
    const text = qaInput.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setQaInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "teacher", text: getAutoResponse(text) }]);
    }, 600);
  }

  function handleHwASubmit() {
    if (!hwAText.trim()) { toast("내용을 입력해주세요", { duration: 2000 }); return; }
    setHwADone(true);
    setFeedbackBadge(true);
    toast("선생님이 확인 중입니다 🌟", { duration: 2500 });
  }

  function handleHwBSubmit() {
    if (!hwBPhoto) { toast("먼저 사진을 찍어주세요 📷", { duration: 2000 }); return; }
    setHwBDone(true);
    setFeedbackBadge(true);
    toast("선생님이 확인 중입니다 🌟", { duration: 2500 });
  }

  /* ── Timetable ── */

  function renderTimetable() {
    return (
      <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">

        {/* 주간 시간표 그리드 */}
        <div className="shrink-0 bg-white border-b border-gray-100">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[11px] text-gray-400 mb-2">3급 · 초등학교 주간 시간표</p>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              {/* 요일 헤더 */}
              <div className="grid grid-cols-6">
                <div className="py-1.5 bg-gray-50" />
                {DAYS.map((day, i) => (
                  <div
                    key={i}
                    className={`py-1.5 text-center text-[11px] font-bold ${
                      i === TODAY_COL
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              {/* 교시별 행 */}
              {WEEK_TIMETABLE.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`grid grid-cols-6 border-t border-gray-100 ${
                    rowIdx === CURRENT_ROW ? "bg-emerald-50" : rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                  }`}
                >
                  <div className={`py-2 text-center text-[10px] font-medium ${
                    rowIdx === CURRENT_ROW ? "text-emerald-600" : "text-gray-400"
                  }`}>
                    {rowIdx + 1}
                  </div>
                  {row.map((subject, colIdx) => (
                    <div
                      key={colIdx}
                      className={`py-2 text-center text-[10px] font-korean ${
                        colIdx === TODAY_COL && rowIdx === CURRENT_ROW
                          ? "bg-emerald-500 text-white font-bold"
                          : colIdx === TODAY_COL
                          ? "text-emerald-700 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {subject}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오늘의 수업 */}
        <div className="shrink-0 px-5 pt-4 pb-1">
          <p className="text-[13px] font-bold text-gray-900">오늘의 수업</p>
          <p className="text-[11px] text-gray-400">수요일 · 4교시</p>
        </div>
        <div className="flex-1 px-4 py-3 space-y-3">
          {PERIODS.map(period => (
            <button
              key={period.num}
              onClick={() => handlePeriodClick(period)}
              className={`w-full rounded-xl p-4 text-left border transition-colors ${
                period.status === "current"
                  ? "bg-emerald-50 border-emerald-200 shadow-sm"
                  : period.status === "done"
                  ? "bg-white border-gray-100 opacity-70"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {period.status === "done" ? "✅" : period.status === "current" ? "🔵" : "⬜"}
                </span>
                <div className="flex-1">
                  <div className="text-[11px] text-gray-400 mb-0.5">{period.num}교시</div>
                  <div className={`font-semibold text-sm font-korean ${period.status === "current" ? "text-emerald-700" : "text-gray-900"}`}>
                    {period.icon} {period.subject} — {period.topic}
                  </div>
                </div>
                {period.status === "current" && (
                  <span className="text-emerald-500 text-sm font-medium">진행 중 →</span>
                )}
              </div>
            </button>
          ))}
        </div>
        {lectureComplete && (
          <div className="shrink-0 px-4 py-3 border-t border-emerald-100 bg-emerald-50">
            <p className="text-center text-sm text-emerald-700 font-medium">🎉 오늘 2교시 완료! 방과 후 활동 잠금 해제</p>
          </div>
        )}
      </div>
    );
  }

  /* ── Lecture ── */

  function renderLecture() {
    return (
      <div className="flex flex-col h-full relative">

        {/* Emerald header bar */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">👩‍🏫</div>
            <span className="text-xs font-medium font-korean">김영희 선생님</span>
          </div>
          <span className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full">
            {slideIdx + 1} / {SLIDES.length}
          </span>
        </div>

        {/* Slide body — dark gradient */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-700 via-indigo-700 to-indigo-900" />

          <div className="absolute inset-x-0 bottom-0 h-[50%]">
            {slideIdx === 1 ? <SceneChunhyang /> :
             slideIdx === 2 ? <SceneFarewell /> :
             slideIdx === 3 ? <SceneDefiance /> :
             <VillageScene />}
          </div>

          {/* Slide content */}
          <div className="relative z-10 px-5 pt-12 pb-4 flex flex-col h-full">

            {slide.type === "cover" ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
                <span className="text-5xl">{slide.emoji}</span>
                {slide.korean.map((line, i) => (
                  <p key={i} className={`font-korean font-bold text-white text-center ${i === 0 ? "text-base" : "text-xl"}`}>{line}</p>
                ))}
                <p className="text-white/50 text-sm">{slide.english}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-px bg-emerald-400/50" />
                  <span className="text-[10px] tracking-widest uppercase text-emerald-400">2교시 · 국어</span>
                  <div className="w-8 h-px bg-emerald-400/50" />
                </div>
              </div>

            ) : slide.type === "summary" ? (
              <div className="flex-1 flex flex-col justify-start gap-3 pt-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{slide.emoji}</span>
                  <p className="text-white font-bold font-korean text-base">{slide.korean[0]}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 space-y-2.5 backdrop-blur-sm">
                  {slide.vocab?.map((v, i) => (
                    <div key={i} className="flex items-baseline justify-between">
                      <p className="text-white font-medium font-korean text-sm">{v.word}</p>
                      <div className="text-right ml-2">
                        <p className="text-white/40 text-[10px]">{v.reading}</p>
                        <p className="text-white/70 text-[11px]">{v.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-white/50 text-xs mt-1">수고했어요! ⭐</p>
              </div>

            ) : (
              <div className="flex-1 flex flex-col justify-start gap-2 mt-2">
                <span className="text-3xl">{slide.emoji}</span>
                <div className="space-y-1">
                  {slide.korean.map((line, i) =>
                    line ? (
                      <p key={i} className={`font-korean text-white leading-relaxed ${line.startsWith('"') ? "font-bold text-base" : "text-sm"}`}>
                        {line}
                      </p>
                    ) : <div key={i} className="h-1" />
                  )}
                </div>
                <p className="text-white/50 text-xs leading-relaxed">{slide.english}</p>
              </div>
            )}

          </div>

          {/* 파형 — 상단 (그라디언트 위에 float) */}
          <div className="absolute top-2 left-0 right-0 z-10 px-5">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5 mx-auto max-w-[260px]">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <div className="flex items-center gap-[2px] flex-1">
                {WAVE_BARS.map((h, i) => (
                  <div
                    key={i}
                    className="w-[2px] rounded-full bg-emerald-400/70"
                    style={{
                      height: `${Math.round(h * 0.7)}px`,
                      animation: `waveBounce 1.2s ease-in-out ${i * 0.06}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] text-white/50">0:12</span>
            </div>
          </div>

          {/* 도트 + 완료 — 하단 */}
          <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-3">
            <div className="flex gap-1">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${i === slideIdx ? "bg-emerald-400 w-2.5" : "bg-white/30 w-1"}`}
                />
              ))}
            </div>
            {isLastSlide && (
              <button
                onClick={handleLectureComplete}
                disabled={lectureComplete}
                className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                  lectureComplete ? "text-white/30" : "text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30"
                }`}
              >
                완료 ✓
              </button>
            )}
          </div>

          {/* ← Left arrow — vertically centered overlay */}
          <button
            onClick={() => setSlideIdx(i => Math.max(0, i - 1))}
            disabled={slideIdx === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center disabled:opacity-20 hover:bg-white/25 transition-colors"
          >
            <span className="text-white text-2xl font-thin leading-none">‹</span>
          </button>

          {/* → Right arrow — vertically centered overlay */}
          <button
            onClick={() => setSlideIdx(i => Math.min(SLIDES.length - 1, i + 1))}
            disabled={isLastSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center disabled:opacity-20 hover:bg-white/25 transition-colors"
          >
            <span className="text-white text-2xl font-thin leading-none">›</span>
          </button>

          {/* 💬 floating Q&A button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="absolute bottom-[72px] right-4 z-20 w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-base shadow-lg hover:bg-emerald-400 transition-colors"
          >
            💬
          </button>
        </div>

        {/* Q&A Drawer — 자유 텍스트 채팅 (QAScreen 스타일) */}
        <div
          className={`absolute inset-0 z-30 flex flex-col transition-transform duration-300 ${drawerOpen ? "translate-y-0" : "translate-y-full"}`}
        >
          {/* Darkened slide preview — 클릭 시 닫기 */}
          <div className="h-20 relative overflow-hidden shrink-0" onClick={() => setDrawerOpen(false)}>
            <div className="absolute inset-0 bg-gradient-to-b from-violet-600 via-indigo-700 to-indigo-900">
              <div className="absolute inset-x-0 bottom-0 h-[70%]">
                <VillageScene />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/50" />
            <p className="relative z-10 text-white/30 text-[10px] px-4 pt-3 font-korean leading-relaxed">
              {slide.korean[0]}
            </p>
          </div>

          {/* White chat panel */}
          <div className="flex-1 bg-white rounded-t-2xl flex flex-col overflow-hidden">
            <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">💬 질문하기</span>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 text-sm">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) =>
                msg.sender === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="bg-kakao text-amber-900 text-[11px] px-3 py-2 rounded-2xl rounded-tr-md max-w-[85%] leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-sm shrink-0">👩‍🏫</div>
                    <div className="bg-gray-100 text-gray-700 text-[11px] px-3 py-2 rounded-2xl rounded-tl-md max-w-[85%] font-korean leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 px-4 py-3 border-t border-gray-100 flex items-center gap-2">
              <input
                className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-emerald-300"
                placeholder="질문을 입력하세요..."
                value={qaInput}
                onChange={e => setQaInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendQaMessage()}
              />
              <button
                onClick={sendQaMessage}
                className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs shrink-0"
              >→</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Homework ── */

  function renderHomework() {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white">
          <h1 className="text-[17px] font-bold text-gray-900">오늘의 숙제</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">2교시 국어 — 사랑의 이야기: 춘향전</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          {/* Homework A */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📝</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">느낀점 일기</p>
                <p className="text-[11px] text-gray-400">숙제 A · 텍스트 제출</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 mb-3 leading-relaxed font-korean">
              오늘 춘향전에서 인상 깊었던 장면을 1~2문장으로 써보세요.
            </p>
            {hwADone ? (
              <div className="bg-emerald-50 rounded-xl p-3 text-sm text-emerald-700 font-medium text-center">✅ 제출 완료</div>
            ) : (
              <>
                <textarea
                  value={hwAText}
                  onChange={e => setHwAText(e.target.value)}
                  placeholder="예) 춘향이 '죽어도 싫소'라고 말한 장면이 인상 깊었어요."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none h-20 bg-white font-korean"
                />
                <button onClick={handleHwASubmit} className="w-full mt-2 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold">
                  제출하기
                </button>
              </>
            )}
          </div>

          {/* Homework B */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📷</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">손글씨 사진</p>
                <p className="text-[11px] text-gray-400">숙제 B · 카메라 제출</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 mb-3 leading-relaxed font-korean">
              오늘 배운 고전 표현(처녀, 수청, 반드시) 중 하나를 종이에 손으로 쓰고 사진으로 제출하세요.
            </p>
            {hwBDone ? (
              <div className="bg-emerald-50 rounded-xl p-3 text-sm text-emerald-700 font-medium text-center">✅ 제출 완료</div>
            ) : (
              <>
                {hwBPhoto ? (
                  <div className="w-full h-24 rounded-xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-1 mb-2">
                    <span className="text-2xl">✍️</span>
                    <p className="text-xs text-indigo-400">사진 촬영 완료</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setHwBPhoto(true)}
                    className="w-full h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 mb-2 hover:border-emerald-300 transition-colors"
                  >
                    <span className="text-2xl">📷</span>
                    <p className="text-xs text-gray-400">탭하여 사진 찍기</p>
                  </button>
                )}
                <input
                  value={hwBName}
                  onChange={e => setHwBName(e.target.value)}
                  placeholder="쓴 단어를 입력하세요 (예: 반드시)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white mb-2 font-korean"
                />
                <button onClick={handleHwBSubmit} className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold">
                  제출하기
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Feedback ── */

  function renderFeedback() {
    const hasAny = hwADone || hwBDone;
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-base shrink-0">👩‍🏫</div>
          <div>
            <h1 className="text-[15px] font-bold text-gray-900">선생님 피드백</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">김영희 선생님 · 2교시 국어</p>
          </div>
        </div>

        {!hasAny ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="text-4xl opacity-40">📋</span>
            <p className="text-sm font-medium text-gray-500">아직 제출된 숙제가 없어요</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">숙제를 완료하면<br/>선생님 피드백을 확인할 수 있어요</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

            {/* Homework A feedback */}
            {hwADone && (
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">📝 숙제 A — 느낀점 일기</p>
                {/* 학생 제출 내용 */}
                <div className="bg-white rounded-xl px-3 py-2.5 border border-gray-100 text-[11px] text-gray-500 font-korean leading-relaxed italic shadow-sm">
                  &ldquo;{hwAText || '춘향이 "죽어도 싫소"라고 말한 장면이 인상 깊었어요. 용감한 사람이에요.'}&rdquo;
                </div>
                {/* 선생님 피드백 버블 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-sm shrink-0">👩‍🏫</div>
                  <div className="flex-1 bg-white border border-emerald-100 rounded-2xl rounded-tl-md px-3 py-2.5 shadow-sm">
                    <p className="text-[11px] text-gray-700 font-korean leading-relaxed">
                      정말 잘 썼어요! 춘향이 용감하다는 점을 딱 포착했네요 😊<br/>
                      다음엔 <span className="font-semibold text-emerald-600">왜</span> 인상 깊었는지 이유도 한 문장 더 써보면 더 좋겠어요!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Homework B feedback */}
            {hwBDone && (
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">📷 숙제 B — 손글씨 사진</p>
                {/* 제출 사진 — 실제 이미지로 교체 가능 */}
                <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex flex-col items-center justify-center gap-1">
                  {/* TODO: 아래 블록을 <img src="..." className="w-full h-full object-cover" /> 로 교체 */}
                  <span className="text-3xl">✍️</span>
                  <p className="text-[11px] text-gray-400">손글씨 사진</p>
                  {hwBName && <p className="text-sm font-bold font-korean text-gray-600 mt-0.5">&ldquo;{hwBName}&rdquo;</p>}
                </div>
                {/* 선생님 피드백 버블 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-sm shrink-0">👩‍🏫</div>
                  <div className="flex-1 bg-white border border-emerald-100 rounded-2xl rounded-tl-md px-3 py-2.5 shadow-sm">
                    <p className="text-[11px] text-gray-700 font-korean leading-relaxed">
                      글씨를 또박또박 잘 썼어요 ✍️<br/>
                      획이 깔끔한데, 조금 더 <span className="font-semibold text-emerald-600">중심선</span>을 의식하면서 쓰면 더 균형 잡힌 글씨가 될 거예요!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 종합 평가 — 둘 다 완료 시 */}
            {hwADone && hwBDone && (
              <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
                <p className="text-xl mb-1">⭐⭐⭐</p>
                <p className="text-sm font-bold text-emerald-700 font-korean">오늘 수업 아주 잘했어요!</p>
                <p className="text-[11px] text-emerald-500 mt-0.5">다음 수업도 기대할게요 😊</p>
              </div>
            )}

          </div>
        )}
      </div>
    );
  }

  /* ── Tabs ── */

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "timetable", label: "시간표", icon: "📅" },
    { id: "lecture",   label: "강의",   icon: "📖" },
    { id: "homework",  label: "숙제",   icon: "📝" },
    { id: "feedback",  label: "피드백",  icon: "💬" },
  ];

  /* ── Render ── */

  return (
    <>
      <style>{`
        @keyframes waveBounce {
          0%   { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>

      <Link to="/" className="fixed top-5 left-5 text-zinc-400 hover:text-white text-sm transition-colors z-50">
        ← 돌아가기
      </Link>

      <div className="min-h-screen bg-zinc-800 flex flex-col items-center justify-center py-10 gap-6">

        {/* Phone frame */}
        <div className="relative shrink-0" style={{ width: 375, height: 812 }}>
          <div className="absolute inset-0 bg-zinc-900 rounded-[50px] shadow-2xl shadow-black/60 border border-zinc-700/50" />
          <div className="absolute -left-[3px] top-[108px] w-[3px] h-[30px] bg-zinc-700 rounded-l-sm" />
          <div className="absolute -left-[3px] top-[158px] w-[3px] h-[62px] bg-zinc-700 rounded-l-sm" />
          <div className="absolute -left-[3px] top-[232px] w-[3px] h-[62px] bg-zinc-700 rounded-l-sm" />
          <div className="absolute -right-[3px] top-[168px] w-[3px] h-[82px] bg-zinc-700 rounded-r-sm" />

          {/* Screen */}
          <div
            className="absolute inset-[10px] rounded-[42px] overflow-hidden flex flex-col bg-white"
            style={{ transform: "translateZ(0)" }}
          >
            <Toaster
              position="top-center"
              offset={56}
              toastOptions={{ style: { width: "350px", fontSize: "13px", marginLeft: "4px" } }}
            />
            <StatusBar />
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-zinc-900 rounded-full z-20 pointer-events-none" />

            <div className="flex-1 overflow-hidden flex flex-col">
              {activeTab === "timetable" && renderTimetable()}
              {activeTab === "lecture"   && renderLecture()}
              {activeTab === "homework"  && renderHomework()}
              {activeTab === "feedback"  && renderFeedback()}
            </div>
          </div>

          <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[120px] h-[5px] bg-zinc-600 rounded-full" />
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2">
          {TABS.map(tab => (
            <div key={tab.id} className="relative">
              {tab.id === "homework" && homeworkBadge && !hwADone && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center z-10 font-bold">1</div>
              )}
              {tab.id === "feedback" && feedbackBadge && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center z-10 font-bold">!</div>
              )}
              <button
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "feedback") setFeedbackBadge(false);
                }}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-lg"
                    : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600 hover:text-zinc-200"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
