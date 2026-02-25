import { useState } from "react";

type Screen = "list" | "chat" | "event";

type Message = {
  id: number;
  sender: "ai" | "user";
  text: string;
  time: string;
};

type Persona = {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: "online" | "busy" | "offline";
  intimacy: number;
};

const PERSONAS: Persona[] = [
  { id: 1, name: "김민준", role: "직장 동료", lastMessage: "내일 회의 있어요", time: "2분 전", unread: 3, status: "online", intimacy: 3 },
  { id: 2, name: "박서연", role: "이웃", lastMessage: "안녕하세요~", time: "1시간 전", unread: 0, status: "busy", intimacy: 2 },
  { id: 3, name: "이철수", role: "집주인", lastMessage: "월세 납부일...", time: "어제", unread: 1, status: "offline", intimacy: 1 },
];

const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: "ai", text: "내일 오전 10시에 팀 회의 있어요. 참석할 수 있어요?", time: "10:32" },
  { id: 2, sender: "user", text: "네, 참석할 수 있어요!", time: "10:45" },
  { id: 3, sender: "ai", text: "'참석할 수 있어요'가 맞아요. 잘 하셨어요! 그럼 내일 봬요~", time: "10:47" },
];

const STATUS_DOT: Record<Persona["status"], string> = {
  online: "bg-green-400",
  busy: "bg-red-400",
  offline: "bg-gray-400",
};

export default function ChatPrototype() {
  const [screen, setScreen] = useState<Screen>("list");
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [showEvent, setShowEvent] = useState(false);

  function openChat(persona: Persona) {
    setActivePersona(persona);
    setScreen("chat");
  }

  function sendMessage() {
    if (!input.trim() || waiting) return;
    const userMsg: Message = {
      id: messages.length + 1,
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setWaiting(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: messages.length + 2,
        sender: "ai",
        text: "알겠어요! 그럼 내일 회의실에서 봬요.",
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setWaiting(false);
      setShowEvent(true);
    }, 2000);
  }

  if (screen === "list") {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200 bg-white sticky top-0">
            <h1 className="text-lg font-bold text-gray-900">AI 세계 채팅</h1>
            <p className="text-xs text-gray-500 mt-0.5">채팅 프로토타입</p>
          </div>

          <div className="flex-1 divide-y divide-gray-100">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => openChat(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                    👤
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[p.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900 text-sm">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.time}</span>
                  </div>
                  <div className="text-xs text-gray-500">{p.role}</div>
                  <div className="text-sm text-gray-600 truncate mt-0.5">{p.lastMessage}</div>
                </div>
                {p.unread > 0 && (
                  <span className="shrink-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {p.unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 px-4 py-2 text-center text-xs text-gray-400">
            채팅 / 작업 / 강의 / 플래시카드
          </div>
        </div>
      </div>
    );
  }

  if (screen === "chat" && activePersona) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-white sticky top-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setScreen("list")} className="text-blue-500 text-sm">
                ← 뒤로
              </button>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">{activePersona.name}</div>
                <div className="text-xs text-gray-500">{activePersona.role}</div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`w-2 h-2 rounded-full ${i < activePersona.intimacy ? "bg-blue-400" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${msg.sender === "user" ? "bg-blue-500 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            {waiting && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-400"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || waiting}
                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-40"
              >
                ↑
              </button>
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {showEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl mx-6 p-6 text-center shadow-xl">
              <div className="text-4xl mb-3">✨</div>
              <div className="font-bold text-gray-900 mb-1">{activePersona.name}와 친해졌어요!</div>
              <div className="text-sm text-gray-600 mb-4">대화가 더 자연스러워졌습니다.</div>
              <button
                onClick={() => setShowEvent(false)}
                className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
