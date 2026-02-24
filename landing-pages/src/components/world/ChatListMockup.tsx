import SectionWrapper from "./SectionWrapper";
import MockupFrame from "./MockupFrame";

interface ChatItem {
  name: string;
  message: string;
  time: string;
  unread?: number;
  online?: boolean;
  locked?: boolean;
  avatar: string;
}

const chats: ChatItem[] = [
  {
    name: "김수진",
    message: "야 밥 먹었어?",
    time: "방금",
    unread: 3,
    online: true,
    avatar: "👩",
  },
  {
    name: "박민호",
    message: "내일 알바 같이 할래?",
    time: "오후 2:30",
    unread: 1,
    avatar: "👨",
  },
  {
    name: "이하영",
    message: "ㅋㅋㅋ 진짜?",
    time: "오전 11:20",
    avatar: "👧",
  },
  {
    name: "편의점 사장님",
    message: "오늘 6시까지 와",
    time: "어제",
    unread: 1,
    avatar: "🧑‍💼",
  },
  {
    name: "동사무소",
    message: "서류 준비해서 오세요",
    time: "월",
    avatar: "🏛️",
  },
  {
    name: "???",
    message: "",
    time: "",
    locked: true,
    avatar: "🔒",
  },
];

export default function ChatListMockup() {
  return (
    <SectionWrapper id="chat-list" className="bg-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
        Your phone is already blowing up.
      </h2>
      <p className="text-center text-gray-500 mb-12 max-w-md mx-auto">
        Some speak English. Some don't. You'll have to figure it out.
      </p>

      <MockupFrame>
        {/* Chat app header */}
        <div className="bg-kakao px-4 py-3">
          <p className="text-sm font-bold text-amber-900">채팅</p>
        </div>

        {/* Chat list */}
        <div className="divide-y divide-gray-100">
          {chats.map((chat, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${
                chat.locked ? "opacity-40" : "hover:bg-gray-50"
              } transition-colors`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                  {chat.avatar}
                </div>
                {chat.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-online rounded-full border-2 border-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-sm text-gray-900 font-korean truncate">
                    {chat.name}
                  </p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2 font-korean">
                    {chat.time}
                  </span>
                </div>
                {chat.locked ? (
                  <div className="h-3 w-24 bg-gray-200 rounded mt-1" />
                ) : (
                  <p className="text-xs text-gray-500 truncate font-korean mt-0.5">
                    {chat.message}
                  </p>
                )}
              </div>

              {/* Unread badge */}
              {chat.unread && (
                <div className="w-5 h-5 rounded-full bg-unread text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </MockupFrame>
    </SectionWrapper>
  );
}
