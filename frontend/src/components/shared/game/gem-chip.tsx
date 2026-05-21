import { GemColor } from '@/types/cards';

import { cn } from '@/lib/utils';

export default function GemChip({
  color,
  count,
  prominent = false,
}: {
  color: GemColor;
  count?: number;
  prominent?: boolean;
}) {
  return (
    <span
      data-gem={color}
      className={cn('gem-chip', prominent && 'gem-chip--prominent')}
      aria-hidden
    >
      {count !== undefined ? count : null}
    </span>
  );
}
