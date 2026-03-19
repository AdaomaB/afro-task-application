import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LuShield } from "react-icons/lu";
import { GoPeople } from "react-icons/go";
import { CiStar } from "react-icons/ci";

const features = [
  {
    icon: LuShield,
    bg: "bg-red-500",
    title: "Trust-First Verification",
    desc: "Every freelancer and client goes through our rigorous verification process",
  },
  {
    icon: GoPeople,
    bg: "bg-blue-600",
    title: "Quality Professionals",
    desc: "Work with verified experts who have proven their skills and credibility",
  },
  {
    icon: CiStar,
    bg: "bg-[#F09603]",
    title: "Guaranteed Quality",
    desc: "Our verification system ensures high-quality work and reliable partnerships",
  },
];

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function WhyAfroTaskFeatures() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 md:gap-12 p-4 md:p-16">
      <FadeIn className="text-center">
        <p className="text-[#FB9E01] font-semibold tracking-widest uppercase text-sm mb-3">
          Our Advantage
        </p>
        <h1 className="text-3xl md:text-5xl font-bold text-center">
          Why Choose Afro Task
        </h1>
      </FadeIn>

      <div className="flex flex-col md:flex-row w-full gap-6 md:gap-8 justify-center items-stretch">
        {features.map((f, i) => (
          <FadeIn key={f.title} delay={i * 0.1} className="flex-1 max-w-sm mx-auto w-full">
            <div className="bg-[#E7E1E1] rounded-2xl h-full p-8 md:p-10 space-y-5 flex items-center justify-center flex-col text-black transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl group">
              <div className={`${f.bg} p-4 md:p-5 rounded-full transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className="text-4xl md:text-6xl text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-center">{f.title}</h2>
              <p className="text-center text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
