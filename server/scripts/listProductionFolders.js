import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const folderSchema = new mongoose.Schema({
  folderId: String,
  name: String,
  path: String,
  parentPath: String,
  createdAt: Date
});

const fileSchema = new mongoose.Schema({
  fileId: String,
  filename: String,
  folderPath: String,
  cloudinaryPath: String,
  cloudinaryUrl: String,
  fileType: String,
  size: Number,
  uploadedAt: Date
});

const Folder = mongoose.model('Folder', folderSchema, 'folders');
const File = mongoose.model('File', fileSchema, 'files');

async function listProductionFolders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // List ALL folders
    const folders = await Folder.find({}).sort({ name: 1 });
    console.log(`=== ALL FOLDERS (${folders.length}) ===`);
    folders.forEach((f, idx) => {
      console.log(`${idx + 1}. "${f.name}"`);
      console.log(`   Path: "${f.path}"`);
      console.log(`   ID: ${f.folderId}`);
      console.log('');
    });

    // List ALL files
    const files = await File.find({}).sort({ filename: 1 });
    console.log(`\n=== ALL FILES (${files.length}) ===`);
    files.forEach((f, idx) => {
      console.log(`${idx + 1}. ${f.filename}`);
      console.log(`   Folder Path: "${f.folderPath}"`);
      console.log(`   File ID: ${f.fileId}`);
      console.log('');
    });

    // Check for Cloud computing specifically
    console.log('\n=== CLOUD COMPUTING SEARCH ===');
    const ccFolders = await Folder.find({ $or: [
      { name: /cloud/i },
      { path: /cloud/i }
    ]});
    console.log(`Folders matching "cloud": ${ccFolders.length}`);
    ccFolders.forEach(f => {
      console.log(`  - "${f.name}" (${f.folderId})`);
    });

    const ccFiles = await File.find({ folderPath: /cloud/i });
    console.log(`\nFiles in cloud folders: ${ccFiles.length}`);
    ccFiles.forEach(f => {
      console.log(`  - ${f.filename} in "${f.folderPath}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

listProductionFolders();
