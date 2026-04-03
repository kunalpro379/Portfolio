import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import backgroundsData from "@/data/backgrounds.json";

export default function AboutSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const bgTexture = backgroundsData.sections.about;

  const heroImages2 = ["/papa.png", "/kunal2.png", "/friends.png", "/kunal.png", "/bhushan.png"];

  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = heroImages2.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error preloading images:", error);
        setImagesLoaded(true);
      }
    };

    preloadImages();

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages2.length);
    }, 4000);

    return () => clearInterval(imageInterval);
  }, []);

  return (
    <section id="about" className="relative pt-0 pb-10">
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundImage: `url('${bgTexture.texture}')`,
          opacity: bgTexture.opacity 
        }} 
      />
      <div className="relative z-10 flex flex-col lg:flex-row items-center px-6 md:px-24 max-w-7xl mx-auto w-full gap-10">
      {/* Image First on Desktop, Second on Mobile */}
      <div className="relative w-full lg:w-[45%] aspect-square select-none order-2 lg:order-1">
        <div className="relative w-full h-full max-w-[500px] mx-auto">
          <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
          <div className="absolute inset-0 bg-black/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-black/10 backdrop-blur-sm" />
          <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-black/20 bg-amber-50/20">
            {/* Colored patches */}
            <div className="absolute top-[10%] left-[5%] w-[25%] h-[30%] bg-yellow-200/40 rounded-full blur-[60px]"></div>
            <div className="absolute top-[5%] left-[15%] w-[15%] h-[20%] bg-yellow-300/30 rounded-full blur-[40px]"></div>
            <div className="absolute top-[20%] right-[10%] w-[20%] h-[25%] bg-gray-300/35 rounded-full blur-[50px]"></div>
            <div className="absolute top-[30%] right-[5%] w-[12%] h-[18%] bg-gray-400/25 rounded-full blur-[35px]"></div>
            <div className="absolute bottom-[15%] left-[8%] w-[22%] h-[28%] bg-red-200/35 rounded-full blur-[55px]"></div>
            <div className="absolute bottom-[25%] left-[20%] w-[14%] h-[16%] bg-red-300/25 rounded-full blur-[40px]"></div>
            <div className="absolute top-[40%] left-[35%] w-[18%] h-[22%] bg-green-200/30 rounded-full blur-[45px]"></div>
            <div className="absolute top-[50%] left-[25%] w-[12%] h-[15%] bg-green-300/25 rounded-full blur-[35px]"></div>
            <div className="absolute bottom-[20%] right-[15%] w-[24%] h-[26%] bg-blue-200/40 rounded-full blur-[58px]"></div>
            <div className="absolute bottom-[10%] right-[8%] w-[16%] h-[20%] bg-blue-300/30 rounded-full blur-[42px]"></div>
            <div className="absolute top-[60%] right-[30%] w-[10%] h-[12%] bg-purple-200/25 rounded-full blur-[30px]"></div>
            <div className="absolute bottom-[40%] left-[50%] w-[13%] h-[16%] bg-orange-200/28 rounded-full blur-[38px]"></div>

            {/* Animated Images */}
            {imagesLoaded ? (
              heroImages2.map((img, index) => {
                const isActive = currentImageIndex === index;
                const isPrev = currentImageIndex === (index + 1) % heroImages2.length;

                return (
                  <motion.img
                    key={img}
                    initial={{
                      opacity: index === 0 ? 1 : 0,
                      x: index === 0 ? 0 : 100,
                      y: index === 0 ? 0 : -100
                    }}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      x: isActive ? 0 : isPrev ? -100 : 100,
                      y: isActive ? 0 : isPrev ? 100 : -100,
                      scale: isActive ? 1 : 0.8
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    src={img}
                    alt="Character"
                    loading={index === 0 ? "eager" : "lazy"}
                    width={500}
                    height={500}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] md:w-[85%] md:h-[95%] object-contain md:object-cover grayscale rounded-2xl"
                  />
                );
              })
            ) : (
              <div className="absolute inset-0 bg-amber-50/30">
                <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-yellow-200/60 blur-[80px]"></div>
                <div className="absolute top-0 right-0 w-[35%] h-[35%] bg-gray-300/50 blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-[38%] h-[38%] bg-red-200/55 blur-[80px]"></div>
                <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-blue-200/60 blur-[80px]"></div>
                <div className="absolute top-[30%] left-[30%] w-[35%] h-[35%] bg-green-200/50 blur-[80px]"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Content - First on Mobile, Second on Desktop */}
      <div className="space-y-6 md:space-y-10 w-full lg:w-1/2 order-1 lg:order-2">
        <div className="space-y-3 md:space-y-4">
          <div className="aspect-[2/1] w-full max-w-md">
            <img
              src="/hero.png"
              alt="Engineering Vault VI"
              width={448}
              height={224}
              loading="eager"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <p className="text-lg md:text-2xl text-black/70 font-handwriting leading-relaxed">
            I'm someone who enjoys going deep into problems, understanding how things really work, and finishing what I start.
          </p>

          <div className="flex flex-wrap gap-6 md:gap-10">
            <div>
              <div className="text-2xl md:text-4xl font-black mb-1 text-black">02+</div>
              <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-black/50">Years Exp.</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-black mb-1 text-black">40+</div>
              <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-black/50">Projects</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-black mb-1 text-black">12k+</div>
              <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-black/50">Commits</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Text & Skills - Full Width Below */}
      <div className="w-full order-3 px-6 pb-10 max-w-7xl mx-auto">
        <div className="space-y-6 text-xl md:text-3xl lg:text-4xl leading-relaxed" style={{ fontFamily: "'Kalam', 'Comic Sans MS', 'Brush Script MT', cursive" }}>
          <p className="font-bold text-gray-800">
            I'm a <span className="font-black text-black bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 px-3 py-1 rounded-lg shadow-sm" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 700 }}>backend-focused engineer</span> who enjoys building systems that are reliable, scalable, and ready for real users. I spend most of my time designing APIs, real-time systems, and cloud-native backends using <span className="font-black text-black bg-gradient-to-r from-green-200 via-green-300 to-green-200 px-3 py-1 rounded-lg shadow-sm" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 700 }}>Node.js and AWS</span>.
          </p>
          
          <p className="font-bold text-gray-800">
            I care deeply about performance, clean architecture, and fault tolerance — not just making things work, but <span className="font-black text-black bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 px-3 py-1 rounded-lg shadow-sm" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 700 }}>making them last</span>. Alongside backend and DevOps, I work extensively with AI systems, including LLMs, generative models, and image generation workflows integrated into real applications.
          </p>
          
          <div className="inline-block bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 border-3 border-black rounded-2xl px-8 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
            <p className="text-xl md:text-2xl font-black text-black uppercase tracking-wide" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 900 }}>⚡ Current Focus</p>
          </div>
          
          <p className="font-bold text-gray-800">
            My focus is on making AI <span className="font-black text-black bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 px-3 py-1 rounded-lg shadow-sm" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 700 }}>production-ready</span>, not experimental. Currently, I'm exploring how generative AI, agents, and real-time infrastructure can come together to build practical, scalable, and high-impact systems.
          </p>
        </div>

       {/* Skills Table */}
        <div className="mt-12 bg-white/60 backdrop-blur-sm border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-1 divide-y-4 divide-black">
            <div className="p-6 md:p-8 bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-black font-black uppercase tracking-wider text-base md:text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 900 }}>
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                LANGUAGES
              </h3>
              <div className="text-gray-800 text-lg md:text-2xl font-bold leading-relaxed" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 600 }}>
                C/C++, Java, Python, JavaScript, SQL
              </div>
            </div>
            <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-cyan-50">
              <h3 className="text-black font-black uppercase tracking-wider text-base md:text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 900 }}>
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                TECHNOLOGIES & TOOLS
              </h3>
              <div className="text-gray-800 text-lg md:text-2xl font-bold leading-relaxed" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 600 }}>
                AWS, Kubernetes, Docker, Kafka, Spring Boot, React.JS, Azure, GitHub Actions, Linux
              </div>
            </div>
            <div className="p-6 md:p-8 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-black font-black uppercase tracking-wider text-base md:text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 900 }}>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                DATABASES
              </h3>
              <div className="text-gray-800 text-lg md:text-2xl font-bold leading-relaxed" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 600 }}>
                MySQL, MongoDB, GraphQL, Supabase, Redis
              </div>
            </div>
            <div className="p-6 md:p-8 bg-gradient-to-r from-orange-50 to-red-50">
              <h3 className="text-black font-black uppercase tracking-wider text-base md:text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 900 }}>
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                AI/ML
              </h3>
              <div className="text-gray-800 text-lg md:text-2xl font-bold leading-relaxed" style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive", fontWeight: 600 }}>
                Machine Learning, Data Analysis, Deep Learning, Generative AI, AI Agents
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}