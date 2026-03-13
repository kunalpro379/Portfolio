import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

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

const File = mongoose.model('File', fileSchema, 'files');

async function addCloudComputingFile() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if file already exists
    const existingFile = await File.findOne({ fileId: 'ccm3x92kq7v1a8p4zt6d' });
    
    if (existingFile) {
      console.log('File already exists:', existingFile.filename);
      console.log('Updating file...');
      
      // Update the file
      existingFile.filename = 'CC-module3.pdf';
      existingFile.folderPath = 'Cloud computing';
      existingFile.cloudinaryPath = 'notes/Cloud computing/CC-module3.pdf';
      existingFile.cloudinaryUrl = 'https://notesportfolio.blob.core.windows.net/notes/notes/Cloud computing/CC-module3.pdf';
      existingFile.fileType = 'application/pdf';
      existingFile.size = 0;
      existingFile.uploadedAt = new Date('2026-03-10T12:30:00.000Z');
      
      await existingFile.save();
      console.log('✓ File updated successfully!');
    } else {
      // Create new file entry
      const fileData = {
        fileId: 'ccm3x92kq7v1a8p4zt6d',
        filename: 'CC-module3.pdf',
        folderPath: 'Cloud computing',
        cloudinaryPath: 'notes/Cloud computing/CC-module3.pdf',
        cloudinaryUrl: 'https://notesportfolio.blob.core.windows.net/notes/notes/Cloud computing/CC-module3.pdf',
        fileType: 'application/pdf',
        size: 0,
        uploadedAt: new Date('2026-03-10T12:30:00.000Z')
      };

      const file = new File(fileData);
      await file.save();
      
      console.log('✓ File added successfully!');
      console.log('File details:', {
        fileId: file.fileId,
        filename: file.filename,
        folderPath: file.folderPath,
        cloudinaryUrl: file.cloudinaryUrl
      });
    }

    // Verify the file exists in the folder
    const filesInFolder = await File.find({ folderPath: 'Cloud computing' });
    console.log(`\n✓ Total files in "Cloud computing" folder: ${filesInFolder.length}`);
    filesInFolder.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.filename} (${f.fileId})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

// Run the script
addCloudComputingFile();
