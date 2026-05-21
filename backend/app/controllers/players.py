import logging

import httpx
from fastapi import APIRouter
from starlette.responses import JSONResponse

from app.models.rooms import EditNicknameRequest
from app.services.players import PlayersService

log = logging.getLogger(__name__)


class PlayersController:
    def __init__(self, service: PlayersService):
        self.router = APIRouter()
        self.service = service
        self.setup_routes()

    def setup_routes(self):
        router = self.router

        @router.patch(
            "/nickname",
        )
        async def edit_nickname(input: EditNicknameRequest) -> JSONResponse:
            try:
                log.info("Editing nickname for user %s", input.user_id)
                await self.service.edit_nickname(
                    user_id=input.user_id,
                    nickname=input.nickname,
                )
                log.info("Nickname edited successfully for user %s", input.user_id)
                return JSONResponse(
                    content={
                        "message": "Nickname edited successfully",
                        "user_id": input.user_id,
                    },
                    status_code=httpx.codes.OK,
                )
            except Exception as e:
                log.exception(
                    "Unexpected error occurred while trying to edit nickname for user %s: %s",
                    input.user_id,
                    e,
                )
                return JSONResponse(
                    content={
                        "message": "Unexpected error occurred while trying to edit nickname",
                        "user_id": input.user_id,
                    },
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                )
