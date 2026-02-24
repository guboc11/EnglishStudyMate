interface PhoneCallOverlayProps {
  callerName: string;
  callerLabel?: string;
  className?: string;
}

export default function PhoneCallOverlay({
  callerName,
  callerLabel,
  className = "",
}: PhoneCallOverlayProps) {
  return (
    <div
      className={`rounded-2xl bg-gray-900 text-white p-6 w-[280px] sm:w-[320px] mx-auto shadow-2xl ${className}`}
    >
      {/* Incoming call label */}
      <p className="text-xs text-gray-400 text-center tracking-wider uppercase mb-4">
        Incoming call
      </p>

      {/* Caller avatar */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl animate-phone-ring">
          📞
        </div>
        <p className="text-lg font-semibold font-korean">{callerName}</p>
        {callerLabel && (
          <p className="text-xs text-gray-400">{callerLabel}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-10">
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-xl">
            ✕
          </div>
          <span className="text-[10px] text-gray-400">거절</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-xl">
            📞
            <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse-ring" />
          </div>
          <span className="text-[10px] text-gray-400">수락</span>
        </div>
      </div>
    </div>
  );
}
