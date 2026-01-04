import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import backgroundsData from "@/data/backgrounds.json";

export default function ExperienceSection() {
  const bgTexture = backgroundsData.sections.experience;
  const experiences = [

    {
      "year": "2025",
      "timeline": "Dec 2025 -Jan 2025",
      "title": "Data & Full-Stack Intern",
      "company": "ProSmart Concepts & Hydralite",
      "description": "Collected and transformed raw product data from multiple sources into clean, structured datasets. Built n8n workflows to automate data extraction, cleaning, validation, and schema standardization. Designed and managed an admin dashboard for product handling and developed a client-facing website to dynamically display categorized products, ensuring seamless data consistency between admin and client systems.",
      "techStack": [
        "JavaScript",
        "SQL",
        "Node.js",
        "n8n",
        "Full-Stack Development",
        "Admin Dashboard",
        "Data Engineering"
      ]
    },
    {
      "year": "2025",
      "timeline": "Feb 2025 – Apr 2025",
      "title": "AQI Prediction and Analytics",
      "company": "Panache Digilife Pvt. Ltd.",
      "description": "Worked under the guidance of Dr. Kanchan Chavan on an AQI prediction system using time series analysis. Implemented an ARIMA-LSTM hybrid model for accurate air quality forecasting and deployed the solution using Firebase listeners to enable real-time data updates.",
      "techStack": [
        "Python",
        "ARIMA",
        "LSTM",
        "Time Series Analysis",
        "Machine Learning",
        "Firebase",
        "Real-time Data Processing"
      ]
    },
    {
      "year": "2024",
      "timeline": "December 2024",
      "title": "Freelancing Project (Plasma)",
      "company": "SignalMint",
      "description": "Deployed the client’s production-ready v2.signalmint.in platform on AWS using ECS, EC2, and ECR. Configured autoscaling, task definitions, containerized services, and separate worker services for efficient scaling. Set up an Application Load Balancer (ALB) with secure GoDaddy DNS integration and implemented CI/CD pipelines using GitHub Actions for automated deployments and rollback support.",
      "techStack": [
        "AWS Services",
        "AWS EC2, ECS, EKS, ALB",
        "Docker",
        "CI/CD-GitHub Actions",
        "DNS"
      ]
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
            <span className="px-4 py-1.5 rounded-full border border-black/30 bg-black/10 text-black text-[10px] font-black uppercase tracking-[0.3em]">
              Career Journey
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4 text-gray-900"
          >
            Experience
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-500 text-sm md:text-base font-medium uppercase tracking-wider"
          >
            Building the future, one project at a time
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-black/40 via-black/20 to-transparent hidden lg:block" />

          {/* Timeline Items */}
          <div className="space-y-12 md:space-y-20">
            {experiences.map((exp, idx) => {
              const isLeft = idx % 2 === 0;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className="relative"
                >
                  <div className={`flex flex-col lg:flex-row gap-6 md:gap-12 items-stretch ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>

                    {/* Image + Title + Timeline + Tech Stack Side */}
                    <div className={`w-full lg:w-[calc(50%-2rem)] space-y-6`}>
                      {/* Content Card with Artistic Border */}
                      <div className="relative group">
                        {/* Decorative corner elements */}
                        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-black rounded-tl-lg" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-black rounded-tr-lg" />
                        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-black rounded-bl-lg" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-black rounded-br-lg" />
                        
                        <div className="bg-gradient-to-br from-white via-gray-50/30 to-white border-2 border-black/20 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 space-y-4">
                          {/* Year Badge */}
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white shadow-md">
                            <Briefcase size={16} />
                            <span className="font-black text-sm uppercase tracking-wider">{exp.year}</span>
                          </div>

                          {/* Title with underline accent */}
                          <div>
                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">
                              {exp.title}
                            </h3>
                            <div className="h-1 w-20 bg-gradient-to-r from-black to-transparent rounded-full" />
                          </div>

                          {/* Company */}
                          <p className="text-black font-bold text-sm md:text-base uppercase tracking-wide">
                            {exp.company}
                          </p>

                          {/* Timeline */}
                          <p className="text-gray-500 text-xs md:text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 bg-black rounded-full" />
                            {exp.timeline}
                          </p>

                          {/* Tech Stack - Hidden on Mobile */}
                          <div className="hidden md:flex flex-wrap gap-2 pt-2">
                            {exp.techStack.map((tech, techIdx) => (
                              <span
                                key={techIdx}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wide hover:border-black hover:text-black transition-all duration-200 shadow-sm"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center Dot - More Artistic */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black border-4 border-white shadow-xl z-10">
                      <div className="w-full h-full rounded-full bg-white/20 animate-pulse" />
                    </div>

                    {/* Description Side - Artistic Card */}
                    <div className={`w-full lg:w-[calc(50%-2rem)]`}>
                      <div className="relative bg-white border-2 border-black/20 rounded-2xl p-6 md:p-8 hover:border-black hover:shadow-2xl transition-all duration-300 group h-full overflow-hidden">
                        {/* Decorative background pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/50 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-100/50 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-8 bg-black rounded-full" />
                            <h4 className="text-lg md:text-xl font-black uppercase tracking-tight text-gray-900">
                              About the Role
                            </h4>
                          </div>
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            {exp.description}
                          </p>
                        </div>

                        {/* Hover effect border */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{
                            background: 'linear-gradient(45deg, transparent 48%, rgba(0, 0, 0, 0.05) 50%, transparent 52%)',
                            backgroundSize: '20px 20px'
                          }}
                        />
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
