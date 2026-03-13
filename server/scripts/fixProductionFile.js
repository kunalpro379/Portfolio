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

async function fixProductionFile() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Find all folders with "Cloud computing" in the name
    const folders = await Folder.find({ name: /Cloud computing/i });
    console.log('=== FOLDERS FOUND ===');
    folders.forEach((f, idx) => {
      console.log(`${idx + 1}. Name: "${f.name}"`);
      console.log(`   Path: "${f.path}"`);
      console.log(`   ID: ${f.folderId}`);
      console.log('');
    });

    // Use the existing production folder (any Cloud computing folder)
    const productionFolder = folders[0]; // Use the first one found
    
    if (!productionFolder) {
      console.log('No Cloud computing folder found!');
      return;
    }

    console.log('Using production folder:');
    console.log(`  Name: "${productionFolder.name}"`);
    console.log(`  Path: "${productionFolder.path}"`);
    console.log(`  ID: ${productionFolder.folderId}\n`);

    // Update or create the file with the correct folder path
    const fileData = {
      fileId: 'ccm3x92kq7v1a8p4zt6d',
      filename: 'CC-module3.pdf',
      folderPath: productionFolder.path, // Use the exact path from production folder
      cloudinaryPath: 'notes/Cloud computing/CC-module3.pdf',
      cloudinaryUrl: 'https://notesportfolio.blob.core.windows.net/notes/notes/Cloud computing/CC-module3.pdf',
      fileType: 'application/pdf',
      size: 0,
      uploadedAt: new Date('2026-03-10T12:30:00.000Z')
    };

    const existingFile = await File.findOne({ fileId: fileData.fileId });
    
    if (existingFile) {
      console.log('File exists, updating...');
      Object.assign(existingFile, fileData);
      await existingFile.save();
      console.log('✓ File updated!');
    } else {
      console.log('Creating new file...');
      const file = new File(fileData);
      await file.save();
      console.log('✓ File created!');
    }

    // Verify
    console.log('\n=== VERIFICATION ===');
    const filesInFolder = await File.find({ folderPath: productionFolder.path });
    console.log(`Files in "${productionFolder.name}": ${filesInFolder.length}`);
    filesInFolder.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.filename} (${f.fileId})`);
    });

    // Delete the duplicate folder we created
    const duplicateFolder = folders.find(f => f.folderId === 'folder_1773146947862_xx9oxsdoc');
    if (duplicateFolder) {
      console.log('\n=== CLEANUP ===');
      console.log('Deleting duplicate folder...');
      await Folder.deleteOne({ folderId: duplicateFolder.folderId });
      console.log('✓ Duplicate folder deleted');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

fixProductionFile();
 bro 