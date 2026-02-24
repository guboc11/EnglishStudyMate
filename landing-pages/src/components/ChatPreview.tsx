interface Message {
  sender: "ai" | "user";
  text: string;
}

interface ChatPreviewProps {
  name?: string;
  messages?: Message[];
  theme?: "light" | "warm" | "dark";
  className?: string;
}

const defaultMessages: Message[] = [
  { sender: "ai", text: "오늘 뭐 했어? \u{1F60A}" },
  { sender: "user", text: "I went to a cafe!" },
  { sender: "ai", text: "오 진짜? 나도 카페 좋아해!\n무슨 커피 마셨어?" },
  { sender: "user", text: "Americano!" },
  { sender: "ai", text: "아 나도 아메리카노 좋아해 \u2615\n우리 취향 비슷하다 \u314E\u314E" },
];

const themes = {
  light: {
    container: "bg-white border border-gray-200 shadow-2xl",
    header: "bg-gray-50 border-b border-gray-200 text-gray-900",
    body: "bg-gray-50",
    aiBubble: "bg-white text-gray-900 shadow-sm border border-gray-100",
    userBubble: "bg-blue-500 text-white",
    avatar: "bg-blue-100 text-blue-600",
  },
  warm: {
    container: "bg-white border border-orange-100 shadow-2xl",
    header: "bg-orange-50 border-b border-orange-100 text-gray-900",
    body: "bg-orange-50/50",
    aiBubble: "bg-white text-gray-900 shadow-sm border border-orange-100",
    userBubble: "bg-orange-400 text-white",
    avatar: "bg-orange-100 text-orange-600",
  },
  dark: {
    container: "bg-gray-900 border border-gray-700 shadow-2xl shadow-purple-500/10",
    header: "bg-gray-800 border-b border-gray-700 text-white",
    body: "bg-gray-900",
    aiBubble: "bg-gray-800 text-gray-100 border border-gray-700",
    userBubble: "bg-purple-600 text-white",
    avatar: "bg-purple-900 text-purple-300",
  },
};

export default function ChatPreview({
  name = "Jieun",
  messages = defaultMessages,
  theme = "light",
  className = "",
}: ChatPreviewProps) {
  const t = themes[theme];

  return (
    <div
      className={`rounded-2xl overflow-hidden max-w-sm w-full mx-auto ${t.container} ${className}`}
    >
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-3 ${t.header}`}>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${t.avatar}`}
        >
          {name[0]}
        </div>
        <div>
          <div className="font-semibold text-sm">
            {name} <span className="ml-1">{"\uD83C\uDDF0\uD83C\uDDF7"}</span>
          </div>
          <div className="text-xs opacity-60">Online now</div>
        </div>
      </div>

      {/* Messages */}
      <div className={`px-4 py-4 space-y-3 ${t.body}`}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "ai" && (
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-1 shrink-0 ${t.avatar}`}
              >
                {name[0]}
              </div>
            )}
            <div
              className={`px-3.5 py-2.5 rounded-2xl max-w-[75%] text-sm leading-relaxed whitespace-pre-line ${
                msg.sender === "user" ? t.userBubble : t.aiBubble
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <div className="flex justify-start">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-1 shrink-0 ${t.avatar}`}
          >
            {name[0]}
          </div>
          <div
            className={`px-4 py-3 rounded-2xl ${t.aiBubble} flex items-center gap-1`}
          >
            <span className="w-1.5 h-1.5 bg-current rounded-full opacity-40 animate-bounce" />
            <span
              className="w-1.5 h-1.5 bg-current rounded-full opacity-40 animate-bounce"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="w-1.5 h-1.5 bg-current rounded-full opacity-40 animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
