'use client';

import { useEffect, useRef } from 'react';

import { Bookmark, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';

type CardActionMenuProps = {
  title: string;
  canBuy?: boolean;
  isBusy?: boolean;
  onBuy?: () => void;
  onReserve: () => void;
  onClose: () => void;
};

export default function CardActionMenu({
  title,
  canBuy = false,
  isBusy = false,
  onBuy,
  onReserve,
  onClose,
}: CardActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) return;
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="splendor-card-action-menu"
      role="menu"
      aria-label={title}
      onClick={(event) => event.stopPropagation()}
    >
      <p className="splendor-card-action-menu__title">{title}</p>
      <div className="splendor-card-action-menu__actions">
        {onBuy ? (
          <Button
            type="button"
            size="sm"
            className="w-full justify-start"
            disabled={!canBuy || isBusy}
            onClick={onBuy}
            role="menuitem"
          >
            <ShoppingCart />
            Buy
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={isBusy}
          onClick={onReserve}
          role="menuitem"
        >
          <Bookmark />
          Reserve
        </Button>
      </div>
    </div>
  );
}
