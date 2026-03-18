import { Link } from "react-router-dom";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useState, useEffect, useRef } from "react";

const slides = [
  { type: "image", src: "/img/whisk.png", alt: "Afro Task" },
  { type: "video", src: "/imgvid/video5897679113241500502.mp4" },
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
    <div className="bg-white h-auto p-6 sm:p-12 mx-4 mt-4 lg:mx-8 py-12 lg:py-24 m-2 lg:m-12 flex flex-col justify-center lg:flex-row items-center rounded-2xl md:rounded-3xl gap-6 overflow-visible relative">
      {/* Text */}
      <div className="w-full gap-6 md:gap-12 flex flex-col z-10 text-center md:text-left md:justify-start md:items-start lg:w-4/5">
        <h1 className="text-xl md:text-3xl lg:text-5xl font-semibold">
          Why Afro Task is Changing Freelancing in Africa
        </h1>
        <p className="text-base md:text-2xl lg:text-3xl">
          Freelancing is no longer just a side hustle — it's becoming the
          future of work in Africa. With young, talented professionals
          looking for opportunities beyond traditional office jobs, Afro
          Task is creating a space where skills meet demand in a truly
          African way.
        </p>
      </div>

      {/* Carousel */}
      <div className="flex flex-col items-center gap-4 w-full lg:w-2/5 relative z-0 mt-6 md:mt-0">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-xl aspect-video bg-black">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === current ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {slide.type === "image" ? (
                <img
                  src={slide.src}
                  alt={slide.alt}
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
            </div>
          ))}

          {/* Prev / Next */}
          <button
            onClick={() => goTo(current - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"
            aria-label="Previous"
          >
            <IoIosArrowBack className="text-lg" />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"
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
        </div>

        {/* Read More button */}
        <div className="self-start mt-2">
          <Link to="/why-afro-task">
            <button className="text-white transition-transform duration-300 ease-in-out hover:scale-105 bg-green-500 flex flex-row items-center py-2 px-6 md:py-2 md:px-8 rounded-2xl md:rounded-3xl shadow-lg text-base md:text-xl font-semibold group">
              Read More{" "}
              <IoIosArrowForward className="font-semibold text-xl md:text-2xl transition-transform duration-300 group-hover:translate-x-4 group-hover:font-bold" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
