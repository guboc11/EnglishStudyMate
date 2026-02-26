import { useState } from "react";

interface WaitlistModalProps {
  onClose: () => void;
}

export default function WaitlistModal({ onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("https://formspree.io/f/xpqjbkwl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-xl leading-none"
        >
          ✕
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-4">🎉</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">You're on the list!</h2>
            <p className="text-sm text-gray-500">
              We'll let you know when the world opens its doors.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Enter the World</h2>
            <p className="text-sm text-gray-500 mb-6">
              Get early access when we launch. No spam, ever.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-navy transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-navy text-white rounded-xl py-3 text-sm font-semibold hover:bg-navy-dark transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "Submitting..." : "Join the Waitlist →"}
              </button>
            </form>

            {status === "error" && (
              <p className="text-xs text-red-500 mt-3 text-center">
                Something went wrong. Please try again.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
