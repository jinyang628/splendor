import httpx

from app.models.base import Player
from app.models.rooms.get_player_number import GetPlayerNumberResponse
from app.services.database import DatabaseService
from app.utils.errors import (RoomMissingHostPlayerError, RoomNotFoundError,
                              UserNotInRoomError)


class RoomsService:
    async def create_room(self, game_id: str, player_id: str | None) -> None:
        client = await DatabaseService().get_client()
        await client.table("games").insert(
            {
                "id": game_id,
                "player_ids": [player_id],
            }
        ).execute()

    async def join_room(self, game_id: str, player_id: str) -> None:
        client = await DatabaseService().get_client()
        response = (
            await client.table("games").select("player_ids").eq("id", game_id).execute()
        )
        if (
            not response.data
            or not isinstance(response.data, list)
            or not response.data[0]
        ):
            raise RoomNotFoundError(
                status_code=httpx.codes.NOT_FOUND, detail="Room not found"
            )

        player_info = response.data[0]
        print(player_info)
        player_ids: list = (
            player_info.get("player_ids") if isinstance(player_info, dict) else None
        )
        if not player_ids:
            raise Exception("Room is missing host player")
        player_ids.append(player_id)
        await client.table("games").update({"player_ids": player_ids}).eq(
            "id", game_id
        ).execute()

    async def get_player_number(
        self, game_id: str, player_id: str
    ) -> GetPlayerNumberResponse:
        client = await DatabaseService().get_client()
        response = (
            await client.table("rooms")
            .select(
                "player_one_id", "player_two_id", "player_three_id", "player_four_id"
            )
            .eq("game_id", game_id)
            .execute()
        )
        if (
            not response.data
            or not isinstance(response.data, list)
            or not response.data[0]
        ):
            raise RoomNotFoundError(
                status_code=httpx.codes.NOT_FOUND, detail="Room not found"
            )

        player_info = response.data[0]
        player_one_id = (
            player_info.get("player_one_id") if isinstance(player_info, dict) else None
        )
        player_two_id = (
            player_info.get("player_two_id") if isinstance(player_info, dict) else None
        )
        player_three_id = (
            player_info.get("player_three_id")
            if isinstance(player_info, dict)
            else None
        )
        player_four_id = (
            player_info.get("player_four_id") if isinstance(player_info, dict) else None
        )
        if (
            not player_one_id
            and not player_two_id
            and not player_three_id
            and not player_four_id
        ):
            raise RoomMissingHostPlayerError(
                status_code=httpx.codes.NOT_FOUND, detail="Room is missing host player"
            )

        if player_one_id == player_id:
            return GetPlayerNumberResponse(
                status_code=httpx.codes.OK, player=Player.PLAYER_ONE
            )
        elif player_two_id == player_id:
            return GetPlayerNumberResponse(
                status_code=httpx.codes.OK, player=Player.PLAYER_TWO
            )
        elif player_three_id == player_id:
            return GetPlayerNumberResponse(
                status_code=httpx.codes.OK, player=Player.PLAYER_THREE
            )
        elif player_four_id == player_id:
            return GetPlayerNumberResponse(
                status_code=httpx.codes.OK, player=Player.PLAYER_FOUR
            )
        else:
            raise UserNotInRoomError(
                status_code=httpx.codes.NOT_FOUND,
                detail="User is not a player in the room",
            )
