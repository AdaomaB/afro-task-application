import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setMenuOpen(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "AI Services", category: "AI / Machine Learning" },
    { name: "Technology", category: "DevOps" },
    { name: "Programming", category: "Web Development" },
    { name: "Graphics Design", category: "Graphic Design" },
    { name: "Video Editing", category: "Video Editing" },
    { name: "SEO", category: "Digital Marketing" },
    { name: "Branding & Sales", category: "Digital Marketing" },
    { name: "Writing & Translation", category: "Writing" },
    { name: "Business", category: "Others" },
  ];

  const handleNavClick = (category) => {
    setMenuOpen(false);
    navigate(`/explore-projects?category=${encodeURIComponent(category)}`);
  };

  const navStyle =
    "self-start inline-block relative cursor-pointer hover:text-gray-300 py-3 md:py-0 border-b border-white/10 md:border-b-0 last:border-b-0 after:absolute after:left-0 after:bottom-1 md:after:-bottom-2 after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:ease-out after:origin-left";

  return (
      <div className="text-white md:mx-10 border-b-2 border-white/50 py-3 md:py-5 relative">
      {/* Services dropdown button for mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden flex items-center justify-between w-full mb-2 px-4 py-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Toggle menu"
      >
        <span className="text-sm font-medium">Services</span>

        <IoIosArrowDown
          className={`text-lg transition-transform duration-200 ${
            menuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <nav
        className={`${
          menuOpen
            ? "absolute top-full left-0 right-0 bg-[#00564C]  z-50 flex flex-col"
            : "hidden"
        } md:flex md:flex-row md:relative md:bg-transparent md:border-t-0 md:z-auto flex-wrap justify-between gap-2 md:gap-4 text-xs lg:text-sm font-medium m-1 whitespace-nowrap`}
      >
        {navLinks.map((link, index) => (
          <Link key={index} to={link.path} className={navStyle}>
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
