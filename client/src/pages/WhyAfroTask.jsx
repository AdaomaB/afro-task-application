import { IoSearch, IoClose } from 'react-icons/io5'
import { useState, useMemo } from 'react'
import Footer from '../components/Footer'
import WhiteNavbar from '../components/navbar/WhiteNavbar'
import WhyAfroTaskBoard from '../components/WhyAfroTaskBoard'
import BlogCard from '../components/BlogCard'
import blogs from '../data/blogs.json'

export default function WhyAfroTask() {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(3);

  const suggestions = ["Freelancing in Nigeria", "Afro task freelancer", "Nigerian freelancer"];

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return suggestions;
    return suggestions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);

  return (
    <div className='min-h-screen bg-[#00564C] relative text-black'>
      <WhiteNavbar />
        <WhyAfroTaskBoard />
        <div className='flex flex-col gap-4 justify-center items-center text-white my-8 px-4 sm:px-8'>
          <div className="w-full max-w-2xl">
            <div className="relative">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none" />
              <input 
                type='text' 
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full bg-white pl-12 pr-12 text-gray-900 rounded-2xl text-xl py-4 border-2 border-gray-300 focus:border-green-500 focus:outline-none shadow-lg' 
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <IoClose className="text-xl" />
                </button>
              )}
            </div>
          </div>

          {filteredSuggestions.length > 0 && (
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl">
              {filteredSuggestions.map((sug, index) => (
                <button
                  key={index}
                  onClick={() => setSearchTerm(sug)}
                  className='flex items-center py-4 px-6 text-lg text-gray-900 hover:bg-gray-50 focus:outline-none transition-colors border-l-4 border-transparent hover:border-green-500 w-full text-left'
                >
                  <IoSearch className="text-lg text-gray-400 mr-3 flex-shrink-0" />
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 sm:px-8 lg:px-12 py-12 lg:py-16 ">
           <div className="max-w-6xl mx-auto lg:space-y-16 space-y-6">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                title={blog.title}
                description={blog.description}
                author={blog.author}
                date={blog.date}
                link={blog.link}
              />
            ))}
           </div>
        </div>
      <Footer />
    </div>
  )
}
