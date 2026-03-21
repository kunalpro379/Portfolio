import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api";

interface Documentation {
  docId: string;
  title: string;
  subject: string;
  description: string;
  tags: string[];
  date: string;
  isPublic: boolean;
  createdAt: string;
}

interface Blog {
  blogId: string;
  title: string;
  slug: string;
  tagline: string;
  subject: string;
  shortDescription: string;
  tags: string[];
  datetime: string;
  footer: string;
  coverImage: string;
  blogLinks: Array<{ name: string; url: string }>;
}

export default function BlogsSection() {
  const blogsScrollRef = useRef<HTMLDivElement>(null);
  const docsScrollRef = useRef<HTMLDivElement>(null);
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch documentation
        const docsUrl = `${API_BASE_URL}${API_ENDPOINTS.documentation}`;
        console.log('Fetching documentation from:', docsUrl);
        
        const docsResponse = await fetch(docsUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (docsResponse.ok) {
          const contentType = docsResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const docsData = await docsResponse.json();
            setDocumentation(docsData.docs.filter((doc: Documentation) => doc.isPublic).slice(0, 5));
          }
        }

        // Fetch blogs
        const blogsUrl = `${API_BASE_URL}${API_ENDPOINTS.blogs}`;
        console.log('Fetching blogs from:', blogsUrl);
        
        const blogsResponse = await fetch(blogsUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (blogsResponse.ok) {
          const contentType = blogsResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const blogsData = await blogsResponse.json();
            setBlogs(blogsData.blogs.slice(0, 5));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const blogsWithColors = blogs.map((blog, idx) => {
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

  const docs = documentation.map((doc, idx) => {
    const colors = [
      "rgb(59, 130, 246)",  // Blue
      "rgb(236, 72, 153)",  // Pink
      "rgb(168, 85, 247)",  // Purple
      "rgb(34, 197, 94)"    // Green
    ];
    return {
      ...doc,
      accentColor: colors[idx % colors.length]
    };
  });

  if (loading) {
    return (
      <section className="relative py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <img src="/loading.gif" alt="Loading" className="w-16 h-16 object-contain" />
              <div className="text-pink-500 text-lg font-bold">Loading blogs and documentation</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">

        {/* Blogs Section */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl md:text-3xl font-black text-black"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              Blogs
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                to="/learnings?tab=blogs"
                className="text-black/70 hover:text-black font-bold text-base md:text-lg underline decoration-2 underline-offset-4 hover:decoration-sky-500 transition-all"
              >
                Show more →
              </Link>
            </motion.div>
          </div>

          <div className="relative">
            <div
              ref={blogsScrollRef}
              className="overflow-x-auto pt-4 pb-8 -mx-6 px-6 md:-mx-12 md:px-12 scrollbar-hide"
            >
              <div className="flex sm:grid sm:grid-cols-2 md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 min-w-max sm:min-w-0 md:min-w-0">
                {blogsWithColors.map((blog, idx) => {
                  const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2'];
                  const hoverRotations = ['hover:rotate-0', 'hover:-rotate-1', 'hover:rotate-1', 'hover:-rotate-2'];
                  const shadows = [
                    'shadow-[6px_6px_0px_0px_rgba(244,114,182,0.4)]',
                    'shadow-[8px_6px_0px_0px_rgba(251,191,36,0.4)]',
                    'shadow-[6px_8px_0px_0px_rgba(167,139,250,0.4)]',
                    'shadow-[7px_7px_0px_0px_rgba(34,197,94,0.4)]'
                  ];
                  const hoverShadows = [
                    'hover:shadow-[10px_10px_0px_0px_rgba(244,114,182,0.6)]',
                    'hover:shadow-[12px_10px_0px_0px_rgba(251,191,36,0.6)]',
                    'hover:shadow-[10px_12px_0px_0px_rgba(167,139,250,0.6)]',
                    'hover:shadow-[11px_11px_0px_0px_rgba(34,197,94,0.6)]'
                  ];
                  
                  return (
                  <motion.div
                    key={blog.blogId}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                    className={`group relative block hover:-translate-y-2 transition-all duration-300 w-[220px] sm:w-auto md:w-auto flex-shrink-0 ${rotations[idx % 4]} ${hoverRotations[idx % 4]}`}
                  >
                    <Link to={`/learnings/blogs/${blog.blogId}`}>
                      <div
                        className={`blog-card relative bg-white overflow-hidden border-[3px] border-black rounded-[20px] transition-all duration-300 h-full flex flex-col ${shadows[idx % 4]} ${hoverShadows[idx % 4]}`}
                        style={{
                          borderRadius: idx % 2 === 0 ? '20px 25px 20px 25px' : '25px 20px 25px 20px'
                        }}
                      >
                        {blog.coverImage && (
                          <div className="relative h-24 md:h-28 overflow-hidden bg-gray-50 flex-shrink-0 border-b-4 border-black">
                            <img
                              src={blog.coverImage}
                              alt={blog.title}
                              width={300}
                              height={160}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                            />
                          </div>
                        )}

                        <div className="p-2.5 md:p-3 space-y-1.5 md:space-y-2 flex-grow">
                          <div className="inline-block px-2.5 py-0.5 bg-pink-100 border-2 border-black rounded-lg text-[9px] md:text-[10px] font-bold">
                            {blog.subject}
                          </div>
                          <h3 className="card-title text-xs md:text-sm font-black leading-tight text-black line-clamp-2">
                            {blog.title}
                          </h3>
                          <p className="card-description text-[10px] md:text-xs text-gray-700 leading-relaxed line-clamp-2 font-medium">
                            {blog.shortDescription}
                          </p>
                        </div>

                        <div className="px-2.5 md:px-3 pb-2.5 md:pb-3 flex-shrink-0">
                          <div className="text-[9px] md:text-[10px] text-gray-600 font-bold">
                            {new Date(blog.datetime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Section */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl md:text-3xl font-black text-black"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              Learnings
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                to="/learnings?tab=documentation"
                className="text-black/70 hover:text-black font-bold text-base md:text-lg underline decoration-2 underline-offset-4 hover:decoration-sky-500 transition-all"
              >
                Show more →
              </Link>
            </motion.div>
          </div>

          <div className="relative">
            <div
              ref={docsScrollRef}
              className="overflow-x-auto pt-4 pb-8 -mx-6 px-6 md:-mx-12 md:px-12 scrollbar-hide"
            >
              <div className="flex sm:grid sm:grid-cols-2 md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 min-w-max sm:min-w-0 md:min-w-0">
                {docs.map((doc, idx) => {
                  const rotations = ['rotate-2', '-rotate-1', 'rotate-1', '-rotate-2'];
                  const hoverRotations = ['hover:-rotate-1', 'hover:rotate-1', 'hover:-rotate-1', 'hover:rotate-2'];
                  const shadows = [
                    'shadow-[7px_7px_0px_0px_rgba(59,130,246,0.4)]',
                    'shadow-[6px_8px_0px_0px_rgba(236,72,153,0.4)]',
                    'shadow-[8px_6px_0px_0px_rgba(168,85,247,0.4)]',
                    'shadow-[7px_8px_0px_0px_rgba(34,197,94,0.4)]'
                  ];
                  const hoverShadows = [
                    'hover:shadow-[11px_11px_0px_0px_rgba(59,130,246,0.6)]',
                    'hover:shadow-[10px_12px_0px_0px_rgba(236,72,153,0.6)]',
                    'hover:shadow-[12px_10px_0px_0px_rgba(168,85,247,0.6)]',
                    'hover:shadow-[11px_12px_0px_0px_rgba(34,197,94,0.6)]'
                  ];
                  
                  return (
                  <motion.div
                    key={doc.docId}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                    className={`group relative block hover:-translate-y-2 transition-all duration-300 w-[220px] sm:w-auto md:w-auto flex-shrink-0 ${rotations[idx % 4]} ${hoverRotations[idx % 4]}`}
                  >
                    <Link to={`/learnings/documentation/${doc.docId}`}>
                      <div
                        className={`doc-card relative bg-white overflow-hidden border-[3px] border-black transition-all duration-300 h-full flex flex-col min-h-[180px] ${shadows[idx % 4]} ${hoverShadows[idx % 4]}`}
                        style={{
                          borderRadius: idx % 2 === 0 ? '25px 20px 25px 18px' : '20px 25px 18px 25px'
                        }}
                      >
                        <div className="p-2.5 md:p-3 space-y-1.5 flex-grow">
                          <div className="inline-block px-2.5 py-0.5 bg-blue-100 border-2 border-black rounded-lg text-[9px] md:text-[10px] font-bold">
                            {doc.subject}
                          </div>
                          <h3 className="card-title text-xs md:text-sm font-black leading-tight text-black line-clamp-2">
                            {doc.title}
                          </h3>
                          <p className="card-description text-[10px] md:text-xs text-gray-700 leading-relaxed line-clamp-2 font-medium">
                            {doc.description}
                          </p>
                        </div>

                        <div className="px-2.5 md:px-3 pb-2.5 md:pb-3 flex-shrink-0">
                          <div className="text-[9px] md:text-[10px] text-gray-600 font-bold">
                            {new Date(doc.date || doc.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
