import type { PlayerInOrder } from '@/lib/games';
import { cn } from '@/lib/utils';

type PlayerBarProps = {
  players: PlayerInOrder[];
  currentPlayerId: string | null;
};

export default function PlayerBar({ players, currentPlayerId }: PlayerBarProps) {
  return (
    <ul className="splendor-player-bar" aria-label="Players in turn order">
      {players.map(({ playerId, position, nickname }) => {
        const isCurrentUser = playerId === currentPlayerId;

        return (
          <li key={playerId}>
            <div
              className={cn('splendor-player-seat', isCurrentUser && 'splendor-player-seat--you')}
              aria-current={isCurrentUser ? 'true' : undefined}
            >
              <span className="splendor-player-seat__order">{position + 1}</span>
              <span className="splendor-player-seat__name">{nickname}</span>
              {isCurrentUser ? <span className="splendor-player-seat__badge">You</span> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
