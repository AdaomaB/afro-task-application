import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

export default function WhyAfroTaskSection() {
  return (
    <div className="bg-gradient-to-br from-[#FB9E01] via-[#E68F07] to-[#C57810] w-full h-auto p-12 mx-2 lg:mx-8 py-12 lg:py-24 m-2 md:m-5 flex flex-col justify-center lg:flex-row items-center rounded-2xl md:rounded-3xl gap-4 overflow-visible relative">
      <div className="w-full gap-6 md:gap-12 flex flex-col z-10 md:text-left md:justify-start md:items-start lg:w-4/5">
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-semibold ">
          Why Afro Task is Changing Freelancing in Africa
        </h1>
        <p className="text-lg md:text-2xl lg:text-3xl">
          Freelancing is no longer just a side hustle — it's becoming the
          future of work in Africa. With young, talented professionals
          looking for opportunities beyond traditional office jobs, Afro
          Task is creating a space where skills meet demand in a truly
          African way.
        </p>
      </div>

      {/* Image and button container */}
      <div className="flex flex-col md:flex-col lg:justify-between md:justify-start justify-center items-center gap-4 w-full lg:w-2/5 relative z-0 mt-6 md:mt-0">
        <div className="w-full md:-mr-16">
          <img
            src="/img/whisk.png"
            alt="Whisk"
            className="lg:rounded-l-3xl w-full md:translate-x-14 hidden lg:block md:hidden"
          />
        </div>
        <div className="self-start md:ml-20 mt-4">
          <Link to="/why-afro-task">
            <button className="text-black bg-white flex flex-row md:w-[200px] lg:justify-center items-center py-2 px-6 md:py-2 md:px-8 rounded-2xl md:rounded-3xl shadow-lg text-base md:text-xl font-semibold group transition-transform duration-300 ease-in-out hover:scale-105">
              Read More {" "}
              <IoIosArrowForward className="font-semibold text-xl md:text-2xl transition-transform duration-300 group-hover:translate-x-4 group-hover:font-bold" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
