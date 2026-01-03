export default function TechStackOverlay() {
  const technologies = [
    { name: "C/C++", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
    { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
    { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
    { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
    { name: "Kafka", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg" },
    { name: "Spring Boot", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
    { name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
    { name: "Linux", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
    { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
    { name: "Supabase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" },
    { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
  ];

  const positions = [
    { top: '5%', left: '8%', rotate: '-12deg' },
    { top: '15%', left: '75%', rotate: '8deg' },
    { top: '25%', left: '15%', rotate: '15deg' },
    { top: '12%', left: '45%', rotate: '-8deg' },
    { top: '35%', left: '82%', rotate: '12deg' },
    { top: '45%', left: '10%', rotate: '-15deg' },
    { top: '35%', left: '92%', rotate: '12deg' },
    { top: '48%', left: '35%', rotate: '-10deg' },
    { top: '65%', left: '88%', rotate: '18deg' },
    { top: '70%', left: '20%', rotate: '-18deg' },
    { top: '75%', left: '50%', rotate: '5deg' },
    { top: '82%', left: '78%', rotate: '-12deg' },
    { top: '88%', left: '12%', rotate: '14deg' },
    { top: '85%', left: '42%', rotate: '-6deg' },
    { top: '20%', left: '92%', rotate: '20deg' },
    { top: '40%', left: '55%', rotate: '-14deg' },
  ];

  return (
    <div className="absolute inset-0 z-[10] pointer-events-none overflow-hidden">
      {technologies.map((tech, i) => {
        const pos = positions[i];
        return (
          <div
            key={i}
            className="absolute flex flex-col items-center justify-center"
            style={{
              top: pos.top,
              left: pos.left,
              transform: `rotate(${pos.rotate})`
            }}
          >
            <img
              src={tech.logo}
              alt={tech.name}
              loading="lazy"
              className="w-8 h-8 md:w-12 md:h-12 mb-1 md:mb-2 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            />
            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-tight text-black/80 text-center">
              {tech.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
