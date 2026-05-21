import logging

import httpx
from fastapi import APIRouter
from starlette.responses import JSONResponse

from app.models.base import FetchGameDataResponse, InitializeRequest
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

        @router.get("/fetch", response_model=FetchGameDataResponse)
        async def fetch_game_data(game_id: str) -> FetchGameDataResponse:
            try:
                log.info(f"Fetching game data for {game_id}")
                return await self.service.fetch_game_data(game_id=game_id)
            except Exception as e:
                log.exception("Error fetching game data %s: %s", game_id, e)
                return JSONResponse(
                    content={
                        "message": "Error fetching game data",
                        "game_id": game_id,
                    },
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                )
