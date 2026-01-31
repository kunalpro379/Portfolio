import { memo } from 'react';

interface Technology {
  name: string;
  logo: string;
}

interface TechStackIconsProps {
  technologies: Technology[];
}

const TechStackIcons = memo(({ technologies }: TechStackIconsProps) => {
  // Better distributed positions to avoid overlapping
  const positions = [
    { top: '8%', left: '5%', rotate: '-12deg' },
    { top: '5%', left: '25%', rotate: '8deg' },
    { top: '12%', left: '45%', rotate: '-8deg' },
    { top: '8%', left: '70%', rotate: '15deg' },
    { top: '6%', left: '90%', rotate: '-10deg' },
    
    { top: '25%', left: '3%', rotate: '12deg' },
    { top: '28%', left: '20%', rotate: '-15deg' },
    { top: '30%', left: '50%', rotate: '10deg' },
    { top: '26%', left: '75%', rotate: '-8deg' },
    { top: '32%', left: '95%', rotate: '14deg' },
    
    { top: '48%', left: '8%', rotate: '-10deg' },
    { top: '52%', left: '30%', rotate: '16deg' },
    { top: '50%', left: '60%', rotate: '-12deg' },
    { top: '55%', left: '85%', rotate: '8deg' },
    
    { top: '72%', left: '5%', rotate: '10deg' },
    { top: '75%', left: '28%', rotate: '-14deg' },
    { top: '70%', left: '55%', rotate: '12deg' },
    { top: '78%', left: '80%', rotate: '-8deg' },
    
    { top: '92%', left: '15%', rotate: '14deg' },
    { top: '90%', left: '40%', rotate: '-10deg' },
    { top: '95%', left: '65%', rotate: '8deg' },
    { top: '88%', left: '88%', rotate: '-16deg' },
  ];

  return (
    <div className="absolute inset-0 z-[10] pointer-events-none overflow-hidden">
      {technologies.map((tech, i) => {
        const pos = positions[i % positions.length];
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
              decoding="async"
              width={48}
              height={48}
              className="w-8 h-8 md:w-12 md:h-12 mb-1 md:mb-2 filter grayscale opacity-60 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            />
            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-tight text-black/60 text-center">
              {tech.name}
            </span>
          </div>
        );
      })}
    </div>
  );
});

TechStackIcons.displayName = 'TechStackIcons';

export default TechStackIcons;
