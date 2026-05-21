import ClosedDeck from '@/components/game/closed-deck';
import GameCardView from '@/components/game/game-card';

import type { GameCard } from '@/types/games';

import type { BoardLevel } from '@/lib/games';

const OPEN_SLOTS = 4;

type CardRowProps = {
  level: BoardLevel;
  closedCards: GameCard[];
  openCards: GameCard[];
  onDeckClick?: () => void;
  onOpenCardClick?: (card: GameCard) => void;
};

export default function CardRow({
  level,
  closedCards,
  openCards,
  onDeckClick,
  onOpenCardClick,
}: CardRowProps) {
  const levelNumber = Number(level);
  const slots = Array.from({ length: OPEN_SLOTS }, (_, index) => openCards[index] ?? null);

  return (
    <div className="splendor-card-row" role="row" aria-label={`Level ${levelNumber} cards`}>
      <div className="splendor-card-row__cell" role="cell">
        <ClosedDeck level={levelNumber} remaining={closedCards.length} onClick={onDeckClick} />
      </div>
      {slots.map((card, index) => (
        <div
          key={card?.id ?? `empty-${level}-${index}`}
          className="splendor-card-row__cell"
          role="cell"
        >
          {card ? (
            <GameCardView
              card={card}
              onClick={onOpenCardClick ? () => onOpenCardClick(card) : undefined}
            />
          ) : (
            <div className="splendor-card-slot" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
