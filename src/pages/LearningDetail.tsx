import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useState, useEffect } from 'react';
import { Clock, Calendar, ArrowLeft, FileText, Download, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_ENDPOINTS } from '@/config/api';

interface Blog {
  blogId: string;
  title: string;
  subject: string;
  tagline: string;
  content: string;
  datetime: string;
  tags: string[];
  coverImage: string;
  blogLinks: Array<{ name: string; url: string }>;
}

interface Documentation {
  docId: string;
  title: string;
  subject: string;
  description: string;
  content: string;
  tags: string[];
  date: string;
  time: string;
}

interface NoteFile {
  fileId: string;
  name: string;
  content: string;
  createdAt: string;
}

interface Folder {
  folderId: string;
  name: string;
  files: NoteFile[];
}

export default function LearningDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [type, setType] = useState<'blog' | 'documentation' | 'notes' | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<NoteFile | null>(null);

  const scrollToSection = useCallback((sectionId: string) => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [navigate]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // Try blog first
        try {
          const blogRes = await fetch(`${API_ENDPOINTS.blogs}/${id}`);
          if (blogRes.ok) {
            const data = await blogRes.json();
            setContent(data.blog);
            setType('blog');
            setLoading(false);
            return;
          }
        } catch (e) {}

        // Try documentation
        try {
          const docRes = await fetch(`${API_ENDPOINTS.documentation}/${id}`);
          if (docRes.ok) {
            const data = await docRes.json();
            setContent(data.doc);
            setType('documentation');
            setLoading(false);
            return;
          }
        } catch (e) {}

        // Try notes
        try {
          const notesRes = await fetch(`${API_ENDPOINTS.notes}/folders/${id}`);
          if (notesRes.ok) {
            const data = await notesRes.json();
            setContent(data.folder);
            setType('notes');
            if (data.folder.files && data.folder.files.length > 0) {
              setSelectedFile(data.folder.files[0]);
            }
            setLoading(false);
            return;
          }
        } catch (e) {}

        // If nothing found
        setLoading(false);
      } catch (err) {
        console.error('Error fetching content:', err);
        setLoading(false);
      }
    };

    if (id) fetchContent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!content || !type) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Content not found</p>
          <button
            onClick={() => navigate('/learnings')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back to Learnings
          </button>
        </div>
      </div>
    );
  }

  // Render based on type
  if (type === 'notes') {
    const folder = content as Folder;
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar scrollToSection={scrollToSection} />
        
        <div className="flex-1 flex pt-20">
          {/* Sidebar */}
          <div className="w-64 border-r-2 border-gray-200 p-4 overflow-y-auto">
            <button
              onClick={() => navigate('/learnings?tab=notes')}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-bold text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <h2 className="text-lg font-black mb-4">{folder.name}</h2>

            <div className="space-y-2">
              {folder.files?.map((file) => (
                <button
                  key={file.fileId}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    selectedFile?.fileId === file.fileId
                      ? 'bg-blue-100 border-2 border-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span className="text-sm font-medium truncate">{file.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedFile ? (
              <div className="max-w-4xl mx-auto px-8 py-12">
                <header className="mb-8">
                  <h1 className="text-3xl font-black mb-2">{selectedFile.name}</h1>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedFile.createdAt).toLocaleDateString()}
                  </p>
                </header>
                <article className="prose prose-lg max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedFile.content}</ReactMarkdown>
                </article>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Select a file</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'blog') {
    const blog = content as Blog;
    return (
      <div className="min-h-screen bg-white">
        <Navbar scrollToSection={scrollToSection} />
        
        <button
          onClick={() => navigate('/learnings?tab=blogs')}
          className="hidden md:flex fixed left-6 top-6 z-[1001] items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md border-2 border-black rounded-full shadow-lg hover:bg-black hover:text-white transition-all group"
        >
          <ArrowLeft size={20} />
          <span className="font-bold text-sm">Back</span>
        </button>

        <main className="max-w-4xl mx-auto px-6 py-24">
          {blog.coverImage && (
            <img src={blog.coverImage} alt={blog.title} className="w-full h-[400px] object-cover rounded-2xl mb-8" />
          )}

          <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-600 mb-4">
            {blog.subject}
          </span>

          <h1 className="text-4xl md:text-5xl font-black mb-4">{blog.title}</h1>
          {blog.tagline && <p className="text-xl text-gray-600 mb-6">{blog.tagline}</p>}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{new Date(blog.datetime).toLocaleDateString()}</span>
            </div>
          </div>

          {blog.blogLinks && blog.blogLinks.length > 0 && (
            <div className="flex gap-3 mb-8">
              {blog.blogLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  {link.name}
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          )}

          <article className="prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
          </article>
        </main>
      </div>
    );
  }

  // Documentation
  const doc = content as Documentation;
  return (
    <div className="min-h-screen bg-white">
      <Navbar scrollToSection={scrollToSection} />
      
      <button
        onClick={() => navigate('/learnings?tab=documentation')}
        className="hidden md:flex fixed left-6 top-6 z-[1001] items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md border-2 border-black rounded-full shadow-lg hover:bg-black hover:text-white transition-all group"
      >
        <ArrowLeft size={20} />
        <span className="font-bold text-sm">Back</span>
      </button>

      <main className="max-w-4xl mx-auto px-6 py-24">
        <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-600 mb-4">
          {doc.subject}
        </span>

        <h1 className="text-4xl md:text-5xl font-black mb-4">{doc.title}</h1>
        {doc.description && <p className="text-xl text-gray-600 mb-6">{doc.description}</p>}

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
          {doc.date && (
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{doc.date}</span>
            </div>
          )}
          {doc.time && (
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{doc.time}</span>
            </div>
          )}
        </div>

        <article className="prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
