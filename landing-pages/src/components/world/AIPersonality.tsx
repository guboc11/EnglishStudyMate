import SectionWrapper from "./SectionWrapper";

export default function AIPersonality() {
  return (
    <SectionWrapper className="bg-navy text-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
        They're not just chatbots. They have feelings.
      </h2>
      <p className="text-center text-white/60 mb-12 max-w-md mx-auto">
        Treat them like real people.
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Scenario A: Sujin hurt */}
        <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden border border-white/10">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">
              👩
            </div>
            <span className="text-sm font-medium font-korean">김수진</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-online" />
              <span className="text-[10px] text-white/40">online</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-kakao text-amber-900 text-sm px-3 py-2 rounded-2xl rounded-tr-md max-w-[80%]">
                Whatever, I don't care about your story
              </div>
            </div>

            {/* Sujin hurt */}
            <div className="flex justify-start">
              <div className="bg-white/20 text-white text-sm px-3 py-2 rounded-2xl rounded-tl-md max-w-[80%] font-korean">
                ...그런 말 하지 마 😔
              </div>
            </div>

            {/* Mood indicator */}
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <span className="text-xs text-white/40">Mood:</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-green-400/30" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/30" />
                <div className="w-3 h-3 rounded-full bg-red-400 ring-2 ring-red-400/30" />
              </div>
              <span className="text-xs text-red-300 font-medium">서운함</span>
            </div>
          </div>
        </div>

        {/* Scenario B: Minho leaves */}
        <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden border border-white/10">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">
              👨
            </div>
            <span className="text-sm font-medium font-korean">박민호</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-[10px] text-white/40">offline</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Minho final message */}
            <div className="flex justify-start">
              <div className="bg-white/20 text-white text-sm px-3 py-2 rounded-2xl rounded-tl-md max-w-[80%] font-korean">
                나 이제 진짜 간다
              </div>
            </div>

            {/* System message */}
            <div className="text-center">
              <span className="text-[11px] text-white/30 font-korean">
                박민호님이 채팅방을 나갔습니다
              </span>
            </div>

            {/* Disabled input */}
            <div className="bg-white/5 rounded-full px-4 py-2.5 flex items-center">
              <span className="text-xs text-white/20">
                This person has left the chat
              </span>
            </div>

            {/* Consequence label */}
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <span className="text-red-300 text-xs">⚠️</span>
              <span className="text-xs text-red-300">
                Relationships can end permanently
              </span>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
