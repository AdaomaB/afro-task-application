import { Link } from "react-router-dom";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useState, useEffect, useRef } from "react";

const slides = [
  { type: "image", src: "/img/whisk.png", alt: "Afro Task" },
  { type: "video", src: "/imgvid/vid_2.mp4" },
  { type: "image", src: "/imgvid/5897679113701494037.jpg", alt: "Afro Task" },
];

export default function WhyAfroTaskBoard() {
  const [current, setCurrent] = useState(0);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const goTo = (index) => {
    setCurrent((index + slides.length) % slides.length);
  };

  // Auto-advance: 5s for images, video advances on end
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (slides[current].type === "image") {
      timerRef.current = setTimeout(() => goTo(current + 1), 5000);
    }
    return () => clearTimeout(timerRef.current);
  }, [current]);

  // Play video when it becomes active
  useEffect(() => {
    if (slides[current].type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [current]);

  return (
    <div className="mx-auto ">
      {/* Carousel */}
      <div className="relative p-4 m-2 md:m-10 rounded-2xl lg:h-screen md:rounded-3xl min-h-[60vh] overflow-hidden flex flex-col justify-end">
        <div>
                  {/* Slides */}
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.type === "image" ? (
              <img
                src={slide.src}
                alt="hero"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={i === current ? videoRef : null}
                src={slide.src}
                className="w-full h-full object-cover"
                muted
                playsInline
                onEnded={() => goTo(current + 1)}
              />
            )}
            {/* Dark overlay so text stays readable */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

          {/* Prev / Next */}
          <button
            onClick={() => goTo(current - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition hidden md:flex"
            aria-label="Previous"
          >
            <IoIosArrowBack className="text-lg" />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition hidden md:"
            aria-label="Next"
          >
            <IoIosArrowForward className="text-lg" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? "bg-white scale-125" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Text - Moved inside carousel container and adjusted for better centering */}
          <div className="absolute inset-0 flex flex-col justify-center items-center z-30 text-white text-xl md:text-2xl lg:text-3xl px-4 text-center max-w-2xl mx-auto md:translate-y-1/3 ">
            <h1 className="font-semibold mb-4 drop-shadow-lg">
              Why Afro Task is Changing Freelancing in Africa
            </h1>
            <p className="text-xs md:text-sm lg:text-lg drop-shadow-lg md:mb-20">
              Freelancing is no longer just a side hustle — it's becoming the
              future of work in Africa. With young, talented professionals
              looking for opportunities beyond traditional office jobs, Afro
              Task is creating a space where skills meet demand in a truly
              African way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
