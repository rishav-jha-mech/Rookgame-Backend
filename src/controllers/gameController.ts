import { Request, Response } from 'express';
import Game from '../models/Game'; // Import your Game model
import { v4 as uuidv4 } from 'uuid';

class CreateAGameController {
  public async createNewGame(req: Request, res: Response): Promise<void> {
    try {
      const { playerName, socketId } = req.body;

      if (playerName == null && socketId == null) {
        res.status(400).json({ error: 'Playername or SocketId missing in request' });
        return;
      }

      const gameId = uuidv4();
      const playerId = uuidv4();

      const newGame = new Game({
        gameId,
        players: [
          {
            playerId,
            playerName,
            socketId
          },
        ],
        gameState: {
          isGameStarted: false,
          isGameCompleted: false,
        },
      });

      await newGame.save();

      res.status(200).json({ message: 'Game created successfully', game: newGame });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new CreateAGameController();
