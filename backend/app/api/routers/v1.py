import logging

from fastapi import APIRouter

from app.controllers.games import GamesController
from app.controllers.rooms import RoomsController
from app.controllers.users import UsersController
from app.services.games import GamesService
from app.services.rooms import RoomsService
from app.services.users import UsersService

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1")

### Health check


@router.get("/status")
async def status():
    log.info("Status endpoint called")
    return {"status": "ok"}


### Games


def get_games_controller_router():
    service = GamesService()
    return GamesController(service=service).router


router.include_router(
    get_games_controller_router(),
    tags=["games"],
    prefix="/games",
)

### Rooms


def get_rooms_controller_router():
    service = RoomsService()
    return RoomsController(service=service).router


router.include_router(
    get_rooms_controller_router(),
    tags=["rooms"],
    prefix="/rooms",
)

### Users


def get_users_controller_router():
    service = UsersService()
    return UsersController(service=service).router


router.include_router(
    get_users_controller_router(),
    tags=["users"],
    prefix="/users",
)
