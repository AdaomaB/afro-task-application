import { LuShield } from "react-icons/lu";
import { GoPeople } from "react-icons/go";
import { CiStar } from "react-icons/ci";

export default function WhyAfroTaskFeatures() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 md:gap-10 p-4 md:p-16">
      <h1 className="text-3xl md:text-5xl font-semibold text-center">
        Why Choose Afro Task{" "}
      </h1>

      <div className="flex flex-col md:flex-row w-full gap-10 justify-center items-center">
        {/* Trust-First Verification Card */}
        <div className="bg-[#E7E1E1] rounded-2xl w-full md:w-[350px] h-auto md:h-[380px] p-6 md:p-10 space-y-4 md:space-y-6 flex items-center justify-center flex-col text-black transition-transform duration-300 ease-in-out hover:scale-105">
          <div className="bg-[#F01010] p-4 md:p-5 rounded-full">
            <LuShield className="text-4xl md:text-6xl text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-center">
            Trust-First Verification
          </h1>
          <p className="max-text-xl text-center">
            Every freelancer and client goes through our rigorous verification
            process
          </p>
        </div>

        {/* Quality Professionals Card */}
        <div className="bg-[#E7E1E1] rounded-2xl w-full md:w-[350px] h-auto md:h-[380px] p-6 md:p-10 space-y-4 md:space-y-6 flex items-center justify-center flex-col text-black transition-transform duration-300 ease-in-out hover:scale-105">
          <div className="bg-[#1735F4] p-4 md:p-5 rounded-full">
            <GoPeople className="text-4xl md:text-6xl text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-center">
            Quality Professionals
          </h1>
          <p className="max-text-xl text-center">
            Work with verified experts who have proven their skills and
            credibility
          </p>
        </div>

        {/* Guaranteed Quality Card */}
        <div className="bg-[#E7E1E1] rounded-2xl w-full md:w-[350px] h-auto md:h-[380px] p-6 md:p-10 space-y-4 md:space-y-6 flex items-center justify-center flex-col text-black transition-transform duration-300 ease-in-out hover:scale-105">
          <div className="bg-[#F09603] p-4 md:p-5 rounded-full">
            <CiStar className="text-4xl md:text-6xl text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-center">
            Guaranteed Quality
          </h1>
          <p className="max-text-xl text-center">
            Our verification system ensures high-quality work and reliable
            partnerships
          </p>
        </div>
      </div>
    </div>
  );
}
