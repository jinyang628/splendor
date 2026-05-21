'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import {
  type FetchGameDataResponse,
  fetchGameDataRequestSchema,
  fetchGameDataResponseSchema,
} from '@/types/games';

export async function fetchGameData(gameId: string): Promise<FetchGameDataResponse> {
  try {
    const request = fetchGameDataRequestSchema.parse({
      game_id: gameId,
    });
    console.log('Fetching game data:', request);

    const response = await axios.get<FetchGameDataResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/games/fetch`,
      { params: request },
    );
    if (response.status === StatusCodes.OK) {
      console.log('Game data fetched successfully');
      return fetchGameDataResponseSchema.parse(response.data);
    } else {
      throw new Error('Failed to fetch game data', { cause: response.data });
    }
  } catch (error) {
    console.error('Error fetching game data:', error);
    throw error;
  }
}
