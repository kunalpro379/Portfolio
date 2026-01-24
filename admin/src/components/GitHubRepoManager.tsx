import React, { useState, useEffect } from 'react';
import { Github, Plus, Trash2, ExternalLink, Folder, File, ChevronRight, X } from 'lucide-react';
import config, { buildUrl } from '../config/config';

interface GitHubRepo {
  _id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  isPrivate: boolean;
  createdAt: string;
}

interface GitHubTreeItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha: string;
}

interface GitHubRepoManagerProps {
  onRepoSelect?: (repo: GitHubRepo) => void;
}

export default function GitHubRepoManager({ onRepoSelect }: GitHubRepoManagerProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const response = await fetch(buildUrl(config.api.endpoints.githubRepos), {
        credentials: 'include'
      });
      const data = await response.json();
      setRepos(data.repos || []);
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const addRepo = async () => {
    if (!repoUrl.trim()) return;

    setAdding(true);
    try {
      const response = await fetch(buildUrl(config.api.endpoints.githubRepoAdd), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: repoUrl.trim() })
      });

      if (response.ok) {
        await fetchRepos();
        setRepoUrl('');
        setShowAddModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add repository');
      }
    } catch (error) {
      console.error('Error adding repo:', error);
      alert('Failed to add repository');
    } finally {
      setAdding(false);
    }
  };

  const deleteRepo = async (repoId: string) => {
    if (!confirm('Are you sure you want to remove this repository?')) return;

    try {
      const response = await fetch(buildUrl(config.api.endpoints.githubRepoDelete(repoId)), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchRepos();
      } else {
        alert('Failed to delete repository');
      }
    } catch (error) {
      console.error('Error deleting repo:', error);
      alert('Failed to delete repository');
    }
  };

  const parseGitHubUrl = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    return match ? { owner: match[1], repo: match[2].replace('.git', '') } : null;
  };

  if (loading) {
    return (
      <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full"></div>
          <span className="ml-3 font-bold text-black">Loading repositories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="w-6 h-6" strokeWidth={2.5} />
          <h3 className="text-xl font-black text-black">GitHub Repositories</h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 border-2 border-black rounded-lg hover:bg-green-200 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="font-bold text-sm">Add Repository</span>
        </button>
      </div>

      {/* Repository List */}
      {repos.length === 0 ? (
        <div className="bg-white border-2 border-black rounded-xl p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Github className="w-12 h-12 text-gray-400 mx-auto mb-4" strokeWidth={2} />
          <h4 className="text-lg font-black text-black mb-2">No Repositories Added</h4>
          <p className="text-gray-600 font-medium mb-4">Add your first GitHub repository to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-100 border-2 border-black rounded-lg hover:bg-blue-200 transition font-bold"
          >
            Add Repository
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {repos.map((repo) => (
            <div
              key={repo._id}
              className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Github className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                    <h4 className="font-black text-black truncate">{repo.fullName}</h4>
                    {repo.isPrivate && (
                      <span className="px-2 py-0.5 bg-red-100 border border-red-300 rounded text-xs font-bold text-red-800">
                        Private
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-sm text-gray-600 font-medium mb-2">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Branch: {repo.defaultBranch}</span>
                    <span>Added: {new Date(repo.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {onRepoSelect && (
                    <button
                      onClick={() => onRepoSelect(repo)}
                      className="p-2 bg-blue-100 border-2 border-black rounded-lg hover:bg-blue-200 transition"
                      title="Browse Repository"
                    >
                      <Folder className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  )}
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 border-2 border-black rounded-lg hover:bg-gray-200 transition"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
                  </a>
                  <button
                    onClick={() => deleteRepo(repo._id)}
                    className="p-2 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 transition"
                    title="Remove Repository"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Repository Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-black rounded-xl w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between p-4 border-b-2 border-black">
              <h3 className="text-lg font-black text-black">Add GitHub Repository</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-bold text-black mb-2">
                Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full px-3 py-2 border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={adding}
              />
              <p className="text-xs text-gray-600 mt-2 font-medium">
                Enter the full GitHub repository URL (e.g., https://github.com/username/repo)
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={addRepo}
                  disabled={adding || !repoUrl.trim()}
                  className="flex-1 px-4 py-2 bg-green-100 border-2 border-black rounded-lg hover:bg-green-200 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? 'Adding...' : 'Add Repository'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={adding}
                  className="px-4 py-2 bg-gray-100 border-2 border-black rounded-lg hover:bg-gray-200 transition font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}