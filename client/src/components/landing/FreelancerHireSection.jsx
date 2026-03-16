import FreelancerCard from "../FreelancerCard";
import freelancerData from "../../data/freelancer.json";

export default function FreelancerHireSection() {

  // repeat the data 3 times for the infinite marquee effect
  const loopFreelancers = Array(3)
    .fill(freelancerData)
    .flat();

  return (
    <div className="text-black">
      <div className="flex items-center justify-center flex-col gap-4 mb-6 md:mb-10 px-2">
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold tracking-wider text-center">
          Hire a Freelancer
        </h1>

        <h2 className="flex flex-col md:flex-row text-lg md:text-2xl lg:text-3xl font-normal text-center">
          Find the right talent.
          <span className="md:ml-2">Start your project.</span>
          <span className="md:ml-2">Watch your vision come alive.</span>
        </h2>
      </div>

      {/* Freelancer cards container */}
      <div className="flex justify-center items-center flex-nowrap overflow-x-auto cursor-grab active:cursor-grabbing select-none lg:gap-4 gap-3 px-2 pb-4 animate-marquee no-scrollbar">

        {loopFreelancers.map((freelancer, index) => (
          <FreelancerCard
            key={`${freelancer.id}-${index}`}
            name={freelancer.name}
            title={freelancer.title}
            description={freelancer.description}
            rating={freelancer.rating}
            reviews={freelancer.reviews}
            hourlyRate={freelancer.hourlyRate}
            image={freelancer.image}
          />
        ))}

      </div>
    </div>
  );
}