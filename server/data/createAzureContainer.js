import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

async function createContainer() {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Check if container exists
    const exists = await containerClient.exists();
    
    if (exists) {
      console.log(`Container "${containerName}" already exists.`);
    } else {
      // Create container with public access for blobs
      await containerClient.create({
        access: 'blob' // Allows public read access to blobs
      });
      console.log(`Container "${containerName}" created successfully!`);
    }
  } catch (error) {
    console.error('Error creating container:', error.message);
  }
}

createContainer();
