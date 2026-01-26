import { uploadDocumentToQdrant, getCollectionStats } from '../vectordb.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to process and upload JSON files
async function uploadJsonFile(filePath, metadata = {}) {
  try {
    console.log(`📄 Processing JSON file: ${filePath}`);
    
    const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Convert JSON to readable text format for better vector search
    let textContent = '';
    
    if (filePath.includes('timetable.json')) {
      // Special handling for timetable
      textContent = `College: ${jsonContent.college}\n`;
      textContent += `Branch: ${jsonContent.branch}\n`;
      textContent += `Class Division: ${jsonContent.class_division}\n\n`;
      textContent += `## Class Schedule\n\n`;
      
      for (const [day, classes] of Object.entries(jsonContent.timetable)) {
        textContent += `### ${day}\n`;
        for (const classInfo of classes) {
          textContent += `Time: ${classInfo.time}\n`;
          textContent += `Subject: ${classInfo.subject}\n`;
          textContent += `Room: ${classInfo.room}\n`;
          textContent += `Teacher: ${classInfo.teacher}\n`;
          textContent += `Note: ${classInfo.note}\n\n`;
        }
      }
    } else {
      // Generic JSON to text conversion
      textContent = JSON.stringify(jsonContent, null, 2);
    }
    
    // Upload to vector database
    await uploadDocumentToQdrant(textContent, {
      ...metadata,
      file_type: 'json',
      file_path: filePath,
      original_format: 'json'
    });
    
    console.log(`✅ Successfully uploaded ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error uploading ${filePath}:`, error);
  }
}

// Function to upload text/markdown files
async function uploadTextFile(filePath, metadata = {}) {
  try {
    console.log(`📄 Processing text file: ${filePath}`);
    
    const textContent = fs.readFileSync(filePath, 'utf8');
    
    // Upload to vector database
    await uploadDocumentToQdrant(textContent, {
      ...metadata,
      file_type: path.extname(filePath).slice(1),
      file_path: filePath,
      original_format: path.extname(filePath).slice(1)
    });
    
    console.log(`✅ Successfully uploaded ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error uploading ${filePath}:`, error);
  }
}

// Main function to upload all data files
async function uploadAllDataFiles() {
  try {
    console.log('🚀 Starting data files upload to vector database...\n');
    
    const projectRoot = path.join(__dirname, '..');
    
    // Upload timetable.json
    const timetablePath = path.join(projectRoot, 'data', 'timetable.json');
    if (fs.existsSync(timetablePath)) {
      await uploadJsonFile(timetablePath, {
        category: 'schedule',
        importance: 'high',
        type: 'timetable'
      });
    }
    
    // Upload AI/md.md if exists
    const aiMdPath = path.join(projectRoot, 'AI', 'md.md');
    if (fs.existsSync(aiMdPath)) {
      await uploadTextFile(aiMdPath, {
        category: 'portfolio',
        importance: 'high',
        type: 'profile'
      });
    }
    
    // Upload any other JSON files in data directory
    const dataDir = path.join(projectRoot, 'data');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      for (const file of files) {
        if (file.endsWith('.json') && file !== 'timetable.json') {
          const filePath = path.join(dataDir, file);
          await uploadJsonFile(filePath, {
            category: 'data',
            importance: 'medium'
          });
        } else if (file.endsWith('.md') || file.endsWith('.txt')) {
          const filePath = path.join(dataDir, file);
          await uploadTextFile(filePath, {
            category: 'documentation',
            importance: 'medium'
          });
        }
      }
    }
    
    console.log('\n🎉 All data files uploaded successfully!');
    
    // Show collection statistics
    console.log('\n📊 Collection Statistics:');
    await getCollectionStats();
    
  } catch (error) {
    console.error('❌ Error during upload process:', error);
  }
}

// Run the upload process
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadAllDataFiles();
}

export { uploadAllDataFiles, uploadJsonFile, uploadTextFile };