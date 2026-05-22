import httpx

from app.models.base import MAX_PLAYER_GEMS, FetchGameDataResponse
from app.models.games import (PLAYER_COUNT_TO_GEM_STACK_SIZE, Card, CardLevel,
                              GemColor)
from app.services.database import DatabaseService
from app.services.utils import instantiate_game_cards, serialize_cards_by_level
from app.utils.errors import (InvalidDatabaseEntryError, InvalidGameLogicError,
                              RoomNotFoundError)
from app.utils.rooms import generate_nicknames

TAKEABLE_GEM_COLORS = [
    GemColor.BLACK,
    GemColor.BLUE,
    GemColor.GREEN,
    GemColor.RED,
    GemColor.WHITE,
]

class GamesService:
    async def fetch_game_data(self, game_id: str) -> FetchGameDataResponse:
        client = await DatabaseService().get_client()
        game_response = await client.table("games").select("turn").eq("id", game_id).execute()
        if (
            not game_response.data
            or not isinstance(game_response.data, list)
            or not game_response.data[0]
        ):
            raise RoomNotFoundError(
                status_code=httpx.codes.NOT_FOUND, detail="Game not found"
            )
        turn = game_response.data[0]["turn"]

        response = (
            await client.table("players")
            .select(
                "id",
                "nickname",
                "order",
                "blue",
                "black",
                "green",
                "red",
                "white",
                "gold",
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
                status_code=httpx.codes.NOT_FOUND, detail="Players not found"
            )
        order: dict[str, int] = {}
        nicknames: dict[str, str] = {}
        gems_owned: dict[str, dict[GemColor, int]] = {}
        for player_info in response.data:
            gems_owned_by_player: dict[GemColor, int] = {}
            for gem_color in GemColor:
                gems_owned_by_player[gem_color] = player_info[gem_color]
            gems_owned[player_info["id"]] = gems_owned_by_player
            order[player_info["id"]] = player_info["order"]
            nicknames[player_info["id"]] = player_info["nickname"]
        gems_available: dict[GemColor, int] = {}
        response = (
            await client.table("gems")
            .select("blue", "black", "green", "red", "white", "gold")
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
                detail="Gems not found",
            )
        gems_info = response.data[0]
        for gem_color in GemColor:
            gems_available[gem_color] = gems_info[gem_color]

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
            turn=turn,
            order=order,
            nicknames=nicknames,
            gems_available=gems_available,
            gems_owned=gems_owned,
            closed=closed_cards,
            open=open_cards,
        )

    async def take_gems(
        self,
        game_id: str,
        player_id: str,
        selected_gems: dict[GemColor, int],
    ) -> FetchGameDataResponse:
        normalized_selection = self._validate_selected_gems(selected_gems)
        client = await DatabaseService().get_client()

        gems_response = (
            await client.table("gems")
            .select("blue", "black", "green", "red", "white", "gold")
            .eq("game_id", game_id)
            .execute()
        )
        if not gems_response.data or not isinstance(gems_response.data, list):
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.NOT_FOUND,
                detail="Gems not found",
            )
        gems_info = gems_response.data[0]
        gems_available = {gem_color: gems_info[gem_color] for gem_color in GemColor}

        self._validate_take_against_available_gems(
            selected_gems=normalized_selection,
            gems_available=gems_available,
        )

        player_response = (
            await client.table("players")
            .select("order", "blue", "black", "green", "red", "white", "gold")
            .eq("game_id", game_id)
            .eq("id", player_id)
            .execute()
        )
        if not player_response.data or not isinstance(player_response.data, list):
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.NOT_FOUND,
                detail="Player not found",
            )
        player_info = player_response.data[0]
        current_player_gems = {
            gem_color: player_info[gem_color.value] for gem_color in GemColor
        }
        await self._validate_player_turn(
            game_id=game_id,
            player_id=player_id,
            player_order=player_info["order"],
        )

        if sum(current_player_gems.values()) > MAX_PLAYER_GEMS:
            raise InvalidGameLogicError(
                status_code=httpx.codes.BAD_REQUEST,
                detail="Discard gems down to 10 before taking more",
            )

        updated_gems_available = {
            gem_color.value: gems_available[gem_color] - normalized_selection[gem_color]
            for gem_color in GemColor
        }
        updated_player_gems = {
            gem_color.value: current_player_gems[gem_color] + normalized_selection[gem_color]
            for gem_color in GemColor
        }

        await client.table("gems").update(updated_gems_available).eq(
            "game_id", game_id
        ).execute()
        await client.table("players").update(updated_player_gems).eq(
            "game_id", game_id
        ).eq("id", player_id).execute()

        if sum(updated_player_gems.values()) <= MAX_PLAYER_GEMS:
            await self._increment_turn(game_id=game_id)

        return await self.fetch_game_data(game_id=game_id)

    async def discard_gems(
        self,
        game_id: str,
        player_id: str,
        discarded_gems: dict[GemColor, int],
    ) -> FetchGameDataResponse:
        normalized_discards = self._normalize_gem_counts(discarded_gems)
        discarded_total = sum(normalized_discards.values())
        if discarded_total < 1:
            raise InvalidGameLogicError(
                status_code=httpx.codes.BAD_REQUEST,
                detail="Select at least 1 gem to discard",
            )

        client = await DatabaseService().get_client()

        player_response = (
            await client.table("players")
            .select("order", "blue", "black", "green", "red", "white", "gold")
            .eq("game_id", game_id)
            .eq("id", player_id)
            .execute()
        )
        if not player_response.data or not isinstance(player_response.data, list):
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.NOT_FOUND,
                detail="Player not found",
            )
        player_info = player_response.data[0]
        player_gems = {gem_color: player_info[gem_color.value] for gem_color in GemColor}
        current_total = sum(player_gems.values())
        await self._validate_player_turn(
            game_id=game_id,
            player_id=player_id,
            player_order=player_info["order"],
        )

        if current_total <= MAX_PLAYER_GEMS:
            raise InvalidGameLogicError(
                status_code=httpx.codes.BAD_REQUEST,
                detail="Player does not need to discard gems",
            )

        for gem_color, count in normalized_discards.items():
            if count > player_gems[gem_color]:
                raise InvalidGameLogicError(
                    status_code=httpx.codes.BAD_REQUEST,
                    detail=f"Cannot discard more {gem_color.value} gems than the player owns",
                )

        required_discards = current_total - MAX_PLAYER_GEMS
        if discarded_total < required_discards:
            raise InvalidGameLogicError(
                status_code=httpx.codes.BAD_REQUEST,
                detail="Discard enough gems to get down to 10",
            )
        if discarded_total > required_discards:
            raise InvalidGameLogicError(
                status_code=httpx.codes.BAD_REQUEST,
                detail="Cannot discard more gems than needed to get down to 10",
            )

        gems_response = (
            await client.table("gems")
            .select("blue", "black", "green", "red", "white", "gold")
            .eq("game_id", game_id)
            .execute()
        )
        if not gems_response.data or not isinstance(gems_response.data, list):
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.NOT_FOUND,
                detail="Gems not found",
            )
        gems_info = gems_response.data[0]
        gems_available = {gem_color: gems_info[gem_color] for gem_color in GemColor}

        updated_player_gems = {
            gem_color.value: player_gems[gem_color] - normalized_discards[gem_color]
            for gem_color in GemColor
        }
        updated_gems_available = {
            gem_color.value: gems_available[gem_color] + normalized_discards[gem_color]
            for gem_color in GemColor
        }

        await client.table("players").update(updated_player_gems).eq(
            "game_id", game_id
        ).eq("id", player_id).execute()
        await client.table("gems").update(updated_gems_available).eq(
            "game_id", game_id
        ).execute()
        await self._increment_turn(game_id=game_id)

        return await self.fetch_game_data(game_id=game_id)

    async def _validate_player_turn(
        self, game_id: str, player_id: str, player_order: int
    ) -> None:
        client = await DatabaseService().get_client()
        players_response = (
            await client.table("players").select("id", "order").eq("game_id", game_id).execute()
        )
        if not players_response.data or not isinstance(players_response.data, list):
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.NOT_FOUND,
                detail="Players not found",
            )

        game_response = await client.table("games").select("turn").eq("id", game_id).execute()
        if (
            not game_response.data
            or not isinstance(game_response.data, list)
            or not game_response.data[0]
        ):
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.NOT_FOUND,
                detail="Game not found",
            )

        players_in_order = sorted(players_response.data, key=lambda player: player["order"])
        turn_index = (game_response.data[0]["turn"] - 1) % len(players_in_order)
        current_turn_player = players_in_order[turn_index]
        if player_id != current_turn_player["id"] or player_order != current_turn_player["order"]:
            raise InvalidGameLogicError(
                status_code=httpx.codes.FORBIDDEN,
                detail="It is not this player's turn",
            )

    async def _increment_turn(self, game_id: str) -> None:
        client = await DatabaseService().get_client()
        game_response = await client.table("games").select("turn").eq("id", game_id).execute()
        if (
            not game_response.data
            or not isinstance(game_response.data, list)
            or not game_response.data[0]
        ):
            raise InvalidDatabaseEntryError(
                status_code=httpx.codes.NOT_FOUND,
                detail="Game not found",
            )
        await client.table("games").update({"turn": game_response.data[0]["turn"] + 1}).eq(
            "id", game_id
        ).execute()

    def _normalize_gem_counts(self, gem_counts: dict[GemColor, int]) -> dict[GemColor, int]:
        normalized_counts = {
            gem_color: gem_counts.get(gem_color, 0) for gem_color in GemColor
        }
        for gem_color, count in normalized_counts.items():
            if count < 0:
                raise InvalidGameLogicError(
                    status_code=httpx.codes.BAD_REQUEST,
                    detail=f"Cannot use a negative number of {gem_color.value} gems",
                )
        return normalized_counts

    def _validate_selected_gems(
        self, selected_gems: dict[GemColor, int]
    ) -> dict[GemColor, int]:
        normalized_selection = self._normalize_gem_counts(selected_gems)

        if normalized_selection[GemColor.GOLD] > 0:
            raise InvalidGameLogicError(
                status_code=httpx.codes.BAD_REQUEST,
                detail="Gold gems cannot be taken with this action",
            )

        for gem_color, count in normalized_selection.items():
            if gem_color in TAKEABLE_GEM_COLORS and count > 2:
                raise InvalidGameLogicError(
                    status_code=httpx.codes.BAD_REQUEST,
                    detail=f"Cannot take more than 2 {gem_color.value} gems",
                )

        total_selected = sum(normalized_selection.values())
        selected_colors = [
            gem_color
            for gem_color in TAKEABLE_GEM_COLORS
            if normalized_selection[gem_color] > 0
        ]

        if total_selected < 1:
            raise InvalidGameLogicError(
                status_code=httpx.codes.BAD_REQUEST,
                detail="Select at least 1 gem",
            )
        if total_selected > 3:
            raise InvalidGameLogicError(
                status_code=httpx.codes.BAD_REQUEST,
                detail="Cannot take more than 3 gems",
            )

        is_two_same_color = len(selected_colors) == 1 and total_selected == 2
        is_unique_selection = all(
            normalized_selection[gem_color] == 1 for gem_color in selected_colors
        )

        if not is_two_same_color and not is_unique_selection:
            raise InvalidGameLogicError(
                status_code=httpx.codes.BAD_REQUEST,
                detail="Take up to 3 unique gems or exactly 2 gems of the same color",
            )

        return normalized_selection

    def _validate_take_against_available_gems(
        self,
        selected_gems: dict[GemColor, int],
        gems_available: dict[GemColor, int],
    ) -> None:
        for gem_color in TAKEABLE_GEM_COLORS:
            if selected_gems[gem_color] > gems_available[gem_color]:
                raise InvalidGameLogicError(
                    status_code=httpx.codes.BAD_REQUEST,
                    detail=f"Not enough {gem_color.value} gems available",
                )

        selected_colors = [
            gem_color
            for gem_color in TAKEABLE_GEM_COLORS
            if selected_gems[gem_color] > 0
        ]
        is_two_same_color = (
            len(selected_colors) == 1 and selected_gems[selected_colors[0]] == 2
        )
        if is_two_same_color:
            gem_color = selected_colors[0]
            if gems_available[gem_color] - 2 < 2:
                raise InvalidGameLogicError(
                    status_code=httpx.codes.BAD_REQUEST,
                    detail=f"At least 2 {gem_color.value} gems must remain after taking 2",
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

        gem_stack_size: int = PLAYER_COUNT_TO_GEM_STACK_SIZE[len(sorted_all_player_ids)]
        await client.table("gems").upsert(
            {
                "game_id": game_id,
                "blue": gem_stack_size,
                "black": gem_stack_size,
                "white": gem_stack_size,
                "green": gem_stack_size,
                "red": gem_stack_size,
                "gold": gem_stack_size,
            }
        ).execute()

        closed_cards, open_cards = instantiate_game_cards()
        await client.table("cards").upsert(
            {
                "game_id": game_id,
                "closed": serialize_cards_by_level(closed_cards),
                "open": serialize_cards_by_level(open_cards),
            }
        ).execute()
        await client.table("games").update({"is_ready": True}).eq(
            "id", game_id
        ).execute()
