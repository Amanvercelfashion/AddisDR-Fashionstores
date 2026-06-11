import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Upload, HelpCircle, ImageOff } from 'lucide-react';
import {
  getProductsAdmin, getCategories, createProduct, updateProduct,
  deleteProduct, toggleVisibility, getProductQuestions, addQuestion, deleteQuestion
} from '../../api';
import { useBusiness } from '../../context/BusinessContext';

function ProductForm({ businessId, product, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name || '', price: product?.price || '', description: product?.description || '',
    category_id: product?.category_id || '', visible: product?.visible !== undefined ? product.visible : 1, image: null,
  });
  const [imagePreview, setImagePreview] = useState(product?.image_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) { setForm(f => ({ ...f, image: file })); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Product name is required.');
    if (!form.price || isNaN(Number(form.price))) return setError('Valid price is required.');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim()); fd.append('price', form.price); fd.append('description', form.description);
      if (form.category_id) fd.append('category_id', form.category_id);
      fd.append('visible', form.visible);
      if (form.image) fd.append('image', form.image);
      if (product?.id) await updateProduct(businessId, product.id, fd);
      else await createProduct(businessId, fd);
      onSave();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-gray-900">{product ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Product Image</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400" onClick={() => fileRef.current?.click()}>
              {imagePreview ? <img src={imagePreview} alt="preview" className="h-32 object-contain rounded-lg" />
                : <><Upload size={24} className="text-gray-400" /><p className="text-sm text-gray-500">Click to upload image</p></>}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </div>
          </div>
          <div><label className="label">Product Name *</label><input type="text" value={form.name} onChange={e => f('name', e.target.value)} className="input-field" placeholder="e.g. Samsung S24" required /></div>
          <div><label className="label">Price (ETB) *</label><input type="number" min="0" step="0.01" value={form.price} onChange={e => f('price', e.target.value)} className="input-field" placeholder="0.00" required /></div>
          <div><label className="label">Description</label><textarea value={form.description} onChange={e => f('description', e.target.value)} className="input-field resize-none" rows={3} /></div>
          <div>
            <label className="label">Category</label>
            <select value={form.category_id} onChange={e => f('category_id', e.target.value)} className="input-field">
              <option value="">No category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => f('visible', form.visible ? 0 : 1)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.visible ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.visible ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <label className="text-sm font-medium text-gray-700">{form.visible ? 'Visible on store' : 'Hidden (sold out)'}</label>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuestionsPanel({ businessId, product, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    getProductQuestions(businessId, product.id).then(setQuestions).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [product.id]);

  const handleAdd = async () => {
    if (!newQ.trim()) return;
    setSaving(true);
    try { await addQuestion(businessId, product.id, { question: newQ.trim() }); setNewQ(''); load(); }
    catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (qid) => {
    if (!confirm('Delete this question?')) return;
    try { await deleteQuestion(businessId, qid); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div><h2 className="font-bold text-gray-900">Custom Questions</h2><p className="text-xs text-gray-500 mt-0.5">{product.name}</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">These appear at checkout for this product only.</p>
          {loading ? <div className="h-10 bg-gray-100 rounded animate-pulse" /> : (
            <div className="space-y-2">
              {questions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No questions yet</p>}
              {questions.map(q => (
                <div key={q.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <HelpCircle size={14} className="text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-800 flex-1">{q.question}</span>
                  <button onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-600 p-0.5"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="text" value={newQ} onChange={e => setNewQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="input-field flex-1" placeholder="e.g. Preferred color..." />
            <button onClick={handleAdd} disabled={saving || !newQ.trim()} className="btn-primary px-3"><Plus size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { businessId } = useBusiness();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [questionsProduct, setQuestionsProduct] = useState(null);

  const load = () => {
    if (!businessId) return;
    Promise.all([getProductsAdmin(businessId), getCategories(businessId)])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [businessId]);

  const handleToggle = async (id) => {
    try {
      await toggleVisibility(businessId, id);
      setProducts(ps => ps.map(p => p.id === id ? { ...p, visible: p.visible === 1 ? 0 : 1 } : p));
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try { await deleteProduct(businessId, product.id); setProducts(ps => ps.filter(p => p.id !== product.id)); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      {showForm && <ProductForm businessId={businessId} product={editProduct} categories={categories}
        onSave={() => { setShowForm(false); setEditProduct(null); load(); }}
        onCancel={() => { setShowForm(false); setEditProduct(null); }} />}
      {questionsProduct && <QuestionsPanel businessId={businessId} product={questionsProduct} onClose={() => setQuestionsProduct(null)} />}

      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Products</h1><p className="text-sm text-gray-500 mt-0.5">{products.length} total</p></div>
        <button onClick={() => { setEditProduct(null); setShowForm(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Product</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card p-4 h-16 animate-pulse bg-gray-100" />)}</div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-gray-500 mb-4">No products yet</p><button onClick={() => setShowForm(true)} className="btn-primary">Add your first product</button></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Visible</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? <img src={p.image_url} alt={p.name} className="h-10 w-10 object-cover rounded-lg flex-shrink-0" />
                          : <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><ImageOff size={14} className="text-gray-400" /></div>}
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400 md:hidden font-mono">{p.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{p.code}</span></td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.category_name || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-right font-medium">{Number(p.price).toLocaleString()} ETB</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggle(p.id)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${p.visible === 1 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {p.visible === 1 ? <Eye size={11} /> : <EyeOff size={11} />}
                        {p.visible === 1 ? 'On' : 'Off'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setQuestionsProduct(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Questions"><HelpCircle size={16} /></button>
                        <button onClick={() => { setEditProduct(p); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
