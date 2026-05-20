from app.services.database import DatabaseService


class UsersService:
    async def edit_nickname(self, user_id: str, nickname: str) -> None:
        client = await DatabaseService().get_client()
        await client.table("users").update(
            {
                "nickname": nickname,
            }
        ).eq("id", user_id).execute()
