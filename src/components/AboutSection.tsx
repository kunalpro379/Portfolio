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
          <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-black/20">
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
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200" />
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
        <div className="space-y-4 text-base md:text-2xl lg:text-3xl text-black/70 font-handwriting leading-relaxed">
          <p>I'm a backend-focused engineer who enjoys building systems that are reliable, scalable, and ready for real users. I spend most of my time designing APIs, real-time systems, and cloud-native backends using Node.js and AWS.</p>
          <p>I care deeply about performance, clean architecture, and fault tolerance — not just making things work, but making them last. Alongside backend and DevOps, I work extensively with AI systems, including LLMs, generative models, and image generation workflows integrated into real applications.</p>
          <p>My focus is on making AI production-ready, not experimental. Currently, I'm exploring how generative AI, agents, and real-time infrastructure can come together to build practical, scalable, and high-impact systems.</p>
        </div>

        {/* Skills Table */}
        <div className="mt-8 bg-gray-100 border-2 border-black rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-black/20">
            <div className="p-6">
              <h3 className="text-black font-black uppercase tracking-wider text-sm mb-3">LANGUAGES</h3>
              <div className="text-black/70 text-sm md:text-base font-handwriting leading-relaxed">
                C/C++, Java, Python, JavaScript, SQL
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-black font-black uppercase tracking-wider text-sm mb-3">TECHNOLOGIES & TOOLS</h3>
              <div className="text-black/70 text-sm md:text-base font-handwriting leading-relaxed">
                AWS, Kubernetes, Docker, Kafka, Spring Boot, React.JS, Azure, GitHub Actions, Linux
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-black font-black uppercase tracking-wider text-sm mb-3">DATABASES</h3>
              <div className="text-black/70 text-sm md:text-base font-handwriting leading-relaxed">
                MySQL, MongoDB, GraphQL, Supabase, Redis
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-black font-black uppercase tracking-wider text-sm mb-3">AI/ML</h3>
              <div className="text-black/70 text-sm md:text-base font-handwriting leading-relaxed">
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
