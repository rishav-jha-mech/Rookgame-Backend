import { MONGO_DB_URL } from "./constants";

import { MongoClient, ServerApiVersion } from "mongodb";

export const db = new MongoClient(MONGO_DB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await db.connect();
    // Send a ping to confirm a successful connection
    await db.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await db.close();
  }
}
run().catch(console.dir);
