import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Search } from 'lucide-react';
import { getOrders, getOrder } from '../../api';
import { useBusiness } from '../../context/BusinessContext';

function OrderDetail({ businessId, orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(businessId, orderId).then(setOrder).catch(console.error).finally(() => setLoading(false));
  }, [orderId]);

  const formatDate = (d) => new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Order #{orderId}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {loading ? <div className="p-6 space-y-3 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}</div>
        : order ? (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
              <p className="font-medium text-gray-900">{order.customer_name}</p>
              <p className="text-sm text-gray-600">{order.customer_phone}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Products</h3>
              <div className="space-y-2">
                {(order.items || []).map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{item.product_code}</span>
                    <span className="flex-1 text-gray-800">{item.product_name}</span>
                    <span className="text-gray-500">×{item.quantity}</span>
                    <span className="font-medium">{Number(item.product_price * item.quantity).toLocaleString()} ETB</span>
                  </div>
                ))}
              </div>
            </div>
            {order.answers?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Custom Answers</h3>
                {order.answers.map(a => (
                  <div key={a.id} className="flex gap-2 text-sm"><span className="text-gray-500">{a.question}:</span><span className="font-medium">{a.answer}</span></div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-400 border-t pt-3 space-y-1">
              <p>Date: {formatDate(order.created_at)}</p>
              <p>Telegram: {order.telegram_sent ? '✅ Sent' : '❌ Not sent'}</p>
            </div>
          </div>
        ) : <p className="p-6 text-center text-gray-500">Order not found</p>}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { businessId } = useBusiness();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!businessId) return;
    getOrders(businessId).then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, [businessId]);

  const filtered = orders.filter(o =>
    !search || o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.customer_phone.includes(search)
  );

  const formatDate = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {selectedId && <OrderDetail businessId={businessId} orderId={selectedId} onClose={() => setSelectedId(null)} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-gray-900">Orders</h1><p className="text-sm text-gray-500 mt-0.5">{orders.length} total</p></div>
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-8 text-sm" placeholder="Search by name or phone..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        : filtered.length === 0 ? <div className="p-12 text-center text-gray-400">{search ? 'No orders match your search' : 'No orders yet'}</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Products</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Items</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Telegram</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{o.id}</td>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{o.customer_name}</p><p className="text-xs text-gray-500">{o.customer_phone}</p></td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell max-w-xs"><p className="truncate text-xs">{o.product_names || '—'}</p></td>
                    <td className="px-4 py-3 text-center hidden md:table-cell"><span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{o.total_items}</span></td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      {o.telegram_sent ? <CheckCircle size={16} className="text-green-500 mx-auto" /> : <XCircle size={16} className="text-gray-300 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => setSelectedId(o.id)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
