import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink, ArrowUpDown, GripVertical, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import config, { buildUrl } from '../config/config';
import PageShimmer from '../components/PageShimmer';

interface Project {
  _id: string;
  projectId: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  tags: string[];
  cardasset: string[];
  created_at: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(buildUrl('/api/projects'));
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateProjectId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const handleCreateProject = () => {
    const projectId = generateProjectId();
    navigate(`/create/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/edit/project/${projectId}`);
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`${config.api.baseUrl}/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProjects(items);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const projectIds = projects.map(p => p.projectId);
      
      const response = await fetch(buildUrl('/api/projects/reorder'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectIds }),
      });

      if (response.ok) {
        alert('Projects reordered successfully!');
        setIsReorderMode(false);
        fetchProjects();
      } else {
        alert('Failed to reorder projects');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageShimmer />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {isReorderMode ? 'Reorder Projects' : 'Projects'}
            </h1>
            <p className="text-gray-600 font-medium">
              {isReorderMode ? 'Drag and drop to reorder your projects' : 'Manage your portfolio projects'}
            </p>
          </div>
          <div className="flex gap-3">
            {isReorderMode ? (
              <>
                <button 
                  onClick={() => setIsReorderMode(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-black rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold">
                  <X className="w-5 h-5" strokeWidth={2.5} />
                  Cancel
                </button>
                <button 
                  onClick={handleSaveOrder}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                  <Save className="w-5 h-5" strokeWidth={2.5} />
                  {saving ? 'Saving...' : 'Save Order'}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsReorderMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold">
                  <ArrowUpDown className="w-5 h-5" strokeWidth={2.5} />
                  Reorder
                </button>
                <button 
                  onClick={handleCreateProject}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold">
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
                  New Project
                </button>
              </>
            )}
          </div>
        </div>

        {/* Projects Grid or Reorder List */}
        {projects.length === 0 ? (
          <div className="bg-white border-4 border-black rounded-2xl p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-20 h-20 border-3 border-black rounded-full flex items-center justify-center bg-blue-200 mx-auto mb-4 transform rotate-3">
              <ExternalLink className="w-10 h-10 text-black" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-black mb-2">No Projects Yet</h3>
            <p className="text-gray-600 font-medium mb-6">Start by creating your first project</p>
            <button 
              onClick={handleCreateProject}
              className="px-6 py-3 bg-black text-white rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold">
              Create Project
            </button>
          </div>
        ) : isReorderMode ? (
          /* Reorder Mode - Drag and Drop List */
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="projects">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {projects.map((project, index) => (
                    <Draggable
                      key={project.projectId}
                      draggableId={project.projectId}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                            snapshot.isDragging ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-2' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                              <GripVertical className="w-6 h-6 text-gray-400" strokeWidth={2.5} />
                            </div>

                            {/* Order Number */}
                            <div className="flex-shrink-0 w-12 h-12 bg-yellow-200 border-3 border-black rounded-full flex items-center justify-center font-black text-xl">
                              {index + 1}
                            </div>

                            {/* Project Image */}
                            {project.cardasset && project.cardasset.length > 0 ? (
                              <img
                                src={project.cardasset[0]}
                                alt={project.title}
                                className="w-16 h-16 object-cover rounded-lg border-3 border-black"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg border-3 border-black" />
                            )}

                            {/* Project Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-black text-black truncate">
                                {project.title}
                              </h3>
                              <p className="text-sm text-gray-600 font-medium truncate">
                                {project.tagline || project.slug}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          /* Normal Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                {/* Card Image */}
                {project.cardasset && project.cardasset.length > 0 ? (
                  <img
                    src={project.cardasset[0]}
                    alt={project.title}
                    className="w-full h-48 object-cover border-b-4 border-black"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-200 to-purple-200 border-b-4 border-black flex items-center justify-center">
                    <ExternalLink className="w-12 h-12 text-black opacity-30" strokeWidth={2} />
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-black text-black mb-2 line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-gray-600 font-medium mb-4 line-clamp-2">
                    {project.tagline || project.description}
                  </p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-yellow-200 border-2 border-black rounded-full text-xs font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProject(project.projectId)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-200 border-3 border-black rounded-xl font-bold hover:bg-blue-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    >
                      <Edit className="w-4 h-4" strokeWidth={2.5} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProject(project.projectId)}
                      className="px-4 py-2 bg-red-200 border-3 border-black rounded-xl font-bold hover:bg-red-300 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    >
                      <Trash2 className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
