import { IoStarSharp } from "react-icons/io5";
import { TbCurrencyNaira } from "react-icons/tb";

export default function FreelancerCard({ name, title, description, rating, reviews, hourlyRate, image }) {
  return (
    <div className="bg-[#E7E1E1] rounded-2xl w-[350px] h-[450px] p-5 py-8 m-10 space-y-6">
        <div className="flex flex-col items-center gap-3">
            <img src={image || "/img/tb.png"} 
              alt={name || "Afro Task"} 
              className="h-28 w-auto" />
            <h1 className="font-bold text-2xl">{name}</h1>
        </div>
        <div className="flex flex-col items-start gap-2">
            <p className="text-xl font-medium">{title}</p>
            <p className="text-lg ">{description}</p>
        </div>
        <div className="flex flex-row justify-between text-xl">
            <p className="flex flex-row gap-2 items-center font-medium">
                <IoStarSharp className="text-yellow-400 text-3xl"/>
                {rating}({reviews})
            </p>
            <p className="flex flex-row font-bold items-center"><TbCurrencyNaira className="text-3xl font-black" />{hourlyRate}/Hr</p>
        </div>
    </div>
  )
}
