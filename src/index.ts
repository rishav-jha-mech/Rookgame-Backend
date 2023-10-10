import bodyParser from "body-parser";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { db } from "./db";
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
app.options("*", cors());

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

// write a route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Socket.io logic for handling connections and game events
io.on(
  "connection",
  (socket: {
    id: any;
    on: (arg0: string, arg1: { (data: any): void; (): void }) => void;
    broadcast: { emit: (arg0: string, arg1: any) => void };
  }) => {
    console.log("Player connected:", socket.id);

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
    });
  }
);

db.once("open", function () {
  // Start your Express app here
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
