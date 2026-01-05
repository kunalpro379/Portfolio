import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import Blog from '../models/Blog.js';

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
    const blobPath = `blogs/${folder}/${filename}`;
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

// Get all blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ datetime: -1 });
        res.json({ blogs });
    } catch (error) {
        console.error('Get blogs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new blog
router.post('/create', async (req, res) => {
    try {
        const { blogId, title, tagline, subject, shortDescription, tags, datetime, footer, blogLinks } = req.body;

        if (!blogId || !title) {
            return res.status(400).json({ message: 'Blog ID and title are required' });
        }

        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const blog = new Blog({
            blogId,
            title,
            slug,
            tagline: tagline || '',
            subject: subject || '',
            shortDescription: shortDescription || '',
            tags: tags || [],
            datetime: datetime || new Date(),
            footer: footer || '',
            blogLinks: blogLinks || [],
            assets: [],
            mdFiles: [],
            coverImage: '',
            created_at: new Date(),
            updated_at: new Date()
        });

        await blog.save();

        res.status(201).json({
            message: 'Blog created successfully',
            blog
        });
    } catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single blog
router.get('/:blogId', async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json({ blog });
    } catch (error) {
        console.error('Get blog error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get MD file content from Azure
router.get('/:blogId/md-content', async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (!blog.mdFiles || blog.mdFiles.length === 0) {
            return res.json({ content: '', exists: false });
        }

        // Fetch MD file content from Azure URL
        const mdUrl = blog.mdFiles[0];
        const response = await fetch(mdUrl);
        const content = await response.text();

        res.json({ content, exists: true, url: mdUrl });
    } catch (error) {
        console.error('Get MD content error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update blog
router.put('/:blogId', async (req, res) => {
    try {
        const { blogId } = req.params;
        const updateData = req.body;

        const blog = await Blog.findOneAndUpdate(
            { blogId },
            { ...updateData, updated_at: new Date() },
            { new: true }
        );

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json({ message: 'Blog updated successfully', blog });
    } catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload MD file
router.post('/:blogId/md-file', upload.single('mdFile'), async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Delete old MD file from Azure if exists
        if (blog.mdFiles && blog.mdFiles.length > 0) {
            const oldUrl = blog.mdFiles[0];
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

        const filename = `${blogId}-content.md`;
        const result = await uploadToAzure(
            req.file.buffer,
            blogId,
            filename,
            'text/markdown'
        );

        blog.mdFiles = [result.blobUrl];
        blog.updated_at = new Date();
        await blog.save();

        res.json({ message: 'MD file uploaded', url: result.blobUrl, blog });
    } catch (error) {
        console.error('Upload MD file error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Upload assets
router.post('/:blogId/assets', upload.array('assets', 10), async (req, res) => {
    try {
        const { blogId } = req.params;
        const { assetNames } = req.body;
        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
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
                `${blogId}/assets`,
                file.originalname,
                file.mimetype
            );
            
            uploadedAssets.push({
                name: names[i] || file.originalname.split('.')[0],
                url: result.blobUrl,
                filename: file.originalname
            });
        }

        blog.assets = [...(blog.assets || []), ...uploadedAssets];
        blog.updated_at = new Date();
        await blog.save();

        res.json({ message: 'Assets uploaded', assets: uploadedAssets, blog });
    } catch (error) {
        console.error('Upload assets error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Upload cover image
router.post('/:blogId/cover', upload.single('cover'), async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Delete old cover image if exists
        if (blog.coverImage) {
            const blobPath = blog.coverImage.split(`${containerName}/`)[1];
            if (blobPath) {
                try {
                    const containerClient = blobServiceClient.getContainerClient(containerName);
                    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
                    await blockBlobClient.deleteIfExists();
                } catch (err) {
                    console.error('Error deleting old cover:', err);
                }
            }
        }

        const result = await uploadToAzure(
            req.file.buffer,
            `${blogId}/cover`,
            req.file.originalname,
            req.file.mimetype
        );

        blog.coverImage = result.blobUrl;
        blog.updated_at = new Date();
        await blog.save();

        res.json({ message: 'Cover image uploaded', url: result.blobUrl, blog });
    } catch (error) {
        console.error('Upload cover error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update asset name
router.put('/:blogId/assets/:index/name', async (req, res) => {
    try {
        const { blogId, index } = req.params;
        const { name } = req.body;
        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (!blog.assets[parseInt(index)]) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        blog.assets[parseInt(index)].name = name;
        blog.updated_at = new Date();
        await blog.save();

        res.json({ message: 'Asset name updated', blog });
    } catch (error) {
        console.error('Update asset name error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete asset
router.delete('/:blogId/assets/:index', async (req, res) => {
    try {
        const { blogId, index } = req.params;
        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const asset = blog.assets[parseInt(index)];
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
                }
            }
        } catch (err) {
            console.error('Error deleting from Azure:', err);
        }

        blog.assets.splice(parseInt(index), 1);
        blog.updated_at = new Date();
        await blog.save();

        res.json({ message: 'Asset deleted', blog });
    } catch (error) {
        console.error('Delete asset error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete blog
router.delete('/:blogId', async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Delete all assets from Azure
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Collect all URLs
        const allUrls = [
            ...(blog.mdFiles || []),
            ...(blog.assets || []).map(a => typeof a === 'string' ? a : a.url),
            blog.coverImage
        ].filter(url => url);

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

        await Blog.deleteOne({ blogId });

        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
