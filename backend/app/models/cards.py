import enum
import uuid

from pydantic import BaseModel, Field


class CardLevel(enum.IntEnum):
    ONE = 1
    TWO = 2
    THREE = 3


class CardColor(enum.StrEnum):
    BLACK = "black"
    BLUE = "blue"
    WHITE = "white"
    GREEN = "green"
    RED = "red"


class Card(BaseModel):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, description="Unique card identifier."
    )
    color: CardColor = Field(description="The bonus color provided by the card.")
    points: int = Field(description="The prestige points awarded by the card.")
    black: int = Field(description="Black gem cost to purchase the card.")
    blue: int = Field(description="Blue gem cost to purchase the card.")
    green: int = Field(description="Green gem cost to purchase the card.")
    red: int = Field(description="Red gem cost to purchase the card.")
    white: int = Field(description="White gem cost to purchase the card.")
