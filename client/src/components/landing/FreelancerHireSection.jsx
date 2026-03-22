import { useRef, useState, useEffect } from "react";
import FreelancerCard from "../FreelancerCard";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import api from "../../services/api";

export default function FreelancerHireSection() {
  const containerRef = useRef(null);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await api.get("/ranking/top-freelancers?limit=6");
        setFreelancers(response.data.freelancers || []);
      } catch (error) {
        console.error("Error fetching top freelancers:", error);
        // Fallback to empty array, no dummy data
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  return (
    <div className="text-black">
      <div className="flex items-center justify-center flex-col gap-4 mb-6 md:mb-10 px-2">
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold tracking-wider text-center">
          Hire a Freelancer
        </h1>

        <h2 className="flex flex-col lg:flex-row text-lg md:text-2xl lg:text-3xl font-normal text-center">
          <span className="md:ml-2">Find the right talent.</span>
          <span className="md:ml-2">Start your project.</span>
          <span className="md:ml-2">Watch your vision come alive.</span>
        </h2>
      </div>

      {/* Freelancer cards container with scroll buttons */}
      <div className="relative w-screen h-full max-w-7xl mx-auto">
        <div
          ref={containerRef}
          className="flex justify-start items-center flex-nowrap overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none lg:gap-6 gap-4 px-2 m-4 no-scrollbar"
        >
          {loading ? (
            Array(6)
              .fill()
              .map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="snap-start w-80 h-96 bg-gray-200 animate-pulse rounded-lg"
                ></div>
              ))
          ) : freelancers.length === 0 ? (
            <div className="snap-start w-full flex items-center justify-center h-96 text-gray-500">
              No top freelancers available
            </div>
          ) : (
            freelancers.map((freelancer) => (
              <div key={freelancer.uid || freelancer.id} className="snap-start">
                <FreelancerCard
                  userId={freelancer.uid || freelancer.id}
                  name={freelancer.fullName || "Unnamed Freelancer"}
                  title={
                    freelancer.professionalTitle ||
                    freelancer.skillCategory ||
                    "Skilled Professional"
                  }
                  description={
                    freelancer.bio?.slice(0, 150) ||
                    freelancer.skills?.slice(0, 3).join(", ") + " expert"
                  }
                  rating={freelancer.averageRating || 0}
                  reviews={freelancer.totalReviews || 0}
                  hourlyRate={freelancer.hourlyRate || "Negotiable"}
                  image={
                    freelancer.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.fullName || "User")}`
                  }
                />
              </div>
            ))
          )}
        </div>

        {/* Left Arrow */}
        <button
          onClick={() =>
            containerRef.current?.scrollBy({ left: -320, behavior: "smooth" })
          }
          className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white shadow-xl rounded-full p-3 transition-all duration-200 hover:scale-110 active:scale-95 border border-gray-200 z-20 w-14 h-14 flex items-center justify-center text-gray-700 hover:text-black"
          aria-label="Scroll left"
        >
          <IoIosArrowBack className="w-6 h-6" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() =>
            containerRef.current?.scrollBy({ left: 320, behavior: "smooth" })
          }
          className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white shadow-xl rounded-full p-3 transition-all duration-200 hover:scale-110 active:scale-95 border border-gray-200 z-20 w-14 h-14 flex items-center justify-center text-gray-700 hover:text-black"
          aria-label="Scroll right"
        >
          <IoIosArrowForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
