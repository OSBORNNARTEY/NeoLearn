require('dotenv').config();
const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && cachedClient) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const db = client.db('udemyClone'); // adjust name if needed

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = connectToDatabase;
