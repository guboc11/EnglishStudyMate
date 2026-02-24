import SectionWrapper from "./SectionWrapper";
import MockupFrame from "./MockupFrame";

interface ChatMessage {
  sender: "sujin" | "user" | "system";
  text: string;
}

const messages: ChatMessage[] = [
  { sender: "sujin", text: "야~ 아까 편의점에서 봤지? ㅋㅋ" },
  { sender: "user", text: "Oh, you saw me? Haha sorry I was confused" },
  { sender: "sujin", text: "ㅋㅋ 괜찮아~ 한국어 할 줄 알아?" },
  { sender: "user", text: "A little... 조금?" },
  { sender: "sujin", text: "오 '조금'! 잘하네~ 👍" },
  { sender: "user", text: "감사합니다 ㅎㅎ" },
  { sender: "sujin", text: "와 발음 좋다!! 한국어 금방 잘하겠다 😄" },
];

const annotations = [
  { index: 0, text: "AI texts first" },
  { index: 2, text: "Gently pushes Korean" },
  { index: 6, text: "Celebrates your attempts" },
];

export default function ChatDetailMockup() {
  return (
    <SectionWrapper className="bg-slate-50">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
        They text you first. They have lives of their own.
      </h2>
      <p className="text-center text-gray-500 mb-12 max-w-lg mx-auto">
        Conversations happen naturally — just like with a real friend.
      </p>

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        {/* Phone mockup */}
        <MockupFrame>
          {/* Chat header */}
          <div className="bg-kakao px-4 py-3 flex items-center gap-3">
            <span className="text-lg">←</span>
            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-sm">
              👩
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 font-korean">
                김수진
              </p>
              <p className="text-[10px] text-amber-800/60">online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="p-3 space-y-2 bg-[#B2C7D9]/20">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-kakao text-amber-900 rounded-tr-md"
                      : "bg-white text-gray-800 rounded-tl-md shadow-sm"
                  } ${msg.sender === "sujin" ? "font-korean" : ""}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div className="border-t border-gray-200 px-3 py-2 flex items-center gap-2 bg-white">
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-400">
              Type a message...
            </div>
            <div className="w-8 h-8 bg-kakao rounded-full flex items-center justify-center text-sm">
              ↑
            </div>
          </div>
        </MockupFrame>

        {/* Annotation callouts - desktop only */}
        <div className="hidden lg:flex flex-col gap-6 pt-20 max-w-[200px]">
          {annotations.map((ann, i) => (
            <div
              key={i}
              className="flex items-start gap-2"
              style={{ marginTop: `${ann.index * 20}px` }}
            >
              <div className="w-2 h-2 rounded-full bg-navy mt-1.5 flex-shrink-0" />
              <p className="text-sm font-medium text-navy">{ann.text}</p>
            </div>
          ))}
        </div>

        {/* Mobile annotations */}
        <div className="flex lg:hidden flex-wrap justify-center gap-3 mt-4">
          {annotations.map((ann, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-navy/10 text-navy text-xs font-medium px-3 py-1.5 rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-navy" />
              {ann.text}
            </span>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
