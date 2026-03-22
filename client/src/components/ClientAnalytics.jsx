import { useState, useEffect } from 'react';
import { Briefcase, Users, TrendingUp, CheckCircle, Eye, FileText } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

const ClientAnalytics = ({ userId }) => {
  const [analytics, setAnalytics] = useState({
    jobsPosted: 0,
    applicationsReceived: 0,
    activeProjects: 0,
    completedProjects: 0,
    freelancersHired: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (!userId) return;

    // Real-time listener for jobs
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('clientId', '==', userId)
    );
    const unsubJobs = onSnapshot(jobsQuery, async (snapshot) => {
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);
      
      setAnalytics(prev => ({
        ...prev,
        jobsPosted: jobs.length,
        totalViews
      }));

      // Fetch applications for these jobs
      if (jobs.length > 0) {
        const jobIds = jobs.map(j => j.id);
        const appsSnapshot = await getDocs(collection(db, 'applications'));
        const applications = appsSnapshot.docs
          .map(doc => doc.data())
          .filter(app => jobIds.includes(app.jobId));
        
        setAnalytics(prev => ({
          ...prev,
          applicationsReceived: applications.length
        }));
      }
    });

    // Fetch projects
    const fetchProjects = async () => {
      const projectsSnapshot = await getDocs(
        query(collection(db, 'projects'), where('clientId', '==', userId))
      );
      const projects = projectsSnapshot.docs.map(doc => doc.data());
      const active = projects.filter(p => p.status === 'ongoing' || p.status === 'awaiting_confirmation').length;
      const completed = projects.filter(p => p.status === 'completed').length;
      
      // Count unique freelancers hired
      const uniqueFreelancers = new Set(projects.map(p => p.freelancerId));
      
      setAnalytics(prev => ({
        ...prev,
        activeProjects: active,
        completedProjects: completed,
        freelancersHired: uniqueFreelancers.size
      }));
    };

    fetchProjects();

    return () => {
      unsubJobs();
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
      {/* Hiring Analytics */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">📊 Hiring Analytics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard icon={Briefcase} label="Jobs Posted" value={analytics.jobsPosted} color="text-blue-400" delay={0.1} />
          <StatCard icon={FileText} label="Applications Received" value={analytics.applicationsReceived} color="text-green-400" delay={0.2} />
          <StatCard icon={Eye} label="Total Job Views" value={analytics.totalViews} color="text-purple-400" delay={0.3} />
        </div>
      </div>

      {/* Project Status */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">💼 Project Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={TrendingUp} label="Active Projects" value={analytics.activeProjects} color="text-orange-400" delay={0.4} />
          <StatCard icon={CheckCircle} label="Completed Projects" value={analytics.completedProjects} color="text-emerald-400" delay={0.5} />
          <StatCard icon={Users} label="Freelancers Hired" value={analytics.freelancersHired} color="text-cyan-400" delay={0.6} />
        </div>
      </div>

      {/* Pending Requests */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">⏳ Pending Requests</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">0</span>
            </div>
            <p className="text-white/80 text-sm">Applications to Review</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">0</span>
            </div>
            <p className="text-white/80 text-sm">Projects to Approve</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAnalytics;
