import { useState, useEffect } from 'react';
import { GripVertical, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Project {
    _id: string;
    projectId: string;
    title: string;
    slug: string;
    tagline: string;
    priority: number;
    cardasset: string[];
}

export default function ReorderProjects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('https://api.kunalpatil.me/api/projects');
            const data = await response.json();
            setProjects(data.projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(projects);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setProjects(items);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const projectIds = projects.map(p => p.projectId);

            const response = await fetch('https://api.kunalpatil.me/api/projects/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectIds }),
            });

            if (response.ok) {
                alert('Projects reordered successfully!');
                navigate('/projects');
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
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xl font-bold">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/projects')}
                            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 font-bold"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Projects
                        </button>
                        <h1 className="text-4xl font-black text-black mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                            Reorder Projects
                        </h1>
                        <p className="text-gray-600 font-medium">Drag and drop to reorder your projects</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" strokeWidth={2.5} />
                        {saving ? 'Saving...' : 'Save Order'}
                    </button>
                </div>

                {/* Drag and Drop List */}
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
                                                className={`bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${snapshot.isDragging ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-2' : ''
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

                {/* Instructions */}
                <div className="mt-8 bg-blue-100 border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-lg font-black text-black mb-2">💡 How to Reorder</h3>
                    <ul className="space-y-2 text-sm font-medium text-gray-700">
                        <li>• Drag projects using the grip icon on the left</li>
                        <li>• The order you set here will be reflected on your portfolio</li>
                        <li>• Click "Save Order" when you're done</li>
                        <li>• Projects at the top will appear first</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
