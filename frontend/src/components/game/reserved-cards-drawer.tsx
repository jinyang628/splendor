'use client';

import { CheckCircle2, CircleX, ShoppingCart } from 'lucide-react';

import GameCardView from '@/components/game/game-card';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import type { GameCard } from '@/types/games';

type ReservedCardsDrawerProps = {
  reservedCards: GameCard[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canBuyNow: (card: GameCard) => boolean;
  canAfford: (card: GameCard) => boolean;
  isBusy?: boolean;
  onBuy: (card: GameCard) => void;
};

export default function ReservedCardsDrawer({
  reservedCards,
  open,
  onOpenChange,
  canBuyNow,
  canAfford,
  isBusy = false,
  onBuy,
}: ReservedCardsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Reserved
          <span className="splendor-reserved-trigger__count">{reservedCards.length}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent side="right" className="w-[22rem] max-w-[90vw]">
        <DrawerHeader>
          <DrawerTitle>Reserved cards</DrawerTitle>
          <DrawerDescription>Your held cards and whether you can afford them.</DrawerDescription>
        </DrawerHeader>
        <div className="splendor-reserved-drawer__cards">
          {reservedCards.length > 0 ? (
            reservedCards.map((card) => {
              const affordable = canAfford(card);

              return (
                <article key={card.id} className="splendor-reserved-card">
                  <GameCardView card={card} />
                  <div className="splendor-reserved-card__status">
                    {affordable ? (
                      <CheckCircle2 className="text-green-600" aria-hidden />
                    ) : (
                      <CircleX className="text-muted-foreground" aria-hidden />
                    )}
                    <span>{affordable ? 'Affordable' : 'Not enough gems'}</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!canBuyNow(card) || isBusy}
                    onClick={() => onBuy(card)}
                  >
                    <ShoppingCart />
                    Buy
                  </Button>
                </article>
              );
            })
          ) : (
            <p className="splendor-reserved-drawer__empty">No reserved cards yet.</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
