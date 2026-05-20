'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import { RoomResponse, roomRequestSchema } from '@/types/room';

export async function createRoom(gameId: string, playerId: string): Promise<RoomResponse> {
  try {
    const request = roomRequestSchema.parse({
      game_id: gameId,
      player_id: playerId,
    });
    console.log('Creating room:', request);

    const response = await axios.post<RoomResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/rooms/create`,
      request,
    );
    if (response.status === StatusCodes.OK) {
      console.log('Room created successfully');
      return response.data;
    } else {
      throw new Error('Failed to create room', { cause: response.data });
    }
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}
