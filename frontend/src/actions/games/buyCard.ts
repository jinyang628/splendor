'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import {
  type BuyCardRequest,
  type FetchGameDataResponse,
  buyCardRequestSchema,
  fetchGameDataResponseSchema,
} from '@/types/games';

export async function buyCard(input: BuyCardRequest): Promise<FetchGameDataResponse> {
  try {
    const request = buyCardRequestSchema.parse(input);
    console.log('Buying card:', request);

    const response = await axios.post<FetchGameDataResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/games/cards/buy`,
      request,
    );
    if (response.status === StatusCodes.OK) {
      console.log('Card bought successfully');
      return fetchGameDataResponseSchema.parse(response.data);
    } else {
      throw new Error('Failed to buy card', { cause: response.data });
    }
  } catch (error) {
    console.error('Error buying card:', error);
    throw error;
  }
}
