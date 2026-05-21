import GemChip from '@/components/shared/game/gem-chip';

import { GEM_COLORS } from '@/types/cards';

import type { PlayerInOrder } from '@/lib/games';
import { cn } from '@/lib/utils';

type PlayerBarProps = {
  players: PlayerInOrder[];
  currentPlayerId: string | null;
};

export default function PlayerBar({ players, currentPlayerId }: PlayerBarProps) {
  return (
    <ul className="splendor-player-bar" aria-label="Players in turn order">
      {players.map(({ playerId, position, nickname, gemsOwned }) => {
        const isCurrentUser = playerId === currentPlayerId;
        const ownedGems = GEM_COLORS.map((color) => ({
          color,
          count: gemsOwned[color],
        }));

        return (
          <li key={playerId}>
            <div
              className={cn('splendor-player-seat', isCurrentUser && 'splendor-player-seat--you')}
              aria-current={isCurrentUser ? 'true' : undefined}
            >
              <span className="splendor-player-seat__order">{position + 1}</span>
              <span className="splendor-player-seat__name">{nickname}</span>
              {isCurrentUser ? <span className="splendor-player-seat__badge">You</span> : null}
              <div className="splendor-player-seat__gems" aria-label={`${nickname}'s owned gems`}>
                {ownedGems.map(({ color, count }) => (
                  <span key={color} className="splendor-player-seat__gem">
                    <GemChip color={color} count={count} />
                    <span className="sr-only">
                      {count} {color} {count === 1 ? 'gem' : 'gems'}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
