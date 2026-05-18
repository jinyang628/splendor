import z from 'zod';

import GemChip from '@/components/shared/game/gem-chip';

import { cardDataSchema, getNonZeroGemCosts } from '@/types/game/cards';

import { cn } from '@/lib/utils';

type CardProps = z.infer<typeof cardDataSchema> & {
  className?: string;
  onClick?: () => void;
};

export default function Card({
  color,
  pointValues,
  black,
  blue,
  green,
  red,
  white,
  className,
  onClick,
}: CardProps) {
  const costEntries = getNonZeroGemCosts({ black, blue, green, red, white });

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-color={color}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn('splendor-card', onClick && 'splendor-card--interactive', className)}
    >
      <div className="splendor-card__stripe" aria-hidden />

      <header className="splendor-card__header">
        <div className="splendor-card__points-wrap">
          {pointValues > 0 ? (
            <span className="splendor-card__points">{pointValues}</span>
          ) : (
            <span className="splendor-card__points splendor-card__points--empty" aria-hidden />
          )}
        </div>

        <GemChip color={color} prominent />
      </header>

      <footer className="splendor-card__footer">
        <div className="splendor-card__costs">
          {costEntries.map(({ gem, count }) => (
            <GemChip key={gem} color={gem} count={count} />
          ))}
        </div>
      </footer>
    </div>
  );
}
