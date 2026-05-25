import httpx

from app.services.database import DatabaseService
from app.utils.errors import RoomNotFoundError


class RoomsService:
    async def create_room(self, game_id: str, player_id: str) -> str:
        client = await DatabaseService().get_client()
        await client.table("games").insert(
            {
                "id": game_id,
                "player_ids": [player_id],
            }
        ).execute()

    async def join_room(self, game_id: str, player_id: str) -> str:
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
        player_ids: list = (
            player_info.get("player_ids") if isinstance(player_info, dict) else None
        )
        if not player_ids:
            raise Exception("Room is missing host player")
        player_ids.append(player_id)
        await client.table("games").update({"player_ids": player_ids}).eq(
            "id", game_id
        ).execute()
