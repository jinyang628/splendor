import CardRow from '@/components/game/card-row';
import GemBank from '@/components/game/gem-bank';
import PlayerBar from '@/components/game/player-bar';

import type { FetchGameDataResponse } from '@/types/games';

import { BOARD_LEVELS, getPlayersInOrder } from '@/lib/games';

type GameBoardProps = {
  gameData: FetchGameDataResponse;
  currentPlayerId: string | null;
};

export default function GameBoard({ gameData, currentPlayerId }: GameBoardProps) {
  const players = getPlayersInOrder(gameData);

  return (
    <div className="splendor-game-board">
      <PlayerBar players={players} currentPlayerId={currentPlayerId} />
      <GemBank gemsAvailable={gameData.gems_available} />

      <div className="splendor-card-board" aria-label="Development cards">
        {BOARD_LEVELS.map((level) => (
          <CardRow
            key={level}
            level={level}
            closedCards={gameData.closed[level] ?? []}
            openCards={gameData.open[level] ?? []}
          />
        ))}
      </div>
    </div>
  );
}
