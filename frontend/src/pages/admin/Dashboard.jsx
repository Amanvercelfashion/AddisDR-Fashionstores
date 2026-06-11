import { useEffect, useState } from 'react';
import { ShoppingBag, Package, TrendingUp, TrendingDown, Minus, Calendar, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalyticsOverview, getTopProducts, getDailyChart } from '../../api';
import { useBusiness } from '../../context/BusinessContext';

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600' };
  return (
    <div className="card p-5">
      <div className={`p-2 rounded-lg inline-flex ${colors[color]} mb-3`}><Icon size={20} /></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { businessId } = useBusiness();
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    Promise.all([getAnalyticsOverview(businessId), getTopProducts(businessId), getDailyChart(businessId)])
      .then(([ov, top, chart]) => {
        setOverview(ov);
        setTopProducts(top);
        setChartData(chart.map(d => ({ name: d.day?.slice(5) || d.day, orders: d.order_count })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="card p-5 h-28 animate-pulse bg-gray-100" />)}
    </div>
  );

  const growth = overview?.orders?.growth_percent ?? 0;
  const GrowthIcon = growth > 0 ? TrendingUp : growth < 0 ? TrendingDown : Minus;
  const growthColor = growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Store performance overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={overview?.orders?.total ?? 0} color="blue" />
        <StatCard icon={Calendar} label="Orders Today" value={overview?.orders?.today ?? 0} color="orange" />
        <StatCard icon={Package} label="Total Products" value={overview?.products?.total ?? 0} sub={`${overview?.products?.visible ?? 0} visible`} color="purple" />
        <div className="card p-5">
          <div className={`p-2 rounded-lg inline-flex bg-green-50 mb-3`}><GrowthIcon size={20} className={growthColor} /></div>
          <p className="text-2xl font-bold text-gray-900">{growth > 0 ? '+' : ''}{growth}%</p>
          <p className="text-sm font-medium text-gray-600 mt-0.5">Weekly Growth</p>
          <p className="text-xs text-gray-400 mt-1">{overview?.orders?.this_week ?? 0} this week vs {overview?.orders?.last_week ?? 0} last</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Orders (Last 30 Days)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No order data yet</div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye size={16} className="text-blue-500" /> Top Products
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 7).map((p, i) => (
                <div key={p.product_code} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.product_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.product_code}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600 flex-shrink-0">{p.total_ordered}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
