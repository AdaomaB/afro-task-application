import { IoStarSharp } from "react-icons/io5";
import { FiDollarSign } from "react-icons/fi";

import { useNavigate } from "react-router-dom";

export default function FreelancerCard({
  name,
  title,
  description,
  rating,
  reviews,
  hourlyRate,
  image,
  userId,
}) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-[#E7E1E1] flex flex-col items-center justify-between rounded-2xl lg:w-[350px] lg:h-[450px] h-[250px] w-[200px] p-5 lg:py-8 py-3 lg:space-y-6 space-y-2 hover:scale-95 transition-transform duration-300 cursor-pointer"
      onClick={() => navigate(`/profile/${userId}`)}
    >
      <div className="flex flex-col items-center gap-3">
        <img
          src={image || "/img/tb.png"}
          alt={name || "Afro Task"}
          className="lg:h-28 h-10 lg:w-28 w-10 rounded-full"
        />
        <h1 className="font-bold lg:text-2xl text-sm">{name}</h1>
      </div>
      <div className="flex flex-col items-start gap-2">
        <p className="lg:text-xl text-sm font-medium">{title}</p>
        <p className="lg:text-xl text-xs font-medium">
        {description?.length > 100
          ? description.slice(0, 100) + " ..."
          : description}
        </p>
      </div>
      <div className="flex flex-row w-full justify-between items-center lg:text-xl text-xs">
        <p className="flex flex-row items-center font-medium">
          <IoStarSharp className="text-yellow-400 lg:text-3xl text-sm" />
          {rating}({reviews})
        </p>
        <p className="flex flex-row font-bold items-center">
          <FiDollarSign className="lg:text-2xl font-black text-sm " />
          {hourlyRate}/Hr
        </p>
      </div>
    </div>
  );
}
