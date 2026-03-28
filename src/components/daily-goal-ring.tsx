"use client";

type Props = {
  current: number;
  goal: number;
  size?: number;
};

export function DailyGoalRing({ current, goal, size = 100 }: Props) {
  const percent = Math.min(Math.round((current / goal) * 100), 100);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;
  const completed = current >= goal;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={8}
            className="text-muted"
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={completed ? "text-green-500" : "text-primary"}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-heading font-bold">
            {current}/{goal}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            chapters
          </span>
        </div>
      </div>
      {completed ? (
        <p className="text-xs font-medium text-green-600">Goal reached!</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {goal - current} more to go
        </p>
      )}
    </div>
  );
}
