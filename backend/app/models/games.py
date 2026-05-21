import enum
import uuid

from pydantic import BaseModel, Field


class CardLevel(enum.IntEnum):
    ONE = 1
    TWO = 2
    THREE = 3


class GemColor(enum.StrEnum):
    BLACK = "black"
    BLUE = "blue"
    WHITE = "white"
    GREEN = "green"
    RED = "red"
    GOLD = "gold"


class Card(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, description="Unique card identifier.")
    color: GemColor = Field(description="The bonus color provided by the card.")
    points: int = Field(description="The prestige points awarded by the card.")
    black: int = Field(description="Black gem cost to purchase the card.")
    blue: int = Field(description="Blue gem cost to purchase the card.")
    green: int = Field(description="Green gem cost to purchase the card.")
    red: int = Field(description="Red gem cost to purchase the card.")
    white: int = Field(description="White gem cost to purchase the card.")
    gold: int = Field(
        description="Gold gem cost to purchase the card.", default=0
    )  # Keep this field to streamline the datastructure


PLAYER_COUNT_TO_GEM_STACK_SIZE: dict[int, int] = {2: 4, 3: 5, 4: 7}
