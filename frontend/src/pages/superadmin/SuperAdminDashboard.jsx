import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShoppingBag, Package, CheckCircle, ArrowRight } from 'lucide-react';
import { saGetStats } from '../../api';
import { useSuperAdmin } from '../../context/SuperAdminContext';

function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600' };
  return (
    <div className="card p-5">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-3`}><Icon size={20} /></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { token } = useSuperAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    saGetStats(token).then(setStats).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="card p-5 h-28 animate-pulse bg-gray-100" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of all businesses on this platform</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Businesses" value={stats?.total_businesses ?? 0} color="blue" />
        <StatCard icon={CheckCircle} label="Active Businesses" value={stats?.active_businesses ?? 0} color="green" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.total_orders ?? 0} color="orange" />
        <StatCard icon={Package} label="Total Products" value={stats?.total_products ?? 0} color="purple" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Businesses</h2>
          <Link to="/superadmin/businesses" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {stats?.recent_businesses?.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No businesses yet. <Link to="/superadmin/businesses" className="text-blue-600 hover:underline">Create one</Link>.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats?.recent_businesses?.map(biz => (
              <div key={biz.id} className="flex items-center gap-3 py-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{biz.name}</p>
                  <p className="text-xs text-gray-400">{biz.subdomain}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${biz.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {biz.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
