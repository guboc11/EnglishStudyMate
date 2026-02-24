interface MenuItem {
  name: string;
  price: string;
  selected?: boolean;
  quantity?: number;
}

interface KoreanMenuUIProps {
  items?: MenuItem[];
  className?: string;
}

const defaultItems: MenuItem[] = [
  { name: "부대찌개", price: "₩9,000", selected: true, quantity: 2 },
  { name: "김치찌개", price: "₩8,000", selected: true, quantity: 1 },
  { name: "된장찌개", price: "₩8,000" },
  { name: "순두부찌개", price: "₩8,500" },
  { name: "비빔밥", price: "₩7,500" },
  { name: "제육볶음", price: "₩9,500" },
];

export default function KoreanMenuUI({
  items = defaultItems,
  className = "",
}: KoreanMenuUIProps) {
  const total = items
    .filter((it) => it.selected)
    .reduce(
      (sum, it) =>
        sum +
        parseInt(it.price.replace(/[₩,]/g, "")) * (it.quantity || 1),
      0
    );

  return (
    <div
      className={`bg-amber-50 border-2 border-amber-800/20 rounded-xl p-4 w-full max-w-[300px] mx-auto ${className}`}
    >
      {/* Header */}
      <div className="text-center border-b border-amber-800/20 pb-3 mb-3">
        <p className="text-sm text-amber-800/60">김치찌개 식당</p>
        <p className="text-lg font-bold font-korean text-amber-900">메 뉴 판</p>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
              item.selected
                ? "bg-amber-200/60 ring-1 ring-amber-400"
                : "bg-white/50"
            }`}
          >
            <div className="flex items-center gap-2 font-korean">
              {item.selected && (
                <span className="text-green-600 text-xs font-bold">✓</span>
              )}
              <span className={item.selected ? "font-semibold" : ""}>
                {item.name}
              </span>
              {item.quantity && item.quantity > 1 && (
                <span className="text-xs text-amber-700">x{item.quantity}</span>
              )}
            </div>
            <span className="text-amber-800 font-medium">{item.price}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-amber-800/20 pt-3 flex justify-between items-center">
        <span className="text-sm font-korean text-amber-800">합계</span>
        <span className="text-lg font-bold text-amber-900">
          ₩{total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
