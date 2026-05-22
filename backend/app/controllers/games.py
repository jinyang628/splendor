import logging

import httpx
from fastapi import APIRouter, HTTPException
from starlette.responses import JSONResponse

from app.models.base import (
    DiscardGemsRequest,
    FetchGameDataResponse,
    InitializeRequest,
    TakeGemsRequest,
)
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

        @router.post("/gems/take", response_model=FetchGameDataResponse)
        async def take_gems(input: TakeGemsRequest) -> FetchGameDataResponse:
            try:
                log.info(
                    "Taking gems for game %s and player %s",
                    input.game_id,
                    input.player_id,
                )
                return await self.service.take_gems(
                    game_id=input.game_id,
                    player_id=input.player_id,
                    selected_gems=input.selected_gems,
                )
            except HTTPException as e:
                log.warning(
                    "Invalid take gems request for game %s and player %s: %s",
                    input.game_id,
                    input.player_id,
                    e.detail,
                )
                return JSONResponse(
                    content={"message": e.detail},
                    status_code=e.status_code,
                )
            except Exception as e:
                log.exception(
                    "Error taking gems for game %s and player %s: %s",
                    input.game_id,
                    input.player_id,
                    e,
                )
                return JSONResponse(
                    content={
                        "message": "Error taking gems",
                        "game_id": input.game_id,
                    },
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                )

        @router.post("/gems/discard", response_model=FetchGameDataResponse)
        async def discard_gems(input: DiscardGemsRequest) -> FetchGameDataResponse:
            try:
                log.info(
                    "Discarding gems for game %s and player %s",
                    input.game_id,
                    input.player_id,
                )
                return await self.service.discard_gems(
                    game_id=input.game_id,
                    player_id=input.player_id,
                    discarded_gems=input.discarded_gems,
                )
            except HTTPException as e:
                log.warning(
                    "Invalid discard gems request for game %s and player %s: %s",
                    input.game_id,
                    input.player_id,
                    e.detail,
                )
                return JSONResponse(
                    content={"message": e.detail},
                    status_code=e.status_code,
                )
            except Exception as e:
                log.exception(
                    "Error discarding gems for game %s and player %s: %s",
                    input.game_id,
                    input.player_id,
                    e,
                )
                return JSONResponse(
                    content={
                        "message": "Error discarding gems",
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
