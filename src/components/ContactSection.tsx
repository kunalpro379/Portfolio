import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Download, Instagram, Linkedin, Twitter, Github, Eye } from "lucide-react";
import { FaThreads } from "react-icons/fa6";
import contactData from "@/data/contact.json";
import backgroundsData from "@/data/backgrounds.json";

export default function ContactSection() {
  const bgTexture = backgroundsData.sections.contact;
  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      github: Github,
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
      threads: FaThreads,
      medium: null // Will use custom image
    };
    return iconMap[iconName];
  };

  return (
    <section className="relative min-h-screen flex items-center py-0">
      <div className="w-full relative z-10">
        <div className="flex flex-col lg:flex-row min-h-screen">

          {/* LEFT SIDE - Big Text + Social Links (60% width) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-3/5 flex flex-col items-start justify-center p-8 md:p-16 lg:p-24 space-y-16"
          >
            <div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-black transform -rotate-2" style={{ fontFamily: "'Permanent Marker', 'Comic Sans MS', cursive" }}>
                LET'S<br />
                COLLABORATE<br />
                TOGETHER!
              </h2>
              <div className="mt-6 h-2 w-32 bg-sky-500 rounded-full transform rotate-1" />
              <p className="mt-8 text-lg md:text-xl lg:text-2xl text-black/80 font-medium leading-relaxed max-w-xl" style={{ fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive" }}>
                Open for full-time roles in AI/ML, DevOps, and Backend Development. 
                Also available for freelance projects and remote work opportunities.
              </p>
            </div>

            {/* Social Links - Below Title */}
            <div className="w-full space-y-8">
              <div>
                <p className="text-black/60 text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wider mb-10">
                  Connect With Me
                </p>
                <div className="flex flex-wrap gap-6 md:gap-8">
                  {contactData.socialLinks.map((social) => {
                    const Icon = getIcon(social.icon);

                    // Custom Medium icon
                    if (social.icon === 'medium') {
                      return (
                        <a
                          key={social.name}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-black/70 ${social.color} transition-all transform hover:scale-110`}
                          aria-label={social.name}
                        >
                          <img
                            src="/medium.png"
                            alt="Medium"
                            className="w-12 h-12 object-contain opacity-70 hover:opacity-100 transition-opacity"
                          />
                        </a>
                      );
                    }

                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-black/70 ${social.color} transition-all transform hover:scale-110`}
                        aria-label={social.name}
                      >
                        <Icon size={48} />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Resume Buttons - Mobile Only */}
              <div className="lg:hidden flex items-center gap-4">
                <a
                  href="https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-base font-bold uppercase tracking-wider rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl group"
                >
                  <Eye size={20} className="group-hover:scale-110 transition-transform" />
                  View Resume
                </a>
                <a
                  href="https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf"
                  download
                  className="inline-flex items-center justify-center p-4 bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl group"
                  aria-label="Download Resume"
                >
                  <Download size={20} className="group-hover:animate-bounce" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE - Black Section (40% width on desktop, full width on mobile at bottom) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-2/5 relative bg-black text-white p-12 xl:p-16 flex flex-col justify-between overflow-hidden rounded-tl-[3rem] rounded-tr-[3rem] lg:rounded-tr-none lg:rounded-bl-[3rem]"
          >
            {/* Decorative Lines */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute border-l-2 border-white/30 h-full"
                  style={{
                    right: `${i * 15}%`,
                    transform: `rotate(${10 + i * 5}deg)`,
                    transformOrigin: 'top right'
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 space-y-12">
              {/* Header */}
              <div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">Contact Information</h3>
                <p className="text-white/60 text-base md:text-lg">
                  If you have any questions, feel free to get in touch with us.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-10">
                {/* Phone */}
                <div className="flex items-start gap-4 group">
                  <div className="mt-1">
                    <Phone size={28} className="text-white/80 group-hover:text-sky-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Phone</p>
                    <a href={`tel:${contactData.phone}`} className="text-xl md:text-2xl font-medium hover:text-sky-400 transition-colors">
                      {contactData.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 group">
                  <div className="mt-1">
                    <Mail size={28} className="text-white/80 group-hover:text-sky-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Email</p>
                    <a href={`mailto:${contactData.email}`} className="text-xl md:text-2xl font-medium hover:text-sky-400 transition-colors break-all">
                      {contactData.email}
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 group">
                  <div className="mt-1">
                    <MapPin size={28} className="text-white/80 group-hover:text-sky-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Location</p>
                    <p className="text-xl md:text-2xl font-medium">
                      {contactData.location}
                    </p>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-start gap-4 group">
                  <div className="mt-1">
                    <Clock size={28} className="text-white/80 group-hover:text-sky-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Availability</p>
                    <p className="text-xl md:text-2xl font-medium">{contactData.availability.days}</p>
                    <p className="text-white/60 text-base">{contactData.availability.hours}</p>
                  </div>
                </div>
              </div>

              {/* Resume Buttons - Desktop Only */}
              <div className="pt-8 hidden lg:flex items-center gap-4">
                <a
                  href="https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-base font-bold uppercase tracking-wider rounded-full hover:bg-sky-400 hover:text-white transition-all shadow-lg hover:shadow-xl group"
                >
                  <Eye size={20} className="group-hover:scale-110 transition-transform" />
                  View Resume
                </a>
                <a
                  href="https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf"
                  download
                  className="inline-flex items-center justify-center p-4 bg-white text-black rounded-full hover:bg-sky-400 hover:text-white transition-all shadow-lg hover:shadow-xl group"
                  aria-label="Download Resume"
                >
                  <Download size={20} className="group-hover:animate-bounce" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
