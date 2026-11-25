import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserScoreTileProps = {
  name: string;
  score: number;
  overall?: boolean;
  onOpen: () => void;
};

export default function UserScoreTile({ name, score, overall = false, onOpen }: UserScoreTileProps) {
  const caution = score < 70;
  return (
    <article className={`flex min-w-0 flex-col items-center rounded-lg border border-portal-border/40 bg-portal-panel px-3 shadow-score-tile ${overall ? "min-h-[264px] py-5" : "min-h-[176px] py-4"}`}>
      <h4 className={`flex w-full items-center justify-center text-center font-semibold ${overall ? "text-lg" : "min-h-8 text-xs"}`}>{name}</h4>
      {overall && <p className="mt-1 text-xs font-semibold">Overall</p>}
      <svg viewBox="0 0 80 80" className={`my-2 h-20 w-20 shrink-0 ${caution ? "text-score-caution" : "text-score-good"}`} role="img" aria-label={`${name} example score ${score}`}>
        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" className={caution ? "text-score-caution-track" : "text-score-good-track"} strokeWidth="7" />
        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="7" pathLength="100" strokeDasharray={`${score} 100`} transform="rotate(-90 40 40)" />
        <text x="40" y="46" textAnchor="middle" fill="currentColor" className="text-xl font-bold">{score}</text>
      </svg>
      {overall && <p className="mb-3 max-w-32 text-center text-[11px] leading-tight text-portal-muted">An overall indication of driving risk based on five key driver score influences.</p>}
      <Button variant="link" size="sm" className="mt-auto h-auto gap-0 p-0 text-xs font-semibold" onClick={onOpen}>View details<ChevronRight className="h-3 w-3" /></Button>
    </article>
  );
}