import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import Project from '../models/Project.js';

const router = express.Router();

// Initialize Azure Blob Storage client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB in bytes
  }
});

// Upload to Azure Blob Storage
const uploadToAzure = async (buffer, folder, filename, fileType) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPath = `projects/${folder}/${filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: fileType }
    });
    
    return {
      blobPath: blobPath,
      blobUrl: blockBlobClient.url
    };
  } catch (error) {
    console.error('Azure upload error:', error);
    throw error;
  }
};

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ priority: 1, created_at: -1 });
        res.json({ projects });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reorder projects
router.post('/reorder', async (req, res) => {
    try {
        const { projectIds } = req.body; // Array of projectIds in new order

        if (!Array.isArray(projectIds)) {
            return res.status(400).json({ message: 'projectIds must be an array' });
        }

        // Update priority for each project
        const updatePromises = projectIds.map((projectId, index) => 
            Project.findOneAndUpdate(
                { projectId },
                { priority: index, updated_at: new Date() },
                { new: true }
            )
        );

        await Promise.all(updatePromises);

        const projects = await Project.find().sort({ priority: 1, created_at: -1 });
        res.json({ message: 'Projects reordered successfully', projects });
    } catch (error) {
        console.error('Reorder projects error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new project
router.post('/create', async (req, res) => {
    try {
        const { projectId, title, tagline, footer, description, tags, links } = req.body;

        if (!projectId || !title) {
            return res.status(400).json({ message: 'Project ID and title are required' });
        }

        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const project = new Project({
            projectId,
            title,
            slug,
            tagline: tagline || '',
            footer: footer || '',
            description: description || '',
            tags: tags || [],
            links: links || [],
            assets: [],
            cardasset: [],
            mdFiles: [],
            created_at: new Date(),
            updated_at: new Date()
        });

        await project.save();

        res.status(201).json({
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single project
router.get('/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findOne({ projectId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ project });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get MD file content from Cloudinary
router.get('/:projectId/md-content', async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findOne({ projectId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!project.mdFiles || project.mdFiles.length === 0) {
            return res.json({ content: '', exists: false });
        }

        // Fetch MD file content from Cloudinary URL
        const mdUrl = project.mdFiles[0];
        const response = await fetch(mdUrl);
        const content = await response.text();

        res.json({ content, exists: true, url: mdUrl });
    } catch (error) {
        console.error('Get MD content error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update project
router.put('/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const updateData = req.body;

        const project = await Project.findOneAndUpdate(
            { projectId },
            { ...updateData, updated_at: new Date() },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project updated successfully', project });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload MD file
router.post('/:projectId/md-file', upload.single('mdFile'), async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findOne({ projectId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Delete old MD file from Azure if exists
        if (project.mdFiles && project.mdFiles.length > 0) {
            const oldUrl = project.mdFiles[0];
            const blobPath = oldUrl.split(`${containerName}/`)[1];
            if (blobPath) {
                try {
                    const containerClient = blobServiceClient.getContainerClient(containerName);
                    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
                    await blockBlobClient.deleteIfExists();
                } catch (err) {
                    console.error('Error deleting old MD file:', err);
                }
            }
        }

        const filename = `${projectId}-content.md`;
        const result = await uploadToAzure(
            req.file.buffer,
            projectId,
            filename,
            'text/markdown'
        );

        project.mdFiles = [result.blobUrl];
        project.updated_at = new Date();
        await project.save();

        res.json({ message: 'MD file uploaded', url: result.blobUrl, project });
    } catch (error) {
        console.error('Upload MD file error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Upload assets
router.post('/:projectId/assets', upload.array('assets', 10), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { assetNames } = req.body; // Array of custom names
        const project = await Project.findOne({ projectId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedAssets = [];
        const names = assetNames ? JSON.parse(assetNames) : [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const result = await uploadToAzure(
                file.buffer,
                `${projectId}/assets`,
                file.originalname,
                file.mimetype
            );
            
            uploadedAssets.push({
                name: names[i] || file.originalname.split('.')[0],
                url: result.blobUrl,
                filename: file.originalname
            });
        }

        project.assets = [...(project.assets || []), ...uploadedAssets];
        project.updated_at = new Date();
        await project.save();

        res.json({ message: 'Assets uploaded', assets: uploadedAssets, project });
    } catch (error) {
        console.error('Upload assets error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Upload card assets
router.post('/:projectId/cardassets', upload.array('cardassets', 5), async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findOne({ projectId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedUrls = [];

        for (const file of req.files) {
            const result = await uploadToAzure(
                file.buffer,
                `${projectId}/cards`,
                file.originalname,
                file.mimetype
            );
            uploadedUrls.push(result.blobUrl);
        }

        project.cardasset = [...(project.cardasset || []), ...uploadedUrls];
        project.updated_at = new Date();
        await project.save();

        res.json({ message: 'Card assets uploaded', urls: uploadedUrls, project });
    } catch (error) {
        console.error('Upload card assets error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update asset name
router.put('/:projectId/assets/:index/name', async (req, res) => {
    try {
        const { projectId, index } = req.params;
        const { name } = req.body;
        const project = await Project.findOne({ projectId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!project.assets[parseInt(index)]) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        project.assets[parseInt(index)].name = name;
        project.updated_at = new Date();
        await project.save();

        res.json({ message: 'Asset name updated', project });
    } catch (error) {
        console.error('Update asset name error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete asset
router.delete('/:projectId/assets/:index', async (req, res) => {
    try {
        const { projectId, index } = req.params;
        const project = await Project.findOne({ projectId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const asset = project.assets[parseInt(index)];
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        // Delete from Azure
        try {
            const assetUrl = typeof asset === 'string' ? asset : asset?.url;
            
            if (assetUrl && typeof assetUrl === 'string') {
                const blobPath = assetUrl.split(`${containerName}/`)[1];
                if (blobPath) {
                    const containerClient = blobServiceClient.getContainerClient(containerName);
                    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
                    await blockBlobClient.deleteIfExists();
                    console.log('Deleted from Azure:', blobPath);
                }
            } else {
                console.log('No valid URL to delete from Azure');
            }
        } catch (err) {
            console.error('Error deleting from Azure:', err);
        }

        project.assets.splice(parseInt(index), 1);
        project.updated_at = new Date();
        await project.save();

        res.json({ message: 'Asset deleted', project });
    } catch (error) {
        console.error('Delete asset error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete card asset
router.delete('/:projectId/cardassets/:index', async (req, res) => {
    try {
        const { projectId, index } = req.params;
        const project = await Project.findOne({ projectId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const assetUrl = project.cardasset[parseInt(index)];
        if (!assetUrl) {
            return res.status(404).json({ message: 'Card asset not found' });
        }

        // Delete from Azure
        const blobPath = assetUrl.split(`${containerName}/`)[1];
        if (blobPath) {
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
            await blockBlobClient.deleteIfExists();
        }

        project.cardasset.splice(parseInt(index), 1);
        project.updated_at = new Date();
        await project.save();

        res.json({ message: 'Card asset deleted', project });
    } catch (error) {
        console.error('Delete card asset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete project
router.delete('/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findOne({ projectId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Delete all assets from Azure
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Collect all URLs
        const allUrls = [
            ...(project.mdFiles || []),
            ...(project.assets || []).map(a => typeof a === 'string' ? a : a.url),
            ...(project.cardasset || [])
        ];

        for (const url of allUrls) {
            try {
                const blobPath = url.split(`${containerName}/`)[1];
                if (blobPath) {
                    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
                    await blockBlobClient.deleteIfExists();
                }
            } catch (err) {
                console.error('Error deleting from Azure:', err);
            }
        }

        await Project.deleteOne({ projectId });

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
