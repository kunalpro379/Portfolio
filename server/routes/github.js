import express from 'express';
import { GraphQLClient } from 'graphql-request';
import { MongoClient, ObjectId } from 'mongodb';

const router = express.Router();

// GitHub GraphQL API client
const githubClient = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
});

// MongoDB connection
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'Portfolio';

// Helper function to get database
async function getDatabase() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  return { client, db: client.db(dbName) };
}

// Parse GitHub URL to extract owner and repo
function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace('.git', '')
  };
}

// Get repository information from GitHub
async function getRepoInfo(owner, repo) {
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        id
        name
        description
        url
        isPrivate
        defaultBranchRef {
          name
        }
        owner {
          login
        }
      }
    }
  `;

  try {
    const data = await githubClient.request(query, { owner, repo });
    return data.repository;
  } catch (error) {
    console.error('GitHub API error:', error);
    throw new Error('Failed to fetch repository information');
  }
}

// Get repository tree from GitHub
async function getRepoTree(owner, repo, path = '', branch = 'main') {
  const expression = path ? `${branch}:${path}` : `${branch}:`;
  
  const query = `
    query($owner: String!, $repo: String!, $expression: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: $expression) {
          ... on Tree {
            entries {
              name
              path
              type
              object {
                ... on Blob {
                  byteSize
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await githubClient.request(query, { owner, repo, expression });
    if (!data.repository?.object?.entries) {
      return [];
    }

    return data.repository.object.entries.map(entry => ({
      name: entry.name,
      path: entry.path,
      type: entry.type === 'tree' ? 'dir' : 'file',
      size: entry.object?.byteSize || 0,
      sha: entry.path // Using path as identifier
    }));
  } catch (error) {
    console.error('GitHub tree API error:', error);
    throw new Error('Failed to fetch repository tree');
  }
}

// Get file content from GitHub
async function getFileContent(owner, repo, path, branch = 'main') {
  const query = `
    query($owner: String!, $repo: String!, $expression: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: $expression) {
          ... on Blob {
            text
            byteSize
          }
        }
      }
    }
  `;

  try {
    const data = await githubClient.request(query, { owner, repo, expression: `${branch}:${path}` });
    if (!data.repository?.object) {
      throw new Error('File not found');
    }

    return {
      content: data.repository.object.text,
      size: data.repository.object.byteSize,
      name: path.split('/').pop(),
      path: path,
      encoding: 'utf-8'
    };
  } catch (error) {
    console.error('GitHub file API error:', error);
    throw new Error('Failed to fetch file content');
  }
}

// Routes

// GET /api/github/repos - Get all stored repositories
router.get('/repos', async (req, res) => {
  try {
    const { client, db } = await getDatabase();
    const repos = await db.collection('github_repos').find({}).toArray();
    await client.close();

    res.json({ repos });
  } catch (error) {
    console.error('Error fetching repos:', error);
    res.status(500).json({ message: 'Failed to fetch repositories' });
  }
});

// POST /api/github/repos/add - Add a new repository
router.post('/repos/add', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'Repository URL is required' });
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return res.status(400).json({ message: 'Invalid GitHub URL' });
    }

    // Get repository info from GitHub
    const repoInfo = await getRepoInfo(parsed.owner, parsed.repo);
    if (!repoInfo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    const { client, db } = await getDatabase();
    
    // Check if repo already exists
    const existing = await db.collection('github_repos').findOne({
      owner: parsed.owner,
      name: parsed.repo
    });

    if (existing) {
      await client.close();
      return res.status(409).json({ message: 'Repository already added' });
    }

    // Store repository info
    const repoDoc = {
      name: repoInfo.name,
      owner: repoInfo.owner.login,
      fullName: `${repoInfo.owner.login}/${repoInfo.name}`,
      description: repoInfo.description || '',
      url: repoInfo.url,
      defaultBranch: repoInfo.defaultBranchRef?.name || 'main',
      isPrivate: repoInfo.isPrivate,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('github_repos').insertOne(repoDoc);
    await client.close();

    res.json({ 
      message: 'Repository added successfully',
      repo: { ...repoDoc, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error adding repo:', error);
    res.status(500).json({ message: error.message || 'Failed to add repository' });
  }
});

// GET /api/github/repos/:id - Get repository details
router.get('/repos/:id', async (req, res) => {
  try {
    const { client, db } = await getDatabase();
    const repo = await db.collection('github_repos').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    await client.close();

    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    res.json({ repo });
  } catch (error) {
    console.error('Error fetching repo:', error);
    res.status(500).json({ message: 'Failed to fetch repository' });
  }
});

// GET /api/github/repos/:id/tree - Get repository tree
router.get('/repos/:id/tree', async (req, res) => {
  try {
    const { path = '' } = req.query;
    
    const { client, db } = await getDatabase();
    const repo = await db.collection('github_repos').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    await client.close();

    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    const items = await getRepoTree(repo.owner, repo.name, path, repo.defaultBranch);
    res.json({ items });
  } catch (error) {
    console.error('Error fetching tree:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch repository tree' });
  }
});

// GET /api/github/repos/:id/file - Get file content
router.get('/repos/:id/file', async (req, res) => {
  try {
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({ message: 'File path is required' });
    }

    const { client, db } = await getDatabase();
    const repo = await db.collection('github_repos').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    await client.close();

    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    const file = await getFileContent(repo.owner, repo.name, path, repo.defaultBranch);
    res.json({ file });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch file content' });
  }
});

// DELETE /api/github/repos/:id - Remove repository
router.delete('/repos/:id', async (req, res) => {
  try {
    const { client, db } = await getDatabase();
    const result = await db.collection('github_repos').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    await client.close();

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    res.json({ message: 'Repository removed successfully' });
  } catch (error) {
    console.error('Error deleting repo:', error);
    res.status(500).json({ message: 'Failed to remove repository' });
  }
});

// POST /api/github/repos/:id/push-code - Push local code to GitHub repository
router.post('/repos/:id/push-code', async (req, res) => {
  try {
    const { folderPath, commitMessage = 'Update code from admin panel' } = req.body;
    
    if (!folderPath) {
      return res.status(400).json({ message: 'Folder path is required' });
    }

    const { client, db } = await getDatabase();
    
    // Get repository info
    const repo = await db.collection('github_repos').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!repo) {
      await client.close();
      return res.status(404).json({ message: 'Repository not found' });
    }

    // Get all files in the specified folder
    const files = await db.collection('codeFiles').find({ 
      folderPath: { $regex: `^${folderPath}` } 
    }).toArray();
    
    await client.close();

    if (files.length === 0) {
      return res.status(400).json({ message: 'No files found in the specified folder' });
    }

    // Get the current commit SHA of the default branch
    const refQuery = `
      query($owner: String!, $repo: String!, $ref: String!) {
        repository(owner: $owner, name: $repo) {
          ref(qualifiedName: $ref) {
            target {
              ... on Commit {
                oid
                tree {
                  oid
                }
              }
            }
          }
        }
      }
    `;

    const refData = await githubClient.request(refQuery, { 
      owner: repo.owner, 
      repo: repo.name, 
      ref: `refs/heads/${repo.defaultBranch}` 
    });

    const currentCommitSha = refData.repository.ref.target.oid;
    const currentTreeSha = refData.repository.ref.target.tree.oid;

    // Create blobs for each file
    const blobs = [];
    for (const file of files) {
      const createBlobMutation = `
        mutation($input: CreateBlobInput!) {
          createBlob(input: $input) {
            blob {
              oid
            }
          }
        }
      `;

      const blobResult = await githubClient.request(createBlobMutation, {
        input: {
          repositoryId: repo.id || `${repo.owner}/${repo.name}`,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'BASE64'
        }
      });

      // Calculate relative path from folder structure
      const relativePath = file.folderPath.replace(folderPath, '').replace(/^\//, '');
      const fullPath = relativePath ? `${relativePath}/${file.filename}` : file.filename;

      blobs.push({
        path: fullPath,
        mode: '100644',
        type: 'blob',
        sha: blobResult.createBlob.blob.oid
      });
    }

    // Create a new tree
    const createTreeMutation = `
      mutation($input: CreateTreeInput!) {
        createTree(input: $input) {
          tree {
            oid
          }
        }
      }
    `;

    const treeResult = await githubClient.request(createTreeMutation, {
      input: {
        repositoryId: repo.id || `${repo.owner}/${repo.name}`,
        baseTreeSha: currentTreeSha,
        entries: blobs
      }
    });

    // Create a new commit
    const createCommitMutation = `
      mutation($input: CreateCommitInput!) {
        createCommit(input: $input) {
          commit {
            oid
          }
        }
      }
    `;

    const commitResult = await githubClient.request(createCommitMutation, {
      input: {
        repositoryId: repo.id || `${repo.owner}/${repo.name}`,
        message: commitMessage,
        tree: treeResult.createTree.tree.oid,
        parents: [currentCommitSha]
      }
    });

    // Update the reference
    const updateRefMutation = `
      mutation($input: UpdateRefInput!) {
        updateRef(input: $input) {
          ref {
            target {
              oid
            }
          }
        }
      }
    `;

    await githubClient.request(updateRefMutation, {
      input: {
        repositoryId: repo.id || `${repo.owner}/${repo.name}`,
        ref: `refs/heads/${repo.defaultBranch}`,
        oid: commitResult.createCommit.commit.oid
      }
    });

    res.json({ 
      message: 'Code pushed to GitHub successfully',
      commitSha: commitResult.createCommit.commit.oid,
      filesCount: files.length
    });

  } catch (error) {
    console.error('Error pushing code to GitHub:', error);
    res.status(500).json({ 
      message: 'Failed to push code to GitHub',
      error: error.message 
    });
  }
});

export default router;