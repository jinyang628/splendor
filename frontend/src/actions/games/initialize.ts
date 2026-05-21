'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import { initializeRequestSchema } from '@/types/games';

export async function initialize(gameId: string): Promise<void> {
  try {
    const request = initializeRequestSchema.parse({
      game_id: gameId,
    });
    console.log('Initializing game:', request);

    const response = await axios.post(
      `${process.env.SERVER_BASE_URL}/api/v1/games/initialize`,
      request,
    );
    if (response.status === StatusCodes.OK) {
      console.log('Room created successfully');
      return;
    } else {
      throw new Error('Failed to create room', { cause: response.data });
    }
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}
