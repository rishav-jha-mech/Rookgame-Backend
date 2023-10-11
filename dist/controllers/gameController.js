"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = __importDefault(require("../models/Game"));
const mongoose_1 = require("mongoose");
class CreateAGameController {
    async createNewGame(req, res) {
        try {
            const { playerName, socketId } = req.body;
            if (!playerName || !socketId) {
                res
                    .status(400)
                    .json({ error: "Playername or SocketId missing in request" });
                return;
            }
            const newGame = new Game_1.default({
                players: [
                    {
                        playerName,
                        socketId,
                    },
                ],
                gameState: {
                    isGameStarted: false,
                    isGameCompleted: false,
                },
            });
            await newGame.save();
            res
                .status(200)
                .json({ message: "Game created successfully", game: newGame });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async checkGameExists(req, res) {
        try {
            const { gameId } = req.body;
            const game = await Game_1.default.findOne({
                _id: new mongoose_1.Types.ObjectId(gameId),
            });
            if (!game) {
                res.status(404).json({ error: "Game not found, check game id or create a new game" });
                return;
            }
            if (game.gameState.isGameStarted || game.players.length == 2) {
                res.status(400).json({ error: "Game already started" });
                return;
            }
            res.status(200).json({ message: "Game found", game });
        }
        catch (error) {
            console.error(error);
            if (`${error}`.includes("BSONError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer")) {
                res.status(404).json({ error: "Game not found, check game id or create a new game" });
            }
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
exports.default = new CreateAGameController();
