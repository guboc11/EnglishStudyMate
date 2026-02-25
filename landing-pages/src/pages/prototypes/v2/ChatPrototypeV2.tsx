import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { toast, Toaster } from "sonner";

/* ───────── types ───────── */

type Msg = { sender: "ai" | "user"; text: string; time: string };
type DayGroup = { date: string; messages: Msg[] };

type Room = {
  id: string;
  name: string;
  role: string;
  color: string;
  initial: string;
  history: DayGroup[];
  incomingMsg?: string;
  incomingDelay?: number;
};


/* ───────── chat data ───────── */

const ROOMS: Room[] = [
  {
    id: "jiho",
    name: "박지호",
    role: "학교 친구",
    color: "bg-blue-500",
    initial: "지",
    incomingMsg: "야 오늘 학교 왔어? ㅋㅋ",
    incomingDelay: 1000,
    history: [
      {
        date: "3월 23일 (일)",
        messages: [
          { sender: "ai", text: "야 너 어제 온 새로운 애지? ㅋㅋ\n반가워~ 나 지호", time: "09:12" },
          { sender: "user", text: "네 안녕하세요! 저는 Alex예요", time: "09:30" },
          { sender: "ai", text: "ㅋㅋㅋ 여기선 반말 해도 돼\n우리 같은 반이니까", time: "09:31" },
          { sender: "user", text: "아... 반말? 알겠어", time: "09:45" },
          { sender: "ai", text: "ㅋㅋㅋ 어색하네\n괜찮아 천천히 해", time: "09:46" },
        ],
      },
      {
        date: "3월 24일 (월)",
        messages: [
          { sender: "ai", text: "야 오늘 학교 가야 돼\n1교시 김영희 선생님 수업이야", time: "08:55" },
          { sender: "user", text: "네 알겠어! 학교 어떻게 가?", time: "09:10" },
          { sender: "ai", text: "학교? 그냥 나가면 바로 보여\n같이 가자 5분 뒤에 나와", time: "09:11" },
          { sender: "ai", text: "점심 뭐 먹을 거야?\n학교 앞에 김밥 맛있는 데 있어", time: "12:30" },
          { sender: "user", text: "김밥? 좋아요... 좋아!", time: "12:42" },
          { sender: "ai", text: "ㅋㅋ 가자가자", time: "12:43" },
          { sender: "ai", text: "야 솔로지옥 봤어??", time: "19:20" },
          { sender: "user", text: "솔로지옥? 뭐야?", time: "19:55" },
          { sender: "ai", text: "넷플릭스 프로그램이야\n한국에서 완전 유명해\n같이 보자 재밌어 ㅋㅋ", time: "19:56" },
        ],
      },
      {
        date: "3월 25일 (화)",
        messages: [
          { sender: "user", text: "어제 솔로지옥 봤어. 재밌다!", time: "10:15" },
          { sender: "ai", text: "ㅋㅋㅋㅋ 그치??\n누가 제일 좋아?", time: "10:18" },
          { sender: "user", text: "음... 잘 모르겠어. 한국어 어려워서 ㅠ", time: "10:25" },
          { sender: "ai", text: "괜찮아 자막 켜고 봐\n나도 처음엔 다 못 알아들었어 ㅋㅋ\n(거짓말)", time: "10:26" },
        ],
      },
    ],
  },
  {
    id: "teacher",
    name: "김영희 선생님",
    role: "담당 선생님",
    color: "bg-emerald-600",
    initial: "김",
    incomingMsg: "숙제 제출 기한 내일까지입니다\n아직 제출하지 않은 학생은\n오늘 수업 후에 제출해 주세요",
    incomingDelay: 4000,
    history: [
      {
        date: "3월 24일 (월)",
        messages: [
          { sender: "ai", text: "안녕하세요, Alex 학생\n오늘부터 수업을 시작합니다\n교실은 1층 3번 교실이에요\n늦지 마세요 😊", time: "08:30" },
          { sender: "user", text: "네 선생님! 알겠습니다", time: "08:35" },
          { sender: "ai", text: "오늘 수업 잘 들었어요\n숙제를 내드릴게요\n\n📝 숙제:\n1. 자기소개 문장 3개 쓰기\n2. 오늘 배운 인사말 정리\n\n기한: 3월 26일 (수) 수업 전까지", time: "15:00" },
          { sender: "user", text: "네 선생님 감사합니다!", time: "15:10" },
          { sender: "ai", text: "혹시 모르는 것이 있으면\n언제든 물어보세요", time: "15:11" },
        ],
      },
      {
        date: "3월 25일 (화)",
        messages: [
          { sender: "ai", text: "오늘 수업 내용은\n\"장소 묻기와 대답하기\" 입니다\n\n\"어디에 있어요?\"\n\"~에 있어요\"\n\n이 표현을 잘 기억하세요", time: "09:00" },
          { sender: "ai", text: "오늘도 수고했어요\n내일 숙제 잊지 마세요!", time: "15:30" },
          { sender: "user", text: "선생님 질문이 있어요\n\"어디에\" 하고 \"어디\" 뭐가 달라요?", time: "15:45" },
          { sender: "ai", text: "좋은 질문이에요!\n\"어디\"는 장소 자체를 물을 때,\n\"어디에\"는 \"~에 있다\"와 함께 쓸 때 사용해요\n\n예시:\n\"학교가 어디에 있어요?\" ← 위치\n\"어디 가요?\" ← 방향\n\n내일 수업에서 더 자세히 알려줄게요 😊", time: "16:02" },
        ],
      },
    ],
  },
  {
    id: "sohee",
    name: "한소희",
    role: "알바 동료",
    color: "bg-orange-500",
    initial: "소",
    incomingMsg: "오늘 알바 같이 하지??\n오늘은 내가 계산대 알려줄게 💰",
    incomingDelay: 7000,
    history: [
      {
        date: "3월 25일 (화)",
        messages: [
          { sender: "ai", text: "안녕! 오늘 같이 알바하는 소희야~\n처음이지? 내가 알려줄게!", time: "14:50" },
          { sender: "user", text: "안녕! 고마워 ㅠㅠ 긴장돼", time: "15:00" },
          { sender: "ai", text: "ㅋㅋ 걱정 마\n사장님 좀 무뚝뚝한데 착한 분이야", time: "15:01" },
          { sender: "ai", text: "손님이 \"이거 데워주세요\" 하면\n전자레인지에 넣으면 돼\n\"감사합니다\" 하고 주면 끝!", time: "15:30" },
          { sender: "ai", text: "야 아까 그 손님\n\"봉투 주세요\" 했을 때\n잘 했어! 👏", time: "17:15" },
          { sender: "user", text: "진짜? 고마워!\n근데 \"봉투\" 뭐예요?", time: "17:20" },
          { sender: "ai", text: "plastic bag!\n비닐봉지라고도 해", time: "17:21" },
          { sender: "ai", text: "오늘 수고했어~\n첫날치곤 잘한 거야!\n내일도 같이 하지?", time: "19:10" },
          { sender: "user", text: "네 내일도 같이 해!", time: "19:15" },
        ],
      },
    ],
  },
  {
    id: "subin",
    name: "이수빈",
    role: "학교 친구",
    color: "bg-pink-500",
    initial: "수",
    history: [
      {
        date: "3월 23일 (일)",
        messages: [
          { sender: "ai", text: "안녕~! 나 수빈이야 ☺️\n새로 온 거 맞지?\n우리 반에서 외국인은 처음이라 신기해", time: "14:05" },
          { sender: "user", text: "안녕하세요! 네, 맞아요", time: "14:20" },
          { sender: "ai", text: "존댓말 안 해도 돼~ ㅎㅎ\n편하게 말해!", time: "14:21" },
          { sender: "ai", text: "참, 혹시 뭐 모르는 거 있으면 나한테 물어봐\n내가 도와줄게 💪", time: "14:22" },
          { sender: "user", text: "고마워! 여기 아직 잘 모르겠어", time: "14:35" },
          { sender: "ai", text: "당연하지~ 처음이니까!\n근데 여기 사람들 다 착해서 금방 적응할 거야", time: "14:36" },
        ],
      },
      {
        date: "3월 24일 (월)",
        messages: [
          { sender: "ai", text: "점심 먹었어?\n나 오늘 떡볶이 먹었는데 맛있었어 🤤", time: "13:10" },
          { sender: "user", text: "나는 김밥 먹었어! 지호랑", time: "13:28" },
          { sender: "ai", text: "오 지호랑? ㅋㅋ\n벌써 친해졌네~", time: "13:29" },
          { sender: "ai", text: "오늘 선생님 숙제 했어?\n나 아직 안 했는데 ㅠㅠ", time: "17:30" },
          { sender: "user", text: "숙제 어려워... 도와줄 수 있어?", time: "17:50" },
          { sender: "ai", text: "당연하지!\n내일 학교에서 같이 하자\n아침에 일찍 오면 돼 👍", time: "17:51" },
        ],
      },
      {
        date: "3월 25일 (화)",
        messages: [
          { sender: "user", text: "수빈아 오늘 학교 일찍 왔어!", time: "08:40" },
          { sender: "ai", text: "아 미안 ㅠㅠ 나 좀 늦을 것 같아\n10분만 기다려줘", time: "08:55" },
          { sender: "ai", text: "왔다!! 헉헉\n숙제 보여줘 내가 봐줄게", time: "09:10" },
          { sender: "ai", text: "오늘 카페 갔는데 딸기 라떼 맛있더라 🍓\n다음에 같이 가자!", time: "21:05" },
          { sender: "user", text: "네, 맞아요!", time: "21:30" },
        ],
      },
    ],
  },
  {
    id: "boss",
    name: "최사장님",
    role: "편의점 사장님",
    color: "bg-gray-600",
    initial: "최",
    history: [
      {
        date: "3월 24일 (월)",
        messages: [
          { sender: "ai", text: "Alex 씨\n내일부터 알바 시작할 수 있어요?\n시간은 오후 3시~7시", time: "10:00" },
          { sender: "user", text: "네! 할 수 있어요!", time: "10:15" },
          { sender: "ai", text: "좋아요\n편의점 주소 보내드릴게요\n시간 맞춰서 와요", time: "10:16" },
        ],
      },
      {
        date: "3월 25일 (화)",
        messages: [
          { sender: "ai", text: "오늘 3시까지 와요\n유니폼은 여기서 줄게요", time: "14:30" },
          { sender: "user", text: "네 알겠습니다!", time: "14:45" },
          { sender: "ai", text: "오늘 수고했어요\n내일도 같은 시간이에요", time: "19:05" },
        ],
      },
    ],
  },
  {
    id: "minwoo",
    name: "정민우",
    role: "개발 동아리",
    color: "bg-violet-600",
    initial: "민",
    history: [
      {
        date: "3월 24일 (월)",
        messages: [
          { sender: "ai", text: "야 너 개발 동아리 들어온 거 맞지?\n반가워~ 나 민우", time: "18:30" },
          { sender: "user", text: "네! 반가워요. 저 개발 좋아해요", time: "18:50" },
          { sender: "ai", text: "오 뭐 주로 해?\n프론트? 백엔드?", time: "18:51" },
          { sender: "user", text: "프론트엔드 해요. React", time: "19:05" },
          { sender: "ai", text: "오 나도 프론트!!\n여기 동아리에서 같이 프로젝트 하면 재밌겠다", time: "19:06" },
          { sender: "ai", text: "근데 한국어로 코딩 얘기하는 거\n좀 어색하지 않아? ㅋㅋ", time: "19:07" },
          { sender: "user", text: "ㅋㅋ 네 좀 어려워", time: "19:15" },
          { sender: "ai", text: "걱정 마 금방 익숙해져\n\"변수\" \"함수\" \"배열\" 이런 거\n한국어로도 알아두면 좋아", time: "19:16" },
        ],
      },
    ],
  },
  {
    id: "office",
    name: "구청 행정실",
    role: "외국인 민원실",
    color: "bg-slate-500",
    initial: "구",
    history: [
      {
        date: "3월 23일 (일)",
        messages: [
          { sender: "ai", text: "Alex 님, 안녕하세요.\n○○구청 외국인 민원실입니다.\n\n외국인등록증 발급 신청이\n접수되었습니다.\n\n📋 준비물:\n- 여권 사본\n- 증명사진 1매\n- 수수료 ₩30,000\n\n수령일: 3월 28일 (금)\n장소: 구청 1층 민원실\n시간: 09:00 ~ 18:00", time: "10:00" },
          { sender: "user", text: "감사합니다. 알겠습니다", time: "10:30" },
          { sender: "ai", text: "추가 문의사항이 있으시면\n이 채팅으로 문의해 주세요.", time: "10:31" },
        ],
      },
    ],
  },
];

/* ───────── helpers ───────── */

function getLastMsg(room: Room): { text: string; isUser: boolean } {
  const last = room.history[room.history.length - 1];
  if (!last) return { text: "", isUser: false };
  const msg = last.messages[last.messages.length - 1];
  if (!msg) return { text: "", isUser: false };
  return { text: msg.text.split("\n")[0], isUser: msg.sender === "user" };
}

function getLastTime(room: Room): string {
  switch (room.id) {
    case "jiho":    return "어제";
    case "teacher": return "어제";
    case "sohee":   return "어제";
    case "subin":   return "어제";
    case "boss":    return "어제";
    case "minwoo":  return "2일 전";
    case "office":  return "3일 전";
    default:        return "";
  }
}

/* ───────── component ───────── */

export default function ChatPrototypeV2() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [arrivedIds, setArrivedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Incoming message sequence
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    ROOMS.filter((r) => r.incomingDelay).forEach((room) => {
      timers.push(setTimeout(() => {
        setArrivedIds((prev) => new Set(prev).add(room.id));
        toast(room.incomingMsg!.split("\n")[0], {
          description: room.name,
          duration: 2000,
        });
      }, room.incomingDelay!));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Scroll to bottom on room open (instant, no animation)
  useLayoutEffect(() => {
    if (activeRoom) {
      chatEndRef.current?.scrollIntoView();
    }
  }, [activeRoom]);

  function openRoom(id: string) {
    setActiveRoom(id);
    setReadIds((prev) => new Set(prev).add(id));
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-zinc-800 flex items-center justify-center py-10">
      {/* Phone frame */}
      <div className="relative shrink-0" style={{ width: 375, height: 812 }}>

        {/* Bezel */}
        <div className="absolute inset-0 bg-zinc-900 rounded-[50px] shadow-2xl shadow-black/60 border border-zinc-700/50" />

        {/* Side buttons */}
        <div className="absolute -left-[3px] top-[108px] w-[3px] h-[30px] bg-zinc-700 rounded-l-sm" />
        <div className="absolute -left-[3px] top-[158px] w-[3px] h-[62px] bg-zinc-700 rounded-l-sm" />
        <div className="absolute -left-[3px] top-[232px] w-[3px] h-[62px] bg-zinc-700 rounded-l-sm" />
        <div className="absolute -right-[3px] top-[168px] w-[3px] h-[82px] bg-zinc-700 rounded-r-sm" />

        {/* Screen */}
        <div
          className="absolute inset-[10px] rounded-[42px] overflow-hidden flex flex-col bg-white"
          style={{ transform: "translateZ(0)" }}
        >
          {/* Sonner toasts — anchored inside phone frame */}
          <Toaster
            position="top-center"
            offset={56}
            toastOptions={{ style: { width: "350px", fontSize: "13px", marginLeft: "4px" } }}
          />

          {/* Status bar */}
          <div className="shrink-0 h-[52px] px-8 flex justify-between items-end pb-2 bg-white relative z-10">
            <span className="text-[13px] font-bold text-gray-900">9:41</span>
            <div className="flex items-center gap-2">
              {/* Signal bars */}
              <div className="flex items-end gap-[2px]">
                {[4, 7, 10, 13].map((h, i) => (
                  <div
                    key={i}
                    className={`w-[3px] bg-gray-900 rounded-[1px] ${i === 3 ? "opacity-25" : ""}`}
                    style={{ height: h }}
                  />
                ))}
              </div>
              {/* WiFi */}
              <svg width="16" height="12" viewBox="0 0 16 12" className="text-gray-900" fill="currentColor">
                <circle cx="8" cy="11" r="1.3" />
                <path d="M4.8 8C5.7 7.1 6.8 6.6 8 6.6s2.3.5 3.2 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M2 5.2C3.5 3.7 5.6 2.8 8 2.8s4.5.9 6 2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.35" />
              </svg>
              {/* Battery */}
              <div className="flex items-center">
                <div className="w-[22px] h-[11px] border border-gray-900 rounded-[2px] p-[1.5px]">
                  <div className="w-[14px] h-full bg-gray-900 rounded-[1px]" />
                </div>
                <div className="w-[2px] h-[5px] bg-gray-900 rounded-r-[1px]" />
              </div>
            </div>
          </div>

          {/* Dynamic Island */}
          <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-zinc-900 rounded-full z-20 pointer-events-none" />

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">

            {activeRoom ? (
              /* ── Chat Room ── */
              (() => {
                const room = ROOMS.find((r) => r.id === activeRoom)!;
                const hasToday = arrivedIds.has(room.id) && !!room.incomingMsg;
                return (
                  <div className="flex flex-col h-full">
                    {/* Room header */}
                    <div className="shrink-0 px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
                      <button
                        onClick={() => setActiveRoom(null)}
                        className="text-blue-500 text-sm font-medium"
                      >
                        ← 뒤로
                      </button>
                      <div className={`w-8 h-8 rounded-full ${room.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {room.initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">{room.name}</div>
                        <div className="text-xs text-gray-400">{room.role}</div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#f5f5f0]">
                      {room.history.map((day, di) => (
                        <div key={di}>
                          <div className="flex justify-center mb-3">
                            <span className="bg-gray-300/60 text-gray-600 text-[11px] px-3 py-1 rounded-full">
                              {day.date}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {day.messages.map((msg, mi) => (
                              <div key={mi} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.sender === "ai" && (
                                  <div className={`w-7 h-7 rounded-full ${room.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-2 mt-0.5`}>
                                    {room.initial}
                                  </div>
                                )}
                                <div className="max-w-[72%]">
                                  {msg.sender === "ai" && (
                                    <div className="text-[11px] text-gray-500 mb-0.5 ml-1">{room.name}</div>
                                  )}
                                  <div className={`flex items-end gap-1.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                                    <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                                      msg.sender === "user"
                                        ? "bg-blue-500 text-white rounded-br-sm"
                                        : "bg-white text-gray-900 rounded-bl-sm shadow-sm"
                                    }`}>
                                      {msg.text}
                                    </div>
                                    <span className="text-[10px] text-gray-400 shrink-0">{msg.time}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Today's message */}
                      {hasToday && (
                        <div>
                          <div className="flex justify-center mb-3">
                            <span className="bg-gray-300/60 text-gray-600 text-[11px] px-3 py-1 rounded-full">
                              3월 26일 (수) — 오늘
                            </span>
                          </div>
                          <div className="flex justify-start">
                            <div className={`w-7 h-7 rounded-full ${room.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-2 mt-0.5`}>
                              {room.initial}
                            </div>
                            <div className="max-w-[72%]">
                              <div className="text-[11px] text-gray-500 mb-0.5 ml-1">{room.name}</div>
                              <div className="flex items-end gap-1.5">
                                <div className="bg-white text-gray-900 rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed whitespace-pre-line shadow-sm">
                                  {room.incomingMsg}
                                </div>
                                <span className="text-[10px] text-gray-400 shrink-0">방금</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="shrink-0 px-3 py-3 border-t border-gray-200 bg-white flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none"
                        readOnly
                      />
                      <button className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm shrink-0">
                        ↑
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* ── Chat List ── */
              <div className="flex flex-col h-full">
                {/* List header */}
                <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white">
                  <h1 className="text-[17px] font-bold text-gray-900">채팅</h1>
                </div>

                {/* Rooms */}
                <div className="flex-1 overflow-y-auto">
                  {ROOMS.map((room) => {
                    const hasUnread = arrivedIds.has(room.id) && !readIds.has(room.id);
                    const last = hasUnread && room.incomingMsg
                      ? { text: room.incomingMsg.split("\n")[0], isUser: false }
                      : getLastMsg(room);
                    const time = hasUnread ? "방금" : getLastTime(room);

                    return (
                      <button
                        key={room.id}
                        onClick={() => openRoom(room.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-100 transition-colors ${
                          hasUnread ? "bg-blue-50/40" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full ${room.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                          {room.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <span className={`text-sm font-semibold ${hasUnread ? "text-gray-900" : "text-gray-800"}`}>
                              {room.name}
                            </span>
                            <span className={`text-[11px] shrink-0 ml-2 ${hasUnread ? "text-blue-500 font-medium" : "text-gray-400"}`}>
                              {time}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mb-0.5">{room.role}</div>
                          <div className={`text-[13px] truncate ${hasUnread ? "font-medium text-gray-800" : "text-gray-500"}`}>
                            {last.isUser && <span className="text-gray-400 font-normal">나: </span>}
                            {last.text}
                          </div>
                        </div>
                        {hasUnread && (
                          <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                            1
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab bar */}
                <div className="shrink-0 border-t border-gray-200 bg-white px-2 py-2">
                  <div className="flex justify-around">
                    {[
                      { icon: "💬", label: "채팅", active: true },
                      { icon: "💼", label: "알바", active: false },
                      { icon: "📝", label: "시험", active: false },
                      { icon: "📚", label: "강의", active: false },
                      { icon: "🔄", label: "복습", active: false },
                    ].map((tab) => (
                      <div key={tab.label} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${tab.active ? "text-blue-500" : "text-gray-400"}`}>
                        <span className="text-xl">{tab.icon}</span>
                        <span className="text-[10px] font-medium">{tab.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Home bar */}
        <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[120px] h-[5px] bg-zinc-600 rounded-full" />
      </div>
    </div>
  );
}
