'use client';

import { useState } from 'react';

import { joinRoom } from '@/actions/room/join';
import { gameIdAtom } from '@/state/game';
import { useSetAtom } from 'jotai';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { getCurrentUserId } from '@/lib/supabase';

export default function JoinRoomGroup() {
  const [gameId, setGameId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const setGameIdAtom = useSetAtom(gameIdAtom);
  const handleJoinRoom = async () => {
    setIsLoading(true);
    try {
      await joinRoom(gameId, await getCurrentUserId());
      setGameIdAtom(gameId);
    } catch (error) {
      toast.error('Unexpected error while trying to join room. Please try again later.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        type="text"
        placeholder="Enter room code"
        className="border-splendor-gold/20 bg-splendor-velvet-deep/80 placeholder:text-muted-foreground/60 focus-visible:border-splendor-gold/50 focus-visible:ring-splendor-gold/25 dark:border-splendor-gold/20 h-11 rounded-lg font-mono text-sm tracking-widest uppercase sm:text-base"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={isLoading}
        className="border-splendor-gold/35 text-splendor-gold hover:border-splendor-gold/60 hover:bg-splendor-gold/10 hover:text-splendor-gold dark:border-splendor-gold/35 h-11 shrink-0 cursor-pointer rounded-lg bg-transparent text-sm font-semibold tracking-wide shadow-none disabled:cursor-not-allowed disabled:opacity-70"
        onClick={handleJoinRoom}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Join Room'}
      </Button>
    </div>
  );
}
