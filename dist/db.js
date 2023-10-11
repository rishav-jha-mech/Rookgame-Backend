"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const constants_1 = require("./constants");
const mongodb_1 = require("mongodb");
exports.db = new mongodb_1.MongoClient(constants_1.MONGO_DB_URL, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await exports.db.connect();
        // Send a ping to confirm a successful connection
        await exports.db.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // Ensures that the client will close when you finish/error
        await exports.db.close();
    }
}
run().catch(console.dir);
