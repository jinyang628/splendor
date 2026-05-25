import random
import uuid

from app.models.games import Card, CardLevel
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
    cards_by_level: dict[CardLevel, list[Card | None]],
) -> dict[str, list[dict | None]]:
    return {
        str(level.value): [
            card.model_dump(mode="json") if card else None for card in cards
        ]
        for level, cards in cards_by_level.items()
    }


def deserialize_cards_by_level(
    cards_by_level: dict[str | CardLevel, list[dict | Card | None]],
) -> dict[CardLevel, list[Card | None]]:
    return {
        CardLevel(int(level)): [
            (
                card
                if isinstance(card, Card) or card is None
                else Card.model_validate(card)
            )
            for card in cards
        ]
        for level, cards in cards_by_level.items()
    }


def reserve_closed_card(
    level: CardLevel, closed_cards: dict[CardLevel, list[Card | None]]
) -> tuple[dict[CardLevel, list[Card]], Card]:
    """Removes a hidden card for a given level, and return the updated closed cards and the card reserved."""

    if not closed_cards[level]:
        raise InvalidGameLogicError(
            status_code=400,
            detail=f"No cards left to reserve for level {level.value}",
        )
    card: Card = closed_cards[level].pop()
    return closed_cards, card


def reserve_open_card(
    card_uuid: uuid.UUID,
    open_cards: dict[CardLevel, list[Card | None]],
    closed_cards: dict[CardLevel, list[Card | None]],
) -> tuple[dict[CardLevel, list[Card]], dict[CardLevel, list[Card | None]], Card]:
    """Removes an open card for a given level, and return the updated closed cards and open cards."""
    reserved_card: Card | None = None
    for level, cards in open_cards.items():
        for card in cards:
            if card is None:
                continue
            if card.id != card_uuid:
                continue
            index: int = cards.index(card)
            reserved_card = card
            if not closed_cards[level]:
                open_cards[level][index] = None
            else:
                open_cards[level][index] = closed_cards[level].pop()

    if not reserved_card:
        raise InvalidGameLogicError(
            status_code=400,
            detail=f"No open card found with UUID {card_uuid}",
        )

    return closed_cards, open_cards, reserved_card
