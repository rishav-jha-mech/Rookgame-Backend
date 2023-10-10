import mongoose from "mongoose";
import { MONGO_DB_URL } from "./constants";

mongoose.connect(MONGO_DB_URL as string);

// Get the default connection
export const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
  // Start your Express app here
});
