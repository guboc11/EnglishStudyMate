interface CTAButtonProps {
  label: string;
  sublabel?: string;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
}

export default function CTAButton({
  label,
  sublabel,
  variant = "primary",
  className = "",
  onClick,
}: CTAButtonProps) {
  const base =
    "rounded-xl font-semibold transition-all duration-200 cursor-pointer text-center";
  const variants = {
    primary: "px-8 py-4 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    secondary: "px-6 py-3 text-sm underline underline-offset-4 hover:opacity-80",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      <span>{label}</span>
      {sublabel && (
        <span className="block text-xs font-normal opacity-80 mt-1">
          {sublabel}
        </span>
      )}
    </button>
  );
}
