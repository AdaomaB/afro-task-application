import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-purple-500">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Afro Task Admin</h1>
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="glass rounded-3xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h2>
          <p className="text-white/80">Welcome, {user?.fullName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Total Users</h3>
            <p className="text-4xl font-bold text-white">0</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Total Projects</h3>
            <p className="text-4xl font-bold text-white">0</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Platform Revenue</h3>
            <p className="text-4xl font-bold text-white">$0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
