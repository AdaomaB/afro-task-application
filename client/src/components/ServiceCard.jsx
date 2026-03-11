import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";

const colorMap = {
  0: "bg-red-600",
  1: "bg-blue-600",
  2: "bg-yellow-500",
};

const getColorByIndex = (index) => {
  return colorMap[index % 3];
};

export default function ServiceCard({ icon: Icon, title, description, index = 0 }) {
  const bgColor = getColorByIndex(index);

  return (
    <div className="bg-white rounded-xl text-black p-6 m-4 w-[300px] h-[280px] flex flex-col justify-between">
      <div className="flex flex-row justify-start items-center gap-4">
        <p className={`${bgColor} p-4 text-4xl text-white rounded-2xl`}>
          {Icon ? <Icon /> : null}
        </p>
        <p className="text-2xl font-bold">{title}</p>
      </div>
      <p className="text-xl">{description}</p>
      <Link to="/welcome">
        <button className={`${bgColor} px-4 py-2 font-thin text-white rounded-2xl flex flex-row gap-2 items-center w-1/2 group`}>
          Explore <IoIosArrowForward className="font-bold transition-transform duration-300 group-hover:translate-x-2 group-hover:text-2xl" />
        </button>
      </Link>
    </div>
  );
}
