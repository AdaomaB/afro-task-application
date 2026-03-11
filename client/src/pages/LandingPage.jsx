// Import React icons from react-icons library
import { useState } from "react";
import {
  FaSearch,
  FaPalette,
  FaBullhorn,
  FaMagic,
  FaRobot,
  FaLaptopCode,
  FaVideo,
  FaPenNib,
} from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";
import { FaToolbox } from "react-icons/fa6";
import { TfiWrite } from "react-icons/tfi";
import { LuShield } from "react-icons/lu";
import { GoPeople } from "react-icons/go";
import { CiStar } from "react-icons/ci";
import { IoIosArrowForward } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

// Import custom components
import ServiceCard from "../components/ServiceCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import FreelancerCard from "../components/FreelancerCard";
import PostCard from "../components/PostCard";

// Import JSON data for services and freelancers
import servicesData from "../data/services.json";
import freelancerData from "../data/freelancer.json";
import WhiteNavbar from "../components/WhiteNavbar";

// Icon mapping: Maps string values from JSON to actual React icon components
// This allows dynamic rendering of icons based on data stored in services.json
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

/**
 * LandingPage Component
 * Main entry point for the AfroTask platform
 */
export default function LandingPage() {
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  // Hook for navigation
  const navigate = useNavigate();

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to freelancer feed with search query as URL parameter
      navigate(`/freelancer/feed?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle category button click
  const handleCategoryClick = (category) => {
    navigate(`/freelancer/feed?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="min-h-screen bg-[#00564C] relative overflow-hidden text-white">
      
      <WhiteNavbar />

      {/* Category Navigation Bar - service categories */}
      <div className="text-white mx-4 md:mx-10 border-b-2 border-white/50 py-3 md:py-5 overflow-x-auto">
        <nav className="flex flex-wrap justify-between gap-2 md:gap-4 text-xs md:text-sm font-thin mt-2 md:mt-5 whitespace-nowrap">
          <Link to="/" className="cursor-pointer hover:text-gray-300">
            Ai Services
          </Link>
          <Link to="/" className="cursor-pointer hover:text-gray-300">Technology</Link>
          <Link to="/" className="cursor-pointer hover:text-gray-300">Programming</Link>
          <Link to="/" className="cursor-pointer hover:text-gray-300">Graphics Design</Link>
          <Link to="/" className="cursor-pointer hover:text-gray-300">Video Editing</Link>
          <Link to="/" className="cursor-pointer hover:text-gray-300">SEO</Link>
          <Link to="/" className="cursor-pointer hover:text-gray-300">Branding & Sales</Link>
          <Link to="/" className="cursor-pointer hover:text-gray-300">Writing & Translation</Link>
          <Link to="/" className="cursor-pointer hover:text-gray-300">Business</Link>
        </nav>
      </div>

      <div className="p-4 md:p-10 m-2 md:m-10 bg-[url('/img/Ld1.png')] rounded-2xl md:rounded-3xl min-h-[60vh] md:h-screen bg-cover bg-center flex flex-col justify-end">
        {/* Main headline text */}
        <div className="font-bold text-2xl md:text-4xl lg:text-5xl flex justify-center flex-col items-center text-center px-2">
          <p>Empowering Ideas, Connecting</p>
          <p>Talent , and Building the Future</p>
        </div>

        {/* Search bar with form handler */}
        <form onSubmit={handleSearch} className="relative flex justify-center items-center w-full md:w-2/3 mx-auto mt-4 px-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for freelancers, services..."
            className="w-full rounded-3xl bg-black/30 border-2 border-[#00564C] ml-0 md:ml-4 my-3 md:my-4 py-3 md:py-4 pl-4 md:pl-12 pr-24 md:pr-36 ring-0 focus:ring-0 focus:outline-none text-white placeholder-gray-300 hover:border-[#004D40] transition-colors duration-300 text-sm md:text-base"
          />
          <button 
            type="submit" 
            className="absolute right-1 md:right-0 bg-[#00564C] text-sm md:text-xl px-3 md:px-6 py-2 md:py-4 font-thin rounded-3xl flex flex-row gap-1 md:gap-2 hover:bg-[#027568] transition-colors duration-300"
          >
            <FaSearch className="text-lg md:text-2xl" /> <span className="hidden md:inline">Search</span>
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
      </div>

      {/* Popular Services Section */}
      <section className="w-full px-2 md:px-1 py-6 md:py-10 overflow-hidden">
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold flex justify-center items-center tracking-wider text-white mb-6 md:mb-10 text-center px-2">
          Popular Services
        </h1>
        <div className="flex justify-center items-center flex-wrap animate-marquee hover:[animation-play-state:paused] gap-4 md:gap-0">
          {servicesData.map((service, index) => {
            const IconComponent = iconMap[service.icon];
            return (
              <ServiceCard
                key={service.id}
                index={index}
                icon={IconComponent}
                title={service.title}
                description={service.description}
                color={service.color}
                link={service.link}
              />
            );
          })}
        </div>
      </section>

      <section className="bg-white flex justify-center items-center p-4 md:p-10 overflow-visible flex-col gap-y-8 md:gap-y-12">
        
        {/* Why Afro Task Section card*/}
        <div className="bg-gradient-to-br from-[#FB9E01] via-[#E68F07] to-[#C57810] w-full h-auto p-6 md:p-12 mx-2 md:mx-8 py-12 md:py-24 m-2 md:m-5 flex flex-col justify-center md:flex-row items-center rounded-2xl md:rounded-3xl gap-4 overflow-visible relative">
          <div className="w-full gap-6 md:gap-12 flex flex-col z-10 md:text-left md:justify-start md:items-start md:w-4/5">
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
          <div className="flex flex-col md:flex-col md:justify-between justify-center items-center gap-4 w-full md:w-2/5 relative z-0 mt-6 md:mt-0">
            <div className="w-full md:-mr-16">
              <img
                src="/img/whisk.png"
                alt="Whisk"
                className="rounded-2xl md:rounded-l-3xl w-full md:translate-x-14"
              />
            </div>
            <div className="self-center md:self-start md:ml-20 mt-4">
              <Link to="/">
                <button className="text-black bg-white flex flex-row justify-center items-center py-2 px-6 md:py-2 md:px-8 rounded-2xl md:rounded-3xl shadow-lg text-base md:text-xl font-semibold group">
                  Read More{" "}
                  <IoIosArrowForward className="font-semibold text-xl md:text-2xl transition-transform duration-300 group-hover:translate-x-2 group-hover:font-bold" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Freelancer cards section */}
        <div className="text-black">
          <div className="flex items-center justify-center flex-col gap-4 mb-6 md:mb-10 px-2">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold flex justify-center items-center tracking-wider mb-2 text-center">
              Hire a Freelancer
            </h1>
            <h2 className="text-lg md:text-2xl lg:text-3xl font-normal text-center">
              Find the right talent. Start your project. Watch your vision come
              alive.
            </h2>
          </div>

          {/* Freelancer cards container */}
          <div className="flex justify-center items-center flex-wrap md:flex-nowrap animate-marquee hover:[animation-play-state:paused] overflow-x-auto gap-4 md:gap-0 px-2">
            {freelancerData.map((freelancer) => {
              return (
                <FreelancerCard
                  key={freelancer.id}
                  name={freelancer.name}
                  title={freelancer.title}
                  description={freelancer.description}
                  rating={freelancer.rating}
                  reviews={freelancer.reviews}
                  hourlyRate={freelancer.hourlyRate}
                  image={freelancer.image}
                />
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FB9E01] via-[#E68F07] to-[#C57810] w-full h-auto p-6 md:p-12 mx-2 md:mx-8 pt-12 md:pt-24 m-4 md:m-10 flex flex-col justify-center items-center rounded-2xl md:rounded-3xl gap-4 md:gap-6 overflow-visible relative">
          <div className="gap-6 md:gap-12 flex flex-col z-10 w-full">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-semibold">
              Stuck at vibe coding?{" "}
            </h1>
            <p className="text-lg md:text-2xl lg:text-3xl">
              Get matched with the right expert to turn your prototype into a
              real, working product.{" "}
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between w-full items-end gap-4 relative z-0 mt-4">
            <Link to="/welcome">
              <button className="text-black bg-white flex flex-row justify-center items-center py-2 px-6 md:py-2 md:px-8 rounded-xl shadow-lg text-lg md:text-2xl font-semibold ring-2 ring-black cursor-pointer hover:bg-gray-200 w-full md:w-auto">
                Find an Expert
              </button>
            </Link>
            <img
              src="/img/board.png"
              alt="afro"
              className="w-full md:w-1/2 translate-y-0 md:translate-y-12"
            />
          </div>
        </div>

        {/* Made on Afro Task Section - Displays recent work/projects */}
        <div className="text-center px-2">
          <h1 className="text-3xl md:text-5xl font-semibold text-black">
            Made on <span className="text-[#00564C]">Afro Task</span>
          </h1>
          {/* <PostCard /> */}
        </div>
      </section>

      {/* Why Choose Afro Task Section - Features and CTA buttons */}
      <div className="flex flex-col items-center justify-center gap-6 md:gap-10 p-4 md:p-16">
        <h1 className="text-3xl md:text-5xl font-semibold text-center">Why Choose Afro Task </h1>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 w-full justify-center items-center">
          {/* Trust-First Verification Card */}
          <div className="bg-[#E7E1E1] rounded-2xl w-full md:w-[350px] h-auto md:h-[380px] p-6 md:p-10 m-2 md:m-10 space-y-4 md:space-y-6 flex items-center justify-center flex-col text-black">
            <div className="bg-[#F01010] p-4 md:p-5 rounded-full">
              <LuShield className="text-4xl md:text-6xl text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-center">Trust-First Verification</h1>
            <p className="text-base md:text-xl text-center">
              Every freelancer and client goes through our rigorous verification
              process
            </p>
          </div>

          {/* Quality Professionals Card */}
          <div className="bg-[#E7E1E1] rounded-2xl w-full md:w-[350px] h-auto md:h-[380px] p-6 md:p-10 m-2 md:m-10 space-y-4 md:space-y-6 flex items-center justify-center flex-col text-black">
            <div className="bg-[#1735F4] p-4 md:p-5 rounded-full">
              <GoPeople className="text-4xl md:text-6xl text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-center">Quality Professionals</h1>
            <p className="text-base md:text-xl text-center">
              Work with verified experts who have proven their skills and
              credibility
            </p>
          </div>

          {/* Guaranteed Quality Card */}
          <div className="bg-[#E7E1E1] rounded-2xl w-full md:w-[350px] h-auto md:h-[380px] p-6 md:p-10 m-2 md:m-10 space-y-4 md:space-y-6 flex items-center justify-center flex-col text-black">
            <div className="bg-[#F09603] p-4 md:p-5 rounded-full">
              <CiStar className="text-4xl md:text-6xl text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-center">Guaranteed Quality</h1>
            <p className="text-base md:text-xl text-center">
              Our verification system ensures high-quality work and reliable
              partnerships
            </p>
          </div>
        </div>
        
        {/* Call-to-Action Section */}
        <p className="text-3xl md:text-5xl font-semibold text-center">Ready to get started?</p>
        <p className="text-lg md:text-3xl text-center px-2">
          Join thousands of verified professionals and trusted clients on
          AfroTask
        </p>
        
        {/* Sign-up buttons for Client and Freelancer */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-10 items-center justify-center w-full px-4">
          <Link to="/signup/client">
            <button className="bg-white text-black text-lg md:text-2xl rounded-xl w-[200px] py-3 md:py-4 md:w-[300px] cursor-pointer hover:bg-gray-200 hover:ring-black hover:ring-2">
              Join as a Client
            </button>
          </Link>
          <Link to="/signup/freelancer">
            <button className="bg-white text-black text-lg md:text-2xl rounded-xl py-3 md:py-4 w-[200px] md:w-[300px] cursor-pointer hover:bg-gray-200 hover:ring-black hover:ring-2">
              Become a Freelancer
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
