import random
import uuid
from typing import Optional

from app.models.cards import Card, CardLevel
from app.utils.errors import InvalidGameLogicError
from app.utils.games import SPLENDOR_CARDS


def instantiate_game_cards() -> (
    tuple[dict[CardLevel, list[Card]], dict[CardLevel, list[Card]]]
):
    """Build per-level ordered Splendor cards, shuffled randomly within each level. Returns a dict of closed cards and open cards."""
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

    closed_cards: dict[CardLevel, list[Card]] = {}
    open_cards: dict[CardLevel, list[Card]] = {}
    for level, cards in cards_by_level.items():
        random.shuffle(cards)

        revealed_cards: list[Card] = []
        for _ in range(4):
            revealed_cards.append(cards.pop())

        closed_cards[level] = cards
        open_cards[level] = revealed_cards

    return closed_cards, open_cards


def serialize_cards_by_level(
    cards_by_level: dict[CardLevel, list[Card]],
) -> dict[str, list[dict]]:
    return {
        str(level.value): [card.model_dump(mode="json") for card in cards]
        for level, cards in cards_by_level.items()
    }


def reserve_closed_card(
    level: CardLevel, closed_cards: dict[CardLevel, list[Card]]
) -> tuple[dict[CardLevel, list[Card]], Card]:
    """Removes a hidden card for a given level, and return the updated closed cards and the card reserved."""

    if not closed_cards[level]:
        raise InvalidGameLogicError("No cards left to reserve for level %s", level)
    card: Card = closed_cards[level].pop()
    return closed_cards, card


def reserve_or_buy_open_card(
    card_uuid: uuid.UUID,
    open_cards: dict[CardLevel, list[Card]],
    closed_cards: dict[CardLevel, list[Card]],
) -> tuple[dict[CardLevel, list[Card]], dict[CardLevel, list[Card]]]:
    """Removes an open card for a given level, and return the updated closed cards and open cards."""
    reserved_card: Optional[Card] = None
    for level, cards in open_cards.items():
        for card in cards:
            if card.id != card_uuid:
                continue
            index: int = cards.index(card)
            reserved_card = card
            if not closed_cards[level]:
                open_cards[level][index] = None
            else:
                open_cards[level][index] = closed_cards[level].pop()

    if not reserved_card:
        raise InvalidGameLogicError("No card found with UUID %s", card_uuid)

    return closed_cards, open_cards
