import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast, Toaster } from "sonner";

/* ── Types ── */

type Tab = "apply" | "interview" | "work" | "admin";

type Job = { id: string; icon: string; name: string; wage: string; hours: string };
type MenuItem = { id: string; name: string; price: number; qty: number };
type AdminField = { label: string; type: "text" | "date" | "select"; options?: string[] };
type AdminTask = { id: string; icon: string; name: string; fields: AdminField[] };

/* ── Data ── */

const JOBS: Job[] = [
  { id: "restaurant", icon: "🍽️", name: "식당 서빙",      wage: "시급 ₩9,860",        hours: "저녁 6~10시" },
  { id: "cafe",       icon: "☕",  name: "카페 바리스타",  wage: "시급 ₩10,500",       hours: "오전 7~12시" },
  { id: "cv",         icon: "🏪",  name: "편의점",         wage: "시급 ₩9,860",        hours: "야간 11~7시" },
  { id: "delivery",   icon: "🛵",  name: "배달",           wage: "건당 ₩4,000~6,000", hours: "자유 시간" },
  { id: "errand",     icon: "🧹",  name: "심부름",         wage: "건당 ₩15,000",       hours: "자유 시간" },
];

const INIT_MENU: MenuItem[] = [
  { id: "americano",  name: "아메리카노", price: 4500, qty: 0 },
  { id: "latte",      name: "카페라떼",  price: 5000, qty: 0 },
  { id: "espresso",   name: "에스프레소",price: 3500, qty: 0 },
  { id: "greentea",   name: "녹차라떼",  price: 5500, qty: 0 },
  { id: "strawberry", name: "딸기스무디",price: 6000, qty: 0 },
];

const ADMIN_TASKS: AdminTask[] = [
  {
    id: "alien", icon: "🪪", name: "외국인 등록증 신청",
    fields: [
      { label: "성명 (한국어)", type: "text" },
      { label: "성명 (영문)",   type: "text" },
      { label: "생년월일",      type: "date" },
      { label: "국적",          type: "text" },
      { label: "입국일",        type: "date" },
      { label: "체류 자격",     type: "select", options: ["학생", "취업", "방문", "결혼"] },
      { label: "주소",          type: "text" },
    ],
  },
  {
    id: "bank", icon: "🏦", name: "은행 계좌 개설",
    fields: [
      { label: "성명",    type: "text" },
      { label: "생년월일",type: "date" },
      { label: "연락처",  type: "text" },
      { label: "은행",    type: "select", options: ["국민은행", "신한은행", "하나은행", "우리은행", "카카오뱅크"] },
      { label: "계좌 종류",type: "select", options: ["입출금 통장", "적금", "청약"] },
    ],
  },
  {
    id: "visa", icon: "📋", name: "비자 연장 신청",
    fields: [
      { label: "성명",       type: "text" },
      { label: "생년월일",   type: "date" },
      { label: "국적",       type: "text" },
      { label: "체류 자격",  type: "select", options: ["D-2 유학", "E-7 특정활동", "F-2 거주", "F-4 재외동포"] },
      { label: "연장 기간",  type: "select", options: ["6개월", "1년", "2년"] },
      { label: "체류 만료일",type: "date" },
    ],
  },
  {
    id: "insurance", icon: "🏥", name: "건강보험 가입 신청",
    fields: [
      { label: "성명",      type: "text" },
      { label: "생년월일",  type: "date" },
      { label: "가입 유형", type: "select", options: ["지역가입자", "직장가입자", "피부양자"] },
      { label: "소득 유형", type: "select", options: ["근로소득", "사업소득", "없음"] },
      { label: "연락처",    type: "text" },
    ],
  },
  {
    id: "tax", icon: "💸", name: "세금 신고",
    fields: [
      { label: "성명",        type: "text" },
      { label: "납세자 번호", type: "text" },
      { label: "소득 유형",   type: "select", options: ["근로소득", "사업소득", "기타소득"] },
      { label: "신고 연도",   type: "text" },
      { label: "총 소득 (원)",type: "text" },
    ],
  },
  {
    id: "moving", icon: "🏠", name: "전입 신고",
    fields: [
      { label: "성명",    type: "text" },
      { label: "이전 주소",type: "text" },
      { label: "새 주소", type: "text" },
      { label: "전입일",  type: "date" },
    ],
  },
];

/* ── Helpers ── */

const WAVE_HEIGHTS = [18, 32, 48, 38, 58, 44, 28, 52, 40, 26, 50, 36, 46, 30, 42];

function Waveform() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {WAVE_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-1.5 bg-green-400 rounded-full"
          style={{
            height: h,
            transformOrigin: "bottom",
            animation: "waveBar 0.7s ease-in-out infinite alternate",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

/* ── Phone chrome shared parts ── */

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

/* ── Main component ── */

export default function WorkPrototypeV2() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) ?? "apply";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // apply
  const [applyScreen, setApplyScreen]   = useState<"list" | "form">("list");
  const [selectedJob, setSelectedJob]   = useState<Job | null>(null);
  const [applyTimes, setApplyTimes]     = useState<string[]>([]);

  // interview
  const [ivScreen, setIvScreen]         = useState<"ringing" | "call" | "done">("ringing");
  const [ivSecs, setIvSecs]             = useState(0);

  // work
  const [workScreen, setWorkScreen]     = useState<"ringing" | "call" | "receipt">("ringing");
  const [workSecs, setWorkSecs]         = useState(0);
  const [menu, setMenu]                 = useState<MenuItem[]>(INIT_MENU.map(m => ({ ...m })));

  // admin
  const [adminScreen, setAdminScreen]   = useState<"list" | "form" | "payment">("list");
  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null);
  const [adminForm, setAdminForm]       = useState<Record<string, string>>({});

  // Reset on tab switch
  useEffect(() => {
    setApplyScreen("list"); setSelectedJob(null); setApplyTimes([]);
    setIvScreen("ringing"); setIvSecs(0);
    setWorkScreen("ringing"); setWorkSecs(0); setMenu(INIT_MENU.map(m => ({ ...m })));
    setAdminScreen("list"); setSelectedTask(null); setAdminForm({});
  }, [activeTab]);

  // Timers
  useEffect(() => {
    if (ivScreen !== "call") { setIvSecs(0); return; }
    const t = setInterval(() => setIvSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [ivScreen]);

  useEffect(() => {
    if (workScreen !== "call") { setWorkSecs(0); return; }
    const t = setInterval(() => setWorkSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [workScreen]);

  /* ── Screen renderers ── */

  function renderApply() {
    if (applyScreen === "list") return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white">
          <h1 className="text-[17px] font-bold text-gray-900">알바 구하기</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {JOBS.map(job => (
            <button
              key={job.id}
              onClick={() => { setSelectedJob(job); setApplyScreen("form"); }}
              className="w-full bg-white rounded-xl p-4 text-left shadow-sm border border-gray-100 active:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{job.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{job.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{job.wage} · {job.hours}</div>
                </div>
                <span className="text-gray-300">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );

    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
          <button onClick={() => setApplyScreen("list")} className="text-blue-500 text-sm font-medium">← 뒤로</button>
          <span className="text-sm font-semibold text-gray-900">{selectedJob?.icon} {selectedJob?.name}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-3">
          {[
            { label: "이름",   placeholder: "홍길동" },
            { label: "나이",   placeholder: "24" },
            { label: "연락처", placeholder: "010-0000-0000" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{f.label}</label>
              <input className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none" placeholder={f.placeholder} />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">경력</label>
            <textarea className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none resize-none h-16" placeholder="없으면 '없음'이라고 쓰세요" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">지원 동기</label>
            <textarea className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none resize-none h-20" placeholder="지원 동기를 적어주세요" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">가능 시간</label>
            <div className="flex gap-2 flex-wrap">
              {["오전", "오후", "저녁", "야간"].map(t => (
                <button
                  key={t}
                  onClick={() => setApplyTimes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    applyTimes.includes(t) ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200"
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="shrink-0 px-4 py-3 border-t border-gray-200 bg-white">
          <button
            onClick={() => { toast("지원이 완료되었습니다 ✅", { description: selectedJob?.name, duration: 2000 }); setApplyScreen("list"); }}
            className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold"
          >지원하기</button>
        </div>
      </div>
    );
  }

  function renderInterview() {
    if (ivScreen === "ringing") return (
      <div className="flex flex-col h-full bg-zinc-900 items-center justify-between py-12">
        <div className="flex flex-col items-center gap-4 mt-10">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-zinc-600 animate-ping opacity-30" />
            <div className="relative w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-4xl">🧑‍💼</div>
          </div>
          <div className="text-center">
            <div className="text-white text-lg font-semibold">최사장님</div>
            <div className="text-zinc-400 text-sm mt-1">면접 전화</div>
          </div>
        </div>
        <div className="flex gap-16 mb-8">
          <div className="flex flex-col items-center gap-2">
            <button className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-2xl">📵</button>
            <span className="text-zinc-400 text-xs">거절</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => setIvScreen("call")} className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-2xl">📞</button>
            <span className="text-zinc-400 text-xs">수락</span>
          </div>
        </div>
      </div>
    );

    if (ivScreen === "call") return (
      <div className="flex flex-col h-full bg-zinc-900">
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-4xl">🧑‍💼</div>
          <div className="text-center">
            <div className="text-white text-base font-semibold">최사장님</div>
            <div className="text-green-400 text-sm mt-1">통화 중 {formatTime(ivSecs)}</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-8 border-t border-zinc-700/60">
          <Waveform />
          <button onClick={() => setIvScreen("done")} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-2xl">📵</button>
        </div>
      </div>
    );

    return (
      <div className="flex flex-col h-full bg-zinc-900 items-center justify-center gap-4 px-6 text-center">
        <span className="text-5xl">🙏</span>
        <p className="text-white text-base font-semibold">면접이 끝났습니다</p>
        <p className="text-zinc-400 text-sm">결과를 기다려 주세요.</p>
        <button onClick={() => setIvScreen("ringing")} className="mt-3 px-5 py-2.5 bg-zinc-700 text-zinc-200 rounded-full text-sm">다시 해보기</button>
      </div>
    );
  }

  function renderWork() {
    if (workScreen === "ringing") return (
      <div className="flex flex-col h-full bg-zinc-900 items-center justify-between py-12">
        <div className="flex flex-col items-center gap-4 mt-10">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-zinc-600 animate-ping opacity-30" />
            <div className="relative w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-4xl">👤</div>
          </div>
          <div className="text-center">
            <div className="text-white text-lg font-semibold">번호 미표시</div>
            <div className="text-zinc-400 text-sm mt-1">주문 전화</div>
          </div>
        </div>
        <div className="flex gap-16 mb-8">
          <div className="flex flex-col items-center gap-2">
            <button className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-2xl">📵</button>
            <span className="text-zinc-400 text-xs">거절</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => setWorkScreen("call")} className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-2xl">📞</button>
            <span className="text-zinc-400 text-xs">수락</span>
          </div>
        </div>
      </div>
    );

    if (workScreen === "call") {
      const total = menu.reduce((s, m) => s + m.price * m.qty, 0);
      return (
        <div className="flex flex-col h-full">
          {/* Top — waveform */}
          <div className="bg-zinc-900 flex flex-col items-center justify-center gap-2 py-5 shrink-0">
            <div className="text-zinc-400 text-xs">통화 중 {formatTime(workSecs)}</div>
            <Waveform />
          </div>
          {/* Bottom — menu */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="shrink-0 px-4 py-2.5 border-b border-gray-200 bg-white flex items-center gap-2">
              <span>📋</span>
              <span className="text-sm font-semibold text-gray-900">메뉴판</span>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {menu.map((item, i) => (
                <div key={item.id} className="flex items-center px-4 py-3 border-b border-gray-100 bg-white">
                  <span className="text-sm text-gray-900 flex-1">{item.name}</span>
                  <span className="text-xs text-gray-400 mr-3">₩{item.price.toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMenu(prev => prev.map((m, idx) => idx === i ? { ...m, qty: Math.max(0, m.qty - 1) } : m))} className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center">−</button>
                    <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                    <button onClick={() => setMenu(prev => prev.map((m, idx) => idx === i ? { ...m, qty: m.qty + 1 } : m))} className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex items-center gap-3">
              <span className="text-sm text-gray-600">합계 <span className="font-bold text-gray-900">₩{total.toLocaleString()}</span></span>
              <button onClick={() => setWorkScreen("receipt")} className="ml-auto bg-blue-500 text-white rounded-xl px-4 py-2 text-sm font-semibold">주문 완료</button>
            </div>
          </div>
        </div>
      );
    }

    const ordered = menu.filter(m => m.qty > 0);
    const total = menu.reduce((s, m) => s + m.price * m.qty, 0);
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-6 w-full shadow-sm border border-gray-100">
          <div className="text-center mb-4">
            <span className="text-2xl">☕</span>
            <p className="text-sm font-bold text-gray-900 mt-1">주문 내역</p>
          </div>
          <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
            {ordered.length === 0
              ? <p className="text-xs text-gray-400 text-center">선택된 메뉴 없음</p>
              : ordered.map(m => (
                <div key={m.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{m.name} × {m.qty}</span>
                  <span className="text-gray-900">₩{(m.price * m.qty).toLocaleString()}</span>
                </div>
              ))}
          </div>
          <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex justify-between text-sm font-bold">
            <span>합계</span>
            <span>₩{total.toLocaleString()}</span>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">감사합니다! ☕</p>
        </div>
        <button
          onClick={() => { setWorkScreen("ringing"); setWorkSecs(0); setMenu(INIT_MENU.map(m => ({ ...m }))); }}
          className="mt-5 px-5 py-2.5 bg-zinc-700 text-zinc-200 rounded-full text-sm"
        >다시 해보기</button>
      </div>
    );
  }

  function renderAdmin() {
    if (adminScreen === "list") return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white">
          <h1 className="text-[17px] font-bold text-gray-900">행정 처리</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {ADMIN_TASKS.map(task => (
            <button
              key={task.id}
              onClick={() => { setSelectedTask(task); setAdminForm({}); setAdminScreen("form"); }}
              className="w-full bg-white rounded-xl p-4 text-left shadow-sm border border-gray-100 active:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{task.icon}</span>
                <span className="font-semibold text-gray-900 text-sm flex-1">{task.name}</span>
                <span className="text-gray-300">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );

    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
          <button onClick={() => setAdminScreen("list")} className="text-blue-500 text-sm font-medium">← 뒤로</button>
          <span className="text-sm font-semibold text-gray-900">{selectedTask?.icon} {selectedTask?.name}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-3">
          {selectedTask?.fields.map(field => (
            <div key={field.label}>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{field.label}</label>
              {field.type === "select" ? (
                <select
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={adminForm[field.label] ?? ""}
                  onChange={e => setAdminForm(prev => ({ ...prev, [field.label]: e.target.value }))}
                >
                  <option value="">선택하세요</option>
                  {field.options?.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={adminForm[field.label] ?? ""}
                  onChange={e => setAdminForm(prev => ({ ...prev, [field.label]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <div className="shrink-0 px-4 py-3 border-t border-gray-200 bg-white">
          <button
            onClick={() => {
              if (selectedTask?.id === "visa") {
                setAdminScreen("payment");
              } else {
                toast("접수가 완료되었습니다 🏛️", { description: "처리까지 약 5~7일 소요됩니다", duration: 3000 });
                setAdminScreen("list");
              }
            }}
            className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold"
          >제출하기</button>
        </div>
      </div>
    );

    if (adminScreen === "payment") return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
          <button onClick={() => setAdminScreen("form")} className="text-blue-500 text-sm font-medium">← 뒤로</button>
          <span className="text-sm font-semibold text-gray-900">💳 수수료 결제</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 bg-gray-50">
          <div className="bg-white rounded-2xl p-6 w-full shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-1">비자 연장 수수료</p>
            <p className="text-4xl font-bold text-gray-900 mb-1">₩120,000</p>
            <p className="text-xs text-gray-400">출입국관리사무소 공식 수수료</p>
          </div>
          <div className="w-full space-y-3">
            {["💳 카드 결제", "🏦 계좌이체"].map(method => (
              <button
                key={method}
                onClick={() => {
                  toast("결제 완료 ✅", { description: "비자 연장 신청이 접수되었습니다. 처리까지 약 2~3주 소요됩니다.", duration: 3500 });
                  setAdminScreen("list");
                }}
                className="w-full bg-white border border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-gray-800 hover:border-blue-300 transition-colors"
              >{method}</button>
            ))}
          </div>
        </div>
      </div>
    );

    return null;
  }

  /* ── Render ── */

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "apply",     label: "알바 지원", icon: "📋" },
    { id: "interview", label: "알바 면접", icon: "📞" },
    { id: "work",      label: "일하기",   icon: "💼" },
    { id: "admin",     label: "행정 처리", icon: "🏛️" },
  ];

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

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {activeTab === "apply"     && renderApply()}
              {activeTab === "interview" && renderInterview()}
              {activeTab === "work"      && renderWork()}
              {activeTab === "admin"     && renderAdmin()}
            </div>
          </div>

          <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[120px] h-[5px] bg-zinc-600 rounded-full" />
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-xs font-medium transition-colors ${
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
