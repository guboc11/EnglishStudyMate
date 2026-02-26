import CTAButton from "../CTAButton";

export default function HeroArrival() {
  return (
    <section className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-white to-slate-50 px-6 py-20 text-center">
      {/* Immigration badge */}
      <div className="mb-6 animate-fade-in">
        <span className="inline-block text-xs tracking-[0.3em] uppercase text-gray-400 border border-gray-200 rounded-full px-4 py-1.5">
          🇰🇷 입국 심사
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl mx-auto animate-fade-in">
        You just arrived in a world where everyone speaks Korean.
      </h1>

      {/* Subline */}
      <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-xl mx-auto animate-fade-in">
        No subtitles. No English menus. No shortcuts.
        <br className="hidden sm:block" />
        Just you — and an entire world waiting to be understood.
      </p>

      {/* Passport stamp divider */}
      <div className="my-10 flex items-center justify-center gap-3 animate-fade-in">
        <div className="h-px w-16 border-t border-dashed border-gray-300" />
        <div className="animate-stamp text-3xl opacity-70">🛂</div>
        <div className="h-px w-16 border-t border-dashed border-gray-300" />
      </div>

      {/* Kakao notification mockup */}
      <div className="animate-slide-up max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-kakao/20 flex items-center justify-center text-lg flex-shrink-0">
              👩
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">
                김수진 sent you a message
              </p>
              <p className="text-sm text-gray-500 font-korean mt-0.5">
                안녕! 이 동네 처음이지? 도와줄까? ^^
              </p>
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">
              now
            </span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-12 flex flex-col items-center gap-3 animate-fade-in">
        <CTAButton
          label="Enter the World"
          className="bg-navy text-white hover:bg-navy-dark"
        />
        <CTAButton
          label="Learn more first"
          variant="secondary"
          className="text-gray-400"
        />
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {[
            { label: "💬 채팅", id: "chat-list" },
            { label: "💼 업무", id: "work" },
            { label: "🏫 학교", id: "school" },
            { label: "🗂️ 복습", id: "review" },
            { label: "📝 시험", id: "exam" },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() =>
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-sm hover:border-gray-400 hover:text-gray-900 transition-colors shadow-sm"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
