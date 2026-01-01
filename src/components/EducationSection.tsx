"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award, BookOpen } from "lucide-react";

export default function EducationSection() {
  const education = [
    {
      year: "2020 - 2024",
      degree: "Bachelor of Technology",
      field: "Computer Science & Engineering",
      institution: "University of Technology",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Specialized in artificial intelligence, machine learning, and distributed systems architecture.",
      achievements: ["CGPA: 8.5/10", "Dean's List", "Research Publication"],
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80"
    },
    {
      year: "2018 - 2020",
      degree: "Higher Secondary Certificate",
      field: "Science Stream (PCM)",
      institution: "Central High School",
      description: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Focused on mathematics, physics, and computer science fundamentals.",
      achievements: ["95.2%", "School Topper", "Science Olympiad Gold"],
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80"
    },
    {
      year: "2016 - 2018",
      degree: "Secondary School Certificate",
      field: "General Studies",
      institution: "Modern Public School",
      description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Built strong foundation in core subjects and developed problem-solving skills.",
      achievements: ["92.8%", "Perfect Score in Math", "Debate Champion"],
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <section className="relative bg-[#fefce8] py-12 md:py-20">
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,163,255,0.05)_0%,transparent_60%)]" />
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 text-[10px] font-black uppercase tracking-[0.3em]">
                Academic Journey
              </span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4 text-gray-900"
            >
              Education
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-500 text-sm md:text-base font-medium uppercase tracking-wider"
            >
              Learning never stops
            </motion.p>
          </div>

          {/* Horizontal Timeline */}
          <div className="relative mb-16">
            {/* Timeline Line */}
            <div className="absolute top-8 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent hidden md:block" />
            
            {/* Timeline Years */}
            <div className="flex justify-between items-start relative">
              {education.map((edu, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  className="flex flex-col items-center"
                >
                  {/* Dot */}
                  <div className="w-4 h-4 rounded-full bg-sky-500 border-4 border-white shadow-lg shadow-sky-500/30 mb-4 hidden md:block" />
                  
                  {/* Year Badge */}
                  <div className="px-4 py-2 rounded-lg bg-sky-50 border border-sky-200">
                    <span className="text-sky-600 font-black text-xs md:text-sm uppercase tracking-wider whitespace-nowrap">
                      {edu.year}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {education.map((edu, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="group relative"
              >
                <div className="relative h-full bg-white border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden hover:border-sky-300 hover:shadow-lg transition-all duration-300">
                  
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={edu.image} 
                      alt={edu.degree}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                    
                    {/* Icon Badge */}
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-sky-100 backdrop-blur-sm border border-sky-200 flex items-center justify-center">
                      <GraduationCap className="text-sky-600" size={24} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Degree */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 leading-tight mb-1">
                        {edu.degree}
                      </h3>
                      <p className="text-sky-600 font-bold text-sm uppercase tracking-wide">
                        {edu.field}
                      </p>
                    </div>

                    {/* Institution */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen size={14} />
                      <p className="text-xs font-medium">{edu.institution}</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                      {edu.description}
                    </p>

                    {/* Achievements */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Award size={14} className="text-sky-600" />
                        <span className="text-sky-600 text-xs font-bold uppercase tracking-wider">Achievements</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {edu.achievements.map((achievement, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-bold"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-sky-500/0 group-hover:from-sky-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
      </div>
    </section>
  );
}
