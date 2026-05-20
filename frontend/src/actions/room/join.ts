'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import { roomRequestSchema } from '@/types/room';

export async function joinRoom(gameId: string, playerId: string): Promise<void> {
  try {
    const request = roomRequestSchema.parse({
      game_id: gameId,
      player_id: playerId,
    });
    console.log('Joining room:', request);

    const response = await axios.post(`${process.env.SERVER_BASE_URL}/api/v1/rooms/join`, request);
    if (response.status === StatusCodes.OK) {
      console.log('Room joined successfully');
      return;
    } else {
      throw new Error('Failed to join room', { cause: response.data });
    }
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
}
