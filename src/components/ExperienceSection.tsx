"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

export default function ExperienceSection() {
  const experiences = [


    {
      "year": "2025",
      "timeline": "Jan 2025",
      "title": "Freelancing Project (Plasma)",
      "company": "SignalMint",
      "description": "Deployed the client’s production-ready v2.signalmint.in platform on AWS using ECS, EC2, and ECR. Configured autoscaling, task definitions, containerized services, and separate worker services for efficient scaling. Set up an Application Load Balancer (ALB) with secure GoDaddy DNS integration and implemented CI/CD pipelines using GitHub Actions for automated deployments and rollback support.",
      "techStack": [
        "AWS ECS",
        "AWS EC2",
        "AWS ECR",
        "Docker",
        "Application Load Balancer (ALB)",
        "GitHub Actions",
        "CI/CD",
        "GoDaddy DNS"
      ]
    },
    {
      "year": "2025",
      "timeline": "Feb 2025 – Mar 2025",
      "title": "AQI Prediction System (ARIMA-LSTM)",
      "company": "Panache Digilife Pvt. Ltd., VESIT, Mumbai",
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
      "year": "2025",
      "timeline": "Dec 2025 – Present",
      "title": "Data & Full-Stack Intern",
      "company": "ProSmart Concepts",
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
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-sky-400/40 via-sky-400/20 to-transparent hidden lg:block" />

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
                      {/* Image - No Card */}
                      {/* <div className="relative overflow-hidden rounded-xl md:rounded-2xl group">
                          <img
                            src={exp.image}
                            alt={exp.title}
                            className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </div> */}

                      {/* Content - No Card */}
                      <div className="space-y-4">
                        {/* Year Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-50 border border-sky-200">
                          <Briefcase size={16} className="text-sky-600" />
                          <span className="text-sky-600 font-black text-sm uppercase tracking-wider">{exp.year}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900">
                          {exp.title}
                        </h3>

                        {/* Company */}
                        <p className="text-sky-600 font-bold text-sm md:text-base uppercase tracking-wide">
                          {exp.company}
                        </p>

                        {/* Timeline */}
                        <p className="text-gray-500 text-xs md:text-sm font-medium uppercase tracking-wider">
                          {exp.timeline}
                        </p>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2">
                          {exp.techStack.map((tech, techIdx) => (
                            <span
                              key={techIdx}
                              className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Center Dot */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-sky-500 border-4 border-white shadow-lg shadow-sky-500/30 z-10" />

                    {/* Description Side */}
                    <div className={`w-full lg:w-[calc(50%-2rem)]`}>
                      <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-6 md:p-8 hover:border-sky-300 hover:shadow-lg transition-all duration-300 group h-full flex items-center">
                        <div>
                          <h4 className="text-lg md:text-xl font-black uppercase tracking-tight text-gray-800 mb-4">
                            About the Role
                          </h4>
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            {exp.description}
                          </p>
                        </div>

                        {/* Gradient Glow on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-sky-500/0 group-hover:from-sky-500/5 group-hover:to-transparent rounded-xl md:rounded-2xl transition-all duration-300 pointer-events-none" />
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
