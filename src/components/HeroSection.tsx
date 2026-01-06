import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";

// Lazy load tech stack component
const TechStackIcons = lazy(() => import('./TechStackIcons'));

const technologies = [
  // Languages
  // { name: "C/C++", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
  // { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  // { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  // { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },

  // Technologies & Tools
  // { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },

  { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
  { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
  { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Kafka", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg" },
  { name: "Spring Boot", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
  // { name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
  // { name: "Linux", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },

  // Databases
  { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  // { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
  // { name: "Supabase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" },
  { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
];

export default function HeroSection() {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const heroImages2 = useMemo(() => ["/kunal.png", "/papa.png", "/friends.png", "/kunal2.png", "/bhushan.png"], []);

  // Memoize bokeh props to prevent recalculation
  const bokehProps = useMemo(() =>
    Array.from({ length: 8 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 10
    })), []
  );

  useEffect(() => {
    // Preload only critical hero image
    const img = new Image();
    img.src = "/me.png";
    img.decode().then(() => {
      setImagesLoaded(true);
    }).catch(() => {
      setImagesLoaded(true);
    });

    // Image rotation for heroImages2
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages2.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages2.length]);

  // Simplified animation variants
  const fadeIn = shouldReduceMotion ? {} : {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

  const slideIn = shouldReduceMotion ? {} : {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <section id="home" className="relative min-h-screen p-2 md:p-3">
      {/* Simplified Background - Static */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Static gradient blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-sky-400/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-400/15 rounded-full blur-[140px]" />
      </div>

      {/* Simplified Grid Overlay */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          maskImage: 'radial-gradient(circle at center, black, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 90%)'
        }}
      />

      {/* Reduced Bokeh particles - only show if motion is allowed */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 z-[3] pointer-events-none">
          {bokehProps.slice(0, 4).map((props, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.3, 0],
                y: [0, -100]
              }}
              transition={{
                duration: props.duration,
                repeat: Infinity,
                ease: "linear",
                delay: props.delay
              }}
              className="absolute w-1 h-1 bg-sky-500 rounded-full blur-[1px]"
              style={{
                top: props.top,
                left: props.left,
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle Aura behind Text */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[40%] h-[40%] bg-sky-400/10 rounded-full blur-[180px] z-[4] pointer-events-none" />

      {/* SCROLLABLE CONTENT */}
      <div className="relative z-[5]">
        <div className="flex flex-col">
          {/* First Screen - Hero Content */}
          <div className="min-h-[75vh] flex flex-col lg:flex-row items-center justify-between px-6 md:px-24 max-w-7xl mx-auto w-full gap-10 pt-20 pb-0">
            {/* Image Second on Mobile, Second on Desktop */}
            <div className="relative w-full lg:w-[45%] aspect-square select-none order-2 lg:order-2">
              <div className="relative w-full h-full max-w-[500px] mx-auto">
                <div className="absolute inset-0 bg-sky-400/20 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
                <div className="absolute inset-0 bg-black/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-black/10 backdrop-blur-sm" />
                <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-black/20 bg-gradient-to-br from-white/50 to-transparent">
                  {imagesLoaded ? (
                    <img
                      src="/me.png"
                      alt="Hero Character"
                      loading="eager"
                      fetchPriority="high"
                      width={500}
                      height={500}
                      decoding="async"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] md:w-[80%] md:h-[80%] object-contain md:object-cover grayscale rounded-2xl"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-sky-200" />
                  )}
                </div>

                {/* <div className="absolute -top-3 -right-3 md:-top-6 md:-right-6 px-3 md:px-6 py-1.5 md:py-3 bg-white border border-black/10 rounded-xl md:rounded-2xl shadow-2xl">
                  <div className="text-[8px] md:text-xs font-black text-sky-500 whitespace-nowrap">AI Engineer</div>
                </div> */}
              </div>
            </div>

            {/* Text Content - First on Mobile, First on Desktop */}
            <div className="flex flex-col items-start justify-center lg:w-3/5 order-1 lg:order-1">
              <motion.div {...fadeIn} className="mb-4 md:mb-6">
                <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                  Crafting Future Tech
                </span>
              </motion.div>
              <h1 className="hero-title text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.8] mb-6 md:mb-8 select-none text-left text-black">
                KUNAL<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-black/40">PATIL</span>
              </h1>
              <p className="max-w-xl text-black/60 font-medium text-sm md:text-lg tracking-wide uppercase text-left">
                I build scalable backends, automate the cloud, and bring AI ideas to life.
              </p>

              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto mb-12 md:mb-20">
                <a href="#projects" className="inline-flex items-center gap-4 px-6 md:px-8 py-3 md:py-4 bg-black text-white rounded-full font-black uppercase tracking-widest md:hover:bg-sky-500 md:hover:text-white transition-all cursor-pointer group text-xs md:text-base shadow-lg active:scale-95">
                  See my work <ChevronRight size={18} className="md:group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#contact" className="px-8 md:px-10 py-4 md:py-5 border border-black/20 bg-white/50 backdrop-blur-md text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest md:hover:bg-white/80 transition-all cursor-pointer text-center text-xs md:text-base shadow-lg active:scale-95">
                  Contact Me
                </a>
              </div>
            </div>
          </div>

          {/* Second Screen - About Content */}
          <div id="about" className="pt-0 pb-10 flex flex-col lg:flex-row items-center px-6 md:px-24 max-w-7xl mx-auto w-full gap-10">
            {/* Image First on Desktop, Second on Mobile */}
            <div className="relative w-full lg:w-[45%] aspect-square select-none order-2 lg:order-1">
              <div className="relative w-full h-full max-w-[500px] mx-auto">
                <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] rotate-6 scale-95" />
                <div className="absolute inset-0 bg-black/5 rounded-[2rem] md:rounded-[4rem] -rotate-3 border border-black/10 backdrop-blur-sm" />
                <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-black/20 bg-gradient-to-br from-amber-50/70 to-orange-100/50 rotate-3">
                  {heroImages2.map((img, index) => {
                    const isActive = currentImageIndex === index;
                    return (
                      <img
                        key={img}
                        src={img}
                        alt="Character"
                        loading="lazy"
                        decoding="async"
                        width={500}
                        height={500}
                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] md:w-[85%] md:h-[95%] object-contain md:object-cover grayscale rounded-2xl transition-opacity duration-1000 -rotate-3 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                        style={{ pointerEvents: 'none' }}
                      />
                    );
                  })}
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
                    loading="lazy"
                    decoding="async"
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
          </div>

          {/* Mobile Only - Additional Text Below Image Section */}
          <div className="px-6 pb-10 max-w-7xl mx-auto w-full">
            <div className="space-y-4 text-base md:text-2xl lg:text-3xl text-black font-handwriting leading-relaxed">
              <p>I'm a backend-focused engineer who enjoys building systems that are reliable, scalable, and ready for real users. I spend most of my time designing APIs, real-time systems, and cloud-native backends using Node.js and AWS.</p>
              <p>I care deeply about performance, clean architecture, and fault tolerance — not just making things work, but making them last. Alongside backend and DevOps, I work extensively with AI systems, including LLMs, generative models, and image generation workflows integrated into real applications.</p>
              <p>My focus is on making AI production-ready, not experimental. Currently, I'm exploring how generative AI, agents, and real-time infrastructure can come together to build practical, scalable, and high-impact systems.</p>
            </div>

            {/* Skills Table */}
            <div className="mt-8 bg-gray-100 border-2 border-black rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-black/20">
                <div className="p-6">
                  <h3 className="text-black font-black uppercase tracking-wider text-sm mb-3">LANGUAGES</h3>
                  <div className="text-black/70 text-sm md:text-base font-handwriting leading-relaxed">C/C++, Java, Python, JavaScript, SQL</div>
                </div>
                <div className="p-6">
                  <h3 className="text-black font-black uppercase tracking-wider text-sm mb-3">TECHNOLOGIES & TOOLS</h3>
                  <div className="text-black/70 text-sm md:text-base font-handwriting leading-relaxed">AWS, Kubernetes, Docker, Kafka, Spring Boot, React.JS, Azure, GitHub Actions, Linux</div>
                </div>
                <div className="p-6">
                  <h3 className="text-black font-black uppercase tracking-wider text-sm mb-3">DATABASES</h3>
                  <div className="text-black/70 text-sm md:text-base font-handwriting leading-relaxed">MySQL, MongoDB, GraphQL, Supabase, Redis</div>
                </div>
                <div className="p-6">
                  <h3 className="text-black font-black uppercase tracking-wider text-sm mb-3">AI/ML</h3>
                  <div className="text-black/70 text-sm md:text-base font-handwriting leading-relaxed">Machine Learning, Data Analysis, Deep Learning, Generative AI, AI Agents</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LAZY LOADED TECH STACK */}
      <Suspense fallback={null}>
        <TechStackIcons technologies={technologies} />
      </Suspense>
    </section>
  );
}
