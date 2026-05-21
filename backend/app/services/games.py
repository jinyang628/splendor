import httpx

from app.services.database import DatabaseService
from app.utils.errors import RoomNotFoundError
from app.utils.rooms import generate_nicknames


class GamesService:
    async def initialize(self, game_id: str) -> None:
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

        sorted_all_player_ids: list[str] = sorted(player_ids)
        order: dict[str, int] = {
            player_id: i for i, player_id in enumerate(sorted_all_player_ids)
        }
        await self._generate_random_nicknames(
            game_id=game_id, sorted_all_player_ids=sorted_all_player_ids
        )
        await client.table("games").update({"order": order, "is_ready": True}).eq(
            "id", game_id
        ).execute()

    async def _generate_random_nicknames(
        self, game_id: str, sorted_all_player_ids: list[str]
    ) -> None:
        client = await DatabaseService().get_client()
        nicknames: dict[str, str] = generate_nicknames(
            game_id=game_id, sorted_all_player_ids=sorted_all_player_ids
        )
        await client.table("users").upsert(
            [
                {"id": player_id, "nickname": nickname}
                for player_id, nickname in nicknames.items()
            ]
        ).execute()
