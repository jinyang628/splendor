import { cn } from '@/lib/utils';

type ClosedDeckProps = {
  level: number;
  remaining: number;
  onClick?: () => void;
};

export default function ClosedDeck({ level, remaining, onClick }: ClosedDeckProps) {
  return (
    <button
      type="button"
      disabled={remaining === 0}
      onClick={onClick}
      aria-label={`Level ${level} deck, ${remaining} cards remaining`}
      className={cn(
        'splendor-deck splendor-card--interactive',
        remaining === 0 && 'splendor-deck--empty',
      )}
    >
      <span className="splendor-deck__pattern" aria-hidden />
      <span className="splendor-deck__level">{level}</span>
      <span className="splendor-deck__count">{remaining}</span>
    </button>
  );
}
