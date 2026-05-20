from pydantic import BaseModel


class RoomRequest(BaseModel):
    game_id: str
    player_id: str


class RoomResponse(BaseModel):
    status_code: int
    message: str  # nickname returned here for 200


class EditNicknameRequest(BaseModel):
    game_id: str
    player_id: str
    nickname: str
