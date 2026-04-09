import { useRef, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { motion } from "framer-motion";
import ServiceCard from "../ServiceCard";
import servicesData from "../../data/services.json";
import { TfiWrite } from "react-icons/tfi";
import {
  FaPalette,
  FaBullhorn,
  FaRobot,
  FaMagic,
  FaLaptopCode,
  FaVideo,
  FaPenNib,
} from "react-icons/fa";
import { FaToolbox } from "react-icons/fa6";
import { CiGlobe } from "react-icons/ci";

const iconMap = {
  TfiWrite,
  FaPalette,
  FaBullhorn,
  FaRobot,
  FaMagic,
  FaToolbox,
  FaLaptopCode,
  FaVideo,
  FaPenNib,
  CiGlobe,
};

export default function ServiceSection() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const arrowAnimRef = useRef(null);
  const isHoveringRef = useRef(false);

  const loopServices = [...servicesData, ...servicesData, ...servicesData];

  const getOneSetWidth = () => {
    const container = containerRef.current;
    if (!container) return 0;
    return container.scrollWidth / 3;
  };

  const normalizeScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const oneSetWidth = getOneSetWidth();
    if (!oneSetWidth) return;

    if (container.scrollLeft < oneSetWidth * 0.5) {
      container.scrollLeft += oneSetWidth;
    } else if (container.scrollLeft > oneSetWidth * 1.5) {
      container.scrollLeft -= oneSetWidth;
    }
  };

  const animateArrowScroll = (distance) => {
    const container = containerRef.current;
    if (!container) return;

    if (arrowAnimRef.current) {
      cancelAnimationFrame(arrowAnimRef.current);
      arrowAnimRef.current = null;
    }

    const start = container.scrollLeft;
    const duration = 450;
    let startTime = null;

    const easeInOutCubic = (t) =>
      t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (time) => {
      const container = containerRef.current;
      if (!container) return;

      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      container.scrollLeft = start + distance * eased;
      normalizeScroll();

      if (progress < 1) {
        arrowAnimRef.current = requestAnimationFrame(step);
      } else {
        arrowAnimRef.current = null;
      }
    };

    arrowAnimRef.current = requestAnimationFrame(step);
  };

  const scrollLeft = () => animateArrowScroll(-320);
  const scrollRight = () => animateArrowScroll(320);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const init = () => {
      const oneSetWidth = getOneSetWidth();
      if (oneSetWidth > 0) {
        container.scrollLeft = oneSetWidth;
      }
    };

    init();

    let lastTime = 0;
    const speed = 60; // px per second

    const tick = (time) => {
      const container = containerRef.current;
      if (!container) return;

      if (!lastTime) lastTime = time;
      const delta = Math.min(time - lastTime, 32);
      lastTime = time;

      const shouldAutoScroll =
        !isHoveringRef.current && !arrowAnimRef.current;

      if (shouldAutoScroll) {
        container.scrollLeft += (speed * delta) / 1000;
        normalizeScroll();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const handleResize = () => {
      normalizeScroll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (arrowAnimRef.current) cancelAnimationFrame(arrowAnimRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section
      className="w-full px-2 md:px-1 py-6 relative overflow-hidden"
      onMouseEnter={() => {
        isHoveringRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveringRef.current = false;
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-xl md:text-2xl font-semibold flex justify-center items-center tracking-wider text-white mb-4 md:mb-6 text-center px-2"
      >
        Popular Services
      </motion.h1>

      <div
        ref={containerRef}
        className="relative flex flex-nowrap items-stretch overflow-x-auto no-scrollbar scrollbar-hide select-none"
      >
        {loopServices.map((service, index) => {
          const IconComponent = iconMap[service.icon];
          return (
            <div key={`${service.id}-${index}`} className="shrink-0">
              <ServiceCard
                index={index}
                icon={IconComponent}
                title={service.title}
                description={service.description}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={scrollLeft}
        className="absolute left-4 top-1/2 bg-white/95 backdrop-blur-sm hover:bg-white shadow-xl rounded-full p-1 transition-all duration-200 hover:scale-110 active:scale-95 border border-gray-200 z-20 w-10 h-10 items-center justify-center text-gray-700 hover:text-black hidden md:flex"
        aria-label="Scroll left"
      >
        <IoIosArrowBack className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={scrollRight}
        className="absolute right-4 top-1/2 bg-white/95 backdrop-blur-sm hover:bg-white shadow-xl rounded-full p-1 transition-all duration-200 hover:scale-110 active:scale-95 border border-gray-200 z-20 w-10 h-10 items-center justify-center text-gray-700 hover:text-black hidden md:flex"
        aria-label="Scroll right"
      >
        <IoIosArrowForward className="w-4 h-4" />
      </button>
    </section>
  );
}