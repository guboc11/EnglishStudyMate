import SectionWrapper from "./SectionWrapper";

interface Location {
  name: string;
  icon: string;
  x: number;
  y: number;
}

const locations: Location[] = [
  { name: "아파트", icon: "🏠", x: 50, y: 15 },
  { name: "편의점", icon: "🏪", x: 20, y: 35 },
  { name: "카페", icon: "☕", x: 80, y: 30 },
  { name: "식당", icon: "🍜", x: 35, y: 55 },
  { name: "동사무소", icon: "🏛️", x: 65, y: 55 },
  { name: "학교", icon: "🏫", x: 20, y: 75 },
  { name: "시험장", icon: "📝", x: 75, y: 80 },
];

const connections: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 6],
  [3, 4],
  [5, 6],
];

const stats = [
  { label: "소지금", value: "₩0", icon: "💰" },
  { label: "한국어 레벨", value: "없음", icon: "📊" },
  { label: "Day", value: "1", icon: "📅" },
];

export default function WorldOverview() {
  return (
    <SectionWrapper className="bg-navy text-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
        Welcome to the world.
      </h2>
      <p className="text-center text-white/60 mb-12 max-w-lg mx-auto">
        You're a foreigner in a Korean-speaking AI world. Your mission:
        survive, work, make friends, and pass the Korean Proficiency Test.
      </p>

      {/* Node map */}
      <div className="relative w-full max-w-lg mx-auto aspect-square mb-12">
        {/* SVG connections */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {connections.map(([a, b], i) => (
            <line
              key={i}
              x1={locations[a].x}
              y1={locations[a].y}
              x2={locations[b].x}
              y2={locations[b].y}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          ))}
        </svg>

        {/* Location nodes */}
        {locations.map((loc, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
          >
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-colors cursor-default">
              {loc.icon}
            </div>
            <span className="mt-1 text-[10px] text-white/70 font-korean">
              {loc.name}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 sm:gap-16">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-xl sm:text-2xl font-bold font-korean">
              {stat.value}
            </p>
            <p className="text-xs text-white/50 font-korean">{stat.label}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
