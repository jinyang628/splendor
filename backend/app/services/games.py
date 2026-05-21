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
            await client.table("games").select("order").eq("id", game_id).execute()
        )
        if (
            not response.data
            or not isinstance(response.data, list)
            or not response.data[0]
        ):
            raise RoomNotFoundError(
                status_code=httpx.codes.NOT_FOUND, detail="Room not found"
            )

        order_info = response.data[0]
        order: dict[str, int] = (
            order_info.get("order") if isinstance(order_info, dict) else None
        )
        if not order:
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                detail="Order information is missing from database",
            )
        nicknames: dict[str, str] = {}
        for player_id in order:
            response = (
                await client.table("users")
                .select("nickname")
                .eq("id", player_id)
                .execute()
            )
            if (
                not response.data
                or not isinstance(response.data, list)
                or not response.data[0]
            ):
                raise InvalidDatabaseEntryError(
                    status_code=httpx.codes.NOT_FOUND,
                    detail="Player not found",
                )
            nickname_info = response.data[0]
            nicknames[player_id] = (
                nickname_info.get("nickname")
                if isinstance(nickname_info, dict)
                else None
            )
            if not nicknames[player_id]:
                raise InvalidDatabaseEntryError(
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                    detail="Nickname information is missing from database",
                )
        response = (
            await client.table("cards")
            .select("open", "closed")
            .eq("id", game_id)
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
        order: dict[str, int] = {
            player_id: i for i, player_id in enumerate(sorted_all_player_ids)
        }
        await self._generate_random_nicknames(
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
