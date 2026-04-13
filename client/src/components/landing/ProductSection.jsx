import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase.js";
import { Eye, Star } from "lucide-react";

export default function ProductSection() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "freelancer_projects"), orderBy("createdAt", "desc"), limit(8))
        );
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        try {
          const snap = await getDocs(query(collection(db, "freelancer_projects"), limit(8)));
          setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (_) {}
      }
    };
    fetchProjects();
  }, []);

  if (projects.length === 0) return null;

  return (
    <div className="text-center px-2 w-full">
      <h1 className="text-3xl md:text-5xl font-semibold text-black mb-2">
        Made on <span className="text-[#00564C]">Afro Task</span>
      </h1>
      <p className="text-gray-500 mb-8">Real work by real African freelancers</p>

      <div className="relative max-w-5xl mx-auto p-4">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate("/explore-projects")}
              className="break-inside-avoid mb-4 rounded-xl overflow-hidden shadow hover:shadow-lg transition cursor-pointer group"
            >
              {project.projectImage ? (
                <img
                  src={project.projectImage}
                  alt={project.projectTitle}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-[#00564C]/10 to-[#00564C]/30 flex items-center justify-center">
                  <span className="text-4xl">💼</span>
                </div>
              )}
              <div className="bg-white p-3 text-left">
                <p className="font-semibold text-gray-900 text-sm line-clamp-1">{project.projectTitle}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#00564C] font-medium">{project.category}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye className="w-3 h-3" />{project.views || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute -bottom-2 w-full left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent h-40 pointer-events-none z-10" />
      </div>

      <button
        onClick={() => navigate("/explore-projects")}
        className="mt-8 px-8 py-3 bg-[#00564C] text-white rounded-xl hover:bg-[#027568] transition font-medium"
      >
        Explore All Projects
      </button>
    </div>
  );
}
