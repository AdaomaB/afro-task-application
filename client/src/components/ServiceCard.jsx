import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const colorMap = {
  0: "bg-red-600",
  1: "bg-blue-600",
  2: "bg-yellow-500",
};

const getColorByIndex = (index) => {
  return colorMap[index % 3];
};

export default function ServiceCard({ icon: Icon, title, description, link, index = 0, user = null }) {
  const bgColor = getColorByIndex(index);
  const navigate = useNavigate(); // <-- get navigate function

  const handleClick = () => {
    navigate(`/explore-projects?category=${encodeURIComponent(title)}`);
  };

  return (
    <div className="bg-white rounded-xl text-black p-6 lg:w-[300px] w-[200px] lg:h-[280px] h-[210px] flex flex-col justify-between flex-shrink-0 m-4 transition-transform duration-300 ease-in-out hover:scale-105">
      <div className="flex flex-row justify-start items-center gap-4 w-full">
        <div className={`${bgColor} p-4 lg:text-4xl text-xl text-white rounded-2xl flex items-center justify-center`}>
          {Icon ? <Icon /> : null}
        </div>
        <p className="lg:text-2xl text-sm font-bold">{title}</p>
      </div>
      <p className="lg:text-xl text-xs line-clamp-2">{description}</p>

      <button
        onClick={handleClick}
        className={`${bgColor} px-4 py-2 font-thin text-white rounded-2xl flex flex-row gap-2 items-center lg:w-1/2 group transition-transform duration-300 ease-in-out hover:scale-105`}
      >
        Explore
        <IoIosArrowForward className="font-bold transition-transform duration-300 group-hover:translate-x-2 group-hover:text-2xl" />
      </button>
    </div>
  );
}