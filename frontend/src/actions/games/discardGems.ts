'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import {
  type DiscardGemsRequest,
  type FetchGameDataResponse,
  discardGemsRequestSchema,
  fetchGameDataResponseSchema,
} from '@/types/games';

export async function discardGems(input: DiscardGemsRequest): Promise<FetchGameDataResponse> {
  try {
    const request = discardGemsRequestSchema.parse(input);
    console.log('Discarding gems:', request);

    const response = await axios.post<FetchGameDataResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/games/gems/discard`,
      request,
    );
    if (response.status === StatusCodes.OK) {
      console.log('Gems discarded successfully');
      return fetchGameDataResponseSchema.parse(response.data);
    } else {
      throw new Error('Failed to discard gems', { cause: response.data });
    }
  } catch (error) {
    console.error('Error discarding gems:', error);
    throw error;
  }
}
