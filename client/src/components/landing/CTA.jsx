import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 md:gap-10 p-4 md:p-16">
      <p className="text-3xl md:text-5xl font-semibold text-center">
        Ready to get started?
      </p>
      <p className="text-lg md:text-3xl text-center px-2">
        Join thousands of verified professionals and trusted clients on
        AfroTask
      </p>

      {/* Sign-up buttons for Client and Freelancer */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-10 items-center justify-center w-full px-4">
        <Link to="/signup/client">
          <button className="bg-white duration-300 ease-in-out hover:scale-105 text-black text-lg md:text-2xl rounded-xl w-[200px] py-3 md:py-4 md:w-[300px] cursor-pointer hover:bg-gray-200 hover:ring-black hover:ring-2">
            Join as a Client
          </button>
        </Link>
        <Link to="/signup/freelancer">
          <button className="bg-white duration-300 ease-in-out hover:scale-105 text-black text-lg md:text-2xl rounded-xl py-3 md:py-4 w-[200px] md:w-[300px] cursor-pointer hover:bg-gray-200 hover:ring-black hover:ring-2">
            Become a Freelancer
          </button>
        </Link>
      </div>
    </div>
  );
}
