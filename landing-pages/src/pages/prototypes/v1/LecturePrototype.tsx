import { useState } from "react";

type Screen = "list" | "detail" | "playing" | "quiz" | "done";

type Episode = {
  id: number;
  title: string;
  status: "done" | "current" | "locked";
  duration: string;
};

type Course = {
  id: number;
  title: string;
  category: string;
  description: string;
  progress: number;
  totalEpisodes: number;
  episodes: Episode[];
};

const COURSES: Course[] = [
  {
    id: 1,
    title: "직장 한국어 기초",
    category: "직장",
    description: "회의, 보고, 동료와의 대화 — 직장에서 자주 쓰는 한국어 표현을 배워요.",
    progress: 40,
    totalEpisodes: 5,
    episodes: [
      { id: 1, title: "인사 표현", status: "done", duration: "5분" },
      { id: 2, title: "회의 시작하기", status: "done", duration: "6분" },
      { id: 3, title: "보고하기", status: "current", duration: "7분" },
      { id: 4, title: "부탁·요청 표현", status: "locked", duration: "6분" },
      { id: 5, title: "마무리 인사", status: "locked", duration: "4분" },
    ],
  },
  {
    id: 2,
    title: "편의점에서 주문하기",
    category: "생활 회화",
    description: "편의점, 카페, 음식점에서 주문하는 실전 표현을 익혀요.",
    progress: 0,
    totalEpisodes: 3,
    episodes: [
      { id: 1, title: "기본 주문", status: "current", duration: "5분" },
      { id: 2, title: "추가 요청", status: "locked", duration: "4분" },
      { id: 3, title: "계산하기", status: "locked", duration: "4분" },
    ],
  },
];

const QUIZ_OPTIONS = [
  "팀장님, 말씀드릴게요.",
  "팀장, 보고해.",
  "팀장님, 보고드립니다.",
  "팀장, 알려줄게요.",
];

const KEY_EXPRESSIONS = [
  { word: "보고드리다", meaning: "격식을 갖춰 보고할 때 쓰는 표현" },
  { word: "말씀드리다", meaning: "격식체로 '말하다'의 높임 표현" },
  { word: "확인해 주시겠어요?", meaning: "정중한 확인 요청 표현" },
];

export default function LecturePrototype() {
  const [screen, setScreen] = useState<Screen>("list");
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [playTime, setPlayTime] = useState(0);

  function openDetail(course: Course) {
    setActiveCourse(course);
    setScreen("detail");
  }

  function startEpisode() {
    setPlayTime(0);
    setScreen("playing");
    // Simulate progress
    const interval = setInterval(() => {
      setPlayTime((t) => {
        if (t >= 45) {
          clearInterval(interval);
          setScreen("quiz");
          return 45;
        }
        return t + 1;
      });
    }, 50);
  }

  function submitAnswer(index: number) {
    setSelectedAnswer(index);
  }

  function continueAfterQuiz() {
    setSelectedAnswer(null);
    setScreen("done");
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (screen === "list") {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200 bg-white sticky top-0">
            <h1 className="text-lg font-bold text-gray-900">강의실</h1>
            <p className="text-xs text-gray-500 mt-0.5">강의 프로토타입</p>
          </div>

          <div className="flex-1 px-4 py-4 space-y-5">
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">🎯 추천 강의</div>
              <button
                onClick={() => openDetail(COURSES[0])}
                className="w-full text-left bg-blue-50 border border-blue-100 rounded-2xl p-4 hover:bg-blue-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-900 text-sm">{COURSES[0].title}</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{COURSES[0].category}</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">{COURSES[0].description}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${COURSES[0].progress}%` }} />
                  </div>
                  <span className="text-xs text-blue-600 font-medium">{COURSES[0].progress}%</span>
                </div>
              </button>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">전체 강의</div>
              <div className="space-y-2">
                {COURSES.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => openDetail(course)}
                    className="w-full text-left border border-gray-200 rounded-xl p-3 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{course.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {course.category} · {course.totalEpisodes}강
                        </div>
                      </div>
                      {course.progress > 0 && (
                        <span className="text-xs text-blue-500 font-medium">{course.progress}%</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "detail" && activeCourse) {
    const nextEpisode = activeCourse.episodes.find((e) => e.status === "current");

    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white flex items-center gap-3">
            <button onClick={() => setScreen("list")} className="text-blue-500 text-sm">← 뒤로</button>
            <span className="font-semibold text-gray-900 text-sm truncate">{activeCourse.title}</span>
          </div>

          <div className="flex-1 px-4 py-5 space-y-5">
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">{activeCourse.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${activeCourse.progress}%` }} />
                </div>
                <span className="text-sm font-bold text-blue-500">{activeCourse.progress}% 완료</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">커리큘럼</div>
              <div className="space-y-2">
                {activeCourse.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${ep.status === "current" ? "bg-blue-50 border border-blue-200" : "border border-gray-100"} ${ep.status === "locked" ? "opacity-40" : ""}`}
                  >
                    <span className="text-lg">
                      {ep.status === "done" ? "✅" : ep.status === "current" ? "▶" : "○"}
                    </span>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${ep.status === "current" ? "text-blue-700" : "text-gray-700"}`}>
                        {ep.id}강 {ep.title}
                      </div>
                      <div className="text-xs text-gray-400">{ep.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {nextEpisode && (
            <div className="px-4 py-4 border-t border-gray-200">
              <button
                onClick={startEpisode}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm"
              >
                {nextEpisode.id}강 {nextEpisode.title} 시작 →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "playing") {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center">
        <div className="w-full max-w-sm flex flex-col min-h-screen">
          <div className="px-4 py-3 flex items-center gap-3">
            <button onClick={() => setScreen("detail")} className="text-gray-400 text-sm">← 뒤로</button>
            <span className="text-white font-semibold text-sm">3강 보고하기</span>
            <button className="ml-auto text-gray-400">🔖</button>
          </div>

          {/* Video area */}
          <div className="bg-gray-800 mx-4 rounded-2xl aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-gray-400 text-sm">영상 플레이어</div>
            </div>
          </div>

          {/* Subtitle */}
          <div className="px-4 py-3">
            <div className="text-white text-sm text-center font-medium">
              "팀장님, 보고드립니다."
            </div>
            <button className="mt-1 text-xs text-blue-400 w-full text-center">
              번역 보기
            </button>
          </div>

          {/* Key expression */}
          <div className="mx-4 bg-yellow-900/30 border border-yellow-700/30 rounded-xl p-3">
            <div className="text-xs text-yellow-400 font-semibold mb-1">💡 핵심 표현</div>
            <div className="text-yellow-200 text-sm font-medium">보고드리다</div>
            <div className="text-yellow-300/70 text-xs mt-0.5">격식을 갖춰 보고할 때 쓰는 표현</div>
          </div>

          {/* Controls */}
          <div className="mt-auto px-4 py-5">
            <div className="flex items-center justify-between text-gray-400 text-sm mb-2">
              <span>{formatTime(playTime)}</span>
              <span>03:20</span>
            </div>
            <div className="bg-gray-700 rounded-full h-1 mb-4">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all"
                style={{ width: `${(playTime / 200) * 100}%` }}
              />
            </div>
            <div className="flex justify-center gap-8 text-white text-2xl">
              <button>⏮</button>
              <button>⏸</button>
              <button>⏭</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "quiz") {
    const isCorrect = selectedAnswer === 2;

    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="text-sm font-bold text-gray-900">잠깐! 확인해볼까요? 🤔</div>
          </div>

          <div className="flex-1 px-4 py-6">
            <p className="text-base font-medium text-gray-900 mb-6">
              팀장에게 결과를 알릴 때 알맞은 표현은?
            </p>

            <div className="space-y-2">
              {QUIZ_OPTIONS.map((opt, i) => {
                let style = "border-gray-200 bg-white text-gray-700";
                if (selectedAnswer !== null) {
                  if (i === 2) style = "border-green-500 bg-green-50 text-green-700";
                  else if (i === selectedAnswer && selectedAnswer !== 2) style = "border-red-400 bg-red-50 text-red-700";
                  else style = "border-gray-100 bg-gray-50 text-gray-400";
                }

                return (
                  <button
                    key={i}
                    onClick={() => selectedAnswer === null && submitAnswer(i)}
                    className={`w-full text-left border-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${style}`}
                  >
                    {["①", "②", "③", "④"][i]} {opt}
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <div className={`mt-4 p-4 rounded-xl ${isCorrect ? "bg-green-50" : "bg-orange-50"}`}>
                <div className={`font-bold text-sm mb-1 ${isCorrect ? "text-green-700" : "text-orange-700"}`}>
                  {isCorrect ? "정답! 🎉" : "아쉽지만 틀렸어요."}
                </div>
                <div className="text-xs text-gray-600">
                  <strong>보고드리다</strong>는 격식을 갖춰 상사에게 보고할 때 쓰는 표현이에요.
                </div>
              </div>
            )}
          </div>

          {selectedAnswer !== null && (
            <div className="px-4 py-4 border-t border-gray-200">
              <button
                onClick={continueAfterQuiz}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm"
              >
                계속 학습하기 →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "done") {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-full max-w-sm bg-white mx-4 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-xl font-bold text-gray-900">3강 완료!</div>
          </div>

          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">이번 강의 핵심 표현</div>
            <div className="space-y-2">
              {KEY_EXPRESSIONS.map((expr, i) => (
                <div key={i} className="bg-blue-50 rounded-xl px-4 py-3">
                  <div className="font-bold text-blue-700 text-sm">{expr.word}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{expr.meaning}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setScreen("list")}
              className="flex-1 border border-blue-500 text-blue-500 py-3 rounded-xl font-semibold text-sm"
            >
              플래시카드 추가
            </button>
            <button
              onClick={() => setScreen("list")}
              className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm"
            >
              다음 강의 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
