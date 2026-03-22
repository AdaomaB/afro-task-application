import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RecommendedJobs = ({ limit = 10 }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchRecommendedJobs();
    }
  }, [currentUser, limit]);

  const fetchRecommendedJobs = async () => {
    try {
      const response = await api.get(`/ranking/recommended-jobs?limit=${limit}`);
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchPercentage = (jobSkills, userSkills) => {
    if (!jobSkills || !userSkills || jobSkills.length === 0) return 0;
    const matches = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    return Math.round((matches.length / jobSkills.length) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">🔥 Jobs You Might Like</h2>
        <p className="text-sm text-gray-600 mt-1">Based on your skills and experience</p>
      </div>
      
      <div className="divide-y">
        {jobs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No recommended jobs found. Complete your profile to get better matches!
          </div>
        ) : (
          jobs.map((job) => (
            <div 
              key={job.id} 
              className="p-6 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Match Badge */}
                  {job.matchPercentage > 0 && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mb-2">
                      🔥 {job.matchPercentage}% Match
                    </div>
                  )}

                  {/* Job Title */}
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {job.title}
                  </h3>

                  {/* Job Details */}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      💰 ${job.budget}
                    </span>
                    <span className="flex items-center gap-1">
                      📅 {job.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      📍 {job.location || 'Remote'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Required Skills */}
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skillsRequired.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Posted Time */}
                  <p className="text-xs text-gray-500 mt-3">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Apply Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/jobs/${job.id}`);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap"
                >
                  View Job
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {jobs.length > 0 && (
        <div className="p-4 border-t text-center">
          <button
            onClick={() => navigate('/explore-jobs')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All Jobs →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
