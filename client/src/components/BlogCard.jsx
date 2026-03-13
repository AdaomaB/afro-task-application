import React from 'react'

export default function BlogCard({ title, description, author, date, link }) {
  return (
    <div className='flex flex-col lg:flex-row flex-shrink-0 items-start lg:items-center justify-center lg:h-[350px] rounded-2xl w-full text-white bg-white/10 backdrop-blur-sm shadow-2xl overflow-hidden'>
        <div className="w-full lg:w-1/3 h-48 lg:h-full">
            <img src={link || "/img/blog1.png"} alt="" className="w-full h-full object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none" />
        </div>
        <div className='w-full lg:w-2/3 p-6 lg:p-8 flex flex-col gap-4 h-full lg:gap-6'>
            <h1 className="text-xl md:text-2xl lg:text-4xl font-bold leading-tight">{title}</h1>
            <p className="text-base md:text-lg text-gray-100 leading-relaxed flex-1">{description}</p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <p className="text-sm text-gray-300">{author} · {date}</p>
              <button className="bg-green-500 hover:bg-green-600 transition-all duration-300 ease-in-out hover:scale-105 px-6 py-3 rounded-3xl text-lg font-medium whitespace-nowrap ml-auto sm:ml-0">
                Read More
              </button>
            </div>
        </div>
    </div>
  )
}
