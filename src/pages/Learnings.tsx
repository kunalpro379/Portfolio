import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import blogsData from "@/data/blogs.metadata.json";

export default function LearningsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'notes' | 'documentation' | 'blogs'>('blogs');

  const blogs = blogsData.map((blog, idx) => {
    const colors = [
      "rgb(244, 114, 182)", // Pink
      "rgb(251, 191, 36)",  // Amber
      "rgb(167, 139, 250)", // Purple
      "rgb(34, 197, 94)"    // Green
    ];
    return {
      ...blog,
      accentColor: colors[idx % colors.length]
    };
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            
            <h1 className="text-2xl font-bold text-black">Learnings</h1>
            
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-4 px-2 font-bold uppercase tracking-wider text-sm transition-all relative ${
                activeTab === 'notes' 
                  ? 'text-black' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Notes
              {activeTab === 'notes' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('documentation')}
              className={`py-4 px-2 font-bold uppercase tracking-wider text-sm transition-all relative ${
                activeTab === 'documentation' 
                  ? 'text-black' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Documentation
              {activeTab === 'documentation' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('blogs')}
              className={`py-4 px-2 font-bold uppercase tracking-wider text-sm transition-all relative ${
                activeTab === 'blogs' 
                  ? 'text-black' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Blogs
              {activeTab === 'blogs' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            {activeTab === 'notes' && 'Notes'}
            {activeTab === 'documentation' && 'Documentation'}
            {activeTab === 'blogs' && 'Blogs & Learnings'}
          </h2>
          <p className="text-lg text-gray-600">
            {activeTab === 'notes' && 'Quick notes and thoughts'}
            {activeTab === 'documentation' && 'Technical documentation and guides'}
            {activeTab === 'blogs' && 'Insights, tutorials, and technical deep-dives'}
          </p>
        </motion.div>

        {/* Content based on active tab */}
        {activeTab === 'notes' && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Notes coming soon...</p>
          </div>
        )}

        {activeTab === 'documentation' && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Documentation coming soon...</p>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="space-y-8">
            {blogs.map((blog, idx) => (
              <motion.a
                key={idx}
                href={blog.blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group block"
              >
                <article className="flex flex-col md:flex-row gap-6 p-6 rounded-lg hover:bg-gray-50 transition-all duration-300">
                  {/* Image */}
                  {blog.coverImage && (
                    <div className="md:w-1/3 flex-shrink-0">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category Badge */}
                      <div className="mb-3">
                        <span 
                          className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                          style={{ 
                            backgroundColor: `${blog.accentColor}20`,
                            color: blog.accentColor
                          }}
                        >
                          {blog.subject}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-black mb-3 group-hover:text-gray-700 transition-colors">
                        {blog.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {blog.shortDescription}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>
                          {new Date(blog.dateUpdated).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{blog.readTime}</span>
                      </div>
                      <div className="hidden sm:block">
                        <span>{blog.author}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </motion.a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
