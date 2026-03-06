import { useState, useEffect } from 'react';
import { Eye, Users, Heart, MessageSquare, Briefcase, Star, TrendingUp } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

const FreelancerAnalytics = ({ userId }) => {
  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    followers: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalPostViews: 0,
    jobsApplied: 0,
    activeJobs: 0,
    completedJobs: 0,
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    if (!userId) return;

    // Real-time listener for followers
    const followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', userId)
    );
    const unsubFollowers = onSnapshot(followersQuery, (snapshot) => {
      setAnalytics(prev => ({ ...prev, followers: snapshot.size }));
    });

    // Real-time listener for posts
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId)
    );
    const unsubPosts = onSnapshot(postsQuery, async (snapshot) => {
      const posts = snapshot.docs.map(doc => doc.data());
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
      const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
      
      setAnalytics(prev => ({
        ...prev,
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalPostViews: totalViews
      }));
    });

    // Fetch profile views
    const fetchProfileViews = async () => {
      const viewsSnapshot = await getDocs(
        query(collection(db, 'profileViews'), where('profileId', '==', userId))
      );
      setAnalytics(prev => ({ ...prev, profileViews: viewsSnapshot.size }));
    };

    // Fetch applications
    const fetchApplications = async () => {
      const appsSnapshot = await getDocs(
        query(collection(db, 'applications'), where('freelancerId', '==', userId))
      );
      setAnalytics(prev => ({ ...prev, jobsApplied: appsSnapshot.size }));
    };

    // Fetch projects
    const fetchProjects = async () => {
      const projectsSnapshot = await getDocs(
        query(collection(db, 'projects'), where('freelancerId', '==', userId))
      );
      const projects = projectsSnapshot.docs.map(doc => doc.data());
      const active = projects.filter(p => p.status === 'ongoing' || p.status === 'awaiting_confirmation').length;
      const completed = projects.filter(p => p.status === 'completed').length;
      
      setAnalytics(prev => ({
        ...prev,
        activeJobs: active,
        completedJobs: completed
      }));
    };

    // Fetch reviews
    const fetchReviews = async () => {
      const reviewsSnapshot = await getDocs(
        query(collection(db, 'reviews'), where('freelancerId', '==', userId))
      );
      const reviews = reviewsSnapshot.docs.map(doc => doc.data());
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / reviews.length;
        
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
          breakdown[review.rating] = (breakdown[review.rating] || 0) + 1;
        });
        
        setAnalytics(prev => ({
          ...prev,
          averageRating: avgRating,
          totalReviews: reviews.length,
          ratingBreakdown: breakdown
        }));
      }
    };

    fetchProfileViews();
    fetchApplications();
    fetchProjects();
    fetchReviews();

    return () => {
      unsubFollowers();
      unsubPosts();
    };
  }, [userId]);

  const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-8 h-8 ${color}`} />
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <p className="text-white/80 text-sm">{label}</p>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Profile Analytics */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">📊 Profile Analytics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Eye} label="Profile Views" value={analytics.profileViews} color="text-blue-400" delay={0.1} />
          <StatCard icon={Users} label="Followers" value={analytics.followers} color="text-green-400" delay={0.2} />
          <StatCard icon={TrendingUp} label="Total Posts" value={analytics.totalPosts} color="text-purple-400" delay={0.3} />
          <StatCard icon={Heart} label="Total Likes" value={analytics.totalLikes} color="text-red-400" delay={0.4} />
        </div>
      </div>

      {/* Post Engagement */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">📈 Post Engagement</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Eye} label="Post Views" value={analytics.totalPostViews} color="text-cyan-400" delay={0.5} />
          <StatCard icon={MessageSquare} label="Comments" value={analytics.totalComments} color="text-yellow-400" delay={0.6} />
          <StatCard icon={Heart} label="Likes" value={analytics.totalLikes} color="text-pink-400" delay={0.7} />
        </div>
      </div>

      {/* Job Activity */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">💼 Job Activity</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Briefcase} label="Jobs Applied" value={analytics.jobsApplied} color="text-orange-400" delay={0.8} />
          <StatCard icon={TrendingUp} label="Active Jobs" value={analytics.activeJobs} color="text-green-400" delay={0.9} />
          <StatCard icon={Briefcase} label="Completed" value={analytics.completedJobs} color="text-emerald-400" delay={1.0} />
        </div>
      </div>

      {/* Rating Analytics */}
      {analytics.totalReviews > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">⭐ Rating Analytics</h3>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-white">{analytics.averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(analytics.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                    />
                  ))}
                </div>
                <p className="text-white/60 text-sm mt-1">{analytics.totalReviews} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-white text-sm w-8">{rating}⭐</span>
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{
                          width: `${analytics.totalReviews > 0 ? (analytics.ratingBreakdown[rating] / analytics.totalReviews) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-white/60 text-sm w-8">{analytics.ratingBreakdown[rating]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerAnalytics;
