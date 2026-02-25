import { useState } from "react";

type Screen = "home" | "front" | "back" | "done" | "missed";

type Card = {
  id: number;
  front: string;
  back: string;
  meaning: string;
  example: string;
};

type Deck = {
  id: number;
  title: string;
  count: number;
  lastReview: string;
};

const ALL_CARDS: Card[] = [
  { id: 1, front: "보고드리다", back: "보고드리다", meaning: "격식을 갖춰 보고할 때 쓰는 표현", example: "팀장님, 결과를 보고드립니다." },
  { id: 2, front: "말씀드리다", back: "말씀드리다", meaning: "격식체로 '말하다'의 높임 표현", example: "한 가지 말씀드릴게요." },
  { id: 3, front: "확인해 주시겠어요?", back: "확인해 주시겠어요?", meaning: "정중한 확인 요청 표현", example: "이 서류 확인해 주시겠어요?" },
  { id: 4, front: "죄송합니다", back: "죄송합니다", meaning: "격식체 사과 표현", example: "늦어서 죄송합니다." },
];

const DECKS: Deck[] = [
  { id: 1, title: "직장 한국어", count: 45, lastReview: "어제" },
  { id: 2, title: "생활 표현", count: 32, lastReview: "3일 전" },
];

type Rating = "again" | "hard" | "good" | "easy";

const RATING_STYLES: Record<Rating, string> = {
  again: "border-red-200 bg-red-50 text-red-600",
  hard: "border-orange-200 bg-orange-50 text-orange-600",
  good: "border-blue-200 bg-blue-50 text-blue-600",
  easy: "border-green-200 bg-green-50 text-green-600",
};

const RATING_LABELS: Record<Rating, string> = {
  again: "다시",
  hard: "어려움",
  good: "보통",
  easy: "쉬움",
};

export default function FlashcardPrototype() {
  const [screen, setScreen] = useState<Screen>("home");
  const [queue, setQueue] = useState<Card[]>([...ALL_CARDS]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<number, Rating>>({});
  const [missedCards, setMissedCards] = useState<Card[]>([]);

  const currentCard = queue[currentIndex] ?? null;
  const progress = currentIndex;
  const total = queue.length;

  function startSession() {
    setQueue([...ALL_CARDS]);
    setCurrentIndex(0);
    setRatings({});
    setMissedCards([]);
    setScreen("front");
  }

  function flipCard() {
    setScreen("back");
  }

  function rateCard(rating: Rating) {
    if (!currentCard) return;
    setRatings((prev) => ({ ...prev, [currentCard.id]: rating }));

    if (rating === "again" || rating === "hard") {
      setMissedCards((prev) => [...prev, currentCard]);
    }

    if (currentIndex + 1 >= queue.length) {
      setScreen("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setScreen("front");
    }
  }

  const ratingCounts = {
    easy: Object.values(ratings).filter((r) => r === "easy").length,
    good: Object.values(ratings).filter((r) => r === "good").length,
    hard: Object.values(ratings).filter((r) => r === "hard" || r === "again").length,
  };

  if (screen === "home") {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200 bg-white sticky top-0">
            <h1 className="text-lg font-bold text-gray-900">플래시카드</h1>
            <p className="text-xs text-gray-500 mt-0.5">플래시카드 프로토타입</p>
          </div>

          <div className="flex-1 px-4 py-5 space-y-5">
            {/* Streak */}
            <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <div className="font-bold text-orange-700">7일 연속 학습 중!</div>
                <div className="text-xs text-orange-500">오늘도 복습하면 8일!</div>
              </div>
            </div>

            {/* Today's review */}
            <div className="bg-blue-500 rounded-2xl p-5 text-white">
              <div className="text-sm font-medium mb-1">오늘 복습</div>
              <div className="text-3xl font-bold mb-3">📚 {ALL_CARDS.length}장 남음</div>
              <button
                onClick={startSession}
                className="w-full bg-white text-blue-500 font-bold py-2.5 rounded-xl text-sm"
              >
                지금 시작하기
              </button>
            </div>

            {/* Decks */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">내 덱</div>
              <div className="space-y-2">
                {DECKS.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={startSession}
                    className="w-full text-left border border-gray-200 rounded-xl p-3 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{deck.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{deck.count}장 · 마지막 복습: {deck.lastReview}</div>
                      </div>
                      <span className="text-gray-300">→</span>
                    </div>
                  </button>
                ))}
                <button className="w-full border-2 border-dashed border-gray-200 rounded-xl p-3 text-gray-400 text-sm font-medium">
                  + 새 덱 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if ((screen === "front" || screen === "back") && currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
            <button onClick={() => setScreen("home")} className="text-blue-500 text-sm">← 그만두기</button>
            <span className="text-sm text-gray-500 ml-auto">{progress + 1} / {total}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-1 bg-blue-500 transition-all"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>

          {/* Card */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <button
              onClick={screen === "front" ? flipCard : undefined}
              className={`w-full rounded-3xl border-2 p-8 text-center transition-all ${screen === "front" ? "border-gray-200 hover:border-blue-300 cursor-pointer" : "border-blue-200 bg-blue-50"}`}
            >
              <div className="text-3xl font-bold text-gray-900 mb-2">{currentCard.front}</div>
              {screen === "back" && (
                <>
                  <div className="w-16 h-0.5 bg-blue-200 mx-auto my-4" />
                  <div className="text-sm text-gray-600 leading-relaxed">{currentCard.meaning}</div>
                  <div className="mt-3 bg-white rounded-xl px-4 py-3">
                    <div className="text-xs text-gray-400 mb-1">예문</div>
                    <div className="text-sm text-gray-700 italic">"{currentCard.example}"</div>
                  </div>
                </>
              )}
            </button>

            {screen === "front" && (
              <p className="mt-6 text-sm text-gray-400">탭해서 뒤집기 👆</p>
            )}
          </div>

          {/* Rating buttons */}
          {screen === "back" && (
            <div className="px-4 py-5 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center mb-3">얼마나 잘 기억했나요?</div>
              <div className="grid grid-cols-4 gap-2">
                {(["again", "hard", "good", "easy"] as Rating[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => rateCard(r)}
                    className={`border-2 rounded-xl py-3 text-xs font-semibold ${RATING_STYLES[r]}`}
                  >
                    {RATING_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "done") {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-full max-w-sm bg-white mx-4 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎊</div>
            <div className="text-xl font-bold text-gray-900">오늘 복습 완료!</div>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex justify-between items-center bg-green-50 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-700">✅ 쉬움</span>
              <span className="font-bold text-green-600">{ratingCounts.easy}장</span>
            </div>
            <div className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-700">🟡 보통</span>
              <span className="font-bold text-blue-600">{ratingCounts.good}장</span>
            </div>
            <div className="flex justify-between items-center bg-red-50 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-700">🔴 어려움</span>
              <span className="font-bold text-red-600">{ratingCounts.hard}장</span>
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl px-4 py-3 text-center mb-6">
            <div className="text-sm text-orange-600 font-bold">🔥 8일 연속 학습!</div>
          </div>

          <div className="space-y-2">
            {missedCards.length > 0 && (
              <button
                onClick={() => setScreen("missed")}
                className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm"
              >
                어려웠던 카드 보기 ({missedCards.length})
              </button>
            )}
            <button onClick={() => setScreen("home")} className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm">
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "missed") {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
            <button onClick={() => setScreen("done")} className="text-blue-500 text-sm">← 뒤로</button>
            <span className="font-semibold text-gray-900 text-sm">다시 볼 표현 ({missedCards.length})</span>
          </div>

          <div className="flex-1 px-4 py-4 space-y-2">
            {missedCards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-xl p-4">
                <div className="font-bold text-gray-900 text-sm">{card.front}</div>
                <div className="text-xs text-gray-500 mt-1">{card.meaning}</div>
              </div>
            ))}
          </div>

          <div className="px-4 py-4 border-t border-gray-200">
            <button onClick={startSession} className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm">
              다시 복습하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
