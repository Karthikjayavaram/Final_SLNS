const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function deleteLocalUploads() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    for (const file of files) {
      try {
        fs.unlinkSync(path.join(uploadDir, file));
        console.log(`[Purge] Deleted local file: ${file}`);
      } catch (e) {
        console.error(`[Purge] Failed to delete ${file}:`, e);
      }
    }
  }
}

async function deleteCloudinaryFolder() {
  if (!isCloudinaryConfigured) return;
  try {
    const result = await cloudinary.api.delete_resources_by_prefix('slns_portfolio');
    console.log('[Purge] Cloudinary resources deleted:', result.deleted);
    await cloudinary.api.delete_folder('slns_portfolio');
    console.log('[Purge] Cloudinary folder removed');
  } catch (e) {
    console.error('[Purge] Cloudinary error:', e);
  }
}

async function dropMongoCollections() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[Purge] No MONGODB_URI set – skipping DB purge');
    return;
  }
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const collections = ['projects', 'eventstyles', 'bookings', 'testimonials', 'sitecontents', 'comments'];
    for (const coll of collections) {
      try {
        await db.collection(coll).drop();
        console.log(`[Purge] Dropped collection: ${coll}`);
      } catch (e) {
        console.warn(`[Purge] Could not drop ${coll}:`, e.message);
      }
    }
    await mongoose.disconnect();
  } catch (e) {
    console.error('[Purge] MongoDB error:', e);
  }
}

async function main() {
  console.log('=== Starting purge ===');
  await deleteLocalUploads();
  await deleteCloudinaryFolder();
  await dropMongoCollections();
  console.log('=== Purge finished ===');
}

main();
