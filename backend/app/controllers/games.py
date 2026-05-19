import logging

from fastapi import APIRouter

# from app.models.api.games.get_game_state import GetGameStateResponse
# from app.models.api.games.initialize import (
#     InitializeCaptureRequest,
#     InitializeCaptureResponse,
#     InitializeRequest,
# )
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

        # @router.post(
        #     "/initialize",
        # )
        # async def initialize(input: InitializeRequest) -> JSONResponse:
        #     try:
        #         log.info(
        #             "Initializing pieces for player %s in game %s",
        #             input.pieces[0].player,
        #             input.game_id,
        #         )
        #         await self.service.initialize(
        #             game_id=input.game_id,
        #             pieces=input.pieces,  # pyright: ignore[reportArgumentType]
        #         )
        #         return JSONResponse(
        #             content={
        #                 "message": "Pieces initialized successfully",
        #                 "game_id": input.game_id,
        #             },
        #             status_code=httpx.codes.OK,
        #         )
        #     except Exception as e:
        #         log.info(
        #             "Error initializing pieces for %s in game %s: %s",
        #             input.pieces[0].player,
        #             input.game_id,
        #             e,
        #         )
        #         return JSONResponse(
        #             content={"message": "Error initializing pieces"},
        #             status_code=httpx.codes.INTERNAL_SERVER_ERROR,
        #         )
