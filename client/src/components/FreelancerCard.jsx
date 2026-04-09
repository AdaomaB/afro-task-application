import { FaStar } from "react-icons/fa";
import { BiDollar } from "react-icons/bi";

import { useNavigate } from "react-router-dom";

export default function Card({
  name,
  title,
  rating,
  reviews,
  hourlyRate,
  image,
  userId,
}) {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col items-center rounded-2xl lg:w-[160px] md:w-[140px] sm:w-[120px] w-[105px] h-auto space-y-2 hover:scale-95 transition-transform duration-300 cursor-pointer text-gray-800 p-4"
      onClick={() => navigate(`/profile/${userId}`)}
    >
      <div className="relative flex flex-col items-center gap-3 lg:h-[160px] md:h-[140px] md:w-[140px] sm:h-[120px] sm:w-[120px] h-[105px] w-[105px] lg:w-[160px] group">
        <div className="absolute top-0 bg-gray-200 h-full w-full rounded-2xl"></div>

        <div className="absolute top-2 bg-gray-300 h-full w-full rounded-2xl"></div>
        <img
          src={image || "/img/blog1.png"}
          alt={name || "Afro Task"}
          className="absolute top-4 h-full w-full rounded-2xl z-20 object-cover transition-transform duration-300 group-hover:-translate-y-2"
        />
      </div>

      <div className="flex flex-col items-center justify-between gap-2 p-1 translate-y-6 space-y-2 ">
        <p className="lg:text-sm text-xs font-medium md:h-8 w-full text-start text-gray-700">
        {title.toUpperCase() || "Skilled Professional"}
        </p>

        <div className="flex flex-col w-full justify-start items-start text-xs text-gray-600">
          <p className="flex flex-row items-center font-medium gap-4">
            <FaStar className="lg:text-sm text-xs" />
            {rating}({reviews})
          </p>
          <p className="flex flex-row font-medium items-center gap-4">
            <BiDollar className="lg:text-base font-black text-sm  " />
            {hourlyRate}/Hr
          </p>
        </div>
      </div>
    </div>
  );
}