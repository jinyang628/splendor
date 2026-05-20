import hashlib
import random

DEFAULT_NICKNAMES = [
    "Baron von Pebble",
    "Gem Goblin",
    "Count Quartzula",
    "The Velvet Merchant",
    "Ruby Tax Evader",
    "Lord of the Rings",
    "Sapphire Addict",
    "Coin Sniffer",
    "Diamond Hands",
    "Cardboard Aristocrat",
    "The Marble Mogul",
    "Emerald Enjoyer",
    "Prestige Gremlin",
    "Silk Road Steve",
    "Gemstone Janitor",
    "Duke of Discounts",
    "The Noble Hoarder",
    "Sir Shiny Things",
]


def generate_nickname(
    game_id: str,
    player_id: str,
    all_player_ids: list[str],
) -> str:
    """
    Guarantees unique nicknames within a game
    as long as player IDs are unique.
    """

    # Deterministically shuffle nicknames using game_id
    seed = int(hashlib.sha256(game_id.encode()).hexdigest(), 16)

    rng = random.Random(seed)

    nicknames = DEFAULT_NICKNAMES.copy()
    rng.shuffle(nicknames)

    # Deterministic player ordering
    sorted_players = sorted(all_player_ids)

    player_index = sorted_players.index(player_id)

    return nicknames[player_index]
