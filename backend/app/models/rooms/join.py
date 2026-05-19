from typing import Optional

from pydantic import BaseModel


class JoinRoomRequest(BaseModel):
    game_id: str
    player_id: str


class JoinRoomResponse(BaseModel):
    status_code: int
    message: str
    is_player_one: Optional[bool]
