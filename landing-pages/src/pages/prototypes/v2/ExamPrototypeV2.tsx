import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "sonner";

/* ── Types ── */

type Tab = "picture" | "dictation" | "expression" | "short" | "long";

type MCQOption = { text: string; correct: boolean };
type Question =
  | { type: "mcq"; imageUrl?: string; label: string; question: string; options: MCQOption[] }
  | { type: "input"; imageUrl?: string; label: string; question: string; answer: string }
  | { type: "dictation-type"; audio: string; answer: string }
  | { type: "dictation-camera"; audio: string; answer: string }
  | { type: "expression-mcq"; prompt: string; options: MCQOption[] }
  | { type: "short-input"; narration: string; question: string; answer: string }
  | { type: "short-binary"; narration: string; question: string; options: MCQOption[] }
  | { type: "long-mcq"; dialogue: { speaker: string; text: string }[]; audioCaption?: string; question: string; options: MCQOption[] }
  | { type: "long-input"; dialogue: { speaker: string; text: string }[]; audioCaption?: string; question: string };

/* ── Data ── */

// 이미지 경로 — 파일을 landing-pages/public/exam/ 에 넣고 경로를 지정해주세요
// 예: imageUrl: "/exam/rabbit.jpg"
const PICTURE_QS: Question[] = [
  { type: "mcq",   imageUrl: undefined, label: "동물", question: "이것은 무엇인가요?", options: [{ text: "고양이", correct: false }, { text: "토끼", correct: true }, { text: "강아지", correct: false }, { text: "쥐", correct: false }] },
  { type: "mcq",   imageUrl: undefined, label: "음식", question: "이 음식의 이름은?", options: [{ text: "김치찌개", correct: true }, { text: "된장찌개", correct: false }, { text: "순두부찌개", correct: false }, { text: "설렁탕", correct: false }] },
  { type: "mcq",   imageUrl: undefined, label: "문화", question: "이것은 무엇인가요?", options: [{ text: "기모노", correct: false }, { text: "한복", correct: true }, { text: "치파오", correct: false }, { text: "아오자이", correct: false }] },
  { type: "input", imageUrl: undefined, label: "음식", question: "이 음식의 이름은?", answer: "부대찌개" },
  { type: "input", imageUrl: undefined, label: "음식", question: "이 음식의 이름은?", answer: "떡볶이" },
];

const DICTATION_QS: Question[] = [
  { type: "dictation-type",   audio: "김치찌개 2인분 주세요",      answer: "김치찌개 2인분 주세요" },
  { type: "dictation-type",   audio: "내일 오전 10시에 만나요",     answer: "내일 오전 10시에 만나요" },
  { type: "dictation-camera", audio: "안녕하세요, 처음 뵙겠습니다", answer: "안녕하세요, 처음 뵙겠습니다" },
];

const EXPRESSION_QS: Question[] = [
  { type: "expression-mcq", prompt: "\"약속 시간에 늦어서 죄송합니다\"와 같은 뜻을 고르세요.", options: [{ text: "제가 먼저 도착했어요", correct: false }, { text: "늦게 도착해서 미안해요", correct: true }, { text: "시간이 없어요", correct: false }, { text: "다음에 만나요", correct: false }] },
  { type: "expression-mcq", prompt: "\"배가 고프다\"를 정중하게 표현하면?", options: [{ text: "배고파요", correct: false }, { text: "밥 주세요", correct: false }, { text: "배가 고픕니다", correct: true }, { text: "먹고 싶어요", correct: false }] },
  { type: "expression-mcq", prompt: "처음 만난 사람에게 가장 자연스러운 인사는?", options: [{ text: "오랜만이에요", correct: false }, { text: "잘 있었어요?", correct: false }, { text: "처음 뵙겠습니다", correct: true }, { text: "어디 가세요?", correct: false }] },
];

// 기본 2 / 중간 3 / 어려운 2
const SHORT_QS: Question[] = [
  // 기본
  { type: "short-binary", narration: "가게가 문을 닫았다.", question: "지금 가게에 들어갈 수 있어?", options: [{ text: "들어갈 수 있어요", correct: false }, { text: "들어갈 수 없어요", correct: true }] },
  { type: "short-input",  narration: "민준이는 매일 아침 버스를 타고 학교에 간다.", question: "민준이는 어떻게 학교에 가?", answer: "버스" },
  // 중간
  { type: "short-binary", narration: "비가 올 것 같아서 수진이는 우산을 챙겼다.", question: "수진이는 왜 우산을 가져갔어?", options: [{ text: "비가 올 것 같아서요", correct: true }, { text: "해가 뜨거워서요", correct: false }] },
  { type: "short-input",  narration: "카페는 평일에는 오전 8시에 열고, 주말에는 오전 10시에 연다.", question: "토요일에 카페가 몇 시에 열어?", answer: "오전 10시" },
  { type: "short-binary", narration: "지호는 배가 고팠지만 돈이 없어서 밥을 먹지 못했다.", question: "지호가 밥을 못 먹은 이유는?", options: [{ text: "배가 안 고파서요", correct: false }, { text: "돈이 없어서요", correct: true }] },
  // 어려운
  { type: "short-binary", narration: "어머니는 시장에 가셨지만 사려던 물건이 다 팔려서 빈손으로 돌아오셨다.", question: "어머니가 빈손으로 돌아온 이유는?", options: [{ text: "물건이 다 팔려서요", correct: true }, { text: "지갑을 잃어버려서요", correct: false }] },
  { type: "short-input",  narration: "영어 시험은 3월에 있고, 한국어 시험은 영어 시험 두 달 후에 있다.", question: "한국어 시험은 몇 월에 있어?", answer: "5월" },
];

const LONG_QS: Question[] = [
  {
    type: "long-mcq",
    dialogue: [{ speaker: "A", text: "이번 주말 뭐 해?" }, { speaker: "B", text: "나 토요일 바빠. 일요일 어때?" }, { speaker: "A", text: "좋아! 일요일에 만나자." }, { speaker: "B", text: "응, 2시에 카페에서 봐." }],
    question: "이 대화의 결론으로 알맞은 것은?",
    options: [{ text: "두 사람은 토요일에 만날 예정이다", correct: false }, { text: "두 사람은 일요일 2시 카페에서 만나기로 했다", correct: true }, { text: "A는 이번 주말 내내 바쁘다", correct: false }, { text: "B는 카페를 좋아하지 않는다", correct: false }],
  },
  {
    type: "long-input",
    dialogue: [{ speaker: "선생님", text: "내일까지 교과서 1~3쪽을 읽고 느낀 점을 노트에 써오세요. 모르는 단어는 사전에서 찾아보세요." }],
    question: "숙제 내용을 한국어로 적어보세요.",
  },
  {
    type: "long-mcq",
    dialogue: [{ speaker: "민준", text: "지난 주에 제주도 여행 갔는데, 첫날은 한라산 등반하고 둘째 날은 해변에서 수영했어. 흑돼지도 먹었는데 진짜 맛있었어!" }],
    question: "민준이 여행에서 한 일로 맞는 것은?",
    options: [{ text: "제주도에서 3박 4일 묵었다", correct: false }, { text: "한라산을 오르고 바다에서 수영했다", correct: true }, { text: "여행 중 음식이 맛없었다", correct: false }, { text: "친구와 함께 여행을 갔다", correct: false }],
  },
  // 오디오 문제
  {
    type: "long-mcq",
    dialogue: [],
    audioCaption: "내일 서울은 오전에 비가 오겠고, 오후부터는 차차 맑아지겠습니다. 낮 최고 기온은 18도로 평년보다 낮겠습니다.",
    question: "내일 오후 서울 날씨는?",
    options: [{ text: "하루 종일 비가 온다", correct: false }, { text: "오전에는 맑고 오후에 비가 온다", correct: false }, { text: "오전에 비가 오고 오후에는 맑다", correct: true }, { text: "흐리고 기온이 높다", correct: false }],
  },
  {
    type: "long-input",
    dialogue: [],
    audioCaption: "A: 이번 주 금요일에 영화 보러 갈래? B: 금요일은 안 되는데, 목요일은 어때? A: 좋아, 목요일로 하자! B: 그럼 저녁 7시에 CGV 앞에서 봐.",
    question: "두 사람이 만나기로 한 날짜와 장소를 적어보세요.",
  },
];

const TAB_DATA: Record<Tab, Question[]> = {
  picture:    PICTURE_QS,
  dictation:  DICTATION_QS,
  expression: EXPRESSION_QS,
  short:      SHORT_QS,
  long:       LONG_QS,
};

/* ── Helpers ── */

const WAVE_HEIGHTS = [18, 32, 48, 38, 58, 44, 28, 52, 40, 26, 50, 36, 46, 30, 42];

function Waveform() {
  return (
    <div className="flex items-center justify-center gap-1">
      {WAVE_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-1.5 bg-green-400 rounded-full"
          style={{ height: h, transformOrigin: "bottom", animation: "waveBar 0.7s ease-in-out infinite alternate", animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(current / total) * 100}%` }} />
    </div>
  );
}

function ResultScreen({ correct, total, onRetry }: { correct: number; total: number; onRetry: () => void }) {
  const pct = Math.round((correct / total) * 100);
  return (
    <div className="flex flex-col h-full items-center justify-center gap-4 px-6 bg-gray-50">
      <span className="text-5xl">{pct === 100 ? "🏆" : pct >= 60 ? "🎉" : "💪"}</span>
      <p className="text-xl font-bold text-gray-900">{correct} / {total} 정답</p>
      <p className="text-sm text-gray-500">{pct === 100 ? "완벽해요!" : pct >= 60 ? "잘했어요!" : "더 연습해봐요!"}</p>
      <button onClick={onRetry} className="mt-3 px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium">다시 풀기</button>
    </div>
  );
}

/* ── Feedback overlay ── */
type Feedback = { correct: boolean; answer?: string } | null;

function FeedbackBanner({ feedback, onNext }: { feedback: Feedback; onNext: () => void }) {
  if (!feedback) return null;
  return (
    <div className={`absolute inset-x-0 bottom-0 z-30 px-4 py-4 flex items-center justify-between ${feedback.correct ? "bg-green-50 border-t border-green-200" : "bg-red-50 border-t border-red-200"}`}>
      <div>
        <p className={`text-sm font-semibold ${feedback.correct ? "text-green-700" : "text-red-700"}`}>
          {feedback.correct ? "✅ 정답이에요!" : "❌ 오답이에요"}
        </p>
        {!feedback.correct && feedback.answer && (
          <p className="text-xs text-red-500 mt-0.5">정답: {feedback.answer}</p>
        )}
      </div>
      <button onClick={onNext} className={`px-4 py-2 rounded-full text-xs font-medium ${feedback.correct ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
        다음 →
      </button>
    </div>
  );
}

/* ── Phone chrome ── */

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

/* ── Screen renderers ── */

function PictureScreen({ questions, onDone }: { questions: Question[]; onDone: (correct: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState(0);

  const q = questions[idx];

  function submit(selectedCorrect: boolean, correctAnswer?: string) {
    const ok = selectedCorrect;
    setFeedback({ correct: ok, answer: ok ? undefined : correctAnswer });
    if (ok) setScore(s => s + 1);
  }

  function next() {
    setFeedback(null);
    setInput("");
    if (idx + 1 >= questions.length) onDone(score + (feedback?.correct ? 0 : 0));
    else setIdx(i => i + 1);
  }

  if (q.type !== "mcq" && q.type !== "input") return null;

  return (
    <div className="flex flex-col h-full relative">
      <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[15px] font-bold text-gray-900">그림 보고 뜻 맞추기</h1>
          <span className="text-xs text-gray-400">{idx + 1} / {questions.length}</span>
        </div>
        <ProgressBar current={idx + 1} total={questions.length} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 bg-gray-50 space-y-5">
        {/* Image card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {q.imageUrl ? (
            <img src={q.imageUrl} alt={q.label} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 bg-gray-50">
              <span className="text-3xl">🖼️</span>
              <p className="text-xs text-gray-400">이미지를 넣어주세요</p>
              <p className="text-[10px] text-gray-300">public/exam/ 폴더에 추가 후 imageUrl 지정</p>
            </div>
          )}
          <div className="px-4 py-2 flex justify-center">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{q.label}</span>
          </div>
        </div>

        <p className="text-sm font-medium text-gray-800 text-center">{q.question}</p>

        {q.type === "mcq" ? (
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                disabled={!!feedback}
                onClick={() => submit(opt.correct, q.options.find(o => o.correct)?.text)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  feedback
                    ? opt.correct
                      ? "bg-green-50 border-green-300 text-green-800"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                    : "bg-white border-gray-200 hover:border-blue-300 text-gray-800"
                }`}
              >
                <span className="text-gray-400 mr-2">{["①","②","③","④"][i]}</span>{opt.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
              placeholder="한국어로 입력하세요"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!!feedback}
            />
            {!feedback && (
              <button
                onClick={() => submit(input.trim() === q.answer, q.answer)}
                className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold"
              >확인</button>
            )}
          </div>
        )}
      </div>

      <FeedbackBanner feedback={feedback} onNext={next} />
    </div>
  );
}

function DictationScreen({ questions, onDone }: { questions: Question[]; onDone: (correct: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [counting, setCounting] = useState(false);

  const q = questions[idx];

  useEffect(() => {
    if (!counting) return;
    if (countdown <= 0) { setCounting(false); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [counting, countdown]);

  function submit() {
    const ok = input.trim() === (q as { answer: string }).answer;
    setFeedback({ correct: ok, answer: ok ? undefined : (q as { answer: string }).answer });
    if (ok) setScore(s => s + 1);
  }

  function submitCamera() {
    // Simulate OCR success
    const ok = true;
    setFeedback({ correct: ok });
    if (ok) setScore(s => s + 1);
  }

  function next() {
    setFeedback(null);
    setInput("");
    setCameraReady(false);
    setCountdown(20);
    setCounting(false);
    if (idx + 1 >= questions.length) onDone(score);
    else setIdx(i => i + 1);
  }

  if (q.type !== "dictation-type" && q.type !== "dictation-camera") return null;

  return (
    <div className="flex flex-col h-full relative">
      <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[15px] font-bold text-gray-900">받아쓰기</h1>
          <span className="text-xs text-gray-400">{idx + 1} / {questions.length}</span>
        </div>
        <ProgressBar current={idx + 1} total={questions.length} />
      </div>

      {/* Waveform area */}
      <div className="shrink-0 bg-zinc-900 flex flex-col items-center justify-center gap-3 py-6">
        <div className="text-zinc-400 text-xs">🔴 재생 중</div>
        <Waveform />
        <div className="mt-1 bg-zinc-800 rounded-xl px-4 py-2 max-w-[260px]">
          <p className="text-zinc-300 text-xs text-center leading-relaxed">"{q.audio}"</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 bg-gray-50 space-y-4">
        {q.type === "dictation-type" ? (
          <>
            <p className="text-sm text-gray-600 text-center">들은 내용을 그대로 적어주세요</p>
            <input
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
              placeholder="여기에 입력하세요"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!!feedback}
            />
            {!feedback && (
              <button onClick={submit} className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold">제출</button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 text-center">종이에 받아쓰고 카메라로 촬영하세요</p>
            {!cameraReady ? (
              <button
                onClick={() => { setCameraReady(true); setCounting(true); }}
                className="w-full bg-zinc-800 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                📷 카메라 켜기
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-zinc-200 rounded-2xl w-full aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-300">
                  <span className="text-3xl">📷</span>
                  <p className="text-xs text-zinc-500">카메라 미리보기</p>
                  <p className="text-xs text-zinc-400">(종이에 쓴 내용을 비춰주세요)</p>
                </div>
                {counting && (
                  <div className="text-center">
                    <span className="text-2xl font-bold text-blue-500">{countdown}</span>
                    <span className="text-sm text-gray-400 ml-1">초</span>
                  </div>
                )}
                {!feedback && (
                  <button onClick={submitCamera} className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold">촬영 완료</button>
                )}
                {feedback && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">📷 AI가 인식 중...</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <FeedbackBanner feedback={feedback} onNext={next} />
    </div>
  );
}

function ExpressionScreen({ questions, onDone }: { questions: Question[]; onDone: (correct: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState(0);

  const q = questions[idx];
  if (q.type !== "expression-mcq") return null;

  function select(opt: MCQOption) {
    setFeedback({ correct: opt.correct, answer: opt.correct ? undefined : q.options.find(o => o.correct)?.text });
    if (opt.correct) setScore(s => s + 1);
  }

  function next() {
    setFeedback(null);
    if (idx + 1 >= questions.length) onDone(score);
    else setIdx(i => i + 1);
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[15px] font-bold text-gray-900">일상 표현 고르기</h1>
          <span className="text-xs text-gray-400">{idx + 1} / {questions.length}</span>
        </div>
        <ProgressBar current={idx + 1} total={questions.length} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 bg-gray-50 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-2 text-center">다음 표현과 같은 뜻을 고르세요</p>
          <p className="text-base font-semibold text-gray-900 text-center leading-relaxed">{q.prompt.replace(/^"/, "").replace(/"[^"]*$/, "").replace(/와 같은 뜻을 고르세요\.$/, "").replace(/를 정중하게 표현하면\?$/, "").replace(/처음 만난 사람에게 가장 자연스러운 인사는\?$/, "")}</p>
        </div>

        <p className="text-sm font-medium text-gray-700 text-center">{q.prompt}</p>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              disabled={!!feedback}
              onClick={() => select(opt)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                feedback
                  ? opt.correct
                    ? "bg-green-50 border-green-300 text-green-800"
                    : "bg-gray-50 border-gray-200 text-gray-400"
                  : "bg-white border-gray-200 hover:border-blue-300 text-gray-800"
              }`}
            >
              <span className="text-gray-400 mr-2">{["①","②","③","④"][i]}</span>{opt.text}
            </button>
          ))}
        </div>
      </div>

      <FeedbackBanner feedback={feedback} onNext={next} />
    </div>
  );
}

function ShortScreen({ questions, onDone }: { questions: Question[]; onDone: (correct: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState(0);

  const q = questions[idx];

  function submitInput() {
    if (q.type !== "short-input") return;
    const ok = input.trim() === q.answer;
    setFeedback({ correct: ok, answer: ok ? undefined : q.answer });
    if (ok) setScore(s => s + 1);
  }

  function selectBinary(opt: MCQOption) {
    setFeedback({ correct: opt.correct });
    if (opt.correct) setScore(s => s + 1);
  }

  function next() {
    setFeedback(null);
    setInput("");
    if (idx + 1 >= questions.length) onDone(score);
    else setIdx(i => i + 1);
  }

  if (q.type !== "short-input" && q.type !== "short-binary") return null;

  return (
    <div className="flex flex-col h-full relative">
      <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[15px] font-bold text-gray-900">짧은 대답</h1>
          <span className="text-xs text-gray-400">{idx + 1} / {questions.length}</span>
        </div>
        <ProgressBar current={idx + 1} total={questions.length} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 bg-gray-50 space-y-4">
        {/* Narration */}
        <div className="bg-zinc-900 rounded-2xl px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-zinc-400 text-[10px] uppercase tracking-wider">나레이션 재생 중</span>
          </div>
          <div className="flex items-center justify-center gap-[3px] mb-3">
            {WAVE_HEIGHTS.slice(0, 12).map((h, i) => (
              <div key={i} className="w-1 bg-green-400 rounded-full" style={{ height: Math.round(h * 0.55), transformOrigin: "bottom", animation: "waveBar 0.7s ease-in-out infinite alternate", animationDelay: `${i * 0.06}s` }} />
            ))}
          </div>
          <p className="text-white text-sm leading-relaxed">{q.narration}</p>
        </div>

        {/* Question bubble */}
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 max-w-[80%]">
            <p className="text-gray-900 text-sm">💬 {q.question}</p>
          </div>
        </div>

        {/* Answer */}
        {q.type === "short-input" ? (
          <div className="space-y-3">
            <input
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
              placeholder="짧게 대답하세요"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!!feedback}
            />
            {!feedback && (
              <button onClick={submitInput} className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold">확인</button>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                disabled={!!feedback}
                onClick={() => selectBinary(opt)}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  feedback
                    ? opt.correct
                      ? "bg-green-50 border-green-300 text-green-800"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                    : "bg-white border-gray-200 hover:border-blue-300 text-gray-800"
                }`}
              >{opt.text}</button>
            ))}
          </div>
        )}
      </div>

      <FeedbackBanner feedback={feedback} onNext={next} />
    </div>
  );
}

function LongScreen({ questions, onDone }: { questions: Question[]; onDone: (correct: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState(0);

  const q = questions[idx];

  function selectMcq(opt: MCQOption) {
    setFeedback({ correct: opt.correct, answer: opt.correct ? undefined : (q as { options: MCQOption[] }).options.find(o => o.correct)?.text });
    if (opt.correct) setScore(s => s + 1);
  }

  function submitInput() {
    const ok = input.trim().length > 0;
    setFeedback({ correct: ok });
    if (ok) setScore(s => s + 1);
  }

  function next() {
    setFeedback(null);
    setInput("");
    if (idx + 1 >= questions.length) onDone(score);
    else setIdx(i => i + 1);
  }

  if (q.type !== "long-mcq" && q.type !== "long-input") return null;

  return (
    <div className="flex flex-col h-full relative">
      <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[15px] font-bold text-gray-900">긴 대답</h1>
          <span className="text-xs text-gray-400">{idx + 1} / {questions.length}</span>
        </div>
        <ProgressBar current={idx + 1} total={questions.length} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 bg-gray-50 space-y-4">
        {/* Dialogue or Audio */}
        {"audioCaption" in q && q.audioCaption ? (
          <div className="bg-zinc-900 rounded-2xl px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-zinc-400 text-[10px] uppercase tracking-wider">음성 재생 중</span>
            </div>
            <div className="flex items-center justify-center gap-[3px] mb-3">
              {WAVE_HEIGHTS.map((h, i) => (
                <div key={i} className="w-1 bg-green-400 rounded-full" style={{ height: Math.round(h * 0.55), transformOrigin: "bottom", animation: "waveBar 0.7s ease-in-out infinite alternate", animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">{q.audioCaption}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400">💬 대화</p>
            {q.dialogue.map((line, i) => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                  i % 2 === 0 ? "bg-gray-100 text-gray-900 rounded-tl-sm" : "bg-blue-500 text-white rounded-tr-sm"
                }`}>
                  {q.dialogue.length > 1 && <span className="font-bold block text-[10px] mb-0.5 opacity-70">{line.speaker}</span>}
                  {line.text}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm font-medium text-gray-800">{q.question}</p>

        {q.type === "long-mcq" ? (
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                disabled={!!feedback}
                onClick={() => selectMcq(opt)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium leading-relaxed transition-colors ${
                  feedback
                    ? opt.correct
                      ? "bg-green-50 border-green-300 text-green-800"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                    : "bg-white border-gray-200 hover:border-blue-300 text-gray-800"
                }`}
              >
                <span className="text-gray-400 mr-2">{["①","②","③","④"][i]}</span>{opt.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 resize-none h-24"
              placeholder="한국어로 자유롭게 적어보세요"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!!feedback}
            />
            {!feedback && (
              <button onClick={submitInput} className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold">제출</button>
            )}
          </div>
        )}
      </div>

      <FeedbackBanner feedback={feedback} onNext={next} />
    </div>
  );
}

/* ── Main component ── */

export default function ExamPrototypeV2() {
  const [activeTab, setActiveTab] = useState<Tab>("picture");
  const [scores, setScores] = useState<Partial<Record<Tab, number>>>({});
  const [done, setDone] = useState<Partial<Record<Tab, boolean>>>({});

  function handleDone(tab: Tab, correct: number) {
    setScores(prev => ({ ...prev, [tab]: correct }));
    setDone(prev => ({ ...prev, [tab]: true }));
    toast(`${TAB_LABELS[tab]} 완료!`, {
      description: `${correct} / ${TAB_DATA[tab].length} 정답`,
      duration: 2500,
    });
  }

  function retry(tab: Tab) {
    setScores(prev => { const n = { ...prev }; delete n[tab]; return n; });
    setDone(prev => { const n = { ...prev }; delete n[tab]; return n; });
  }

  const TAB_LABELS: Record<Tab, string> = {
    picture:    "그림",
    dictation:  "받아쓰기",
    expression: "표현",
    short:      "짧은 대답",
    long:       "긴 대답",
  };

  const TAB_ICONS: Record<Tab, string> = {
    picture:    "🖼️",
    dictation:  "✍️",
    expression: "💬",
    short:      "🗣️",
    long:       "📝",
  };

  const TABS = (Object.keys(TAB_LABELS) as Tab[]);

  function renderContent() {
    if (done[activeTab]) {
      return (
        <ResultScreen
          correct={scores[activeTab] ?? 0}
          total={TAB_DATA[activeTab].length}
          onRetry={() => retry(activeTab)}
        />
      );
    }
    if (activeTab === "picture")    return <PictureScreen    key={activeTab} questions={PICTURE_QS}    onDone={c => handleDone("picture",    c)} />;
    if (activeTab === "dictation")  return <DictationScreen  key={activeTab} questions={DICTATION_QS}  onDone={c => handleDone("dictation",  c)} />;
    if (activeTab === "expression") return <ExpressionScreen key={activeTab} questions={EXPRESSION_QS} onDone={c => handleDone("expression", c)} />;
    if (activeTab === "short")      return <ShortScreen      key={activeTab} questions={SHORT_QS}      onDone={c => handleDone("short",      c)} />;
    if (activeTab === "long")       return <LongScreen       key={activeTab} questions={LONG_QS}       onDone={c => handleDone("long",       c)} />;
  }

  return (
    <>
      <style>{`
        @keyframes waveBar {
          0%   { transform: scaleY(0.25); }
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
              {renderContent()}
            </div>
          </div>

          <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[120px] h-[5px] bg-zinc-600 rounded-full" />
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-2xl text-xs font-medium transition-colors relative ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-lg"
                  : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600 hover:text-zinc-200"
              }`}
            >
              <span className="text-xl">{TAB_ICONS[tab]}</span>
              {TAB_LABELS[tab]}
              {done[tab] && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-[9px] rounded-full flex items-center justify-center">✓</span>
              )}
            </button>
          ))}
        </div>

      </div>
    </>
  );
}
