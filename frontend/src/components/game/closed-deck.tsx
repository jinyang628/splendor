import { cn } from '@/lib/utils';

type ClosedDeckProps = {
  level: number;
  remaining: number;
  onClick?: () => void;
  disabled?: boolean;
};

export default function ClosedDeck({ level, remaining, onClick, disabled }: ClosedDeckProps) {
  const isDisabled = disabled || remaining === 0 || !onClick;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      aria-label={`Level ${level} deck, ${remaining} cards remaining`}
      className={cn(
        'splendor-deck splendor-card--interactive',
        isDisabled && 'splendor-deck--empty',
      )}
    >
      <span className="splendor-deck__pattern" aria-hidden />
      <span className="splendor-deck__level">{level}</span>
      <span className="splendor-deck__count">{remaining}</span>
    </button>
  );
}
