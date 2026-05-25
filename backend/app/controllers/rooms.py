import logging

import httpx
from fastapi import APIRouter, HTTPException
from starlette.responses import JSONResponse

from app.models.rooms import RoomRequest
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
        async def create_room(input: RoomRequest) -> JSONResponse:
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
                    content={
                        "message": "Error creating room",
                        "game_id": input.game_id,
                    },
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                )

        @router.post(
            "/join",
        )
        async def join_room(input: RoomRequest) -> JSONResponse:
            try:
                log.info("Joining room for game %s", input.game_id)
                await self.service.join_room(
                    game_id=input.game_id,
                    player_id=input.player_id,
                )
                log.info("Room joined successfully for game %s", input.game_id)
                return JSONResponse(
                    content={
                        "message": "Room joined successfully",
                        "game_id": input.game_id,
                    },
                    status_code=httpx.codes.OK,
                )
            except HTTPException as e:
                log.exception(e.detail)
                return JSONResponse(
                    content={"message": "Room not found", "game_id": input.game_id},
                    status_code=httpx.codes.NOT_FOUND,
                )
            except Exception as e:
                log.exception(
                    "Unexpected error occurred while trying to join room %s: %s",
                    input.game_id,
                    e,
                )
                return JSONResponse(
                    content={
                        "message": "Unexpected error occurred while trying to join room",
                        "game_id": input.game_id,
                    },
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                )
