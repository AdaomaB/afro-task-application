import { Link } from "react-router-dom";

export default function Navbar({ menuOpen }) {
  const navLinks = [
    { name: "AI Services", path: "/ai-services" },
    { name: "Technology", path: "/technology" },
    { name: "Programming", path: "/programming" },
    { name: "Graphics Design", path: "/graphics-design" },
    { name: "Video Editing", path: "/video-editing" },
    { name: "SEO", path: "/seo" },
    { name: "Branding & Sales", path: "/branding-sales" },
    { name: "Writing & Translation", path: "/writing-translation" },
    { name: "Business", path: "/business" },
  ];

  const navStyle =
    "self-start inline-block relative cursor-pointer hover:text-gray-300 py-3 md:py-0 border-b border-white/10 md:border-b-0 last:border-b-0 after:absolute after:left-0 after:bottom-1 md:after:-bottom-2 after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:ease-out after:origin-left";
  return (
    <nav
      className={`${
        menuOpen
          ? "absolute top-full left-0 right-0 bg-[#00564C]  z-50 flex flex-col"
          : "hidden"
      } md:flex md:flex-row md:relative md:bg-transparent md:border-t-0 md:z-auto flex-wrap justify-between gap-2 md:gap-4 text-xs md:text-sm font-medium m-2 md:mt-5 whitespace-nowrap`}
    >
      {navLinks.map((link, index) => (
        <Link key={index} to={link.path} className={navStyle}>
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
