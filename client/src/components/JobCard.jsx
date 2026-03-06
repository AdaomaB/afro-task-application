import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const JobCard = ({ job, onApply, showApplyButton = true, trackView = true }) => {
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    // Track job view when card is mounted - only once per user
    if (trackView && job.id && user?.uid && job.clientId !== user.uid) {
      const trackJobView = async () => {
        try {
          await api.post(`/jobs/${job.id}/view`);
        } catch (error) {
          console.error('Failed to track job view:', error);
        }
      };
      
      // Track after a short delay to ensure user is actually viewing
      const timer = setTimeout(trackJobView, 1000);
      return () => clearTimeout(timer);
    }
  }, [job.id, trackView, user?.uid, job.clientId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <img
            src={job.client?.profileImage || '/default-avatar.png'}
            alt={job.client?.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.client?.fullName}</p>
            {job.client?.companyName && (
              <span className="inline-block mt-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                {job.client.companyName}
              </span>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          job.status === 'open' ? 'bg-green-100 text-green-700' :
          job.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {job.status}
        </span>
      </div>

      <p className="mt-4 text-gray-700 line-clamp-3">{job.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.requiredSkills?.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs mb-1">Budget</p>
          <p className="font-semibold text-gray-800">
            {job.budgetRange && job.budgetRange !== '$0' ? job.budgetRange : 'Not specified'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Type</p>
          <p className="font-semibold text-gray-800">
            {job.projectType || 'Not specified'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Location</p>
          <p className="font-semibold text-gray-800">
            {job.workLocation || 'Not specified'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Deadline</p>
          <p className="font-semibold text-gray-800">
            {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Not specified'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{job.applicantsCount || 0} applicants</span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {job.views || 0} views
          </span>
        </div>
        {showApplyButton && job.status === 'open' && (
          <button
            onClick={() => onApply(job)}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition"
          >
            Apply Now
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default JobCard;
