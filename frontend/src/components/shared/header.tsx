'use client';

import ThemeToggle from '@/components/shared/theme/toggle';

export default function Header() {
  return (
    <header className="flex w-full justify-end">
      <ThemeToggle />
    </header>
  );
}
