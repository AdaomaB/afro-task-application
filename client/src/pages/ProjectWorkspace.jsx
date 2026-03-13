import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare, Calendar, DollarSign, Clock, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      if (response.data.success) {
        setProject(response.data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'finished') {
      // Show post modal when clicking finished
      setShowPostModal(true);
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/projects/${projectId}/status`, { taskStatus: newStatus });
      toast.success('Status updated!');
      fetchProject();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostAboutProject = async () => {
    if (!postContent.trim()) {
      toast.error('Please write something about the project');
      return;
    }

    setActionLoading(true);
    try {
      // Create post about completed project
      await api.post('/posts', {
        content: postContent,
        type: 'text'
      });

      // Update task status to finished and mark project as finished
      await api.put(`/projects/${projectId}/status`, { taskStatus: 'finished' });
      await api.post(`/projects/${projectId}/mark-finished`);
      
      toast.success('Project marked as finished! Client will be notified.');
      setShowPostModal(false);
      setPostContent('');
      fetchProject();
    } catch (error) {
      toast.error('Failed to complete action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCompletion = () => {
    setShowPostModal(true);
  };

  const handleClientPostReview = async () => {
    if (!postContent.trim()) {
      toast.error('Please write a review');
      return;
    }

    setActionLoading(true);
    try {
      // Create review post
      await api.post('/posts', {
        content: postContent,
        type: 'text'
      });

      // Approve project completion
      await api.post(`/projects/${projectId}/approve`);
      
      toast.success('Project completed! Thank you for your review.');
      setShowPostModal(false);
      setPostContent('');
      navigate(`/client/projects/completed`);
    } catch (error) {
      toast.error('Failed to complete action');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!project) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 text-green-600 hover:text-green-700"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    const statusConfig = {
      ongoing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Ongoing' },
      awaiting_confirmation: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Awaiting Confirmation' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' }
    };
    const config = statusConfig[project.status] || statusConfig.ongoing;
    return (
      <span className={`px-4 py-2 ${config.bg} ${config.text} text-sm font-semibold rounded-full`}>
        {config.label}
      </span>
    );
  };

  const taskStatus = project.taskStatus || 'not_started';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back to Projects
            </button>

            {/* Header with Purple Gradient */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 md:p-8 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src="/img/afro-task-logo.png"
                    alt="Afro Task"
                    className="w-12 h-12 bg-white rounded-full p-2"
                  />
                  <div>
                    <p className="text-white/80 text-sm">
                      {isFreelancer ? 'Client' : 'Freelancer'}
                    </p>
                    <h2 className="text-2xl font-bold text-white">
                      {isFreelancer ? project.client?.fullName : project.freelancer?.fullName}
                    </h2>
                  </div>
                </div>
                {getStatusBadge()}
              </div>

              {/* Task Status Buttons - REPLACES Chat/Profile/Call */}
              {isFreelancer && project.status === 'ongoing' && (
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleStatusChange('not_started')}
                    disabled={actionLoading}
                    className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                      taskStatus === 'not_started'
                        ? 'border-white bg-white/20 backdrop-blur-sm'
                        : 'border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20'
                    }`}
                  >
                    <XCircle className="w-8 h-8 text-white" />
                    <span className="text-white font-medium">Not Started</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={actionLoading}
                    className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                      taskStatus === 'in_progress'
                        ? 'border-white bg-white/20 backdrop-blur-sm'
                        : 'border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20'
                    }`}
                  >
                    <Clock className="w-8 h-8 text-white" />
                    <span className="text-white font-medium">In Progress</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange('finished')}
                    disabled={actionLoading}
                    className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                      taskStatus === 'finished'
                        ? 'border-white bg-white/20 backdrop-blur-sm'
                        : 'border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20'
                    }`}
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                    <span className="text-white font-medium">Finished</span>
                  </button>
                </div>
              )}

              {/* Client View - Show Chat Button */}
              {isClient && (
                <button
                  onClick={() => project.chatId && navigate(`/project-chat/${project.chatId}`)}
                  className="w-full p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition border-2 border-white/30 flex items-center justify-center gap-3"
                >
                  <MessageSquare className="w-6 h-6 text-white" />
                  <span className="text-white font-medium">Open Project Chat</span>
                </button>
              )}
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{project.job?.title}</h1>
              <p className="text-gray-600 mb-6">{project.job?.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Started</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(project.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold text-gray-900">${project.job?.budget}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="font-semibold text-gray-900">
                      {(project.deadline || project.job?.deadline) 
                        ? new Date(project.deadline || project.job.deadline).toLocaleDateString() 
                        : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Awaiting Confirmation Alert */}
            {isClient && project.status === 'awaiting_confirmation' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-yellow-800 font-medium mb-2">
                      Freelancer has finished the project!
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Please review the work and confirm completion below.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleConfirmCompletion}
                  disabled={actionLoading}
                  className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-6 h-6" />
                  Confirm Project Completion
                </button>
              </div>
            )}

            {/* Freelancer Awaiting Confirmation Status */}
            {isFreelancer && project.status === 'awaiting_confirmation' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      Waiting for client confirmation
                    </p>
                    <p className="text-blue-700 text-sm">
                      The client will review your work and confirm completion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Project Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{project.job?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {isFreelancer ? 'Share Your Success!' : 'Share Your Experience'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isFreelancer 
                ? 'Tell your network about this completed project:'
                : 'Share your experience working with this freelancer:'
              }
            </p>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={isFreelancer 
                ? "Just completed an amazing project! Here's what I built..."
                : "Had a great experience working with this freelancer..."
              }
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPostModal(false);
                  setPostContent('');
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={isFreelancer ? handlePostAboutProject : handleClientPostReview}
                disabled={actionLoading || !postContent.trim()}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {actionLoading ? 'Posting...' : 'Post & Complete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkspace;
