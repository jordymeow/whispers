// Script to remove nickname field from existing users and drop the index
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
let MONGODB_URI = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('MONGODB_URI=')) {
      MONGODB_URI = line.substring('MONGODB_URI='.length).trim();
      // Remove quotes if present
      MONGODB_URI = MONGODB_URI.replace(/^["']|["']$/g, '');
      break;
    }
  }
} catch (err) {
  console.error('Could not read .env.local file:', err.message);
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function removeNicknameField() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check if collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      console.log('Users collection does not exist yet');
      await mongoose.disconnect();
      return;
    }

    // Drop the nickname index if it exists
    try {
      await usersCollection.dropIndex('nickname_1');
      console.log('Dropped nickname index');
    } catch (err) {
      console.log('Nickname index does not exist or already dropped');
    }

    // Remove nickname field from all documents
    const result = await usersCollection.updateMany(
      {},
      { $unset: { nickname: "" } }
    );
    console.log(`Updated ${result.modifiedCount} documents to remove nickname field`);

    // List remaining indexes
    const indexes = await usersCollection.indexes();
    console.log('Remaining indexes:', indexes.map(idx => idx.name));

    await mongoose.disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

removeNicknameField();