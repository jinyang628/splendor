from enum import StrEnum

from pydantic import BaseModel


class Player(StrEnum):
    PLAYER_ONE = "player_one"
    PLAYER_TWO = "player_two"
    PLAYER_THREE = "player_three"
    PLAYER_FOUR = "player_four"


class InitializeRequest(BaseModel):
    game_id: str
