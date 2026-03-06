import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';

const ExploreJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [applicationData, setApplicationData] = useState({
    proposalMessage: '',
    proposedBudget: '',
    portfolioLink: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs?status=open');
      setJobs(response.data.jobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job) => {
    // Check if profile is completed and has intro video
    try {
      const response = await api.get('/onboarding/status');
      if (!response.data.profileCompleted) {
        toast.error('Please complete your profile before applying to jobs');
        setTimeout(() => {
          window.location.href = '/freelancer/onboarding';
        }, 2000);
        return;
      }
      
      // Check specifically for intro video
      const userResponse = await api.get('/auth/me');
      if (!userResponse.data.user.introVideoUrl) {
        toast.error('You must upload a professional introduction video before applying to jobs');
        setTimeout(() => {
          window.location.href = '/freelancer/onboarding';
        }, 2000);
        return;
      }
    } catch (error) {
      console.error('Failed to check profile status');
    }
    
    setSelectedJob(job);
    setShowModal(true);
    setShowJobDetails(false);
  };

  const handleLearnMore = async (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
    setShowModal(false);
    
    // Track job view
    try {
      await api.post(`/jobs/${job.id}/view`);
    } catch (error) {
      console.error('Failed to track job view:', error);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    
    if (!cvFile) {
      toast.error('Please upload your CV');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('jobId', selectedJob.id);
      formData.append('proposalMessage', applicationData.proposalMessage);
      formData.append('proposedBudget', applicationData.proposedBudget);
      formData.append('portfolioLink', applicationData.portfolioLink);
      formData.append('cv', cvFile);

      await api.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Application submitted successfully!');
      setShowModal(false);
      setCvFile(null);
      setApplicationData({ proposalMessage: '', proposedBudget: '', portfolioLink: '' });
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        {/* Simple header without user info */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">Explore Jobs</h1>
          </div>
        </div>
        
        <div className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Explore Jobs</h1>
              <p className="text-gray-600">Find your next opportunity</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {jobs.map(job => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Company Logo/Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {job.title?.charAt(0) || 'J'}
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                              {job.client?.fullName && (
                                <>
                                  <span>{job.client.fullName}</span>
                                  <span>•</span>
                                </>
                              )}
                              {job.workLocation && (
                                <>
                                  <span>{job.workLocation}</span>
                                  <span>•</span>
                                </>
                              )}
                              {job.status && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {job.status.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          {job.budgetRange && (
                            <div className="text-left md:text-right">
                              <p className="text-xl md:text-2xl font-bold text-green-600">
                                {job.budgetRange}
                              </p>
                              {job.projectType && (
                                <p className="text-sm text-gray-500">{job.projectType}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                        )}

                        {/* Tags */}
                        {job.requiredSkills && job.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.requiredSkills.length > 4 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                +{job.requiredSkills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleApply(job)}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                          >
                            Apply Now
                          </button>
                          <button 
                            onClick={() => handleLearnMore(job)}
                            className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                          >
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {jobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No jobs available at the moment</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for new opportunities</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {selectedJob.title}
                </h2>
                <p className="text-gray-600">
                  {selectedJob.client?.fullName || 'Client'} • {selectedJob.workLocation || 'Remote'}
                </p>
              </div>
              <button
                onClick={() => setShowJobDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Budget */}
              {selectedJob.budgetRange && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedJob.budgetRange}
                  </p>
                  {selectedJob.projectType && (
                    <p className="text-sm text-gray-500">{selectedJob.projectType}</p>
                  )}
                </div>
              )}

              {/* Description */}
              {selectedJob.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
              )}

              {/* Skills Required */}
              {selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4">
                {selectedJob.projectType && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Project Type</h4>
                    <p className="text-gray-900">{selectedJob.projectType}</p>
                  </div>
                )}
                {selectedJob.workLocation && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Work Location</h4>
                    <p className="text-gray-900">{selectedJob.workLocation}</p>
                  </div>
                )}
                {selectedJob.deadline && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Deadline</h4>
                    <p className="text-gray-900">{new Date(selectedJob.deadline).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedJob.createdAt && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Posted</h4>
                    <p className="text-gray-900">
                      {new Date(selectedJob.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowJobDetails(false);
                    handleApply(selectedJob);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition"
                >
                  Apply for this Job
                </button>
                <button
                  onClick={() => setShowJobDetails(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
              Apply for {selectedJob?.title}
            </h2>
            
            <form onSubmit={submitApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proposal Message *</label>
                <textarea
                  value={applicationData.proposalMessage}
                  onChange={(e) => setApplicationData({...applicationData, proposalMessage: e.target.value})}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Explain why you're the best fit for this project..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proposed Budget *</label>
                <input
                  type="text"
                  value={applicationData.proposedBudget}
                  onChange={(e) => setApplicationData({...applicationData, proposedBudget: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                  placeholder="e.g., $500 - $1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CV * (PDF, DOC, DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files[0])}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                {cvFile && (
                  <p className="mt-2 text-sm text-green-600">Selected: {cvFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Link (Optional)</label>
                <input
                  type="url"
                  value={applicationData.portfolioLink}
                  onChange={(e) => setApplicationData({...applicationData, portfolioLink: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                  placeholder="https://your-portfolio.com"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCvFile(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition text-sm md:text-base font-medium"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExploreJobs;
