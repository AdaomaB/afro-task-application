export default function BlogCard({
  title,
  description,
  author,
  date,
  link,
  onReadMore,
}) {
  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      
      {/* Image */}
      <div className="w-full aspect-[16/9] overflow-hidden">
        <img
          src={link || "/img/blog1.png"}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 md:p-6 gap-3 md:gap-4">
        
        {/* Title */}
        <h2 className="text-black text-lg md:text-xl font-semibold leading-tight line-clamp-2">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* Spacer pushes footer down */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs md:text-sm text-gray-500">
            {author} • {date}
          </p>

          <button
            onClick={onReadMore}
            className="bg-[#00564c] hover:bg-green-600 text-white px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 hover:scale-105"
          >
            Read More
          </button>
        </div>
      </div>
    </div>
  );
}