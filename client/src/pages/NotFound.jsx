import { ArrowBigDown, ArrowLeftCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full mx-auto text-center">
        {/* Logo */}
        <img 
          src="/img/afro-task-logo.png" 
          alt="AfroTask Logo" 
          className="mx-auto h-24 w-auto mb-8"
        />
        
        {/* 404 */}
        <div className="mb-8">
          <h1 className="text-7xl font-bold text-gray-800 mb-4">
            404
          </h1>
          <p className="text-2xl font-semibold text-gray-700 mb-2">
            Oops! Page Not Found
          </p>
          <p className="text-lg text-gray-600">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
        </div>
        
        {/* Button */}
        <Link
          to="/"
          className="inline-flex items-center px-8 py-4 bg-[#00564C] text-white font-semibold text-lg rounded-full hover:bg-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg gap-2 group"
        >
          <ArrowLeftCircle className="group-hover:-translate-x-1" /> Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;