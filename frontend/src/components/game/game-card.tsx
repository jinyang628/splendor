import Card from '@/components/shared/game/card';

import type { GameCard } from '@/types/games';

type GameCardProps = {
  card: GameCard;
  className?: string;
  onClick?: () => void;
};

export default function GameCardView({ card, className, onClick }: GameCardProps) {
  return (
    <Card
      color={card.color}
      pointValues={card.points}
      black={card.black}
      blue={card.blue}
      green={card.green}
      red={card.red}
      white={card.white}
      className={className}
      onClick={onClick}
    />
  );
}
