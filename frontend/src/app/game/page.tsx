'use client';

import Card from '@/components/shared/game/card';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Card color="blue" pointValues={1} black={0} blue={2} green={3} red={0} white={3} />
    </div>
  );
}
