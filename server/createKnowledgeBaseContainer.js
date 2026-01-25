import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'knowledge-base';

async function createKnowledgeBaseContainer() {
  try {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      console.error('❌ AZURE_STORAGE_CONNECTION_STRING not found in environment variables');
      process.exit(1);
    }

    console.log('🔄 Connecting to Azure Blob Storage...');
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    
    console.log(`🔄 Creating container: ${CONTAINER_NAME}...`);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    
    const createContainerResponse = await containerClient.createIfNotExists({
      access: 'blob' // Public read access for blobs
    });

    if (createContainerResponse.succeeded) {
      console.log(`✅ Container "${CONTAINER_NAME}" created successfully!`);
    } else {
      console.log(`ℹ️  Container "${CONTAINER_NAME}" already exists.`);
    }

    // Verify container exists
    const exists = await containerClient.exists();
    if (exists) {
      console.log(`✅ Container "${CONTAINER_NAME}" is ready to use!`);
      console.log(`📦 Container URL: ${containerClient.url}`);
    }

  } catch (error) {
    console.error('❌ Error creating container:', error.message);
    process.exit(1);
  }
}

createKnowledgeBaseContainer();