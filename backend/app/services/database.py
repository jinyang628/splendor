import os
from typing import Optional

from supabase import AsyncClient, create_async_client

from app.utils.singleton import Singleton


class DatabaseService(metaclass=Singleton):
    _client: Optional[AsyncClient] = None
    _url: str
    _key: str

    def __init__(self) -> None:
        url: str | None = os.environ.get("SUPABASE_URL")
        if url is None:
            raise ValueError("SUPABASE_URL must be set")
        key: str | None = os.environ.get("SUPABASE_KEY")
        if key is None:
            raise ValueError("SUPABASE_KEY must be set")
        self._url = url
        self._key = key

    async def get_client(self) -> AsyncClient:
        if self._client is None:
            self._client = await create_async_client(self._url, self._key)
        return self._client
