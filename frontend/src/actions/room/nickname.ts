'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import { editNicknameRequestSchema } from '@/types/room';

export async function editNickname(gameId: string, playerId: string, nickname: string): Promise<void> {
  try {
    const request = editNicknameRequestSchema.parse({
      game_id: gameId,
      player_id: playerId,
      nickname: nickname
    });
    console.log('Editing nickname:', request);

    const response = await axios.patch(
      `${process.env.SERVER_BASE_URL}/api/v1/rooms/nickname`,
      request,
    );
    if (response.status === StatusCodes.OK) {
      console.log('Nickname edited successfully');
      return;
    } else {
      throw new Error('Failed to edit nickname', { cause: response.data });
    }
  } catch (error) {
    console.error('Error editing nickname:', error);
    throw error;
  }
}
