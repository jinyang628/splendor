from pydantic import BaseModel


class CreateRoomRequest(BaseModel):
    game_id: str
    player_id: str | None = None
