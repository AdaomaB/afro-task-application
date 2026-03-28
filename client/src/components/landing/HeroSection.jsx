import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const slides = [
  { type: "image", src: "/img/Ld1.png" },
  { type: "video", src: "/imgvid/vid_2.mp4" },
  { type: "video", src: "/imgvid/vid_1.mp4" },
  { type: "image", src: "/img/whisk.png" },
];

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [current, setCurrent] = useState(0);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate(); 

  const goTo = (index) => setCurrent((index + slides.length) % slides.length);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (slides[current].type === "image") {
      timerRef.current = setTimeout(() => goTo(current + 1), 5000);
    }
    return () => clearTimeout(timerRef.current);
  }, [current]);

  useEffect(() => {
    if (slides[current].type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [current]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/explore-projects?category=${encodeURIComponent(category)}`);
  };

  return (
    <div>
      <div className="relative p-4 md:p-10 m-2 md:m-10 rounded-2xl lg:h-screen md:rounded-3xl min-h-[60vh] overflow-hidden flex flex-col justify-end">

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
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}

        {/* Prev / Next arrows */}
        <button
          onClick={() => goTo(current - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
          aria-label="Previous slide"
        >
          <IoIosArrowBack className="text-xl" />
        </button>
        <button
          onClick={() => goTo(current + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
          aria-label="Next slide"
        >
          <IoIosArrowForward className="text-xl" />
        </button>

        {/* Dot indicators */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === current ? "bg-white scale-125" : "bg-white/50"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Content — unchanged */}
        <div className="relative z-10 font-bold text-2xl md:text-4xl lg:text-5xl flex justify-center flex-col items-center text-center px-2">
          <p>Empowering Ideas, Connecting</p>
          <p>Talent , and Building the Future</p>
        </div>

        <form
          onSubmit={handleSearch}
          className="relative z-10 flex justify-center items-center w-full md:w-2/3 mx-auto mt-4 px-2"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for freelancers, services..."
            className="w-full rounded-3xl bg-black/30 border-2 border-[#00564C] ml-0 md:ml-4 my-3 md:my-4 py-3 md:py-4 pl-4 md:pl-12 pr-24 md:pr-36 ring-0 focus:ring-0 focus:outline-none text-white placeholder-gray-300 hover:border-[#004D40] transition-colors duration-300 text-sm md:text-base"
          />
          <button
            type="submit"
            className="absolute right-1 md:right-0 bg-[#00564C] text-sm md:text-xl px-6 py-3 md:py-4 font-thin rounded-3xl flex flex-row gap-1 md:gap-2 hover:bg-[#027568] transition-colors duration-300"
          >
            <FaSearch className="text-lg md:text-2xl" />{" "}
            <span className="hidden md:inline">Search</span>
          </button>
        </form>

        <div className="relative z-10 flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-10 text-sm md:text-xl font-thin mt-3 md:mt-5 px-2">
          <button
            onClick={() => handleCategoryClick("Web Development")}
            className="bg-[#00564C] p-2 px-3 md:px-4 rounded-xl md:rounded-2xl hover:bg-[#027568] transition-colors duration-300 cursor-pointer text-xs md:text-base"
          >
            Web Development
          </button>
          <button
            onClick={() => handleCategoryClick("Logo Design")}
            className="bg-[#00564C] p-2 px-3 md:px-4 rounded-xl md:rounded-2xl hover:bg-[#027568] transition-colors duration-300 cursor-pointer text-xs md:text-base"
          >
            Logo Design
          </button>
          <button
            onClick={() => handleCategoryClick("Video Editing")}
            className="bg-[#00564C] p-2 px-3 md:px-4 rounded-xl md:rounded-2xl hover:bg-[#027568] transition-colors duration-300 cursor-pointer text-xs md:text-base"
          >
            Video Editing
          </button>
          <button
            onClick={() => handleCategoryClick("Content Writing")}
            className="bg-[#00564C] p-2 px-3 md:px-4 rounded-xl md:rounded-2xl hover:bg-[#027568] transition-colors duration-300 cursor-pointer text-xs md:text-base"
          >
            Content Writing
          </button>
        </div>
      </div>
    </div>
  );
}
