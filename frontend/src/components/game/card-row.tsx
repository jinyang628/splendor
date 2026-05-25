import type { ReactNode } from 'react';

import ClosedDeck from '@/components/game/closed-deck';
import GameCardView from '@/components/game/game-card';

import type { GameCard } from '@/types/games';

import type { BoardLevel } from '@/lib/games';
import { cn } from '@/lib/utils';

const OPEN_SLOTS = 4;

type CardRowProps = {
  level: BoardLevel;
  closedCards: GameCard[];
  openCards: (GameCard | null)[];
  onDeckClick?: () => void;
  onOpenCardClick?: (card: GameCard) => void;
  isInteractionDisabled?: boolean;
  highlightedDeck?: boolean;
  highlightedOpenIndex?: number | null;
  renderDeckMenu?: () => ReactNode;
  renderOpenCardMenu?: (card: GameCard) => ReactNode;
};

export default function CardRow({
  level,
  closedCards,
  openCards,
  onDeckClick,
  onOpenCardClick,
  isInteractionDisabled,
  highlightedDeck,
  highlightedOpenIndex,
  renderDeckMenu,
  renderOpenCardMenu,
}: CardRowProps) {
  const levelNumber = Number(level);
  const slots = Array.from({ length: OPEN_SLOTS }, (_, index) => openCards[index] ?? null);

  return (
    <div className="splendor-card-row" role="row" aria-label={`Level ${levelNumber} cards`}>
      <div
        className={cn(
          'splendor-card-row__cell',
          highlightedDeck && 'splendor-card-row__cell--reserved-highlight',
        )}
        role="cell"
      >
        <ClosedDeck
          level={levelNumber}
          remaining={closedCards.length}
          onClick={onDeckClick}
          disabled={isInteractionDisabled}
        />
        {renderDeckMenu?.()}
      </div>
      {slots.map((card, index) => (
        <div
          key={card?.id ?? `empty-${level}-${index}`}
          className={cn(
            'splendor-card-row__cell',
            highlightedOpenIndex === index && 'splendor-card-row__cell--reserved-highlight',
          )}
          role="cell"
        >
          {card ? (
            <>
              <GameCardView
                card={card}
                onClick={
                  onOpenCardClick && !isInteractionDisabled
                    ? () => onOpenCardClick(card)
                    : undefined
                }
              />
              {renderOpenCardMenu?.(card)}
            </>
          ) : (
            <div className="splendor-card-slot" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
