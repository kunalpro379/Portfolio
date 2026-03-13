import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Folder Schema
const folderSchema = new mongoose.Schema({
  folderId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true,
    unique: true
  },
  parentPath: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// File Schema
const fileSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  filename: {
    type: String,
    required: true
  },
  folderPath: {
    type: String,
    required: true
  },
  cloudinaryPath: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  fileType: String,
  size: Number,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const Folder = mongoose.model('Folder', folderSchema, 'folders');
const File = mongoose.model('File', fileSchema, 'files');

async function checkCloudComputingFolder() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check if Cloud computing folder exists
    console.log('Checking for "Cloud computing" folder...');
    const folder = await Folder.findOne({ path: 'Cloud computing' });
    
    if (folder) {
      console.log('✓ Folder exists:');
      console.log('  - Folder ID:', folder.folderId);
      console.log('  - Name:', folder.name);
      console.log('  - Path:', folder.path);
      console.log('  - Parent Path:', folder.parentPath);
    } else {
      console.log('✗ Folder NOT found!');
      console.log('\nCreating "Cloud computing" folder...');
      
      const newFolder = new Folder({
        folderId: 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: 'Cloud computing',
        path: 'Cloud computing',
        parentPath: '',
        createdAt: new Date()
      });
      
      await newFolder.save();
      console.log('✓ Folder created successfully!');
      console.log('  - Folder ID:', newFolder.folderId);
      console.log('  - Name:', newFolder.name);
      console.log('  - Path:', newFolder.path);
    }

    // Check files in the folder
    console.log('\n--- Files in "Cloud computing" folder ---');
    const files = await File.find({ folderPath: 'Cloud computing' });
    console.log(`Total files: ${files.length}`);
    
    files.forEach((file, idx) => {
      console.log(`\n${idx + 1}. ${file.filename}`);
      console.log(`   - File ID: ${file.fileId}`);
      console.log(`   - Folder Path: ${file.folderPath}`);
      console.log(`   - URL: ${file.cloudinaryUrl}`);
    });

    // List all folders
    console.log('\n--- All Folders in Database ---');
    const allFolders = await Folder.find({});
    console.log(`Total folders: ${allFolders.length}`);
    allFolders.forEach((f, idx) => {
      console.log(`${idx + 1}. ${f.name} (path: "${f.path}")`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

// Run the script
checkCloudComputingFolder();
