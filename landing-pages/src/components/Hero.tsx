import { ReactNode } from "react";

interface HeroProps {
  headline: string;
  subline: string;
  children?: ReactNode;
  className?: string;
}

export default function Hero({
  headline,
  subline,
  children,
  className = "",
}: HeroProps) {
  return (
    <section
      className={`min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center ${className}`}
    >
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight max-w-3xl">
        {headline}
      </h1>
      <p className="mt-6 text-lg sm:text-xl max-w-xl opacity-80 leading-relaxed">
        {subline}
      </p>
      {children}
    </section>
  );
}
