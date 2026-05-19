import logging

import httpx
from fastapi import APIRouter, HTTPException
from starlette.responses import JSONResponse

from app.models.rooms.create import CreateRoomRequest
from app.models.rooms.get_player_number import GetPlayerNumberResponse
from app.models.rooms.join import JoinRoomRequest, JoinRoomResponse
from app.services.rooms import RoomsService

log = logging.getLogger(__name__)


class RoomsController:
    def __init__(self, service: RoomsService):
        self.router = APIRouter()
        self.service = service
        self.setup_routes()

    def setup_routes(self):
        router = self.router

        @router.post(
            "/create",
        )
        async def create(input: CreateRoomRequest) -> JSONResponse:
            try:
                log.info(
                    "Creating room for game: %s, player one id: %s, player two id: %s",
                    input.game_id,
                    input.player_id,
                )
                await self.service.create_room(
                    game_id=input.game_id, player_id=input.player_id
                )
                log.info("Room created successfully for game %s", input.game_id)
                return JSONResponse(
                    content={
                        "message": "Room created successfully",
                        "game_id": input.game_id,
                    },
                    status_code=httpx.codes.OK,
                )
            except Exception as e:
                log.exception("Error creating room for game %s: %s", input.game_id, e)
                return JSONResponse(
                    content={"message": "Error creating room"},
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                )

        @router.post(
            "/join",
            response_model=JoinRoomResponse,
        )
        async def join(input: JoinRoomRequest) -> JoinRoomResponse:
            try:
                log.info("Joining room for game %s", input.game_id)
                response = await self.service.join_room(
                    game_id=input.game_id,
                    player_id=input.player_id,
                )
                log.info("Room joined successfully for game %s", input.game_id)
                return response
            except HTTPException as e:
                log.exception(e.detail)
                return JoinRoomResponse(
                    status_code=httpx.codes.NOT_FOUND,
                    message=e.detail,
                    is_player_one=False,
                )
            except Exception as e:
                log.exception(
                    "Unexpected error occurred while trying to join room %s: %s",
                    input.game_id,
                    e,
                )
                return JoinRoomResponse(
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                    message="Unexpected error occurred while trying to join room. Please try again later.",
                    is_player_one=False,
                )

        @router.get(
            "/player-number",
            response_model=GetPlayerNumberResponse,
        )
        async def get_player_number(
            game_id: str, user_id: str
        ) -> GetPlayerNumberResponse:
            try:
                log.info("Getting player number for game %s", game_id)
                response = await self.service.get_player_number(
                    game_id=game_id, player_id=player_id
                )
                log.info("Player number got successfully for game %s", game_id)
                return response
            except HTTPException as e:
                log.exception(e.detail)
                return GetPlayerNumberResponse(
                    status_code=e.status_code,
                    is_player_one=None,
                )
            except Exception as e:
                log.exception(
                    "Unexpected error occurred while trying to get player number for game %s: %s",
                    game_id,
                    e,
                )
                return GetPlayerNumberResponse(
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                    is_player_one=None,
                )
