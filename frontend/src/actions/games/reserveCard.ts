'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import {
  type FetchGameDataResponse,
  type ReserveCardRequest,
  fetchGameDataResponseSchema,
  reserveCardRequestSchema,
} from '@/types/games';

export async function reserveCard(input: ReserveCardRequest): Promise<FetchGameDataResponse> {
  try {
    const request = reserveCardRequestSchema.parse(input);
    console.log('Reserving card:', request);

    const response = await axios.post<FetchGameDataResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/games/cards/reserve`,
      request,
    );
    if (response.status === StatusCodes.OK) {
      console.log('Card reserved successfully');
      return fetchGameDataResponseSchema.parse(response.data);
    } else {
      throw new Error('Failed to reserve card', { cause: response.data });
    }
  } catch (error) {
    console.error('Error reserving card:', error);
    throw error;
  }
}
