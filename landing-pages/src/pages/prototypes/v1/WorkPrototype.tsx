import { useState } from "react";

type Screen = "list" | "detail" | "success" | "fail";

type Mission = {
  id: number;
  title: string;
  persona: string;
  category: string;
  deadline: string;
  urgency: "high" | "mid" | "low";
  status: "active" | "done";
  description: string;
  conditions: string[];
};

const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "월세 납부",
    persona: "이철수 (집주인)",
    category: "행정",
    deadline: "D-1",
    urgency: "high",
    status: "active",
    description:
      "집주인 이철수 씨에게 이번 달 월세를 납부해야 합니다. 연락을 취해 계좌번호를 확인하고 이체하세요.",
    conditions: ["이철수에게 연락", "계좌번호 확인", "이체 완료 확인"],
  },
  {
    id: 2,
    title: "팀 보고서 제출",
    persona: "김민준 (팀장)",
    category: "직장",
    deadline: "D-3",
    urgency: "mid",
    status: "active",
    description:
      "이번 주 업무 보고서를 팀장 김민준 씨에게 제출해야 합니다. 보고서 형식은 이메일로 전송합니다.",
    conditions: ["보고서 초안 작성", "팀장에게 제출"],
  },
  {
    id: 3,
    title: "주민등록 신청",
    persona: "주민센터",
    category: "행정",
    deadline: "완료",
    urgency: "low",
    status: "done",
    description: "주민등록 신청이 완료되었습니다.",
    conditions: ["서류 제출", "접수 완료"],
  },
];

const URGENCY_COLOR: Record<Mission["urgency"], string> = {
  high: "text-red-500",
  mid: "text-yellow-500",
  low: "text-gray-400",
};

const URGENCY_DOT: Record<Mission["urgency"], string> = {
  high: "🔴",
  mid: "🟡",
  low: "✅",
};

export default function WorkPrototype() {
  const [screen, setScreen] = useState<Screen>("list");
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [checkedConditions, setCheckedConditions] = useState<number[]>([]);

  function openDetail(mission: Mission) {
    setActiveMission(mission);
    setCheckedConditions([]);
    setScreen("detail");
  }

  function toggleCondition(index: number) {
    setCheckedConditions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  function completeMission(success: boolean) {
    setScreen(success ? "success" : "fail");
  }

  if (screen === "list") {
    const active = MISSIONS.filter((m) => m.status === "active");
    const done = MISSIONS.filter((m) => m.status === "done");

    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200 bg-white sticky top-0">
            <h1 className="text-lg font-bold text-gray-900">오늘의 할 일</h1>
            <p className="text-xs text-gray-500 mt-0.5">작업 프로토타입</p>
          </div>

          <div className="flex-1 px-4 py-4 space-y-6">
            {/* Urgent */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">긴급</div>
              {active.filter((m) => m.urgency === "high").map((m) => (
                <button
                  key={m.id}
                  onClick={() => openDetail(m)}
                  className="w-full text-left border border-red-100 bg-red-50 rounded-xl p-3 mb-2 hover:bg-red-100"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm">{URGENCY_DOT[m.urgency]}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{m.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{m.persona}</div>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs font-bold ${URGENCY_COLOR[m.urgency]}`}>{m.deadline}</span>
                        <span className="text-xs text-gray-400">· {m.category}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* In Progress */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">진행 중</div>
              {active.filter((m) => m.urgency !== "high").map((m) => (
                <button
                  key={m.id}
                  onClick={() => openDetail(m)}
                  className="w-full text-left border border-gray-200 rounded-xl p-3 mb-2 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm">{URGENCY_DOT[m.urgency]}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{m.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{m.persona}</div>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs font-bold ${URGENCY_COLOR[m.urgency]}`}>{m.deadline}</span>
                        <span className="text-xs text-gray-400">· {m.category}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Done */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">완료</div>
              {done.map((m) => (
                <div key={m.id} className="border border-gray-100 rounded-xl p-3 mb-2 opacity-50">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">✅</span>
                    <div>
                      <div className="font-semibold text-gray-700 text-sm">{m.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">완료 · 어제</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "detail" && activeMission) {
    const allChecked = checkedConditions.length === activeMission.conditions.length;

    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-white sticky top-0 flex items-center gap-3">
            <button onClick={() => setScreen("list")} className="text-blue-500 text-sm">← 뒤로</button>
            <span className="font-semibold text-gray-900 text-sm">{activeMission.title}</span>
          </div>

          <div className="flex-1 px-4 py-5 space-y-5">
            <div>
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                📍 {activeMission.category} 미션
              </span>
              <div className={`text-sm font-bold mt-2 ${URGENCY_COLOR[activeMission.urgency]}`}>
                기한: {activeMission.deadline}
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">{activeMission.description}</p>

            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">완료 조건</div>
              <div className="space-y-2">
                {activeMission.conditions.map((cond, i) => (
                  <button
                    key={i}
                    onClick={() => toggleCondition(i)}
                    className="w-full flex items-center gap-3 text-left"
                  >
                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs flex-shrink-0 ${checkedConditions.includes(i) ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300"}`}>
                      {checkedConditions.includes(i) ? "✓" : ""}
                    </span>
                    <span className={`text-sm ${checkedConditions.includes(i) ? "text-gray-400 line-through" : "text-gray-700"}`}>
                      {cond}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">관련 페르소나</div>
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
                <span className="text-2xl">👤</span>
                <span className="text-sm text-gray-900">{activeMission.persona}</span>
                <button className="ml-auto text-xs text-blue-500 font-medium">채팅 →</button>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => completeMission(allChecked)}
              className={`w-full py-3 rounded-xl text-sm font-semibold ${allChecked ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"}`}
            >
              {allChecked ? "미션 완료하기" : `${activeMission.conditions.length - checkedConditions.length}개 조건 남음`}
            </button>
            {!allChecked && (
              <button onClick={() => completeMission(false)} className="w-full py-2 text-sm text-gray-400">
                실패로 처리
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-full max-w-sm bg-white mx-4 rounded-2xl p-8 text-center shadow-lg">
          <div className="text-5xl mb-4">✅</div>
          <div className="text-xl font-bold text-gray-900 mb-2">{activeMission?.title} 완료!</div>
          <div className="text-sm text-gray-600 mb-4">이철수 씨가 고맙다고 했어요. 관계가 좋아졌습니다.</div>
          <div className="bg-green-50 rounded-xl px-4 py-2 inline-block text-sm text-green-600 font-medium mb-6">
            📈 이철수 친밀도 +10
          </div>
          <button onClick={() => setScreen("list")} className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (screen === "fail") {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-full max-w-sm bg-white mx-4 rounded-2xl p-8 text-center shadow-lg">
          <div className="text-5xl mb-4">❌</div>
          <div className="text-xl font-bold text-gray-900 mb-2">기한을 넘겼습니다.</div>
          <div className="text-sm text-gray-600 mb-4">이철수 씨가 화가 났어요. 관계가 나빠졌습니다.</div>
          <div className="bg-red-50 rounded-xl px-4 py-2 inline-block text-sm text-red-600 font-medium mb-6">
            📉 이철수 친밀도 -20
          </div>
          <div className="flex gap-2">
            <button onClick={() => setScreen("detail")} className="flex-1 border border-blue-500 text-blue-500 py-3 rounded-xl font-semibold text-sm">
              다시 시도
            </button>
            <button onClick={() => setScreen("list")} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold text-sm">
              넘어가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
