import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

export default function HeroSection() {
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Hook for navigation
  const navigate = useNavigate();
  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to freelancer feed with search query as URL parameter
      navigate(
        `/freelancer/feed?search=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };

  // Handle category button click
  const handleCategoryClick = (category) => {
    navigate(`/explore-projects?category=${encodeURIComponent(category)}`);
  };

  return (
    <div>
      <div className="p-4 md:p-10 m-2 md:m-10 bg-[url('/img/Ld1.png')] rounded-2xl lg:h-screen md:rounded-3xl min-h-[60vh] bg-cover bg-center flex flex-col justify-end">
        {/* Main headline text */}
        <div className="font-bold text-2xl md:text-4xl lg:text-5xl flex justify-center flex-col items-center text-center px-2">
          <p>Empowering Ideas, Connecting</p>
          <p>Talent , and Building the Future</p>
        </div>

        {/* Search bar with form handler */}
        <form
          onSubmit={handleSearch}
          className="relative flex justify-center items-center w-full md:w-2/3 mx-auto mt-4 px-2"
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

        {/* Quick category filter buttons */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-10 text-sm md:text-xl font-thin mt-3 md:mt-5 px-2">
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
      </div>{" "}
    </div>
  );
}
