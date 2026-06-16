// scripts/testMongo.js
// Load environment variables (make sure .env.local exists)
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in .env.local');

    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const dbName = process.env.MONGODB_DB_NAME || 'test';
    const db = client.db(dbName);
    console.log('🗂 Using database:', db.databaseName);

    // List collections
    const collections = await db.collections();
    console.log('📚 Collections:', collections.map(c => c.collectionName));

    // Show up to 5 docs from the collection that stores your images (default: projects)
    const col = db.collection('projects');
    const docs = await col.find({}).limit(5).toArray();
    console.log('🔎 Sample docs from "projects" collection:', docs);

    await client.close();
  } catch (e) {
    console.error('❌ Connection error:', e.message);
  }
})();
