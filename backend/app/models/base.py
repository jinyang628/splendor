from enum import StrEnum

from pydantic import BaseModel

from app.models.games import Card, CardLevel, GemColor

MAX_PLAYER_GEMS = 10


class Player(StrEnum):
    PLAYER_ONE = "player_one"
    PLAYER_TWO = "player_two"
    PLAYER_THREE = "player_three"
    PLAYER_FOUR = "player_four"


class InitializeRequest(BaseModel):
    game_id: str


class TakeGemsRequest(BaseModel):
    game_id: str
    player_id: str
    selected_gems: dict[GemColor, int]


class DiscardGemsRequest(BaseModel):
    game_id: str
    player_id: str
    discarded_gems: dict[GemColor, int]


class ReserveCardSource(StrEnum):
    OPEN = "open"
    CLOSED = "closed"


class ReserveCardRequest(BaseModel):
    game_id: str
    player_id: str
    source: ReserveCardSource
    card_id: str | None = None
    level: CardLevel | None = None


class BuyCardRequest(BaseModel):
    game_id: str
    player_id: str
    card_id: str


class FetchGameDataResponse(BaseModel):
    turn: int
    order: dict[str, int]
    nicknames: dict[str, str]
    gems_available: dict[GemColor, int]
    gems_owned: dict[str, dict[GemColor, int]]
    reserved: dict[str, list[Card]]
    purchased: dict[str, list[Card]]
    closed: dict[CardLevel, list[Card]]
    open: dict[CardLevel, list[Card | None]]
