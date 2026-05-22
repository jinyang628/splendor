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


class FetchGameDataResponse(BaseModel):
    order: dict[str, int]
    nicknames: dict[str, str]
    gems_available: dict[GemColor, int]
    gems_owned: dict[str, dict[GemColor, int]]
    closed: dict[CardLevel, list[Card]]
    open: dict[CardLevel, list[Card]]
