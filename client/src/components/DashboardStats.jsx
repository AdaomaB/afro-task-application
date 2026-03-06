import { motion } from 'framer-motion';
import { Briefcase, FileText, Eye, Users, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, growth, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          {growth && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">{growth}</span>
              <span className="text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

const DashboardStats = ({ role, stats }) => {
  const freelancerStats = [
    { icon: FileText, label: 'Active Applications', value: stats?.activeApplications || 0, color: 'bg-green-500', delay: 0.1 },
    { icon: Briefcase, label: 'Ongoing Projects', value: stats?.ongoingProjects || 0, color: 'bg-green-600', delay: 0.2 },
    { icon: Eye, label: 'Profile Views', value: stats?.profileViews || 0, color: 'bg-emerald-500', delay: 0.3 },
    { icon: Users, label: 'Followers', value: stats?.followers || 0, color: 'bg-teal-500', delay: 0.4 },
  ];

  const clientStats = [
    { icon: Briefcase, label: 'Active Jobs', value: stats?.activeJobs || 0, color: 'bg-yellow-500', delay: 0.1 },
    { icon: Users, label: 'Applicants', value: stats?.applicants || 0, color: 'bg-yellow-600', delay: 0.2 },
    { icon: FileText, label: 'Ongoing Projects', value: stats?.ongoingProjects || 0, color: 'bg-amber-500', delay: 0.3 },
    { icon: TrendingUp, label: 'Completed Projects', value: stats?.completedProjects || 0, color: 'bg-orange-500', delay: 0.4 },
  ];

  const displayStats = role === 'freelancer' ? freelancerStats : clientStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {displayStats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
