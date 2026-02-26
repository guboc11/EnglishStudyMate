import { Link } from "react-router-dom";
import SectionWrapper from "./SectionWrapper";
import PhoneCallOverlay from "./PhoneCallOverlay";
import KoreanMenuUI from "./KoreanMenuUI";

interface SimStep {
  step: number;
  label: string;
}

const simSteps: SimStep[] = [
  { step: 1, label: "전화 수신" },
  { step: 2, label: "주문 듣기" },
  { step: 3, label: "메뉴 선택" },
  { step: 4, label: "결과" },
];

export default function RestaurantSimulation() {
  return (
    <SectionWrapper className="bg-slate-50">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
        Your shift at 김치찌개 식당.
      </h2>
      <p className="text-center text-gray-500 mb-6 max-w-md mx-auto">
        A real work simulation. Take calls, listen to orders, pick the right
        items.
      </p>
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12">
        {simSteps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0
                    ? "bg-navy text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s.step}
              </div>
              <span className="text-[10px] text-gray-500 font-korean">
                {s.label}
              </span>
            </div>
            {i < simSteps.length - 1 && (
              <div className="w-6 sm:w-10 h-px bg-gray-300 mb-4" />
            )}
          </div>
        ))}
      </div>

      {/* Simulation flow */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {/* Step 1: Phone call */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold text-navy uppercase tracking-wider">
            Step 1
          </div>
          <PhoneCallOverlay
            callerName="손님"
            callerLabel="Customer"
            className="w-full max-w-[260px]"
          />
        </div>

        {/* Step 2: Listen */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold text-navy uppercase tracking-wider">
            Step 2
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 w-full max-w-[260px] shadow-sm">
            <div className="flex items-start gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                🙋
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-md px-3 py-2 text-sm font-korean">
                "부대찌개 2인분이랑 김치찌개 1인분 주세요~"
              </div>
            </div>

            {/* Voice recording bar */}
            <div className="bg-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
              <div className="flex-1 flex items-center gap-0.5">
                {Array.from({ length: 20 }).map((_, j) => (
                  <div
                    key={j}
                    className="w-1 bg-gray-400 rounded-full"
                    style={{
                      height: `${6 + Math.sin(j * 0.8) * 6}px`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">0:03</span>
            </div>
          </div>
        </div>

        {/* Step 3: Menu selection */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold text-navy uppercase tracking-wider">
            Step 3
          </div>
          <KoreanMenuUI className="w-full max-w-[260px]" />
        </div>

        {/* Step 4: Result */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold text-navy uppercase tracking-wider">
            Step 4
          </div>
          <div className="w-full max-w-[260px] space-y-3">
            {/* Success */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-semibold text-green-700">성공!</p>
              <p className="text-xs text-green-600 mt-1">+₩8,500</p>
              <p className="text-[10px] text-green-500 mt-0.5">
                주문을 정확히 처리했습니다
              </p>
            </div>

            {/* Failure */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center opacity-60">
              <div className="text-3xl mb-2">❌</div>
              <p className="text-sm font-semibold text-red-700">실패</p>
              <p className="text-xs text-red-600 mt-1">+₩0</p>
              <p className="text-[10px] text-red-500 mt-0.5">
                주문을 틀렸습니다
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <Link
          to="/prototype/v2/work?tab=work"
          className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
          onClick={() => (window as any).gtag?.('event', 'prototype_click', { section: 'restaurant' })}
        >
          Try it yourself →
        </Link>
      </div>
    </SectionWrapper>
  );
}
