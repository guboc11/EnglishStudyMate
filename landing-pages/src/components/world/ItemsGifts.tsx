import SectionWrapper from "./SectionWrapper";
import MockupFrame from "./MockupFrame";

interface ShopItem {
  name: string;
  price: string;
  emoji: string;
  locked?: boolean;
}

const items: ShopItem[] = [
  { name: "커피", price: "₩3,000", emoji: "☕" },
  { name: "떡볶이", price: "₩4,500", emoji: "🍢" },
  { name: "인형", price: "₩12,000", emoji: "🧸" },
  { name: "편지", price: "₩1,000", emoji: "💌" },
  { name: "케이크", price: "₩15,000", emoji: "🎂" },
  { name: "꽃다발", price: "₩8,000", emoji: "💐" },
  { name: "귀걸이", price: "₩20,000", emoji: "✨" },
  { name: "책", price: "₩7,000", emoji: "📖" },
  { name: "???", price: "???", emoji: "🔒", locked: true },
];

export default function ItemsGifts() {
  return (
    <SectionWrapper className="bg-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
        Buy gifts. Build friendships.
      </h2>
      <p className="text-center text-gray-500 mb-12 max-w-md mx-auto">
        Spend your hard-earned won on people who matter.
      </p>

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        {/* Item shop mockup */}
        <MockupFrame>
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-400 to-orange-300 px-4 py-3 text-white">
            <p className="text-sm font-bold">아이템샵</p>
            <p className="text-[10px] opacity-80">선물로 마음을 전하세요</p>
          </div>

          {/* Balance */}
          <div className="px-4 py-2 bg-gray-50 flex items-center justify-between text-sm">
            <span className="text-gray-500 font-korean">소지금</span>
            <span className="font-bold text-gray-900">₩32,500</span>
          </div>

          {/* Item grid */}
          <div className="p-3 grid grid-cols-3 gap-2">
            {items.map((item, i) => (
              <div
                key={i}
                className={`rounded-xl border p-2.5 text-center transition-all ${
                  item.locked
                    ? "bg-gray-50 border-gray-100 opacity-40"
                    : "bg-white border-gray-200 hover:border-pink-300 hover:shadow-sm cursor-pointer"
                }`}
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <p className="text-[11px] font-medium text-gray-900 font-korean">
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-400">{item.price}</p>
              </div>
            ))}
          </div>

          {/* Gift button */}
          <div className="p-3">
            <button className="w-full bg-gradient-to-r from-pink-400 to-orange-300 text-white rounded-xl py-2.5 text-sm font-semibold shadow-sm">
              선물하기 🎁
            </button>
          </div>
        </MockupFrame>

        {/* Reaction preview */}
        <div className="max-w-[280px] space-y-4">
          <p className="text-sm text-gray-500 text-center lg:text-left">
            Send a gift and see how they react:
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            {/* System message */}
            <div className="text-center">
              <span className="text-[10px] text-gray-400 bg-white px-3 py-1 rounded-full font-korean">
                ☕ 커피를 선물했습니다
              </span>
            </div>

            {/* Sujin reaction */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm flex-shrink-0">
                👩
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 shadow-sm">
                <p className="text-sm font-korean">
                  헉 커피?! 고마워!! ☕💕
                </p>
              </div>
            </div>

            {/* Friendship indicator */}
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400">Friendship:</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-gradient-to-r from-pink-400 to-red-400 rounded-full" />
              </div>
              <span className="text-xs text-pink-500 font-medium">+5</span>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
