import { SlLike } from "react-icons/sl";

export default function ProductCard({ src }) {
  return (
    <div className="flex flex-col justify-end items-end bg-gray-100 lg:w-full h-fit max-h-[600px] rounded-3xl hover:scale-110 hover:shadow-2xl hover:-rotate-1 transition-transform duration-300 ease-in-out group break-inside-avoid mb-6 contain-content cursor-pointer">
      <div className="bg-[#00564C] text-3xl font-semibold p-4 rounded-full group-hover:-rotate-12 transition-transform duration-300 ease-in-out absolute top-4 right-4">
        <SlLike className="group-hover:scale-125" />
      </div>

      <img
        src={`${src}.png`}
        alt="Product"
        className="w-full h-full object-cover rounded-3xl flex-1"
      />
    </div>
  );
}
