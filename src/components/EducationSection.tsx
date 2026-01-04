import { motion } from "framer-motion";
import { GraduationCap, Award, BookOpen } from "lucide-react";
import backgroundsData from "@/data/backgrounds.json";

export default function EducationSection() {
  const bgTexture = backgroundsData.sections.education;
  const education = [
    {
      year: "2022-2026",
      degree: "Bachelor of Technology",
      field: "Artificial Intelligence and Data Science, Mumbai",
      institution: "Vivekanand Education Society Institute of Technology",
      score: "CGPA: 8.1",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80"
    },
    {
      year: "2019-2021",
      degree: "Higher Secondary Certificate",
      field: "Science Stream (PCM)",
      institution: "Chandibai Himathmaal Mansukhani Collage, Ulhasnagar",
      score: "89.67% | CET: 96.19 Percentile",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80"
    },
    {
      year: "2018-2019",
      degree: "Secondary School Certificate",
      field: "10th grade",
      institution: "Bhausaheb Paranjpe Vidyalaya, Ambernath,Thane",
      score: "91%",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <section className="relative py-12 md:py-20">
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

        {/* Horizontal Timeline - Desktop Only */}
        <div className="relative mb-16 hidden md:block">
          {/* Timeline Horizontal Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-black" />

          {/* Timeline Years with Vertical Lines */}
          <div className="flex justify-between items-start relative">
            {education.map((edu, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="flex flex-col items-center relative"
              >
                {/* Vertical Line */}
                <div className="w-[2px] h-16 bg-black mb-4" />

                {/* Year Badge */}
                <div className="px-4 py-2 rounded-lg bg-white border border-gray-300">
                  <span className="text-gray-900 font-black text-xs md:text-sm uppercase tracking-wider whitespace-nowrap">
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
              <div className="relative h-full bg-transparent overflow-hidden transition-all duration-300">

                {/* Year Badge - Mobile Only */}
                <div className="md:hidden mb-4">
                  <div className="px-4 py-2 rounded-lg bg-white border border-gray-300 inline-block">
                    <span className="text-gray-900 font-black text-xs uppercase tracking-wider whitespace-nowrap">
                      {edu.year}
                    </span>
                  </div>
                </div>

                {/* Image */}
                <div className="relative h-64 overflow-hidden rounded-t-xl md:rounded-t-2xl">
                  <img
                    src={edu.image}
                    alt={edu.degree}
                    width={600}
                    height={256}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fefce8]/60 to-[#fefce8]" />

                  {/* Content Overlay on Image */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                    {/* Degree */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 leading-tight mb-1">
                        {edu.degree}
                      </h3>
                      <p className="text-sky-600 font-bold text-sm uppercase tracking-wide">
                        {edu.field}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block">
                      <p className="text-gray-900 font-black text-sm">
                        {edu.score}
                      </p>
                    </div>

                    {/* Institution */}
                    <div className="flex items-center gap-2 text-gray-900">
                      <BookOpen size={14} />
                      <p className="text-xs font-medium">{edu.institution}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
