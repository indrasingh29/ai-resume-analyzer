type ScoreRingProps = {
  score: number;
  size?: "sm" | "lg";
};

export function ScoreRing({ score, size = "lg" }: ScoreRingProps) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const dimensions = size === "lg" ? "h-32 w-32" : "h-20 w-20";
  const textSize = size === "lg" ? "text-3xl" : "text-xl";

  return (
    <div className={`relative ${dimensions}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="8"
          className="fill-none stroke-gray-200"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="fill-none stroke-mint transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${textSize} font-bold text-ink`}>{score}</span>
        <span className="text-xs font-medium uppercase text-gray-500">ATS</span>
      </div>
    </div>
  );
}
