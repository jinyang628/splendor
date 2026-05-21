import httpx

from app.models.base import FetchGameDataResponse
from app.models.cards import Card, CardLevel
from app.services.database import DatabaseService
from app.services.utils import instantiate_game_cards, serialize_cards_by_level
from app.utils.errors import InvalidDatabaseEntryError, RoomNotFoundError
from app.utils.rooms import generate_nicknames


class GamesService:
    async def fetch_game_data(self, game_id: str) -> FetchGameDataResponse:
        client = await DatabaseService().get_client()
        response = (
            await client.table("players")
            .select("id", "nickname", "order")
            .eq("game_id", game_id)
            .execute()
        )
        if (
            not response.data
            or not isinstance(response.data, list)
            or not response.data[0]
        ):
            raise RoomNotFoundError(
                status_code=httpx.codes.NOT_FOUND, detail="Players not found"
            )
        order: dict[str, int] = {}
        nicknames: dict[str, str] = {}
        for player_info in response.data:
            print(player_info)
            order[player_info["id"]] = player_info["order"]
            nicknames[player_info["id"]] = player_info["nickname"]
        response = (
            await client.table("cards")
            .select("open", "closed")
            .eq("game_id", game_id)
            .execute()
        )
        if (
            not response.data
            or not isinstance(response.data, list)
            or not response.data[0]
        ):
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.NOT_FOUND,
                detail="Game not found",
            )
        card_info = response.data[0]
        closed_cards: dict[CardLevel, list[Card]] = (
            card_info.get("closed") if isinstance(card_info, dict) else None
        )
        open_cards: dict[CardLevel, list[Card]] = (
            card_info.get("open") if isinstance(card_info, dict) else None
        )
        if not closed_cards or not open_cards:
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                detail="Card information is missing from database",
            )
        return FetchGameDataResponse(
            order=order,
            nicknames=nicknames,
            closed=closed_cards,
            open=open_cards,
        )

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
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                detail="Player ids information is missing from database",
            )

        sorted_all_player_ids: list[str] = sorted(player_ids)
        await self._generate_random_nicknames_by_order(
            game_id=game_id, sorted_all_player_ids=sorted_all_player_ids
        )
        closed_cards, open_cards = instantiate_game_cards()
        await client.table("cards").insert(
            {
                "game_id": game_id,
                "closed": serialize_cards_by_level(closed_cards),
                "open": serialize_cards_by_level(open_cards),
            }
        ).execute()
        await client.table("games").update({"is_ready": True}).eq(
            "id", game_id
        ).execute()

    async def _generate_random_nicknames_by_order(
        self, game_id: str, sorted_all_player_ids: list[str]
    ) -> None:
        client = await DatabaseService().get_client()
        nicknames: dict[str, str] = generate_nicknames(
            game_id=game_id, sorted_all_player_ids=sorted_all_player_ids
        )
        await client.table("players").upsert(
            [
                {
                    "id": player_id,
                    "game_id": game_id,
                    "nickname": nicknames[player_id],
                    "order": idx + 1,
                }
                for idx, player_id in enumerate(sorted_all_player_ids)
            ]
        ).execute()
