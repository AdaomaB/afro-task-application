import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: "linear-gradient(135deg, #00564C 0%, #027568 60%, #00564C 100%)" }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 90%, #FB9E01 0%, transparent 50%), radial-gradient(circle at 90% 10%, #fff 0%, transparent 50%)",
        }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative max-w-3xl mx-auto px-6 text-center"
      >
        <p className="text-[#FB9E01] font-semibold tracking-widest uppercase text-sm mb-4">
          Get Started Today
        </p>
        {/* <h2 className="text-xl md:text-3xl font-bold text-white mb-6 leading-tight">
          Ready to get started?
        </h2> */}
        <p className="text-white/70 text-xs md:text-base mb-10">
          Join thousands of verified professionals and trusted clients on AfroTask
        </p>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center">
          <Link to="/signup/client">
            <button className="bg-[#FB9E01] hover:bg-[#CC8102] text-white font-semibold px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 text-base md:text-lg flex items-center gap-2">
              Join as a Client <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link to="/signup/freelancer">
            <button className="border-2 border-white/40 hover:border-white text-white font-semibold px-10 py-4 rounded-xl transition-all duration-300 hover:bg-white/10 text-base md:text-lg">
              Become a Freelancer
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
