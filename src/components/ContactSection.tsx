"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectDetails: "",
    budget: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <section className="relative bg-[#f5f5f5] min-h-screen flex items-center py-16 md:py-24">
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEFT SIDE - Big Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.9] text-black">
              LET'S<br />
              COLLABORATE<br />
              TOGETHER!
            </h2>
          </motion.div>

          {/* RIGHT SIDE - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-black/60 font-bold text-xs uppercase tracking-wider mb-3">
                  *Your Name
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-b-2 border-black/20 focus:border-black focus:outline-none transition-colors text-black placeholder:text-black/30 text-lg"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-black/60 font-bold text-xs uppercase tracking-wider mb-3">
                  *Your Email
                </label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-b-2 border-black/20 focus:border-black focus:outline-none transition-colors text-black placeholder:text-black/30 text-lg"
                  required
                />
              </div>

              {/* Project Details */}
              <div>
                <label className="block text-black/60 font-bold text-xs uppercase tracking-wider mb-3">
                  *Project Details
                </label>
                <textarea
                  placeholder="What is your Project goals, requirement and specific timeline..."
                  value={formData.projectDetails}
                  onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                  rows={4}
                  className="w-full px-0 py-3 bg-transparent border-b-2 border-black/20 focus:border-black focus:outline-none transition-colors text-black placeholder:text-black/30 resize-none text-lg"
                  required
                />
              </div>

              {/* Budget Field */}
              <div>
                <label className="block text-black/60 font-bold text-xs uppercase tracking-wider mb-3">
                  *Project Budget
                </label>
                <input
                  type="text"
                  placeholder="What is your Budget (USD)"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-b-2 border-black/20 focus:border-black focus:outline-none transition-colors text-black placeholder:text-black/30 text-lg"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-8 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 group text-lg"
              >
                Submit Inquiry
                <Send size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
