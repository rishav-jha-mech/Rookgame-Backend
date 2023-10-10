import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

interface IPlayer {
  playerId: string;
  socketId: string;
}

interface IGameState {
  isGameStarted: boolean;
  isGameCompleted: boolean;
  gameStartTime?: Date;
  winnerId?: string;
  winner?: string;
  reason?: string;
}

export interface IGame extends Document {
  gameId: string;
  players: IPlayer[];
  gameState: IGameState;
}

const gameSchema = new Schema<IGame>(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
    },
    players: [
      {
        playerId: {
          type: String,
          required: true,
        },
        playerName: {
          type: String,
          required: true,
        },
        socketId: {
          type: String,
          required: true,
        },
      },
    ],
    gameState: {
      isGameStarted: {
        type: Boolean,
        required: true,
        default: false,
      },
      isGameCompleted: {
        type: Boolean,
        required: true,
        default: false,
      },
      gameStartTime: {
        type: Date,
      },
      winnerId: {
        type: String,
      },
      winner: {
        type: String,
      },
      reason: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model<IGame>("Game", gameSchema);

export default Game;
