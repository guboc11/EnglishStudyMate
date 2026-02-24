import { ReactNode } from "react";

interface MockupFrameProps {
  children: ReactNode;
  className?: string;
}

export default function MockupFrame({ children, className = "" }: MockupFrameProps) {
  return (
    <div
      className={`mx-auto w-[320px] sm:w-[360px] rounded-[2.5rem] border-[6px] border-gray-800 bg-white shadow-2xl overflow-hidden ${className}`}
    >
      {/* Notch */}
      <div className="relative bg-gray-800 h-7 flex items-end justify-center">
        <div className="w-28 h-5 bg-gray-800 rounded-b-2xl" />
      </div>
      {/* Screen content */}
      <div className="bg-white min-h-[500px] max-h-[600px] overflow-y-auto">
        {children}
      </div>
      {/* Home indicator */}
      <div className="bg-white py-2 flex justify-center">
        <div className="w-28 h-1 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}
