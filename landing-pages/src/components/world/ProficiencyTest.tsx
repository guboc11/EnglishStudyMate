import { Link } from "react-router-dom";
import SectionWrapper from "./SectionWrapper";
import MockupFrame from "./MockupFrame";

const badges = [
  { level: "Bronze", color: "from-amber-600 to-amber-700", label: "Bronze", fee: "₩50,000" },
  { level: "Silver", color: "from-gray-400 to-gray-500", label: "Silver", fee: "₩70,000" },
  { level: "Gold",   color: "from-yellow-400 to-amber-400", label: "Gold", fee: "₩100,000", glow: true },
];

export default function ProficiencyTest() {
  return (
    <SectionWrapper id="exam" className="bg-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
        The test that changes everything.
      </h2>
      <p className="text-center text-gray-500 mb-12 max-w-md mx-auto">
        Pass the IBIK (이방인 한국어 인증 검정) to unlock new areas, jobs, and relationships.
      </p>

      <div className="flex flex-col items-center gap-12">
        {/* Test UI mockup */}
        <MockupFrame>
          {/* Test header */}
          <div className="bg-navy px-4 py-3 flex items-center justify-between text-white">
            <span className="text-xs font-korean">IBIK</span>
            <span className="text-xs font-medium">Bronze</span>
          </div>

          <div className="p-4 space-y-4">
            {/* Progress bar */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="font-korean">문제 7 / 20</span>
              {/* Timer */}
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5 animate-timer-pulse" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3"
                    strokeDasharray="94.2"
                    strokeDashoffset="78.5"
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <span className="text-red-500 font-mono font-medium">00:05</span>
              </div>
            </div>

            {/* Progress bar fill */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-[35%] bg-navy rounded-full" />
            </div>

            {/* Question */}
            <div className="bg-gray-50 rounded-xl p-4 mt-4">
              <p className="text-sm font-medium text-gray-900 font-korean leading-relaxed">
                다음 중 "약속 시간에 늦어서 죄송합니다"와 같은 뜻의 문장을
                고르세요.
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2 mt-2">
              {[
                { text: "약속에 못 가서 미안해요", selected: false },
                { text: "늦게 도착해서 죄송합니다", selected: true },
                { text: "약속을 취소해서 죄송합니다", selected: false },
                { text: "일찍 와서 기다렸어요", selected: false },
              ].map((opt, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 rounded-xl text-sm font-korean border-2 transition-colors ${
                    opt.selected
                      ? "border-navy bg-navy/5 text-navy font-medium"
                      : "border-gray-100 bg-white text-gray-700"
                  }`}
                >
                  <span className="mr-2 text-xs opacity-50">{i + 1}.</span>
                  {opt.text}
                </div>
              ))}
            </div>
          </div>
        </MockupFrame>

        {/* Level badges */}
        <div className="flex flex-wrap justify-center gap-6">
          {badges.map((badge, i) => (
            <div key={i} className="text-center">
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg ${
                  badge.glow ? "animate-glow" : ""
                }`}
              >
                <span className="text-white font-bold text-lg font-korean">
                  {badge.level}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-korean mt-2">
                응시료 {badge.fee}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <Link
          to="/prototype/v2/exam"
          className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
        >
          Try it yourself →
        </Link>
      </div>
    </SectionWrapper>
  );
}
