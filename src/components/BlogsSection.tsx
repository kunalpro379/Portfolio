"use client";

import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";

export default function BlogsSection() {
  const blogs = [
    {
      category: "Design",
      title: "Top UI Design Trends You Should Know Today",
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=800",
      link: "#"
    },
    {
      category: "Coding",
      title: "Mastering JavaScript for Modern Web Projects",
      image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800",
      link: "#"
    },
    {
      category: "Career",
      title: "How I Started My Freelance Career Journey",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800",
      link: "#"
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-white via-blue-50 to-sky-50 py-16 md:py-24">
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 text-[10px] font-black uppercase tracking-[0.3em]">
              Insights & Thoughts
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4 text-black"
          >
            Blogs & Notes
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-black/60 text-sm md:text-base font-medium uppercase tracking-wider"
          >
            Sharing knowledge and experiences
          </motion.p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogs.map((blog, idx) => (
            <motion.a
              key={idx}
              href={blog.link}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="group relative bg-white rounded-2xl md:rounded-3xl overflow-hidden border-2 border-black/10 hover:border-sky-500 transition-all duration-300 hover:shadow-2xl"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-black text-[10px] font-black uppercase tracking-wider">
                    {blog.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black leading-tight group-hover:text-sky-500 transition-colors">
                  {blog.title}
                </h3>

                {/* Read More Button */}
                <div className="flex items-center gap-2 text-sky-500 font-black text-sm uppercase tracking-wide group-hover:gap-4 transition-all">
                  Read More
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-blue-500/0 group-hover:from-sky-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none" />
            </motion.a>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href="#"
            className="inline-flex items-center gap-3 px-8 py-4 bg-black hover:bg-sky-500 text-white rounded-full font-black uppercase tracking-wider transition-all group"
          >
            <BookOpen size={20} />
            View All Blogs
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
