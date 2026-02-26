import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "sonner";

/* ── Types ── */

type Tab = "cards" | "alerts" | "r1" | "r2" | "r3" | "r4" | "r5";
type ReviewPhase = "idle" | "show" | "blank" | "input" | "choices" | "result";

type Card = {
  id: number;
  word: string;
  meaning: string;
  sentence: string;
  tag: string;
  stage: number;
  hasImage?: boolean;
  imageName?: string;
};

/* ── Data ── */

const BASE_CARDS: Card[] = [
  { id:1, word:"처녀",    meaning:"unmarried young woman",     sentence:"한 마을에 춘향이라는 아름다운 처녀가 살았습니다.", tag:"고전", stage:2, hasImage:true, imageName:"young-woman"        },
  { id:2, word:"반드시",  meaning:"definitely / without fail", sentence:"이몽룡이 '반드시 돌아오겠소'라고 말했습니다.",     tag:"고전", stage:3, hasImage:true, imageName:"definitely"          },
  { id:3, word:"동사무소",meaning:"community service center",  sentence:"동사무소에서 주민등록증을 발급받았어.",             tag:"행정", stage:6, hasImage:true, imageName:"community-center"   },
  { id:4, word:"그러니까",meaning:"so / that's what I mean",   sentence:"그러니까 내 말은 그게 아니야.",                   tag:"회화", stage:5, hasImage:true, imageName:"so-you-see"         },
  { id:5, word:"세탁기",  meaning:"washing machine",           sentence:"세탁기가 고장났어.",                             tag:"생활", stage:5, hasImage:true, imageName:"washing-machine"    },
  { id:6, word:"혼쭐나다",meaning:"get scolded hard",          sentence:"오늘 사장님한테 혼쭐났어.",                       tag:"슬랭", stage:2, hasImage:true, imageName:"got-scolded"        },
];

const QA_CARDS: Card[] = [
  { id:7, word:"눈치",    meaning:"reading the room",  sentence:"눈치가 없으면 한국 생활이 힘들어.",     tag:"회화", stage:1, hasImage:true, imageName:"reading-the-room" },
  { id:8, word:"끝내주다",meaning:"awesome / amazing", sentence:"어제 그 영화 끝내주지 않았어?",         tag:"슬랭", stage:1, hasImage:true, imageName:"awesome"          },
  { id:9, word:"갑분싸",  meaning:"sudden mood kill",  sentence:"갑분싸... 분위기 다 죽었어.",           tag:"슬랭", stage:1, hasImage:true, imageName:"mood-kill"        },
];

const NOTIFICATIONS = [
  { word:"눈치",    desc:"reading the room",          stage:1, time:"10분 전",  tag:"회화" },
  { word:"처녀",    desc:"unmarried young woman",      stage:2, time:"45분 전", tag:"고전" },
  { word:"동사무소",desc:"community service center",  stage:6, time:"2분 전",   tag:"행정" },
  { word:"끝내주다",desc:"awesome / amazing",          stage:1, time:"15분 전", tag:"슬랭" },
  { word:"그러니까",desc:"so / that's what I mean",   stage:5, time:"1시간 전", tag:"회화" },
  { word:"세탁기",  desc:"washing machine",            stage:5, time:"3시간 전", tag:"생활" },
  { word:"갑분싸",  desc:"sudden mood kill",           stage:4, time:"어제",    tag:"슬랭" },
];

const STAGE_META: Record<number, { color: string; bg: string; dot: string }> = {
  1: { color:"text-sky-600",     bg:"bg-sky-100",     dot:"bg-sky-400"    },
  2: { color:"text-amber-600",   bg:"bg-amber-100",   dot:"bg-amber-400"  },
  3: { color:"text-emerald-600", bg:"bg-emerald-100", dot:"bg-emerald-400"},
  4: { color:"text-violet-600",  bg:"bg-violet-100",  dot:"bg-violet-400" },
  5: { color:"text-violet-600",  bg:"bg-violet-100",  dot:"bg-violet-400" },
  6: { color:"text-violet-600",  bg:"bg-violet-100",  dot:"bg-violet-400" },
  7: { color:"text-violet-600",  bg:"bg-violet-100",  dot:"bg-violet-400" },
  8: { color:"text-rose-600",    bg:"bg-rose-100",    dot:"bg-rose-400"   },
  9: { color:"text-rose-600",    bg:"bg-rose-100",    dot:"bg-rose-400"   },
};

const STAGE_INTERVAL = ["신규","10분","1시간","6시간","1일","3일","1주","2주","3주","4주"];

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id:"cards",  label:"카드함", icon:"🗂️" },
  { id:"alerts", label:"알림",   icon:"🔔" },
  { id:"r1",     label:"복습①", icon:"1️⃣" },
  { id:"r2",     label:"복습②", icon:"2️⃣" },
  { id:"r3",     label:"복습③", icon:"3️⃣" },
  { id:"r4",     label:"복습④", icon:"4️⃣" },
  { id:"r5",     label:"복습⑤", icon:"5️⃣" },
];

const TAG_COLORS: Record<string, string> = {
  고전: "bg-amber-50 text-amber-700",
  회화: "bg-sky-50 text-sky-700",
  슬랭: "bg-violet-50 text-violet-700",
  행정: "bg-emerald-50 text-emerald-700",
  생활: "bg-gray-100 text-gray-600",
  기타: "bg-gray-100 text-gray-600",
};

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

/* ── Shared review sub-components ── */

function ReviewIdleCard({
  card, onStart, label, modeDesc,
}: {
  card: Card; onStart: () => void; label: string; modeDesc: string;
}) {
  return (
    <div className="flex flex-col h-full bg-gray-100 items-center justify-center px-6 gap-6">
      <div className="text-center">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-[12px] text-gray-400 mt-1">{modeDesc}</p>
      </div>
      <div className="relative w-[220px] h-[140px]">
        <div className="absolute inset-0 rotate-2 bg-white rounded-2xl shadow-sm border border-gray-200 opacity-50" />
        <div className="absolute inset-0 -rotate-1 bg-white rounded-2xl shadow-sm border border-gray-200 opacity-70" />
        <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center justify-center gap-2 p-5">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[card.tag] ?? "bg-gray-100 text-gray-500"}`}>
            {card.tag}
          </span>
          <p className="text-3xl font-bold text-gray-200 font-korean">?</p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg"
      >
        시작 ▶
      </button>
    </div>
  );
}

function ReviewResult({
  correct, card, nextInterval, onReset,
}: {
  correct: boolean; card: Card; nextInterval: string; onReset: () => void;
}) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-6 gap-5 bg-white">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${correct ? "bg-emerald-100" : "bg-red-100"}`}>
        {correct ? "✅" : "❌"}
      </div>
      <div className="text-center">
        <p className={`text-base font-bold ${correct ? "text-emerald-600" : "text-red-500"}`}>
          {correct ? "정답!" : "아쉬워요"}
        </p>
        <p className="text-3xl font-bold font-korean text-gray-900 mt-2">{card.word}</p>
        <p className="text-sm text-gray-500 mt-1">{card.meaning}</p>
        {card.sentence && (
          <p className="text-[11px] text-gray-400 mt-2 px-4 leading-relaxed italic font-korean">
            "{card.sentence}"
          </p>
        )}
      </div>
      <div className={`px-4 py-2 rounded-xl text-sm font-medium ${correct ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
        {correct ? `다음 복습: ${nextInterval} 후 🎉` : `다시: ${nextInterval} 후`}
      </div>
      <button onClick={onReset} className="text-sm text-indigo-500 font-medium mt-1">
        다시 시도 →
      </button>
    </div>
  );
}

/* ── Main ── */

export default function ReviewPrototypeV2() {
  const [activeTab, setActiveTab] = useState<Tab>("cards");

  // Card state
  const [cards, setCards] = useState<Card[]>(BASE_CARDS);
  const [pendingQA, setPendingQA] = useState<Card[]>(QA_CARDS);
  const [addWord, setAddWord] = useState("");
  const [addMeaning, setAddMeaning] = useState("");
  const [expandedStages, setExpandedStages] = useState<number[]>([1, 2, 3]);

  // Selected card from notification — all review tabs use this
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Review shared state
  const [reviewPhase, setReviewPhase] = useState<ReviewPhase>("idle");
  const [reviewInput, setReviewInput] = useState("");
  const [reviewTimer, setReviewTimer] = useState(0);
  const [reviewCorrect, setReviewCorrect] = useState<boolean | null>(null);
  const [mcqCards, setMcqCards] = useState<Card[]>([]);
  const [mcqSelected, setMcqSelected] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset review phase on tab switch
  useEffect(() => {
    resetReview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function resetReview() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (phaseRef.current) { clearTimeout(phaseRef.current); phaseRef.current = null; }
    setReviewPhase("idle");
    setReviewInput("");
    setReviewTimer(0);
    setReviewCorrect(null);
    setMcqSelected(null);
  }

  function startTimer(seconds: number, onExpire: () => void) {
    setReviewTimer(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setReviewTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          onExpire();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function after(ms: number, fn: () => void) {
    if (phaseRef.current) clearTimeout(phaseRef.current);
    phaseRef.current = setTimeout(fn, ms);
  }

  function finishReview(correct: boolean, card: Card) {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setReviewCorrect(correct);
    setReviewPhase("result");
    if (correct) {
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, stage: Math.min(9, c.stage + 1) } : c));
      toast("정답! 🎉 다음 단계로 진급했어요");
    }
  }

  function checkMeaning(input: string, meaning: string): boolean {
    const norm = input.trim().toLowerCase();
    if (norm.length < 2) return false;
    const keywords = meaning.toLowerCase().split(/[\s\/,]+/).filter(w => w.length >= 3);
    return keywords.some(w => norm.includes(w));
  }

  function checkWord(input: string, word: string): boolean {
    return input.trim().replace(/\s/g, "").toLowerCase() === word.toLowerCase().replace(/\s/g, "");
  }

  function getImageMCQChoices(card: Card): Card[] {
    const pool = [...cards, ...pendingQA].filter(c => c.id !== card.id);
    const wrong = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    return [card, ...wrong].sort(() => Math.random() - 0.5);
  }

  // Empty state shown when no card is selected from notification
  function NoCardSelected({ tab }: { tab: string }) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-5 px-8 text-center bg-gray-50">
        <span className="text-5xl opacity-30">🔔</span>
        <div>
          <p className="text-sm font-bold text-gray-600">{tab} 복습</p>
          <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">
            알림 탭에서 단어를 선택하면<br />해당 단어의 복습이 시작돼요
          </p>
        </div>
        <button
          onClick={() => setActiveTab("alerts")}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm rounded-2xl font-medium"
        >
          🔔 알림 탭으로 →
        </button>
      </div>
    );
  }

  /* ── 카드함 ── */

  function renderCards() {
    const grouped: Record<number, Card[]> = {};
    for (let i = 1; i <= 9; i++) grouped[i] = [];
    cards.forEach(c => { grouped[c.stage]?.push(c); });

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="shrink-0 px-5 py-3 bg-white border-b border-gray-100">
          <h1 className="text-[15px] font-bold text-gray-900">🗂️ 카드함</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {cards.length}장 저장{pendingQA.length > 0 && ` · AI 추천 ${pendingQA.length}개 대기`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Manual add */}
          <div className="px-4 pt-4 pb-3 space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">✍️ 직접 추가</p>
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm space-y-2">
              <input
                value={addWord}
                onChange={e => setAddWord(e.target.value)}
                placeholder="단어 (예: 눈치)"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 font-korean"
              />
              <input
                value={addMeaning}
                onChange={e => setAddMeaning(e.target.value)}
                placeholder="뜻 (예: reading the room)"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400"
              />
              <button
                onClick={() => {
                  if (!addWord.trim() || !addMeaning.trim()) return;
                  setCards(prev => [...prev, {
                    id: Date.now(), word: addWord.trim(), meaning: addMeaning.trim(),
                    sentence: addWord.trim(), tag: "기타", stage: 1,
                  }]);
                  setAddWord(""); setAddMeaning("");
                  toast("카드 추가! 10분 후 첫 복습 알림이 와요 ⚡");
                }}
                className="w-full py-2 bg-indigo-600 text-white text-sm rounded-xl font-medium"
              >
                추가하기
              </button>
            </div>
          </div>

          {/* AI pending */}
          {pendingQA.length > 0 && (
            <div className="px-4 pb-3 space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">💡 AI 추천 — 질문에서 추출</p>
              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 space-y-2.5">
                {pendingQA.map(card => (
                  <div key={card.id} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold font-korean text-gray-900">{card.word}</span>
                      <span className="text-[11px] text-gray-400 ml-2 truncate">{card.meaning}</span>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setCards(prev => [...prev, { ...card, stage: 1 }]);
                          setPendingQA(prev => prev.filter(c => c.id !== card.id));
                          toast(`'${card.word}' 추가! ⚡ 10분 후 첫 복습`);
                        }}
                        className="text-[11px] px-2 py-1 bg-emerald-500 text-white rounded-lg font-bold"
                      >추가 ✓</button>
                      <button
                        onClick={() => setPendingQA(prev => prev.filter(c => c.id !== card.id))}
                        className="text-[11px] px-2 py-1 bg-gray-200 text-gray-600 rounded-lg"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage groups */}
          <div className="px-4 pb-6 space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">📚 단계별 카드</p>
            {([1,2,3,4,5,6,7,8,9] as number[]).map(stage => {
              const stageCards = grouped[stage];
              if (!stageCards || stageCards.length === 0) return null;
              const meta = STAGE_META[stage];
              const interval = STAGE_INTERVAL[stage];
              const expanded = expandedStages.includes(stage);
              return (
                <div key={stage} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpandedStages(prev =>
                      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
                    )}
                    className="w-full flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                        {stage}단계
                      </span>
                      <span className="text-[11px] text-gray-400">· {interval} 뒤</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">{stageCards.length}장</span>
                      <span className="text-[11px] text-gray-300">{expanded ? "∧" : "∨"}</span>
                    </div>
                  </button>
                  {expanded && (
                    <div className="border-t border-gray-50 divide-y divide-gray-50">
                      {stageCards.map(card => (
                        <div key={card.id} className="px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold font-korean text-gray-900">{card.word}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${TAG_COLORS[card.tag] ?? "bg-gray-100 text-gray-500"}`}>
                              {card.tag}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400">{interval} 뒤</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── 알림 ── */

  function renderAlerts() {
    const allPool = [...cards, ...pendingQA];
    return (
      <div className="flex flex-col h-full bg-gray-900 text-white">
        <div className="shrink-0 text-center pt-5 pb-2">
          <p className="text-[11px] text-white/40">화요일, 2월 26일</p>
          <p className="text-3xl font-light text-white/90 mt-1">오후 3:42</p>
        </div>
        <div className="shrink-0 mx-4 mb-3 bg-white/10 rounded-2xl px-4 py-2 border border-white/5 text-center">
          <p className="text-[12px] text-white/70 font-medium">🔔 오늘 {NOTIFICATIONS.length}개 복습 예정</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {NOTIFICATIONS.map((n, i) => {
            const s = STAGE_META[Math.min(n.stage, 9)];
            const isSelected = selectedCard?.word === n.word;
            return (
              <button
                key={i}
                onClick={() => {
                  const found = allPool.find(c => c.word === n.word);
                  const card: Card = found ?? {
                    id: -1, word: n.word, meaning: n.desc,
                    sentence: n.word, tag: n.tag, stage: n.stage,
                  };
                  setSelectedCard(card);
                  setActiveTab("r1");
                  toast(`'${n.word}' 복습을 시작해요!`);
                }}
                className={`w-full backdrop-blur rounded-2xl px-3 py-2.5 border text-left transition-colors ${
                  isSelected
                    ? "bg-indigo-500/30 border-indigo-400/50"
                    : "bg-white/10 border-white/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center shrink-0">
                    <span className="text-[8px]">🌏</span>
                  </div>
                  <span className="text-[10px] text-white/40 font-medium">AI World</span>
                  <span className="text-[10px] text-white/25 ml-auto">{n.time}</span>
                  {isSelected && <span className="text-[9px] text-indigo-300 font-bold">선택됨</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white/90 font-korean leading-snug">
                      '<span className="font-bold">{n.word}</span>'{" "}
                      <span className="text-white/50">기억나? 복습할 시간!</span>
                    </p>
                    <p className="text-[10px] text-white/35 mt-0.5">{n.desc}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-center gap-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${s.bg} ${s.color}`}>
                      {n.stage}단계
                    </span>
                    <div className="flex gap-0.5">
                      {[1,2,3].map(d => (
                        <div key={d} className={`w-1 h-1 rounded-full ${d <= Math.min(n.stage, 3) ? s.dot : "bg-white/15"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-1.5">
                  <span className="text-[8px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded-full">#{n.tag}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="shrink-0 py-3 text-center">
          <p className="text-[10px] text-white/20">알림을 탭하면 복습①로 이동해요</p>
        </div>
      </div>
    );
  }

  /* ── 복습① — 단어 1초 flash → 뜻 입력 ── */

  function renderReview1() {
    if (!selectedCard) return <NoCardSelected tab="①" />;
    const card = selectedCard;
    const nextStage = Math.min(card.stage + 1, 9);

    function start() {
      setReviewPhase("show");
      after(1000, () => {                       // ← 1초
        setReviewPhase("blank");
        after(1500, () => {
          setReviewPhase("input");
          startTimer(10, () => finishReview(false, card));
        });
      });
    }

    if (reviewPhase === "idle") return (
      <ReviewIdleCard card={card} onStart={start}
        label={`⚡ ${card.stage}단계 · 단어→뜻`}
        modeDesc="단어 1초 표시 → 뜻을 10초 안에 입력" />
    );

    if (reviewPhase === "show") return (
      <div className="flex flex-col h-full items-center justify-center bg-indigo-600 gap-4">
        <p className="text-[11px] text-indigo-300 uppercase tracking-wider">기억하세요</p>
        <p className="text-5xl font-bold text-white font-korean">{card.word}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${TAG_COLORS[card.tag] ?? "bg-gray-100 text-gray-700"}`}>
          {card.tag}
        </span>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500">
          <div className="h-full bg-white/60" style={{ animation:"shrinkWidth 1s linear forwards" }} />
        </div>
      </div>
    );

    if (reviewPhase === "blank") return (
      <div className="flex flex-col h-full items-center justify-center bg-white gap-3">
        <p className="text-4xl">✏️</p>
        <p className="text-base font-medium text-gray-400">기억나요?</p>
      </div>
    );

    if (reviewPhase === "input") return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-[12px] text-gray-400 font-medium">뜻을 입력하세요</p>
          <input
            autoFocus
            value={reviewInput}
            onChange={e => setReviewInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") finishReview(checkMeaning(reviewInput, card.meaning), card); }}
            placeholder="meaning in English..."
            className="w-full text-center text-base border-b-2 border-indigo-300 outline-none py-2 text-gray-900 focus:border-indigo-600"
          />
          <p className={`text-3xl font-bold tabular-nums ${reviewTimer <= 3 ? "text-red-500 animate-pulse" : "text-gray-300"}`}>
            {reviewTimer}
          </p>
        </div>
        <div className="shrink-0 px-6 pb-8">
          <button
            onClick={() => finishReview(checkMeaning(reviewInput, card.meaning), card)}
            className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold"
          >
            제출
          </button>
        </div>
      </div>
    );

    if (reviewPhase === "result") return (
      <ReviewResult correct={reviewCorrect!} card={card}
        nextInterval={reviewCorrect ? STAGE_INTERVAL[nextStage] : STAGE_INTERVAL[card.stage]}
        onReset={resetReview} />
    );

    return null;
  }

  /* ── 복습② — 문장 컨텍스트 → 뜻 입력 ── */

  function renderReview2() {
    if (!selectedCard) return <NoCardSelected tab="②" />;
    const card = selectedCard;
    const nextStage = Math.min(card.stage + 1, 9);

    function start() {
      setReviewPhase("input");
      startTimer(15, () => finishReview(false, card));
    }

    if (reviewPhase === "idle") return (
      <ReviewIdleCard card={card} onStart={start}
        label={`📖 ${card.stage}단계 · 문장→뜻`}
        modeDesc="예문을 읽고 단어 뜻을 15초 안에 입력" />
    );

    if (reviewPhase === "input") {
      const parts = card.sentence.split(new RegExp(`(${card.word})`, "g"));
      return (
        <div className="flex flex-col h-full bg-white">
          <div className="flex-1 flex flex-col justify-center px-6 gap-4">
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <p className="text-sm leading-relaxed font-korean text-gray-800">
                {parts.map((part, i) =>
                  part === card.word
                    ? <span key={i} className="font-bold text-indigo-600 underline decoration-wavy decoration-indigo-300">{part}</span>
                    : <span key={i}>{part}</span>
                )}
              </p>
            </div>
            <p className="text-[12px] text-gray-500 text-center">
              밑줄 친 '<span className="font-bold font-korean text-gray-700">{card.word}</span>'의 뜻은?
            </p>
            <input
              autoFocus
              value={reviewInput}
              onChange={e => setReviewInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") finishReview(checkMeaning(reviewInput, card.meaning), card); }}
              placeholder="meaning in English..."
              className="w-full text-center text-base border-b-2 border-indigo-300 outline-none py-2 text-gray-900 focus:border-indigo-600"
            />
            <p className={`text-3xl font-bold tabular-nums text-center ${reviewTimer <= 3 ? "text-red-500 animate-pulse" : "text-gray-300"}`}>
              {reviewTimer}
            </p>
          </div>
          <div className="shrink-0 px-6 pb-8">
            <button
              onClick={() => finishReview(checkMeaning(reviewInput, card.meaning), card)}
              className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold"
            >
              제출
            </button>
          </div>
        </div>
      );
    }

    if (reviewPhase === "result") return (
      <ReviewResult correct={reviewCorrect!} card={card}
        nextInterval={reviewCorrect ? STAGE_INTERVAL[nextStage] : STAGE_INTERVAL[card.stage]}
        onReset={resetReview} />
    );

    return null;
  }

  /* ── 복습③ — 뜻 1초 flash → 단어 입력 ── */

  function renderReview3() {
    if (!selectedCard) return <NoCardSelected tab="③" />;
    const card = selectedCard;
    const nextStage = Math.min(card.stage + 1, 9);

    function start() {
      setReviewPhase("show");
      after(1000, () => {                       // ← 1초
        setReviewPhase("blank");
        after(1500, () => {
          setReviewPhase("input");
          startTimer(10, () => finishReview(false, card));
        });
      });
    }

    if (reviewPhase === "idle") return (
      <ReviewIdleCard card={card} onStart={start}
        label={`🔄 ${card.stage}단계 · 뜻→단어`}
        modeDesc="뜻 1초 표시 → 한국어 단어를 10초 안에 입력" />
    );

    if (reviewPhase === "show") return (
      <div className="flex flex-col h-full items-center justify-center bg-violet-600 gap-4">
        <p className="text-[11px] text-violet-300 uppercase tracking-wider">뜻을 기억하세요</p>
        <p className="text-2xl font-bold text-white text-center px-8">{card.meaning}</p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-500">
          <div className="h-full bg-white/60" style={{ animation:"shrinkWidth 1s linear forwards" }} />
        </div>
      </div>
    );

    if (reviewPhase === "blank") return (
      <div className="flex flex-col h-full items-center justify-center bg-white gap-3">
        <p className="text-4xl">✏️</p>
        <p className="text-base font-medium text-gray-400">한국어로 써보세요</p>
      </div>
    );

    if (reviewPhase === "input") return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-[12px] text-gray-400 font-medium">한국어 단어를 입력하세요</p>
          <input
            autoFocus
            value={reviewInput}
            onChange={e => setReviewInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") finishReview(checkWord(reviewInput, card.word), card); }}
            placeholder="단어..."
            className="w-full text-center text-lg font-korean border-b-2 border-violet-300 outline-none py-2 text-gray-900 focus:border-violet-600"
          />
          <p className={`text-3xl font-bold tabular-nums ${reviewTimer <= 3 ? "text-red-500 animate-pulse" : "text-gray-300"}`}>
            {reviewTimer}
          </p>
        </div>
        <div className="shrink-0 px-6 pb-8">
          <button
            onClick={() => finishReview(checkWord(reviewInput, card.word), card)}
            className="w-full py-3 bg-violet-600 text-white rounded-2xl text-sm font-bold"
          >
            제출
          </button>
        </div>
      </div>
    );

    if (reviewPhase === "result") return (
      <ReviewResult correct={reviewCorrect!} card={card}
        nextInterval={reviewCorrect ? STAGE_INTERVAL[nextStage] : STAGE_INTERVAL[card.stage]}
        onReset={resetReview} />
    );

    return null;
  }

  /* ── 복습④ — 이미지 4지선다 ── */

  function renderReview4() {
    if (!selectedCard) return <NoCardSelected tab="④" />;
    const card = selectedCard;
    const nextStage = Math.min(card.stage + 1, 9);

    function start() {
      setMcqCards(getImageMCQChoices(card));
      setReviewPhase("show");
    }

    if (reviewPhase === "idle") return (
      <ReviewIdleCard card={card} onStart={start}
        label={`🎯 ${card.stage}단계 · 이미지 선택`}
        modeDesc="문장 제시 → 올바른 이미지를 선택" />
    );

    if (reviewPhase === "show") {
      const parts = card.sentence.split(new RegExp(`(${card.word})`, "g"));
      return (
        <div className="flex flex-col h-full bg-white">
          <div className="flex-1 flex flex-col justify-center px-6 gap-4">
            <p className="text-[11px] text-amber-600 uppercase tracking-wider text-center">문장을 읽어보세요</p>
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-sm leading-relaxed font-korean text-gray-800">
                {parts.map((part, i) =>
                  part === card.word
                    ? <span key={i} className="font-bold text-amber-600 underline decoration-wavy decoration-amber-300">{part}</span>
                    : <span key={i}>{part}</span>
                )}
              </p>
            </div>
            <p className="text-[12px] text-gray-500 text-center">
              밑줄 친 '<span className="font-bold font-korean text-gray-700">{card.word}</span>'에 맞는 이미지를 고르세요
            </p>
          </div>
          <div className="shrink-0 px-6 pb-8">
            <button
              onClick={() => setReviewPhase("choices")}
              className="w-full py-3 bg-amber-500 text-white rounded-2xl text-sm font-bold"
            >
              이미지 선택하기 →
            </button>
          </div>
        </div>
      );
    }

    if (reviewPhase === "choices" || (reviewPhase === "result" && mcqSelected !== null)) {
      const showResult = reviewPhase === "result";
      const useImage = card.hasImage;
      return (
        <div className="flex flex-col h-full bg-white">
          <div className="shrink-0 px-5 py-3 border-b border-gray-100">
            <p className="text-[12px] text-gray-500 text-center">
              밑줄 친 단어에 맞는 이미지를 고르세요
            </p>
          </div>
          <div className={`flex-1 p-4 content-center ${useImage ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3 justify-center"}`}>
            {mcqCards.map((choice, i) => {
              const isSelected = mcqSelected === i;
              const isCorrect = choice.id === card.id;
              const showHint = showResult || isSelected;

              let borderCls = "border-2 rounded-2xl overflow-hidden transition-all ";
              if (!showResult && mcqSelected === null) {
                borderCls += "border-gray-200 hover:border-amber-300 active:scale-95";
              } else if (isSelected && isCorrect) {
                borderCls += "border-emerald-500 ring-2 ring-emerald-300";
              } else if (isSelected && !isCorrect) {
                borderCls += "border-red-400";
              } else if (!isSelected && isCorrect && showResult) {
                borderCls += "border-emerald-400";
              } else {
                borderCls += "border-gray-100";
              }

              return (
                <button
                  key={i}
                  disabled={mcqSelected !== null}
                  onClick={() => {
                    setMcqSelected(i);
                    const correct = isCorrect;
                    setReviewCorrect(correct);
                    setTimeout(() => {
                      setReviewPhase("result");
                      if (correct) {
                        setCards(prev => prev.map(c =>
                          c.id === card.id ? { ...c, stage: Math.min(9, c.stage + 1) } : c
                        ));
                        toast("정답! 🎉 다음 단계로 진급했어요");
                      }
                    }, 900);
                  }}
                  className={borderCls}
                >
                  {useImage ? (
                  <>
                    {/* Image area — TODO: replace inner div with <img> */}
                    <div className={`aspect-square relative flex items-center justify-center ${
                      isSelected && isCorrect ? "bg-emerald-100" :
                      isSelected && !isCorrect ? "bg-red-100" :
                      !isSelected && isCorrect && showResult ? "bg-emerald-50" :
                      "bg-gray-100"
                    }`}>
                      <img
                        src={`/images/review/${choice.imageName}.jpg`}
                        onError={(e) => { (e.target as HTMLImageElement).src = `/images/review/${choice.imageName}.png`; }}
                        className="w-full h-full object-cover"
                        alt={choice.word}
                      />
                      {isSelected && (
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          isCorrect ? "bg-emerald-500" : "bg-red-400"
                        }`}>
                          {isCorrect ? "✓" : "✗"}
                        </div>
                      )}
                      {!isSelected && isCorrect && showResult && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                    {/* Word label below image (visible after selection) */}
                    <div className={`px-2 py-1.5 text-center border-t ${
                      isSelected && isCorrect ? "bg-emerald-50 border-emerald-100" :
                      isSelected && !isCorrect ? "bg-red-50 border-red-100" :
                      !isSelected && isCorrect && showResult ? "bg-emerald-50 border-emerald-100" :
                      "bg-white border-gray-100"
                    }`}>
                      <span className={`text-[11px] font-korean font-bold ${
                        showHint ? "text-gray-700" : "text-transparent select-none"
                      }`}>
                        {choice.word}
                      </span>
                    </div>
                  </>
                  ) : (
                  /* Text MCQ — for abstract words without images */
                  <div className={`px-4 py-4 text-left w-full ${
                    isSelected && isCorrect ? "bg-emerald-50" :
                    isSelected && !isCorrect ? "bg-red-50" :
                    !isSelected && isCorrect && showResult ? "bg-emerald-50" :
                    "bg-white"
                  }`}>
                    <p className={`text-sm font-medium font-korean ${
                      isSelected && isCorrect ? "text-emerald-700" :
                      isSelected && !isCorrect ? "text-red-600" :
                      !isSelected && isCorrect && showResult ? "text-emerald-700" :
                      "text-gray-800"
                    }`}>{choice.meaning}</p>
                    {showHint && (
                      <p className="text-[10px] text-gray-400 mt-0.5 font-korean">{choice.word}</p>
                    )}
                  </div>
                  )}
                </button>
              );
            })}
          </div>
          {showResult && (
            <div className="shrink-0 px-6 pb-6">
              <button onClick={resetReview} className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold">
                다시 시도 →
              </button>
            </div>
          )}
        </div>
      );
    }

    if (reviewPhase === "result" && mcqSelected === null) return (
      <ReviewResult correct={reviewCorrect!} card={card}
        nextInterval={reviewCorrect ? STAGE_INTERVAL[nextStage] : STAGE_INTERVAL[card.stage]}
        onReset={resetReview} />
    );

    return null;
  }

  /* ── 복습⑤ — 받아쓰기 ── */

  function renderReview5() {
    if (!selectedCard) return <NoCardSelected tab="⑤" />;
    const card = selectedCard;
    const nextStage = Math.min(card.stage + 1, 9);
    const hint = card.word.split("").map((ch, i) =>
      i === 0 || i === card.word.length - 1 ? ch : "_"
    ).join(" ");

    function start() {
      setReviewPhase("show");
      after(2000, () => {
        setReviewPhase("input");
        startTimer(15, () => finishReview(false, card));
      });
    }

    if (reviewPhase === "idle") return (
      <ReviewIdleCard card={card} onStart={start}
        label={`🔊 ${card.stage}단계 · 받아쓰기`}
        modeDesc="소리를 듣고 한국어 단어를 15초 안에 입력" />
    );

    if (reviewPhase === "show") return (
      <div className="flex flex-col h-full items-center justify-center bg-rose-600 gap-5">
        <p className="text-[11px] text-rose-200 uppercase tracking-wider">듣고 받아쓰세요</p>
        <div className="text-6xl">🔊</div>
        <div className="flex items-end gap-1 h-8">
          {[0.3,0.7,1,0.5,0.9,0.4,0.8,0.6,1,0.3].map((h, i) => (
            <div
              key={i}
              className="w-2 bg-white/60 rounded-full"
              style={{
                height: `${h * 28}px`,
                animation: `waveBounce ${0.4 + i * 0.05}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.07}s`,
              }}
            />
          ))}
        </div>
        <div className="bg-white/15 px-5 py-2 rounded-xl">
          <p className="text-white/80 text-lg font-korean tracking-widest">{hint}</p>
        </div>
      </div>
    );

    if (reviewPhase === "input") return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-4xl">🔊</p>
          <p className="text-[12px] text-gray-400 font-medium">들은 단어를 한국어로 써보세요</p>
          <p className="text-sm text-gray-300 font-korean tracking-widest">{hint}</p>
          <input
            autoFocus
            value={reviewInput}
            onChange={e => setReviewInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") finishReview(checkWord(reviewInput, card.word), card); }}
            placeholder="단어..."
            className="w-full text-center text-lg font-korean border-b-2 border-rose-300 outline-none py-2 text-gray-900 focus:border-rose-600"
          />
          <p className={`text-3xl font-bold tabular-nums ${reviewTimer <= 3 ? "text-red-500 animate-pulse" : "text-gray-300"}`}>
            {reviewTimer}
          </p>
        </div>
        <div className="shrink-0 px-6 pb-8">
          <button
            onClick={() => finishReview(checkWord(reviewInput, card.word), card)}
            className="w-full py-3 bg-rose-600 text-white rounded-2xl text-sm font-bold"
          >
            제출
          </button>
        </div>
      </div>
    );

    if (reviewPhase === "result") return (
      <ReviewResult correct={reviewCorrect!} card={card}
        nextInterval={reviewCorrect ? STAGE_INTERVAL[nextStage] : STAGE_INTERVAL[card.stage]}
        onReset={resetReview} />
    );

    return null;
  }

  /* ── Render ── */

  return (
    <>
      <style>{`
        @keyframes waveBounce {
          0%   { transform: scaleY(0.3); }
          100% { transform: scaleY(1.0); }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to   { width: 0%; }
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

          <div className="absolute inset-[10px] rounded-[42px] overflow-hidden flex flex-col bg-white" style={{ transform:"translateZ(0)" }}>
            <Toaster position="top-center" offset={56} toastOptions={{ style:{ width:"350px", fontSize:"13px", marginLeft:"4px" } }} />
            <StatusBar />
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-zinc-900 rounded-full z-20 pointer-events-none" />

            <div className="flex-1 overflow-hidden flex flex-col">
              {activeTab === "cards"  && renderCards()}
              {activeTab === "alerts" && renderAlerts()}
              {activeTab === "r1"     && renderReview1()}
              {activeTab === "r2"     && renderReview2()}
              {activeTab === "r3"     && renderReview3()}
              {activeTab === "r4"     && renderReview4()}
              {activeTab === "r5"     && renderReview5()}
            </div>
          </div>

          <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[120px] h-[5px] bg-zinc-600 rounded-full" />
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-lg"
                  : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600 hover:text-zinc-200"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

      </div>
    </>
  );
}
