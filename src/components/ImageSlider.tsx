"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import Image from "next/image";

const images = [
  { src: "/kunal.png", alt: "Kunal" },
  { src: "/friends.png", alt: "Friends" },
  { src: "/papa.png", alt: "Papa" },
  { src: "/character.png", alt: "Character" },
];

const ImageSlider = memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const slideVariants = useMemo(() => ({
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0
    })
  }), []);

  const handleIndicatorClick = useCallback((i: number) => {
    setDirection(i > currentIndex ? 1 : -1);
    setCurrentIndex(i);
  }, [currentIndex]);

  const getImageClass = useCallback((src: string) => {
    if (src === "/kunal.png") return "object-contain scale-75";
    if (src === "/friends.png") return "object-contain scale-90";
    return "object-cover";
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-3xl">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", duration: 0.5, ease: "easeInOut" },
            opacity: { duration: 0.3 }
          }}
          className="absolute inset-0"
        >
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            loading="lazy"
            decoding="async"
            className={`w-full h-full grayscale hover:grayscale-0 transition-all duration-700 ${getImageClass(images[currentIndex].src)}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => handleIndicatorClick(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-white" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
});

ImageSlider.displayName = "ImageSlider";

export default ImageSlider;
