'use client';

import { useMemo, useState } from 'react';

import { takeGems } from '@/actions/games/takeGems';
import { toast } from 'sonner';

import CardRow from '@/components/game/card-row';
import GemBank from '@/components/game/gem-bank';
import PlayerBar from '@/components/game/player-bar';
import GemChip from '@/components/shared/game/gem-chip';
import { Button } from '@/components/ui/button';

import { CARD_COLORS, type CardColor, type GemColor, type GemCounts } from '@/types/cards';
import type { FetchGameDataResponse } from '@/types/games';

import { BOARD_LEVELS, getPlayersInOrder } from '@/lib/games';

type GameBoardProps = {
  gameId: string;
  gameData: FetchGameDataResponse;
  currentPlayerId: string | null;
  onGameDataChange: (gameData: FetchGameDataResponse) => void;
};

const EMPTY_GEM_COUNTS: GemCounts = {
  black: 0,
  blue: 0,
  green: 0,
  red: 0,
  white: 0,
  gold: 0,
};

function getSelectedTotal(selectedGems: GemCounts) {
  return Object.values(selectedGems).reduce((total, count) => total + count, 0);
}

function isTakeableColor(color: GemColor): color is CardColor {
  return color !== 'gold';
}

function canAddGem(color: GemColor, selectedGems: GemCounts, gemsAvailable: GemCounts) {
  if (!isTakeableColor(color)) return false;
  if (gemsAvailable[color] - selectedGems[color] <= 0) return false;

  const selectedTotal = getSelectedTotal(selectedGems);
  if (selectedTotal >= 3) return false;

  if (selectedGems[color] === 1) {
    return selectedTotal === 1 && gemsAvailable[color] - 2 >= 2;
  }

  if (selectedGems[color] > 1) return false;

  return CARD_COLORS.every((gemColor) => selectedGems[gemColor] <= 1);
}

export default function GameBoard({
  gameId,
  gameData,
  currentPlayerId,
  onGameDataChange,
}: GameBoardProps) {
  const players = getPlayersInOrder(gameData);
  const [selectedGems, setSelectedGems] = useState<GemCounts>(EMPTY_GEM_COUNTS);
  const [isTakingGems, setIsTakingGems] = useState(false);

  const selectedGemEntries = useMemo(
    () =>
      CARD_COLORS.map((color) => ({
        color,
        count: selectedGems[color],
      })).filter(({ count }) => count > 0),
    [selectedGems],
  );
  const selectedTotal = getSelectedTotal(selectedGems);

  const handleGemClick = (color: GemColor) => {
    if (!canAddGem(color, selectedGems, gameData.gems_available)) return;

    setSelectedGems((current) => ({
      ...current,
      [color]: current[color] + 1,
    }));
  };

  const handleRemoveSelectedGem = (color: CardColor) => {
    setSelectedGems((current) => ({
      ...current,
      [color]: Math.max(0, current[color] - 1),
    }));
  };

  const handleClearSelection = () => {
    setSelectedGems({ ...EMPTY_GEM_COUNTS });
  };

  const handleTakeGems = async () => {
    if (!currentPlayerId || selectedTotal === 0) return;

    setIsTakingGems(true);
    try {
      const updatedGameData = await takeGems({
        game_id: gameId,
        player_id: currentPlayerId,
        selected_gems: selectedGems,
      });
      onGameDataChange(updatedGameData);
      handleClearSelection();
      toast.success('Gems taken');
    } catch (error) {
      console.error(error);
      toast.error('Could not take gems');
    } finally {
      setIsTakingGems(false);
    }
  };

  return (
    <div className="splendor-game-board">
      <PlayerBar players={players} currentPlayerId={currentPlayerId} />
      <GemBank
        gemsAvailable={gameData.gems_available}
        selectedGems={selectedGems}
        getGemDisabled={(color) =>
          isTakingGems ||
          !currentPlayerId ||
          !canAddGem(color, selectedGems, gameData.gems_available)
        }
        onGemClick={handleGemClick}
      />

      <section className="splendor-gem-selection" aria-label="Selected gems">
        <div className="splendor-gem-selection__content">
          <span className="splendor-gem-selection__label">Selected gems</span>
          <div className="splendor-gem-selection__chips">
            {selectedGemEntries.length > 0 ? (
              selectedGemEntries.map(({ color, count }) => (
                <button
                  key={color}
                  type="button"
                  className="splendor-gem-selection__chip"
                  aria-label={`Remove one selected ${color} gem`}
                  onClick={() => handleRemoveSelectedGem(color)}
                >
                  <GemChip color={color} count={count} />
                </button>
              ))
            ) : (
              <span className="splendor-gem-selection__empty">No gems selected</span>
            )}
          </div>
        </div>
        <div className="splendor-gem-selection__actions">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={selectedTotal === 0 || isTakingGems}
            onClick={handleClearSelection}
          >
            Clear
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!currentPlayerId || selectedTotal === 0 || isTakingGems}
            onClick={handleTakeGems}
          >
            Take
          </Button>
        </div>
      </section>

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
