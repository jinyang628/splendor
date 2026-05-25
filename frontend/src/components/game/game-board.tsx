'use client';

import { useEffect, useMemo, useState } from 'react';

import { buyCard } from '@/actions/games/buyCard';
import { discardGems } from '@/actions/games/discardGems';
import { reserveCard } from '@/actions/games/reserveCard';
import { takeGems } from '@/actions/games/takeGems';
import { toast } from 'sonner';

import CardActionMenu from '@/components/game/card-action-menu';
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
import type { FetchGameDataResponse, GameCard } from '@/types/games';

import { BOARD_LEVELS, getCurrentTurnPlayerId, getPlayersInOrder } from '@/lib/games';

type GameBoardProps = {
  gameId: string;
  gameData: FetchGameDataResponse;
  currentPlayerId: string | null;
  onGameDataChange: (gameData: FetchGameDataResponse) => void;
};

type ActiveCardMenu = { type: 'open'; cardId: string } | { type: 'closed'; level: number } | null;

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
  const [isReservingCard, setIsReservingCard] = useState(false);
  const [isBuyingCard, setIsBuyingCard] = useState(false);
  const [activeCardMenu, setActiveCardMenu] = useState<ActiveCardMenu>(null);
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

  const currentPlayerPermanentColors = useMemo(() => {
    const purchasedCards = currentPlayerId ? (gameData.purchased[currentPlayerId] ?? []) : [];
    return CARD_COLORS.reduce(
      (counts, color) => ({
        ...counts,
        [color]: purchasedCards.filter((card) => card.color === color).length,
      }),
      { ...EMPTY_GEM_COUNTS },
    );
  }, [currentPlayerId, gameData.purchased]);

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
      setActiveCardMenu(null);
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

  const canReserveCard = () =>
    Boolean(
      currentPlayerId &&
        isCurrentUserTurn &&
        !mustDiscard &&
        !isTakingGems &&
        !isDiscardingGems &&
        !isReservingCard &&
        !isBuyingCard,
    );

  const canBuyCard = (card: GameCard) => {
    if (!currentPlayerGems || !canReserveCard()) return false;

    let goldNeeded = 0;
    for (const color of CARD_COLORS) {
      const discountedCost = Math.max(0, card[color] - currentPlayerPermanentColors[color]);
      const normalPayment = Math.min(currentPlayerGems[color], discountedCost);
      goldNeeded += discountedCost - normalPayment;
    }

    return goldNeeded <= currentPlayerGems.gold;
  };

  const handleReserveOpenCard = async (card: GameCard) => {
    if (!currentPlayerId || !canReserveCard()) return;

    setIsReservingCard(true);
    try {
      const updatedGameData = await reserveCard({
        game_id: gameId,
        player_id: currentPlayerId,
        source: 'open',
        card_id: card.id,
      });
      onGameDataChange(updatedGameData);
      handleClearSelection();
      setActiveCardMenu(null);
      const updatedPlayerTotal = getGemTotal(updatedGameData.gems_owned[currentPlayerId]);
      if (updatedPlayerTotal > 10) {
        toast.info(`Card reserved. Discard ${updatedPlayerTotal - 10} to get back to 10.`);
      } else {
        toast.success('Card reserved');
      }
    } catch (error) {
      console.error(error);
      toast.error('Could not reserve card');
    } finally {
      setIsReservingCard(false);
    }
  };

  const handleReserveClosedCard = async (level: number) => {
    if (!currentPlayerId || !canReserveCard()) return;

    setIsReservingCard(true);
    try {
      const updatedGameData = await reserveCard({
        game_id: gameId,
        player_id: currentPlayerId,
        source: 'closed',
        level: level as 1 | 2 | 3,
      });
      onGameDataChange(updatedGameData);
      handleClearSelection();
      setActiveCardMenu(null);
      const updatedPlayerTotal = getGemTotal(updatedGameData.gems_owned[currentPlayerId]);
      if (updatedPlayerTotal > 10) {
        toast.info(`Card reserved. Discard ${updatedPlayerTotal - 10} to get back to 10.`);
      } else {
        toast.success('Card reserved');
      }
    } catch (error) {
      console.error(error);
      toast.error('Could not reserve card');
    } finally {
      setIsReservingCard(false);
    }
  };

  const handleBuyOpenCard = async (card: GameCard) => {
    if (!currentPlayerId || !canBuyCard(card)) return;

    setIsBuyingCard(true);
    try {
      const updatedGameData = await buyCard({
        game_id: gameId,
        player_id: currentPlayerId,
        card_id: card.id,
      });
      onGameDataChange(updatedGameData);
      handleClearSelection();
      setActiveCardMenu(null);
      toast.success('Card bought');
    } catch (error) {
      console.error(error);
      toast.error('Could not buy card');
    } finally {
      setIsBuyingCard(false);
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
          isReservingCard ||
          isBuyingCard ||
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
              isBuyingCard ||
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
            isInteractionDisabled={!canReserveCard()}
            onDeckClick={() => setActiveCardMenu({ type: 'closed', level: Number(level) })}
            onOpenCardClick={(card) => setActiveCardMenu({ type: 'open', cardId: card.id })}
            renderDeckMenu={() =>
              activeCardMenu?.type === 'closed' && activeCardMenu.level === Number(level) ? (
                <CardActionMenu
                  title={`Level ${Number(level)} deck`}
                  isBusy={isReservingCard || isBuyingCard}
                  onReserve={() => handleReserveClosedCard(Number(level))}
                  onClose={() => setActiveCardMenu(null)}
                />
              ) : null
            }
            renderOpenCardMenu={(card) =>
              activeCardMenu?.type === 'open' && activeCardMenu.cardId === card.id ? (
                <CardActionMenu
                  title="Open card"
                  canBuy={canBuyCard(card)}
                  isBusy={isReservingCard || isBuyingCard}
                  onBuy={() => handleBuyOpenCard(card)}
                  onReserve={() => handleReserveOpenCard(card)}
                  onClose={() => setActiveCardMenu(null)}
                />
              ) : null
            }
          />
        ))}
      </div>
    </div>
  );
}
