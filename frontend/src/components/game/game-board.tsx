'use client';

import { useEffect, useMemo, useState } from 'react';

import { discardGems } from '@/actions/games/discardGems';
import { takeGems } from '@/actions/games/takeGems';
import { toast } from 'sonner';

import CardRow from '@/components/game/card-row';
import GemBank from '@/components/game/gem-bank';
import PlayerBar from '@/components/game/player-bar';
import GemChip from '@/components/shared/game/gem-chip';
import { Button } from '@/components/ui/button';

import {
  CARD_COLORS,
  type CardColor,
  GEM_COLORS,
  type GemColor,
  type GemCounts,
} from '@/types/cards';
import type { FetchGameDataResponse } from '@/types/games';

import { BOARD_LEVELS, getCurrentTurnPlayerId, getPlayersInOrder } from '@/lib/games';

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

function getGemTotal(gems: GemCounts | undefined) {
  if (!gems) return 0;
  return Object.values(gems).reduce((total, count) => total + count, 0);
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
  const [selectedDiscards, setSelectedDiscards] = useState<GemCounts>(EMPTY_GEM_COUNTS);
  const [isTakingGems, setIsTakingGems] = useState(false);
  const [isDiscardingGems, setIsDiscardingGems] = useState(false);
  const currentTurnPlayerId = getCurrentTurnPlayerId(gameData);
  const isCurrentUserTurn = Boolean(currentPlayerId && currentPlayerId === currentTurnPlayerId);
  const currentPlayerGems = currentPlayerId ? gameData.gems_owned[currentPlayerId] : undefined;
  const currentPlayerGemTotal = getGemTotal(currentPlayerGems);
  const discardRequired = Math.max(0, currentPlayerGemTotal - 10);
  const mustDiscard = isCurrentUserTurn && discardRequired > 0;

  const selectedGemEntries = useMemo(
    () =>
      CARD_COLORS.map((color) => ({
        color,
        count: selectedGems[color],
      })).filter(({ count }) => count > 0),
    [selectedGems],
  );
  const selectedTotal = getSelectedTotal(selectedGems);
  const selectedDiscardEntries = useMemo(
    () =>
      GEM_COLORS.map((color) => ({
        color,
        count: selectedDiscards[color],
      })).filter(({ count }) => count > 0),
    [selectedDiscards],
  );
  const selectedDiscardTotal = getSelectedTotal(selectedDiscards);

  useEffect(() => {
    if (!mustDiscard) {
      setSelectedDiscards({ ...EMPTY_GEM_COUNTS });
    } else {
      setSelectedGems({ ...EMPTY_GEM_COUNTS });
    }
  }, [mustDiscard]);

  useEffect(() => {
    if (!isCurrentUserTurn) {
      setSelectedGems({ ...EMPTY_GEM_COUNTS });
      setSelectedDiscards({ ...EMPTY_GEM_COUNTS });
    }
  }, [isCurrentUserTurn]);

  const handleGemClick = (color: GemColor) => {
    if (
      !isCurrentUserTurn ||
      mustDiscard ||
      !canAddGem(color, selectedGems, gameData.gems_available)
    ) {
      return;
    }

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
    if (!currentPlayerId || !isCurrentUserTurn || selectedTotal === 0 || mustDiscard) return;

    setIsTakingGems(true);
    try {
      const updatedGameData = await takeGems({
        game_id: gameId,
        player_id: currentPlayerId,
        selected_gems: selectedGems,
      });
      onGameDataChange(updatedGameData);
      handleClearSelection();
      const updatedPlayerTotal = getGemTotal(updatedGameData.gems_owned[currentPlayerId]);
      if (updatedPlayerTotal > 10) {
        toast.info(`Gems taken. Discard ${updatedPlayerTotal - 10} to get back to 10.`);
      } else {
        toast.success('Gems taken');
      }
    } catch (error) {
      console.error(error);
      toast.error('Could not take gems');
    } finally {
      setIsTakingGems(false);
    }
  };

  const canAddDiscard = (color: GemColor) => {
    if (!currentPlayerGems || !isCurrentUserTurn || !mustDiscard) return false;
    if (selectedDiscardTotal >= discardRequired) return false;
    return selectedDiscards[color] < currentPlayerGems[color];
  };

  const handleDiscardGemClick = (color: GemColor) => {
    if (!canAddDiscard(color)) return;

    setSelectedDiscards((current) => ({
      ...current,
      [color]:
        getSelectedTotal(current) >= discardRequired ||
        !currentPlayerGems ||
        current[color] >= currentPlayerGems[color]
          ? current[color]
          : current[color] + 1,
    }));
  };

  const handleRemoveDiscardGem = (color: GemColor) => {
    setSelectedDiscards((current) => ({
      ...current,
      [color]: Math.max(0, current[color] - 1),
    }));
  };

  const handleClearDiscards = () => {
    setSelectedDiscards({ ...EMPTY_GEM_COUNTS });
  };

  const handleDiscardGems = async () => {
    if (!currentPlayerId || !isCurrentUserTurn || selectedDiscardTotal !== discardRequired) return;

    setIsDiscardingGems(true);
    try {
      const updatedGameData = await discardGems({
        game_id: gameId,
        player_id: currentPlayerId,
        discarded_gems: selectedDiscards,
      });
      onGameDataChange(updatedGameData);
      handleClearDiscards();
      toast.success('Gems discarded');
    } catch (error) {
      console.error(error);
      toast.error('Could not discard gems');
    } finally {
      setIsDiscardingGems(false);
    }
  };

  return (
    <div className="splendor-game-board">
      <p className="splendor-turn-status">
        {isCurrentUserTurn
          ? 'Your turn'
          : `${gameData.nicknames[currentTurnPlayerId ?? ''] ?? 'Waiting'}'s turn`}
      </p>
      <PlayerBar
        players={players}
        currentPlayerId={currentPlayerId}
        currentTurnPlayerId={currentTurnPlayerId}
      />
      <GemBank
        gemsAvailable={gameData.gems_available}
        selectedGems={selectedGems}
        getGemDisabled={(color) =>
          isTakingGems ||
          isDiscardingGems ||
          mustDiscard ||
          !currentPlayerId ||
          !isCurrentUserTurn ||
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
            disabled={selectedTotal === 0 || isTakingGems || mustDiscard || !isCurrentUserTurn}
            onClick={handleClearSelection}
          >
            Clear
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={
              !currentPlayerId ||
              !isCurrentUserTurn ||
              selectedTotal === 0 ||
              isTakingGems ||
              mustDiscard
            }
            onClick={handleTakeGems}
          >
            Take
          </Button>
        </div>
      </section>

      {mustDiscard ? (
        <section
          className="splendor-gem-selection splendor-gem-selection--discard"
          aria-label="Discard gems"
        >
          <div className="splendor-gem-selection__content">
            <span className="splendor-gem-selection__label">Discard {discardRequired}</span>
            <div className="splendor-gem-selection__chips">
              {GEM_COLORS.map((color) => {
                const ownedCount = currentPlayerGems?.[color] ?? 0;
                const selectedDiscardCount = selectedDiscards[color];

                return (
                  <button
                    key={color}
                    type="button"
                    className="splendor-gem-selection__chip"
                    aria-label={`Discard one ${color} gem`}
                    disabled={!canAddDiscard(color) || isDiscardingGems}
                    onClick={() => handleDiscardGemClick(color)}
                  >
                    <GemChip color={color} count={ownedCount - selectedDiscardCount} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="splendor-gem-selection__content">
            <span className="splendor-gem-selection__label">Returning</span>
            <div className="splendor-gem-selection__chips">
              {selectedDiscardEntries.length > 0 ? (
                selectedDiscardEntries.map(({ color, count }) => (
                  <button
                    key={color}
                    type="button"
                    className="splendor-gem-selection__chip"
                    aria-label={`Keep one selected ${color} gem`}
                    disabled={isDiscardingGems}
                    onClick={() => handleRemoveDiscardGem(color)}
                  >
                    <GemChip color={color} count={count} />
                  </button>
                ))
              ) : (
                <span className="splendor-gem-selection__empty">Choose gems to return</span>
              )}
            </div>
          </div>
          <div className="splendor-gem-selection__actions">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={selectedDiscardTotal === 0 || isDiscardingGems}
              onClick={handleClearDiscards}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={
                !currentPlayerId || selectedDiscardTotal !== discardRequired || isDiscardingGems
              }
              onClick={handleDiscardGems}
            >
              Discard
            </Button>
          </div>
        </section>
      ) : null}

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
