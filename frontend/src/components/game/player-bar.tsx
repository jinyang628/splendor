import type { ReactNode } from 'react';

import GemChip from '@/components/shared/game/gem-chip';

import type { CardColor, GemColor } from '@/types/cards';

import type { PlayerInOrder } from '@/lib/games';
import { cn } from '@/lib/utils';

const RESOURCE_TRACK_COLORS = [
  'white',
  'blue',
  'green',
  'red',
  'black',
  'gold',
] as const satisfies readonly GemColor[];

type PlayerBarProps = {
  players: PlayerInOrder[];
  currentPlayerId: string | null;
  currentTurnPlayerId: string | null;
  reservedCardsControl?: ReactNode;
};

export default function PlayerBar({
  players,
  currentPlayerId,
  currentTurnPlayerId,
  reservedCardsControl,
}: PlayerBarProps) {
  return (
    <ul className="splendor-player-bar" aria-label="Players in turn order">
      {players.map(
        ({ playerId, position, nickname, points, gemsOwned, reservedCards, purchasedCards }) => {
          const isCurrentUser = playerId === currentPlayerId;
          const isCurrentTurn = playerId === currentTurnPlayerId;
          const getPermanentCount = (color: CardColor) =>
            purchasedCards.filter((card) => card.color === color).length;

          return (
            <li key={playerId}>
              <div
                className={cn(
                  'splendor-player-seat',
                  isCurrentUser && 'splendor-player-seat--you',
                  isCurrentTurn && 'splendor-player-seat--turn',
                )}
                aria-current={isCurrentTurn ? 'step' : isCurrentUser ? 'true' : undefined}
              >
                <span className="splendor-player-seat__order">{position}</span>
                <span className="splendor-player-seat__name">{nickname}</span>
                <span className="splendor-player-seat__points">
                  {points} {points === 1 ? 'point' : 'points'}
                </span>
                {isCurrentUser ? <span className="splendor-player-seat__badge">You</span> : null}
                <div
                  className="splendor-player-seat__resources"
                  aria-label={`${nickname}'s cards and gems`}
                >
                  {RESOURCE_TRACK_COLORS.map((color) => {
                    const cardCount =
                      color === 'gold' ? reservedCards.length : getPermanentCount(color);
                    const cardLabel =
                      color === 'gold'
                        ? `${cardCount} reserved ${cardCount === 1 ? 'card' : 'cards'}`
                        : `${cardCount} permanent ${color} ${cardCount === 1 ? 'card' : 'cards'}`;

                    return (
                      <div key={color} className="splendor-player-seat__resource-column">
                        <span
                          data-gem={color}
                          className={cn(
                            'splendor-player-seat__card-count',
                            color === 'gold' && 'splendor-player-seat__card-count--reserved',
                          )}
                          aria-hidden
                        >
                          {cardCount > 0 ? cardCount : null}
                        </span>
                        <span className="sr-only">{cardLabel}</span>
                        <span className="splendor-player-seat__gem">
                          <GemChip color={color} count={gemsOwned[color]} />
                          <span className="sr-only">
                            {gemsOwned[color]} {color} {gemsOwned[color] === 1 ? 'gem' : 'gems'}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
                {isCurrentUser && reservedCardsControl ? (
                  <div className="splendor-player-seat__reserved-action">
                    {reservedCardsControl}
                  </div>
                ) : null}
              </div>
            </li>
          );
        },
      )}
    </ul>
  );
}
