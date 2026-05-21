import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const HOST_BY_GAME_STORAGE_KEY = 'splendor-host-by-game';
const HOST_TTL_MS = 24 * 60 * 60 * 1000;

type HostEntry = {
  isHost: boolean;
  expiresAt: number;
};

type HostByGameStorage = Record<string, HostEntry>;

export type HostByGameId = Record<string, boolean>;

function pruneExpired(storage: HostByGameStorage): HostByGameStorage {
  const now = Date.now();
  return Object.fromEntries(Object.entries(storage).filter(([, entry]) => entry.expiresAt > now));
}

function migrateHostStorage(value: unknown): HostByGameStorage {
  if (!value || typeof value !== 'object') return {};

  const result: HostByGameStorage = {};
  for (const [gameId, entry] of Object.entries(value)) {
    if (typeof entry === 'boolean') {
      result[gameId] = { isHost: entry, expiresAt: Date.now() + HOST_TTL_MS };
    } else if (
      entry &&
      typeof entry === 'object' &&
      'isHost' in entry &&
      typeof entry.isHost === 'boolean' &&
      'expiresAt' in entry &&
      typeof entry.expiresAt === 'number'
    ) {
      result[gameId] = { isHost: entry.isHost, expiresAt: entry.expiresAt };
    }
  }
  return pruneExpired(result);
}

function storageToHostByGameId(storage: HostByGameStorage): HostByGameId {
  return Object.fromEntries(
    Object.entries(pruneExpired(storage)).map(([gameId, entry]) => [gameId, entry.isHost]),
  );
}

const hostByGameStorage = createJSONStorage<HostByGameStorage>(() => {
  if (typeof window === 'undefined') {
    return undefined as unknown as Storage;
  }
  return sessionStorage;
});

const hostByGamePersistedStorage = {
  ...hostByGameStorage,
  getItem: (key: string, initialValue: HostByGameStorage) => {
    const value = hostByGameStorage.getItem(key, initialValue);
    return migrateHostStorage(value);
  },
  setItem: (key: string, value: HostByGameStorage) => {
    hostByGameStorage.setItem(key, pruneExpired(value));
  },
};

const hostByGameStorageAtom = atomWithStorage<HostByGameStorage>(
  HOST_BY_GAME_STORAGE_KEY,
  {},
  hostByGamePersistedStorage,
  { getOnInit: true },
);

export const gameIdAtom = atom<string>('');

export const hostByGameIdAtom = atom(
  (get) => storageToHostByGameId(get(hostByGameStorageAtom)),
  (get, set, update: HostByGameId | ((prev: HostByGameId) => HostByGameId)) => {
    const storage = get(hostByGameStorageAtom);
    const prev = storageToHostByGameId(storage);
    const next = typeof update === 'function' ? update(prev) : update;
    const pruned = pruneExpired(storage);
    const newStorage: HostByGameStorage = {};

    for (const gameId of Object.keys(next)) {
      const isHost = next[gameId];
      const existing = pruned[gameId];
      const prevIsHost = prev[gameId] ?? false;

      if (existing && isHost === existing.isHost && isHost === prevIsHost) {
        newStorage[gameId] = existing;
      } else {
        newStorage[gameId] = { isHost, expiresAt: Date.now() + HOST_TTL_MS };
      }
    }

    set(hostByGameStorageAtom, newStorage);
  },
);

export function isHostForGame(hostByGameId: HostByGameId, gameId: string): boolean {
  return hostByGameId[gameId] ?? false;
}
