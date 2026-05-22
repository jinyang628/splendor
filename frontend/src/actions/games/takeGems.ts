'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import {
  type FetchGameDataResponse,
  type TakeGemsRequest,
  fetchGameDataResponseSchema,
  takeGemsRequestSchema,
} from '@/types/games';

export async function takeGems(input: TakeGemsRequest): Promise<FetchGameDataResponse> {
  try {
    const request = takeGemsRequestSchema.parse(input);
    console.log('Taking gems:', request);

    const response = await axios.post<FetchGameDataResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/games/gems/take`,
      request,
    );
    if (response.status === StatusCodes.OK) {
      console.log('Gems taken successfully');
      return fetchGameDataResponseSchema.parse(response.data);
    } else {
      throw new Error('Failed to take gems', { cause: response.data });
    }
  } catch (error) {
    console.error('Error taking gems:', error);
    throw error;
  }
}
