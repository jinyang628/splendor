from typing import Optional

from pydantic import BaseModel


class GetPlayerNumberRequest(BaseModel):
    game_id: str
    player_id: str


class GetPlayerNumberResponse(BaseModel):
    status_code: int
    is_player_one: Optional[bool]
