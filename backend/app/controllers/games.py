import logging

import httpx
from fastapi import APIRouter
from starlette.responses import JSONResponse

from app.models.base import InitializeRequest
# from app.models.api.games.get_game_state import GetGameStateResponse
# from app.models.api.games.move_piece import MovePieceRequest, MovePieceResponse
# from app.models.api.games.toggle_marking import ToggleMarkingRequest
from app.services.games import GamesService

log = logging.getLogger(__name__)


class GamesController:
    def __init__(self, service: GamesService):
        self.router = APIRouter()
        self.service = service
        self.setup_routes()

    def setup_routes(self):
        router = self.router

        @router.post(
            "/initialize",
        )
        async def initialize(input: InitializeRequest) -> JSONResponse:
            try:
                log.info(f"Initializing game for {input.game_id}")
                await self.service.initialize(
                    game_id=input.game_id,
                )
                return JSONResponse(
                    content={
                        "message": "Game initialized successfully",
                        "game_id": input.game_id,
                    },
                    status_code=httpx.codes.OK,
                )
            except Exception as e:
                log.exception("Error initializing game %s: %s", input.game_id, e)
                return JSONResponse(
                    content={
                        "message": "Error initializing game",
                        "game_id": input.game_id,
                    },
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                )
