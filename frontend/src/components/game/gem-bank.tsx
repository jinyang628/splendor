import GemChip from '@/components/shared/game/gem-chip';

import { GEM_COLORS, type GemColor, type GemCounts } from '@/types/cards';

import { cn } from '@/lib/utils';

type GemBankProps = {
  gemsAvailable: GemCounts;
  onGemClick?: (color: GemColor) => void;
  getGemDisabled?: (color: GemColor) => boolean;
  selectedGems?: GemCounts;
};

const GEM_LABELS: Record<GemColor, string> = {
  black: 'Black',
  blue: 'Blue',
  white: 'White',
  green: 'Green',
  red: 'Red',
  gold: 'Gold',
};

export default function GemBank({
  gemsAvailable,
  onGemClick,
  getGemDisabled,
  selectedGems,
}: GemBankProps) {
  return (
    <section className="splendor-gem-bank" aria-label="Available gems">
      {GEM_COLORS.map((color) => {
        const count = gemsAvailable[color];
        const selectedCount = selectedGems?.[color] ?? 0;
        const isSelected = selectedCount > 0;
        const isDisabled = getGemDisabled?.(color) ?? false;
        const label = `${GEM_LABELS[color]} gems, ${count} available`;

        return (
          <button
            key={color}
            type="button"
            className={cn(
              'splendor-gem-bank__button',
              isSelected && 'splendor-gem-bank__button--selected',
            )}
            aria-label={label}
            aria-pressed={isSelected}
            disabled={isDisabled}
            title={label}
            onClick={() => onGemClick?.(color)}
          >
            <GemChip color={color} count={count} prominent />
            {selectedCount > 0 ? (
              <span className="splendor-gem-bank__selected-count">+{selectedCount}</span>
            ) : null}
          </button>
        );
      })}
    </section>
  );
}
