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
      className="bg-gradient-to-br from-[#FB9E01] via-[#E68F07] to-[#C57810] w-full h-auto p-6 md:p-12 mx-2 md:mx-8 pt-12 m-4 flex flex-col md:flex-row justify-center items-center rounded-2xl md:rounded-3xl gap-4 md:gap-6 overflow-visible relative shadow-2xl"
    >
      <div className="gap-6 md:gap-12 flex flex-col z-10 w-full">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
          Stuck at vibe coding?
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-xl">
          Get matched with the right expert to turn your prototype into a
          real, working product.
        </p>
        <Link to="/explore-projects">
          <button className="text-black duration-300 ease-in-out hover:scale-105 bg-white flex flex-row justify-center items-center py-2 px-6 md:py-2 md:px-8 rounded-xl shadow-lg text-sm lg:text-xl font-semibold ring-1 ring-black cursor-pointer hover:bg-gray-100 hover:shadow-xl transition-all md:w-auto">
            Find an Expert
          </button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between w-full items-end gap-4 relative z-0 mt-4">
        <img
          src="/img/board.png"
          alt="afro"
          className="w-full translate-y-0 md:translate-y-12"
        />
      </div>
    </motion.div>
  );
}
