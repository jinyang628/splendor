import random
from collections import deque

from app.models.game.cards import Card, CardLevel
from app.utils import SPLENDOR_CARDS


def instantiate_game_cards() -> dict[CardLevel, deque[Card]]:
    """Build per-level deques of Splendor cards, shuffled randomly within each level."""
    cards_by_level: dict[CardLevel, list[Card]] = {
        CardLevel.ONE: [],
        CardLevel.TWO: [],
        CardLevel.THREE: [],
    }
    for level, color, points, black, blue, green, red, white in SPLENDOR_CARDS:
        card = Card(
            color=color,
            points=points,
            black=black,
            blue=blue,
            green=green,
            red=red,
            white=white,
        )
        cards_by_level[level].append(card)

    result: dict[CardLevel, deque[Card]] = {}
    for level, cards in cards_by_level.items():
        random.shuffle(cards)
        result[level] = deque(cards)
    return result
