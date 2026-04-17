import ProductCard from "../ProductCard";
import { products } from "../../dummy.js"
 
export default function ProductSection() {
  const productCards = products.map(product => (
        <ProductCard
            key={product.id}
            src={product.id}
        />
    ))

  return (
    <div className="text-center px-2 h-full">
      <h1 className="text-3xl md:text-5xl font-semibold text-black">
        Made on <span className="text-[#00564C]">Afro Task</span>
      </h1>
      {/* <PostCard /> */}

      <div className="relative max-w-4/5 mx-auto p-4">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
          {productCards}
        </div>
        <div className="absolute lg:-bottom-10 md:-bottom-8 bottom-0 w-full left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent h-52 pointer-events-none z-10"></div>
      </div>
    </div>
  );
}
