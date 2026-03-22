import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RecommendedFreelancers = ({ jobId, limit = 5 }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (jobId) {
      fetchRecommendedFreelancers();
    }
  }, [jobId]);

  const fetchRecommendedFreelancers = async () => {
    try {
      const response = await api.get(`/ranking/recommended-freelancers/${jobId}?limit=${limit}`);
      setFreelancers(response.data.freelancers || []);
    } catch (error) {
      console.error('Error fetching recommended freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (freelancers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-bold text-gray-900">🎯 Recommended Freelancers</h3>
        <p className="text-sm text-gray-600 mt-1">Top matches for this job</p>
      </div>
      
      <div className="divide-y">
        {freelancers.map((freelancer) => (
          <div 
            key={freelancer.id} 
            className="p-6 hover:bg-gray-50 transition cursor-pointer"
            onClick={() => navigate(`/profile/${freelancer.id}`)}
          >
            <div className="flex items-start gap-4">
              <img
                src={freelancer.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.fullName || 'User')}&background=random`}
                alt={freelancer.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {freelancer.fullName}
                      {freelancer.matchPercentage > 0 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          🔥 {freelancer.matchPercentage}% Match
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">{freelancer.professionalTitle || 'Freelancer'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    ⭐ {freelancer.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <span>📍 {freelancer.country || 'N/A'}</span>
                  <span>✅ {freelancer.completedProjects || 0} jobs</span>
                </div>

                {freelancer.skills && freelancer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {freelancer.skills.length > 4 && (
                      <span className="px-2 py-1 text-gray-500 text-xs">
                        +{freelancer.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedFreelancers;
