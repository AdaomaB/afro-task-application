import { useState, useEffect, useCallback } from "react";
import FreelancerCard from "../FreelancerCard";
import api from "../../services/api";

export default function FreelancerHireSection() {
  const [allFreelancers, setAllFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const CATEGORIES = [
    'All',
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Video Editing',
  'Digital Marketing',
  'Writing',
  'Data Science',
  'AI / Machine Learning',
  'Cybersecurity',
  'DevOps',
  'Game Development',
  'Others',
  ];

  const fetchFreelancers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/ranking/top-freelancers?limit=12");
      setAllFreelancers(response.data.freelancers || []);
      setFilteredFreelancers(response.data.freelancers || []);
    } catch (error) {
      console.error("Error fetching top freelancers:", error);
      setAllFreelancers([]);
      setFilteredFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setFilteredFreelancers(allFreelancers);
    } else if (category === "Others") {
      // For "Others", show freelancers that don't match any of the specific categories
      const specificCategories = CATEGORIES.filter(cat => cat !== "All" && cat !== "Others");
      const filtered = allFreelancers.filter((freelancer) => {
        const skillCategory = freelancer.skillCategory?.toLowerCase() || '';
        const professionalTitle = freelancer.professionalTitle?.toLowerCase() || '';
        const skills = freelancer.skills || [];
        
        // Check if this freelancer has any data that could match categories
        const hasCategoryData = skillCategory || professionalTitle || skills.length > 0;
        
        if (!hasCategoryData) {
          // If freelancer has no category data, include in "Others"
          return true;
        }
        
        // Check if this freelancer matches ANY of the specific categories
        const matchesAnySpecificCategory = specificCategories.some(specificCat => {
          const matchesCategory = skillCategory === specificCat.toLowerCase();
          const matchesTitle = professionalTitle.includes(specificCat.toLowerCase());
          const matchesSkills = skills.some(skill => 
            skill.toLowerCase().includes(specificCat.toLowerCase())
          );
          return matchesCategory || matchesTitle || matchesSkills;
        });
        
        // Include in "Others" if it doesn't match any specific category
        return !matchesAnySpecificCategory;
      });
      console.log(`Filtered ${filtered.length} freelancers for "Others" category`);
      setFilteredFreelancers(filtered);
    } else {
      const filtered = allFreelancers.filter((freelancer) => {
        const skillCategory = freelancer.skillCategory?.toLowerCase() || '';
        const professionalTitle = freelancer.professionalTitle?.toLowerCase() || '';
        const skills = freelancer.skills || [];
        
        // Check if category matches skill category, title, or any skill
        const matchesCategory = skillCategory === category.toLowerCase();
        const matchesTitle = professionalTitle.includes(category.toLowerCase());
        const matchesSkills = skills.some(skill => 
          skill.toLowerCase().includes(category.toLowerCase())
        );
        
        const matches = matchesCategory || matchesTitle || matchesSkills;
        
        // Debug logging
        if (matches) {
          console.log(`Freelancer ${freelancer.fullName} matches ${category}:`, {
            skillCategory: freelancer.skillCategory,
            professionalTitle: freelancer.professionalTitle,
            skills: freelancer.skills,
            matchesCategory,
            matchesTitle,
            matchesSkills
          });
        }
        
        return matches;
      });
      console.log(`Filtered ${filtered.length} freelancers for category: ${category}`);
      setFilteredFreelancers(filtered);
    }
  };

  return (
    <div className="text-black">
      <div className="flex items-center justify-center flex-col gap-4 mb-6 md:mb-10 px-2">
        <h1 className="text-xl md:text-xl lg:text-3xl font-semibold tracking-wider text-center">
          Hire a Freelancer
        </h1>

        <h2 className="flex flex-col md:flex-row text-sm lg:text-xl font-thin text-center">
          <span className="md:ml-2">Find the right talent.</span>
          <span className="md:ml-2">Start your project.</span>
          <span className="md:ml-2">Watch your vision come alive.</span>
        </h2>
      </div>

      <div className=" w-full px-6">
      {/* Category Filter Buttons */}
      <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth -webkit-overflow-scrolling-touch w-full max-w-5xl mx-auto px-4 py-2 gap-x-2 mb-8 md:!grid md:!grid-cols-7 md:gap-4 md:overflow-visible md:max-w-none lg:px-12 md:p-0">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryFilter(category)}
            className={`min-w-[80px] px-2 py-2 lg:px-3 text-[10px] lg:text-xs xl:text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 rounded-lg ${
              activeCategory === category
                ? "bg-[#00564c] text-white shadow-lg shadow-blue-500/25"
                : "bg-white/80 backdrop-blur-sm h-12 hover:bg-white border border-gray-300 hover:shadow-md text-gray-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Freelancer cards container */}
        <div className="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 xl:justify-start justify-center lg:gap-6 gap-4 px-6 mx-auto max-w-7xl">
          {loading ? (
            Array(12)
              .fill()
              .map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="w-full aspect-[3/4] bg-gray-200 animate-pulse rounded-xl shadow-lg"
                ></div>
              ))
          ) : filteredFreelancers.length === 0 ? (
            <div className="col-span-full text-gray-500 flex justify-center items-center h-96 text-center">
              <div>
                <p className="text-lg font-medium mb-2">No freelancers found for this category</p>
                <p className="text-sm">Try selecting a different category or check back later</p>
              </div>
            </div>
          ) : (
            filteredFreelancers.map((freelancer) => (
              <div
                key={freelancer.uid || freelancer.id}
                className="w-full"
              >
                <FreelancerCard
                  userId={freelancer.uid || freelancer.id}
                  name={freelancer.fullName || "Unknown"}
                  title={
                    freelancer.professionalTitle ||
                    freelancer.skillCategory ||
                    "Skilled Professional"
                  }
                  rating={freelancer.averageRating || 0}
                  reviews={freelancer.totalReviews || 0}
                  hourlyRate={freelancer.hourlyRate || "Negotiable"}
                  image={
                    freelancer.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.fullName || "User")}`
                  }
                  className="w-full max-w-[200px] mx-auto"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
