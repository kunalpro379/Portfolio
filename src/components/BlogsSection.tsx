import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import blogsData from "@/data/blogs.metadata.json";
import backgroundsData from "@/data/backgrounds.json";

export default function BlogsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bgTexture = backgroundsData.sections.blogs;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

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
    <section className="relative py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">

        {/* Header */}
        <div className="mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black tracking-tight leading-none text-black"
          >
            Documentation & Learnings
          </motion.h2>
        </div>

        {/* Blog Cards Container with Navigation Arrows */}
        <div className="relative">
          {/* Left Arrow - Mobile Only */}
          <button
            onClick={() => scroll('left')}
            className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black text-white p-2 rounded-full shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right Arrow - Mobile Only */}
          <button
            onClick={() => scroll('right')}
            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black text-white p-2 rounded-full shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>

          {/* Blog Cards - Horizontal Scroll for Mobile, Grid for Desktop */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pt-4 pb-8 -mx-6 px-6 md:-mx-12 md:px-12 scrollbar-hide"
          >
            <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 min-w-max md:min-w-0">
              {blogs.map((blog, idx) => (
                <motion.a
                  key={idx}
                  href={blog.blogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="group relative block hover:scale-105 transition-all duration-300 w-[220px] md:w-auto flex-shrink-0"
                >
                  {/* Sketchy Border SVG Overlay */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    style={{ filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.1))' }}
                  >
                    <rect
                      x="1"
                      y="1"
                      width="calc(100% - 2px)"
                      height="calc(100% - 2px)"
                      fill="none"
                      stroke={blog.accentColor}
                      strokeWidth="2.5"
                      rx="6"
                      strokeDasharray="5, 3"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Card Container - Fixed Height with Flexbox */}
                  <div
                    className="relative bg-white overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col"
                    style={{
                      borderRadius: '6px',
                      border: `2px solid ${blog.accentColor}50`
                    }}
                  >

                    {/* Subject/Category at Top */}
                    <div className="p-3 md:p-4 flex-shrink-0">
                      <div className="text-[10px] md:text-xs lg:text-sm font-bold text-black/70 font-handwriting">
                        {blog.subject}
                      </div>
                    </div>

                    {/* Image Section */}
                    {blog.coverImage && (
                      <div className="relative h-32 md:h-40 overflow-hidden bg-gray-50 flex-shrink-0">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-500 grayscale-[30%]"
                        />
                      </div>
                    )}

                    {/* Title and Description */}
                    <div className="p-3 md:p-4 space-y-2 md:space-y-3 flex-grow">
                      <h3 className="text-sm md:text-base lg:text-lg font-bold leading-tight text-black font-handwriting line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-xs md:text-sm text-black/60 font-handwriting leading-relaxed line-clamp-2">
                        {blog.shortDescription}
                      </p>
                    </div>

                    {/* Date at Bottom */}
                    <div className="px-3 md:px-4 pb-3 md:pb-4 flex-shrink-0">
                      <div className="text-[10px] md:text-xs text-black/60 font-medium">
                        {new Date(blog.dateUpdated).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })} · {blog.readTime}
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Show More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <Link
            to="/learnings"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-full font-bold uppercase tracking-wider transition-all text-sm md:text-base shadow-lg hover:shadow-xl"
          >
            Show More
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
