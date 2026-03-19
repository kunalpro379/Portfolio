export default function GlobalBackground() {
  return (
    <>
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
