import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Phone, User, ShoppingCart, AlertCircle } from 'lucide-react';
import { useBasket } from '../context/BasketContext';
import { useBusiness } from '../context/BusinessContext';
import { getProductQuestions, submitOrder } from '../api';

export default function CheckoutPage() {
  const { items, clearBasket, totalCount, totalPrice } = useBasket();
  const { business, businessId } = useBusiness();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '' });
  const [questions, setQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successPhone, setSuccessPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0 && !success) navigate(businessId ? `/store?business=${businessId}` : '/');
  }, [items, success, navigate, businessId]);

  useEffect(() => {
    if (!businessId) return;
    const loadQuestions = async () => {
      const result = {};
      for (const item of items) {
        try {
          const qs = await getProductQuestions(businessId, item.id);
          if (qs.length > 0) result[item.id] = qs;
        } catch { /* no questions */ }
      }
      setQuestions(result);
    };
    if (items.length > 0) loadQuestions();
  }, [items, businessId]);

  const formatPrice = (n) => Number(n).toLocaleString('en-US');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter your full name.');
    if (!form.phone.trim()) return setError('Please enter your phone number.');
    if (form.phone.trim().length < 7) return setError('Please enter a valid phone number.');

    const answersArray = [];
    for (const item of items) {
      const itemQs = questions[item.id] || [];
      for (const q of itemQs) {
        const key = `${item.id}_${q.id}`;
        const answer = answers[key] || '';
        if (answer.trim()) {
          answersArray.push({ item_index: items.findIndex(i => i.id === item.id), question: q.question, answer: answer.trim() });
        }
      }
    }

    const orderData = {
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      items: items.map(item => ({ product_id: item.id, product_code: item.code, product_name: item.name, product_price: item.price, quantity: item.quantity })),
      answers: answersArray
    };

    setLoading(true);
    try {
      const res = await submitOrder(businessId, orderData);
      setSuccessPhone(res.phone || business?.phone || '');
      setSuccess(true);
      clearBasket();
    } catch (err) {
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const backHref = businessId ? `/store?business=${businessId}` : '/';

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4"><div className="bg-green-100 rounded-full p-4"><CheckCircle size={48} className="text-green-600" /></div></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Submitted!</h2>
        <p className="text-gray-600 mb-2">Our sales team will contact you soon.</p>
        {successPhone && (
          <p className="text-gray-600 mb-6">Or call us at:{' '}
            <a href={`tel:${successPhone}`} className="text-blue-600 font-semibold hover:underline">{successPhone}</a>
          </p>
        )}
        <a href={backHref} className="btn-primary block w-full py-3 text-center">Back to Store</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href={backHref} className="text-gray-500 hover:text-gray-700 p-1"><ArrowLeft size={20} /></a>
          <h1 className="font-bold text-gray-900 text-lg">Submit Order</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4"><ShoppingCart size={18} className="text-blue-600" /><h2 className="font-semibold text-gray-900">Order Summary</h2></div>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                {item.image_url ? <img src={item.image_url} alt={item.name} className="h-12 w-12 object-cover rounded-lg flex-shrink-0" />
                  : <div className="h-12 w-12 bg-gray-100 rounded-lg flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{item.code} × {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-blue-700">{formatPrice(item.price * item.quantity)} ETB</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">{totalCount} item{totalCount !== 1 ? 's' : ''}</span>
            <span className="font-bold text-blue-700">{formatPrice(totalPrice)} ETB</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className="label"><span className="flex items-center gap-1.5"><User size={14} /> Full Name *</span></label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g. John Doe" required />
              </div>
              <div>
                <label className="label"><span className="flex items-center gap-1.5"><Phone size={14} /> Phone Number *</span></label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="e.g. 0912345678" required inputMode="tel" />
              </div>
            </div>
          </div>

          {items.some(item => questions[item.id]?.length > 0) && (
            <div className="card p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="space-y-5">
                {items.map(item => {
                  const itemQs = questions[item.id];
                  if (!itemQs?.length) return null;
                  return (
                    <div key={item.id}>
                      <p className="text-sm font-medium text-gray-700 mb-2">For: <span className="text-blue-600">{item.name}</span></p>
                      <div className="space-y-3 pl-3 border-l-2 border-blue-100">
                        {itemQs.map(q => (
                          <div key={q.id}>
                            <label className="label">{q.question}</label>
                            <input type="text" value={answers[`${item.id}_${q.id}`] || ''} onChange={e => setAnswers(a => ({ ...a, [`${item.id}_${q.id}`]: e.target.value }))} className="input-field" placeholder="Your answer..." />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
            {loading ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</> : <><Send size={18} />Submit Order</>}
          </button>
        </form>
      </div>
    </div>
  );
}
