import GemChip from '@/components/shared/game/gem-chip';

import { GEM_COLORS, type GemColor, type GemCounts } from '@/types/cards';

type GemBankProps = {
  gemsAvailable: GemCounts;
  onGemClick?: (color: GemColor) => void;
};

const GEM_LABELS: Record<GemColor, string> = {
  black: 'Black',
  blue: 'Blue',
  white: 'White',
  green: 'Green',
  red: 'Red',
  gold: 'Gold',
};

export default function GemBank({ gemsAvailable, onGemClick }: GemBankProps) {
  return (
    <section className="splendor-gem-bank" aria-label="Available gems">
      {GEM_COLORS.map((color) => {
        const count = gemsAvailable[color];
        const label = `${GEM_LABELS[color]} gems, ${count} available`;

        return (
          <button
            key={color}
            type="button"
            className="splendor-gem-bank__button"
            aria-label={label}
            title={label}
            onClick={() => onGemClick?.(color)}
          >
            <GemChip color={color} count={count} prominent />
          </button>
        );
      })}
    </section>
  );
}
