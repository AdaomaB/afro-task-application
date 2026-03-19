import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

export default function StuckVibeSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="bg-gradient-to-br from-[#FB9E01] via-[#E68F07] to-[#C57810] w-full h-auto p-6 md:p-12 mx-2 md:mx-8 pt-12 md:pt-24 m-4 md:m-10 flex flex-col justify-center items-center rounded-2xl md:rounded-3xl gap-4 md:gap-6 overflow-visible relative shadow-2xl"
    >
      <div className="gap-6 md:gap-12 flex flex-col z-10 w-full">
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-semibold">
          Stuck at vibe coding?
        </h1>
        <p className="text-lg md:text-2xl lg:text-3xl opacity-90">
          Get matched with the right expert to turn your prototype into a
          real, working product.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between w-full items-end gap-4 relative z-0 mt-4">
        <Link to="/explore-projects">
          <button className="text-black duration-300 ease-in-out hover:scale-105 bg-white flex flex-row justify-center items-center py-2 px-6 md:py-2 md:px-8 rounded-xl shadow-lg text-lg md:text-2xl font-semibold ring-2 ring-black cursor-pointer hover:bg-gray-100 hover:shadow-xl transition-all w-full md:w-auto">
            Find an Expert
          </button>
        </Link>
        <img
          src="/img/board.png"
          alt="afro"
          className="w-full md:w-1/2 translate-y-0 md:translate-y-12"
        />
      </div>
    </motion.div>
  );
}
