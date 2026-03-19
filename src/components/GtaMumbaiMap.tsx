interface GtaMumbaiMapProps {
  className?: string;
}

const MUMBAI_MAP_EMBED_URL =
  'https://www.openstreetmap.org/export/embed.html?bbox=72.824%2C18.982%2C72.948%2C19.142&layer=mapnik&marker=19.0760%2C72.8777#map=12/19.0760/72.8777';

export default function GtaMumbaiMap({ className = 'h-[420px]' }: GtaMumbaiMapProps) {
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border-4 border-black bg-[#091019] ${className}`}>
      <iframe
        src={MUMBAI_MAP_EMBED_URL}
        title="Mumbai Map"
        className="h-full w-full border-0 grayscale contrast-[1.45] saturate-[0.6] brightness-[0.72] sepia-[0.34] hue-rotate-[165deg]"
        loading="lazy"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,220,0.2),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(255,60,120,0.18),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-45 bg-[linear-gradient(to_bottom,transparent_95%,rgba(255,255,255,0.09)_96%),linear-gradient(to_right,transparent_95%,rgba(255,255,255,0.09)_96%)] bg-[length:22px_22px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-md border-2 border-black bg-black/80 px-2 py-1 text-[10px] font-black tracking-widest text-[#6ef2ff]">
        MUMBAI GRID
      </div>
    </div>
  );
}
