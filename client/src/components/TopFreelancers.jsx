import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TopFreelancers = ({ limit = 10 }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopFreelancers();
  }, [limit]);

  const fetchTopFreelancers = async () => {
    try {
      const response = await api.get(`/ranking/top-freelancers?limit=${limit}`);
      setFreelancers(response.data.freelancers || []);
      
      // Check following status for each freelancer
      if (currentUser) {
        const statusMap = {};
        for (const freelancer of response.data.freelancers || []) {
          const followDoc = await getDoc(
            doc(db, 'followers', `${currentUser.uid}_${freelancer.id}`)
          );
          statusMap[freelancer.id] = followDoc.exists();
        }
        setFollowingStatus(statusMap);
      }
    } catch (error) {
      console.error('Error fetching top freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (freelancerId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const followId = `${currentUser.uid}_${freelancerId}`;
      const isFollowing = followingStatus[freelancerId];

      if (isFollowing) {
        await deleteDoc(doc(db, 'followers', followId));
        setFollowingStatus(prev => ({ ...prev, [freelancerId]: false }));
      } else {
        await setDoc(doc(db, 'followers', followId), {
          followerId: currentUser.uid,
          followingId: freelancerId,
          createdAt: new Date().toISOString()
        });
        setFollowingStatus(prev => ({ ...prev, [freelancerId]: true }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">⭐ Top Rated Freelancers</h2>
        <p className="text-sm text-gray-600 mt-1">Highest ranked professionals on AfroTask</p>
      </div>
      
      <div className="divide-y">
        {freelancers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No freelancers found
          </div>
        ) : (
          freelancers.map((freelancer) => (
            <div key={freelancer.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start gap-4">
                {/* Profile Picture */}
                <img
                  src={freelancer.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.fullName || 'User')}&background=random`}
                  alt={freelancer.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {freelancer.fullName}
                        {freelancer.rankingScore >= 50 && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                            ⭐ Top Rated
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{freelancer.professionalTitle || 'Freelancer'}</p>
                    </div>
                    
                    {/* Follow Button */}
                    {currentUser?.uid !== freelancer.id && (
                      <button
                        onClick={() => handleFollow(freelancer.id)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                          followingStatus[freelancer.id]
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {followingStatus[freelancer.id] ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      ⭐ {freelancer.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span>📍 {freelancer.country || 'N/A'}</span>
                    <span>✅ {freelancer.completedProjects || 0} jobs</span>
                  </div>

                  {/* Skills */}
                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {freelancer.skills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {freelancer.skills.length > 5 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{freelancer.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* View Profile Button */}
                  <button
                    onClick={() => navigate(`/profile/${freelancer.id}`)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Profile →
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopFreelancers;
