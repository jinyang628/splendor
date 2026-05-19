'use client';

import { useEffect, useState } from 'react';

const STATUS_MESSAGES = [
  'Shuffling the gem market',
  'Welcoming the nobles',
  'Counting emerald reserves',
  'Inspecting rare rubies',
  'Opening velvet card cases',
  'Stacking sapphire shipments',
  'Minting prestige points',
  'Refreshing the trade ledger',
  'Awaiting ambitious merchants',
  'Securing diamond caravans',
  'Welcoming noble patrons',
] as const;

export default function StatusText() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const DISPLAY_MS = 3000;
    const FADE_MS = 400;

    let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

    const id = setInterval(() => {
      setFading(true);
      fadeTimeout = setTimeout(() => {
        setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
        setFading(false);
      }, FADE_MS);
    }, DISPLAY_MS);

    return () => {
      clearInterval(id);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, []);

  return (
    <p className={`splendor-status ${fading ? 'opacity-0' : 'opacity-100'}`} aria-live="polite">
      {STATUS_MESSAGES[statusIndex]}
    </p>
  );
}
