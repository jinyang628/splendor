'use client';

import Link from 'next/link';

import { Home, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { FetchGameDataResponse } from '@/types/games';

import { getPlayersInOrder } from '@/lib/games';

type GameOverScreenProps = {
  gameData: FetchGameDataResponse;
  currentPlayerId: string | null;
};

export default function GameOverScreen({ gameData, currentPlayerId }: GameOverScreenProps) {
  const players = getPlayersInOrder(gameData);
  const winner = players.find((player) => player.playerId === gameData.endgame.winner_player_id);
  const triggeredByPosition = gameData.endgame.triggered_by_player_id
    ? (gameData.order[gameData.endgame.triggered_by_player_id] ?? null)
    : null;

  const rankedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (triggeredByPosition === null) return b.position - a.position;
    const playerCount = players.length;
    const aFinalTurnOffset = (a.position - triggeredByPosition + playerCount) % playerCount;
    const bFinalTurnOffset = (b.position - triggeredByPosition + playerCount) % playerCount;
    return bFinalTurnOffset - aFinalTurnOffset;
  });

  return (
    <section className="splendor-game-over" aria-label="Game over">
      <div className="splendor-game-over__icon" aria-hidden>
        <Trophy />
      </div>

      <div className="splendor-game-over__header">
        <p className="splendor-eyebrow">Game complete</p>
        <h1 className="splendor-game-over__title">
          {winner ? `${winner.nickname} wins` : 'The winner is undecided'}
        </h1>
        {winner ? (
          <p className="splendor-game-over__subtitle">
            {winner.playerId === currentPlayerId ? 'You won with ' : 'Winning score: '}
            {winner.points} {winner.points === 1 ? 'point' : 'points'}
          </p>
        ) : null}
      </div>

      <ol className="splendor-game-over__standings" aria-label="Final standings">
        {rankedPlayers.map((player, index) => (
          <li key={player.playerId} className="splendor-game-over__standing">
            <span className="splendor-game-over__rank">{index + 1}</span>
            <span className="splendor-game-over__name">
              {player.nickname}
              {player.playerId === currentPlayerId ? ' (You)' : ''}
            </span>
            <span className="splendor-game-over__score">{player.points}</span>
          </li>
        ))}
      </ol>

      <Button asChild size="lg" className="splendor-game-over__button">
        <Link href="/">
          <Home />
          Main menu
        </Link>
      </Button>
    </section>
  );
}
