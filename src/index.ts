import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { Types } from "mongoose";
import { Server } from "socket.io";
import { db } from "./db";
import Game from "./models/Game";
import gameRoutes from "./routes/gameRoutes";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
// Disable CORS
app.use(cors());

// Serve static files from the public folder
app.use(express.static("public"));

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Set up routes
app.use("/api/games", gameRoutes); // Mount game routes under '/api/games'

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
  }
);

// Socket.io logic for handling connections and game events
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Handle disconnections
  socket.on("disconnect", async () => {
    console.log("Player disconnected:", socket.id);
    try {
      const game = await Game.findOne({
        "players.socketId": socket.id,
      });

      if (game) {
        // If there is only one player who left the game
        if (game?.players.length == 1) {
          await Game.findOneAndRemove({
            _id: new Types.ObjectId(game?._id),
          }).lean();
          return;
        } else {
          // Player disconnected has lost the game and the other player has won
          let winner = {
            playerName: "",
            socketId: "",
          };
          let loser = {
            playerName: "",
            socketId: "",
          };
          game?.players.map((player) => {
            if (player.socketId != socket.id) winner = player;
          });
          game?.players.map((player) => {
            if (player.socketId == socket.id) loser = player;
          });

          const updatedGame = await Game.findOneAndUpdate(
            {
              _id: new Types.ObjectId(game?._id),
            },
            {
              $set: {
                "gameState.isGameCompleted": true,
                "gameState.winner": winner?.playerName,
                "gameState.reason": `${loser?.playerName} disconnected`,
              },
            },
            { new: true }
          );
          if (!updatedGame) {
            throw new Error("Game not found");
          }
          socket
            .to(updatedGame.players[0].socketId)
            .emit("game-ended", updatedGame);
          socket
            .to(updatedGame.players[1].socketId)
            .emit("game-ended", updatedGame);
        }
      }
      return game;
    } catch (error) {
      console.error(`Error in join-game socket event ${error}`);
    }
  });
  socket.on("join-game", async (data) => {
    const { gameId, player2Name, socketId } = JSON.parse(data);
    console.log({ gameId, player2Name, socketId });
    
    try {
      const game = await Game.findOne({
        _id: new Types.ObjectId(gameId),
      });
      if (!game) {
        console.log("game-not-found");
        socket.emit("game-not-found");
        return;
      } else if (game?.gameState.isGameCompleted) {
        console.log("game-ended");
        socket.emit("game-ended", game);
      } else if (game?.players.length == 2) {
        console.log("already-busy");
        socket.emit("already-busy");
        return;
      } else {
        const updatedGame = await Game.findOneAndUpdate(
          {
            _id: gameId,
          },
          {
            $push: {
              players: {
                playerName: player2Name,
                socketId,
              },
            },
          },
          { new: true }
        ).lean();
        if (updatedGame) {
          console.log(`${updatedGame.players[0].socketId}`);
          console.log(`${updatedGame.players[1].socketId}`);
          socket
            .to(`${updatedGame.players[0].socketId}`)
            .emit("start-game", updatedGame);
          socket.emit("start-game", updatedGame);
        }
      }
    } catch (error) {
      // game not found
      socket.emit("game-not-found");
      console.error(`Error in join-game socket event ${error}`);
    }
  });
});

db.once("open", function () {
  // Start your Express app here
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
