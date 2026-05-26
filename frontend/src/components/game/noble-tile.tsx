import Image from 'next/image';

import GemChip from '@/components/shared/game/gem-chip';

import { CARD_COLORS } from '@/types/cards';
import type { GameNoble } from '@/types/games';

type NobleTileProps = {
  noble: GameNoble;
  imagePath: string;
};

export default function NobleTile({ noble, imagePath }: NobleTileProps) {
  const requirementEntries = CARD_COLORS.map((color) => ({
    color,
    count: noble[color],
  })).filter(({ count }) => count > 0);

  return (
    <article className="splendor-noble-tile" aria-label={`Noble worth ${noble.points} points`}>
      <span className="splendor-noble-tile__points">{noble.points}</span>
      <div className="splendor-noble-tile__portrait" aria-hidden>
        <Image src={imagePath} alt="" width={64} height={64} />
      </div>
      <div className="splendor-noble-tile__requirements">
        {requirementEntries.map(({ color, count }) => (
          <GemChip key={color} color={color} count={count} />
        ))}
      </div>
    </article>
  );
}
