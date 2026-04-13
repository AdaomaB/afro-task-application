import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Eye, MessageCircle, MapPin, ExternalLink, X, ChevronDown } from 'lucide-react';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Video Editing',
  'Digital Marketing',
  'Writing',
  'Data Science',
  'AI / Machine Learning',
  'Cybersecurity',
  'DevOps',
  'Game Development',
  'Others',
];

const PAGE_SIZE = 12;

export default function ExploreProjects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);

  // Read category from URL param on mount
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      const match = CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase());
      setSelectedCategory(match || 'All');
    }
  }, []);

  useEffect(() => {
    fetchProjects(true);
  }, [selectedCategory]);

  const buildQuery = (afterDoc = null) => {
    const col = collection(db, 'freelancer_projects');
    const constraints = [];

    if (selectedCategory !== 'All') {
      constraints.push(where('category', '==', selectedCategory));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(PAGE_SIZE));

    if (afterDoc) constraints.push(startAfter(afterDoc));

    return query(col, ...constraints);
  };

  const fetchProjects = async (reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      if (reset) setLastDoc(null);

      const q = buildQuery(reset ? null : lastDoc);
      const snap = await getDocs(q);
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setProjects(reset ? items : prev => [...prev, ...items]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching projects:', err);
      // Fallback: simpler query without composite index
      try {
        const col = collection(db, 'freelancer_projects');
        const fallbackQ = selectedCategory !== 'All'
          ? query(col, where('category', '==', selectedCategory), limit(PAGE_SIZE))
          : query(col, limit(PAGE_SIZE));
        const snap = await getDocs(fallbackQ);
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(reset ? items : prev => [...prev, ...items]);
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length === PAGE_SIZE);
      } catch (fallbackErr) {
        console.error('Fallback query failed:', fallbackErr);
        toast.error('Failed to load projects');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleContactFreelancer = async (freelancerId) => {
    if (!user) {
      navigate('/welcome');
      return;
    }
    setContactLoading(true);
    try {
      const res = await api.post('/chats/create', { otherUserId: freelancerId });
      const chatId = res.data.chatId;
      const messagesPath = user.role === 'client' ? '/client/messages' : '/freelancer/messages';
      navigate(`${messagesPath}?chatId=${chatId}`);
    } catch (err) {
      console.error('Error creating chat:', err);
      toast.error('Failed to open chat');
    } finally {
      setContactLoading(false);
    }
  };

  const renderStars = (rating = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WhiteNavbar />

      {/* Header */}
      <div className="bg-[#00564C] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Explore Projects</h1>
          <p className="text-green-200 text-lg">Discover work by top African freelancers</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#00564C] text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No projects found{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.
            </h3>
            <p className="text-gray-500">Try selecting a different category or check back later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map(project => (
                <motion.div key={project.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all cursor-pointer group">
                  {/* Project Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {project.projectImage ? (
                      <img src={project.projectImage} alt={project.projectTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00564C]/10 to-[#00564C]/30">
                        <span className="text-5xl">💼</span>
                      </div>
                    )}
                    {project.category && (
                      <span className="absolute top-3 left-3 bg-[#00564C] text-white text-xs px-2 py-1 rounded-full">
                        {project.category}
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{project.projectTitle || 'Untitled Project'}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{project.projectDescription || ''}</p>

                    {/* Freelancer Info */}
                    <div className="flex items-center gap-2 mb-2">
                      {project.freelancerProfileImage ? (
                        <img src={project.freelancerProfileImage} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#00564C] flex items-center justify-center text-white text-xs font-bold">
                          {(project.freelancerName || 'F')[0]}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 line-clamp-1">{project.freelancerName || 'Freelancer'}</span>
                    </div>

                    {/* Rating & Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {renderStars(project.freelancerRating)}
                        <span className="text-xs text-gray-500 ml-1">({project.reviewCount || 0})</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Eye className="w-3 h-3" />
                        <span>{project.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-10">
                <button onClick={() => fetchProjects(false)} disabled={loadingMore}
                  className="bg-[#00564C] text-white px-8 py-3 rounded-full hover:bg-[#027568] transition flex items-center gap-2 mx-auto disabled:opacity-60">
                  {loadingMore ? 'Loading...' : <><ChevronDown className="w-4 h-4" /> Load More</>}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

              {/* Modal Image */}
              <div className="relative">
                {selectedProject.projectImage ? (
                  <img src={selectedProject.projectImage} alt={selectedProject.projectTitle}
                    className="w-full h-56 object-cover rounded-t-2xl" />
                ) : (
                  <div className="w-full h-56 bg-gradient-to-br from-[#00564C] to-[#027568] rounded-t-2xl flex items-center justify-center">
                    <span className="text-7xl">💼</span>
                  </div>
                )}
                <button onClick={() => setSelectedProject(null)}
                  className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 hover:bg-white transition">
                  <X className="w-5 h-5" />
                </button>
                {selectedProject.category && (
                  <span className="absolute bottom-3 left-3 bg-[#00564C] text-white text-xs px-3 py-1 rounded-full">
                    {selectedProject.category}
                  </span>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.projectTitle || 'Untitled Project'}</h2>
                <p className="text-gray-600 mb-5 leading-relaxed">{selectedProject.projectDescription || 'No description provided.'}</p>

                {/* Technologies */}
                {selectedProject.technologies?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Technologies Used</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((t, i) => (
                        <span key={i} className="bg-[#00564C]/10 text-[#00564C] text-xs px-3 py-1 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Link */}
                {selectedProject.projectLink && (
                  <div className="mb-5">
                    <a href={selectedProject.projectLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#00564C] hover:text-[#027568] font-medium text-sm transition">
                      <ExternalLink className="w-4 h-4" />View Project / Live Demo
                    </a>
                  </div>
                )}

                {/* Freelancer Profile */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    {selectedProject.freelancerProfileImage ? (
                      <img src={selectedProject.freelancerProfileImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#00564C] flex items-center justify-center text-white font-bold text-lg">
                        {(selectedProject.freelancerName || 'F')[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{selectedProject.freelancerName || 'Freelancer'}</p>
                      {selectedProject.freelancerLocation && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <MapPin className="w-3 h-3" /><span>{selectedProject.freelancerLocation}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      {renderStars(selectedProject.freelancerRating)}
                      <span className="text-sm text-gray-500 ml-1">({selectedProject.reviewCount || 0})</span>
                    </div>
                  </div>

                  {selectedProject.freelancerBio && (
                    <p className="text-gray-600 text-sm mb-3">{selectedProject.freelancerBio}</p>
                  )}

                  {selectedProject.freelancerSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.freelancerSkills.map((skill, i) => (
                        <span key={i} className="bg-[#00564C]/10 text-[#00564C] text-xs px-2 py-1 rounded-full">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1"><Eye className="w-4 h-4" />{selectedProject.views || 0} views</div>
                  <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{selectedProject.reviewCount || 0} reviews</div>
                  {selectedProject.completionDate && (
                    <div className="flex items-center gap-1">
                      Completed: {new Date(selectedProject.completionDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Contact Button */}
                <button onClick={() => handleContactFreelancer(selectedProject.freelancerId)}
                  disabled={contactLoading || user?.id === selectedProject.freelancerId}
                  className="w-full bg-[#00564C] text-white py-3 rounded-xl font-semibold hover:bg-[#027568] transition disabled:opacity-60">
                  {contactLoading ? 'Opening chat...'
                    : user?.id === selectedProject.freelancerId ? 'This is your project'
                    : 'Contact Freelancer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
