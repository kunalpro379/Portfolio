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

async function debugFileIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get the folder
    const folder = await Folder.findOne({ name: 'Cloud computing' });
    console.log('=== FOLDER ===');
    console.log('Folder ID:', folder?.folderId);
    console.log('Folder Name:', folder?.name);
    console.log('Folder Path:', `"${folder?.path}"`);
    console.log('Folder Path Length:', folder?.path?.length);
    console.log('Folder Path Bytes:', Buffer.from(folder?.path || '').toString('hex'));

    // Get the file
    const file = await File.findOne({ fileId: 'ccm3x92kq7v1a8p4zt6d' });
    console.log('\n=== FILE ===');
    console.log('File ID:', file?.fileId);
    console.log('Filename:', file?.filename);
    console.log('Folder Path:', `"${file?.folderPath}"`);
    console.log('Folder Path Length:', file?.folderPath?.length);
    console.log('Folder Path Bytes:', Buffer.from(file?.folderPath || '').toString('hex'));

    // Check if they match
    console.log('\n=== COMPARISON ===');
    console.log('Paths match:', folder?.path === file?.folderPath);
    console.log('Folder path === File folderPath:', folder?.path === file?.folderPath);

    // Try to find files with this folder path
    console.log('\n=== QUERY TEST ===');
    const filesFound = await File.find({ folderPath: folder?.path });
    console.log('Files found with folder.path:', filesFound.length);
    filesFound.forEach(f => {
      console.log(`  - ${f.filename} (${f.fileId})`);
    });

    // Try to find files with exact string
    const filesFound2 = await File.find({ folderPath: 'Cloud computing' });
    console.log('\nFiles found with "Cloud computing":', filesFound2.length);
    filesFound2.forEach(f => {
      console.log(`  - ${f.filename} (${f.fileId})`);
    });

    // List all files
    console.log('\n=== ALL FILES ===');
    const allFiles = await File.find({});
    console.log('Total files in database:', allFiles.length);
    allFiles.forEach(f => {
      console.log(`  - ${f.filename}`);
      console.log(`    Folder Path: "${f.folderPath}"`);
      console.log(`    File ID: ${f.fileId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

debugFileIssue();
