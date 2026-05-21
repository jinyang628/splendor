from enum import StrEnum

from pydantic import BaseModel

from app.models.cards import Card, CardLevel


class Player(StrEnum):
    PLAYER_ONE = "player_one"
    PLAYER_TWO = "player_two"
    PLAYER_THREE = "player_three"
    PLAYER_FOUR = "player_four"


class InitializeRequest(BaseModel):
    game_id: str


class FetchGameDataRequest(BaseModel):
    game_id: str


class FetchGameDataResponse(BaseModel):
    order: dict[str, int]
    nicknames: dict[str, str]
    closed: dict[CardLevel, list[Card]]
    open: dict[CardLevel, list[Card]]
