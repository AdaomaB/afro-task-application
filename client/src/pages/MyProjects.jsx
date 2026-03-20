import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const MyProjects = () => {
  const { logout, user } = useContext(AuthContext);
  const { status } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  useEffect(() => {
    fetchProjects();
  }, [status]);

  const fetchProjects = async () => {
    try {
      const response = await api.get(`/projects?status=${status}`);
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (projectStatus) => {
    if (projectStatus === 'awaiting_confirmation') {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          Awaiting Confirmation
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user?.role} onLogout={logout} />
      
      <div className="flex-1 lg:ml-64 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-2xl text-center lg:text-start font-bold text-gray-800 mb-8">
            {status === 'ongoing' ? 'Ongoing' : 'Completed'} Projects
          </h1>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(project => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{project.job?.title}</h3>
                    {getStatusBadge(project.status)}
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-2">{project.job?.description}</p>
                  
                  <div className="mt-4 flex items-center gap-3">
                    <img
                      src={isFreelancer ? project.client?.profileImage : project.freelancer?.profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        {isFreelancer ? project.client?.fullName : project.freelancer?.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isFreelancer ? project.client?.companyName : project.freelancer?.skillCategory}
                      </p>
                    </div>
                  </div>

                  {project.status === 'awaiting_confirmation' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        {isFreelancer 
                          ? '⏳ Waiting for client to approve completion'
                          : '✅ Freelancer marked this as finished. Please review and approve or request revision.'
                        }
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                    <p>Started: {new Date(project.startedAt).toLocaleDateString()}</p>
                    {project.completedAt && (
                      <p>Completed: {new Date(project.completedAt).toLocaleDateString()}</p>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/project/${project.id}`)}
                    className={`mt-4 w-full px-4 py-2 ${
                      isFreelancer ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-white rounded-lg transition font-medium`}
                  >
                    Open Workspace
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {projects.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No {status} projects</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyProjects;
