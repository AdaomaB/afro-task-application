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
  // repeat services 5 times for marquee effect
  const loopServices = Array(5).fill(servicesData).flat();

  return (
    <section className="w-full px-2 md:px-1 py-6 md:py-10">
      <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold flex justify-center items-center tracking-wider text-white mb-6 md:mb-10 text-center px-2">
        Popular Services
      </h1>

      <div className="flex flex-nowrap justify-center items-center gap-4 md:gap-0 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none px-2 pb-4 animate-marquee hover:[animation-play-state:paused]">

        {loopServices.map((service, index) => {
          const IconComponent = iconMap[service.icon];

          return (
            <ServiceCard
              key={`${service.id}-${index}`}
              index={index}
              icon={IconComponent}
              title={service.title}
              description={service.description}
            />
          );
        })}

      </div>
    </section>
  );
}