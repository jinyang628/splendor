import CreateRoomButton from '@/components/home/create-room-button';
import JoinRoomGroup from '@/components/home/join-room-group';
import GemChip from '@/components/shared/game/gem-chip';
import SplendorHeroShell from '@/components/shared/splendor-hero-shell';

import { CARD_COLORS } from '@/types/cards';

export default function Home() {
  return (
    <main className="flex w-full flex-1 items-center justify-center px-2 py-4 sm:px-4">
      <SplendorHeroShell>
        <header className="relative z-10 flex flex-col items-center gap-5 text-center">
          <div className="splendor-gem-crown flex items-center justify-center gap-2.5 sm:gap-3">
            {CARD_COLORS.map((color) => (
              <GemChip key={color} color={color} prominent />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <p className="splendor-eyebrow">The Renaissance of Merchants</p>
            <h1 className="splendor-title animate-title-shine">Splendor</h1>
            <div className="splendor-divider" aria-hidden />
            <p className="splendor-subtitle mx-auto max-w-sm">
              Amass gems, acquire development cards, and attract nobles to claim your place among
              the merchant elite.
            </p>
          </div>
        </header>

        <section className="relative z-10 mt-10 flex flex-col gap-5">
          <CreateRoomButton />

          <div className="splendor-action-panel flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className="bg-splendor-gold/80 size-1.5 shrink-0 rounded-full shadow-[0_0_8px_var(--splendor-gold)]"
                aria-hidden
              />
              <label className="splendor-eyebrow text-[0.6rem] tracking-[0.28em]">
                Enter an existing room
              </label>
            </div>
            <JoinRoomGroup />
          </div>
        </section>
      </SplendorHeroShell>
    </main>
  );
}
