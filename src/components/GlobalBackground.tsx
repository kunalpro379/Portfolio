export default function GlobalBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-[70] overflow-hidden hidden md:block">
        <style>{`
          @keyframes globalBackgroundSlideshow {
            0%, 6.5%, 100% { opacity: 0; }
            0.3%, 5.8% { opacity: 0.16; }
          }

          .global-bg-slide {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0;
            transform: translateZ(0);
            will-change: opacity;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }

          .global-bg-slide-1 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 0s; background-image: url(/back1.png); }
          .global-bg-slide-2 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 8s; background-image: url(/back2.png); }
          .global-bg-slide-3 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 16s; background-image: url(/back3.png); }
          .global-bg-slide-4 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 24s; background-image: url(/back4.png); }
          .global-bg-slide-5 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 32s; background-image: url(/back5.png); }
          .global-bg-slide-6 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 40s; background-image: url(/back6.png); }
          .global-bg-slide-7 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 48s; background-image: url(/back7.png); }
          .global-bg-slide-8 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 56s; background-image: url(/back8.png); }
          .global-bg-slide-9 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 64s; background-image: url(/back9.png); }
          .global-bg-slide-10 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 72s; background-image: url(/back10.png); }
          .global-bg-slide-11 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 80s; background-image: url(/back11.png); }
          .global-bg-slide-12 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 88s; background-image: url(/back12.png); }
          .global-bg-slide-13 { animation: globalBackgroundSlideshow 104s ease-in-out infinite 96s; background-image: url(/back13.png); }
        `}</style>

        <div className="global-bg-slide global-bg-slide-1" />
        <div className="global-bg-slide global-bg-slide-2" />
        <div className="global-bg-slide global-bg-slide-3" />
        <div className="global-bg-slide global-bg-slide-4" />
        <div className="global-bg-slide global-bg-slide-5" />
        <div className="global-bg-slide global-bg-slide-6" />
        <div className="global-bg-slide global-bg-slide-7" />
        <div className="global-bg-slide global-bg-slide-8" />
        <div className="global-bg-slide global-bg-slide-9" />
        <div className="global-bg-slide global-bg-slide-10" />
        <div className="global-bg-slide global-bg-slide-11" />
        <div className="global-bg-slide global-bg-slide-12" />
        <div className="global-bg-slide global-bg-slide-13" />
      </div>

      <div
        className="fixed inset-0 -z-50"
        style={{
          background:
            'linear-gradient(to bottom, rgba(243, 232, 255, 0.6) 0%, rgba(219, 234, 254, 0.6) 16.67%, rgba(220, 252, 231, 0.6) 33.33%, rgba(254, 252, 232, 0.6) 50%, rgba(255, 237, 213, 0.6) 66.67%, rgba(254, 226, 226, 0.6) 83.33%, rgba(254, 226, 226, 0.5) 100%)'
        }}
      />
      <div
        className="fixed inset-0 -z-40 opacity-20 mix-blend-multiply"
        style={{
          backgroundImage: 'url(/page7.png)',
          backgroundRepeat: 'repeat',
          filter: 'grayscale(100%) brightness(0)'
        }}
      />
    </>
  );
}
