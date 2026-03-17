import { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoStarSharp, IoClose } from 'react-icons/io5';
import { FaEye, FaGithub, FaLinkedin, FaGlobe, FaMapMarkerAlt, FaPlay } from 'react-icons/fa';
import { MdWork } from 'react-icons/md';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import api from '../services/api';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [freelancerDetails, setFreelancerDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const activeCategory = searchParams.get('category') || 'All';

  const fetchProjects = useCallback(async (category, paginate = false) => {
    if (!paginate) setLoading(true);
    try {
      const params = { limit: PAGE_SIZE };
      if (category && category !== 'All') params.category = category;
      if (paginate && lastDoc) params.startAfter = lastDoc;

      const res = await api.get('/profile/showcase-projects', { params });
      const { projects: docs, lastId, hasMore: more } = res.data;

      setLastDoc(lastId || null);
      setHasMore(more);
      if (paginate) {
        setProjects(prev => [...prev, ...docs]);
      } else {
        setProjects(docs);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [lastDoc]);

  useEffect(() => {
    setLastDoc(null);
    fetchProjects(activeCategory, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleCategoryChange = (cat) => {
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const openProjectModal = async (project) => {
    setSelectedProject(project);
    setModalLoading(true);
    try {
      const freelancerId = project.freelancerId || project.userId;
      if (freelancerId) {
        const res = await api.get(`/profile/public/${freelancerId}`);
        setFreelancerDetails(res.data.success ? { id: freelancerId, ...res.data.profile } : null);
      } else {
        setFreelancerDetails(null);
      }
    } catch (err) {
      console.error('Error fetching freelancer:', err);
      setFreelancerDetails(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedProject(null);
    setFreelancerDetails(null);
  };

  const handleContactFreelancer = () => {
    if (!user) {
      navigate('/welcome');
      return;
    }
    const freelancerId = selectedProject?.freelancerId || selectedProject?.userId;
    if (freelancerId) {
      navigate(`/${user.role}/messages?userId=${freelancerId}`);
    } else {
      navigate(`/${user.role}/messages`);
    }
    closeModal();
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return isNaN(d) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 0;
    return (
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <IoStarSharp key={i} className={i <= Math.round(r) ? 'text-yellow-400' : 'text-gray-300'} />
        ))}
        <span className="ml-1 text-sm text-gray-600">{r.toFixed(1)}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WhiteNavbar />

      {/* Page Header */}
      <div className="bg-[#00564C] text-white py-12 px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Explore Projects</h1>
        <p className="text-lg text-green-100 max-w-2xl mx-auto">
          Discover amazing work by talented African freelancers
        </p>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#00564C] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
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
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <MdWork className="text-6xl mb-4 text-gray-300" />
            <p className="text-xl font-medium">No projects found in this category.</p>
            <p className="text-sm mt-2">Try selecting a different category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => openProjectModal(project)}
                  formatDate={formatDate}
                  renderStars={renderStars}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => fetchProjects(activeCategory, true)}
                  className="bg-[#00564C] text-white px-8 py-3 rounded-full font-medium hover:bg-[#027568] transition"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            freelancer={freelancerDetails}
            loading={modalLoading}
            onClose={closeModal}
            onContact={handleContactFreelancer}
            formatDate={formatDate}
            renderStars={renderStars}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

// ─── Project Card ────────────────────────────────────────────────────────────
function ProjectCard({ project, onClick, formatDate, renderStars }) {
  const media = project.projectImage || project.mediaUrl || project.imageUrl || project.image || null;
  const isVideo = media && (media.includes('.mp4') || media.includes('.webm') || media.includes('video'));

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow cursor-pointer group"
    >
      {/* Media */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {media ? (
          isVideo ? (
            <div className="relative w-full h-full">
              <video src={media} className="w-full h-full object-cover" muted />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <FaPlay className="text-white text-3xl" />
              </div>
            </div>
          ) : (
            <img src={media} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00564C]/10 to-[#00564C]/30">
            <MdWork className="text-5xl text-[#00564C]/40" />
          </div>
        )}
        {project.category && (
          <span className="absolute top-3 left-3 bg-[#00564C] text-white text-xs px-2 py-1 rounded-full">
            {project.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base line-clamp-1 mb-1">
          {project.title || 'Untitled Project'}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {project.description || project.content || ''}
        </p>

        {/* Freelancer info */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={project.freelancerProfileImage || project.freelancerImage || project.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.freelancerName || project.userName || 'F')}&background=00564C&color=fff`}
            alt={project.freelancerName || project.userName}
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-sm text-gray-700 font-medium truncate">
            {project.freelancerName || project.userName || 'Freelancer'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {renderStars(project.freelancerRating || project.rating)}
            <span className="ml-1">({project.reviews || project.reviewCount || 0})</span>
          </div>
          <div className="flex items-center gap-1">
            <FaEye />
            <span>{project.views || 0}</span>
          </div>
        </div>

        {project.createdAt && (
          <p className="text-xs text-gray-400 mt-2">{formatDate(project.createdAt)}</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Project Modal ────────────────────────────────────────────────────────────
function ProjectModal({ project, freelancer, loading, onClose, onContact, formatDate, renderStars }) {
  const media = project.projectImage || project.mediaUrl || project.imageUrl || project.image || null;
  const isVideo = media && (media.includes('.mp4') || media.includes('.webm') || media.includes('video'));

  const fl = freelancer || {};
  const flName = fl.fullName || project.freelancerName || project.userName || 'Freelancer';
  const flImage = fl.profileImage || project.freelancerProfileImage || project.freelancerImage || project.userImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(flName)}&background=00564C&color=fff`;
  const flRating = fl.rating || project.freelancerRating || project.rating || 0;
  const flReviews = fl.reviewCount || project.reviews || project.reviewCount || 0;
  const flLocation = fl.country || fl.location || project.freelancerLocation || '';
  const flBio = fl.bio || fl.introduction || project.freelancerBio || '';
  const flSkills = fl.skills || project.skills || [];
  const flIntroVideo = fl.introVideo || fl.introductionVideo || null;
  const flGithub = fl.github || fl.githubUrl || null;
  const flLinkedin = fl.linkedin || fl.linkedinUrl || null;
  const flPortfolio = fl.portfolio || fl.portfolioUrl || fl.website || null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{project.title || 'Project Details'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <IoClose className="text-xl text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Media */}
          {media && (
            <div className="rounded-xl overflow-hidden bg-gray-100 max-h-72">
              {isVideo ? (
                <video src={media} controls className="w-full h-full object-cover max-h-72" />
              ) : (
                <img src={media} alt={project.title} className="w-full object-cover max-h-72" />
              )}
            </div>
          )}

          {/* Category & Date */}
          <div className="flex flex-wrap gap-2">
            {project.category && (
              <span className="bg-[#00564C]/10 text-[#00564C] text-sm px-3 py-1 rounded-full font-medium">
                {project.category}
              </span>
            )}
            {project.createdAt && (
              <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                {formatDate(project.createdAt)}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">About this project</h3>
            <p className="text-gray-600 leading-relaxed">
              {project.description || project.content || 'No description provided.'}
            </p>
          </div>

          {/* Technologies */}
          {project.technologies?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, i) => (
                  <span key={i} className="bg-[#00564C]/10 text-[#00564C] text-sm px-3 py-1 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Link */}
          {project.projectLink && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Project Link</h3>
              <a href={project.projectLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#00564C] hover:underline font-medium">
                <FaGlobe />
                {project.projectLink}
              </a>
            </div>
          )}

          {/* Freelancer Profile */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Freelancer</h3>

            {loading ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <img src={flImage} alt={flName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-lg">{flName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(flRating)}
                      <span className="text-sm text-gray-500">({flReviews} reviews)</span>
                    </div>
                    {flLocation && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <FaMapMarkerAlt className="text-[#00564C]" />
                        <span>{flLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {flBio && (
                  <p className="text-gray-600 text-sm leading-relaxed">{flBio}</p>
                )}

                {/* Intro Video */}
                {flIntroVideo && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Introduction Video</p>
                    <video src={flIntroVideo} controls className="w-full rounded-lg max-h-48" />
                  </div>
                )}

                {/* Skills */}
                {flSkills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {flSkills.map((skill, i) => (
                        <span key={i} className="bg-[#00564C]/10 text-[#00564C] text-xs px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio Links */}
                {(flGithub || flLinkedin || flPortfolio) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Portfolio Links</p>
                    <div className="flex gap-3">
                      {flGithub && (
                        <a href={flGithub} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#00564C] transition">
                          <FaGithub className="text-lg" /> GitHub
                        </a>
                      )}
                      {flLinkedin && (
                        <a href={flLinkedin} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#00564C] transition">
                          <FaLinkedin className="text-lg text-blue-600" /> LinkedIn
                        </a>
                      )}
                      {flPortfolio && (
                        <a href={flPortfolio} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#00564C] transition">
                          <FaGlobe className="text-lg text-green-600" /> Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contact Button */}
          <button
            onClick={onContact}
            className="w-full bg-[#00564C] hover:bg-[#027568] text-white font-semibold py-4 rounded-xl transition-all duration-200 hover:scale-[1.01] text-lg"
          >
            Contact Freelancer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
