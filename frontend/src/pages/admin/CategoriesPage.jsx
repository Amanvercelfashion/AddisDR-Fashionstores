import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, FolderOpen } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api';
import { useBusiness } from '../../context/BusinessContext';

export default function CategoriesPage() {
  const { businessId } = useBusiness();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    if (!businessId) return;
    getCategories(businessId).then(setCategories).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [businessId]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setError(''); setSaving(true);
    try {
      await createCategory(businessId, { name: newName.trim() });
      setNewName(''); load();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    setError('');
    try {
      await updateCategory(businessId, id, { name: editName.trim() });
      setEditId(null); load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    setError('');
    try {
      await deleteCategory(businessId, cat.id); load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500 mt-0.5">Organize your products by category</p>
      </div>

      <div className="card p-4">
        <label className="label">Add New Category</label>
        <div className="flex gap-2">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="input-field flex-1" placeholder="e.g. Electronics, Furniture..." />
          <button onClick={handleAdd} disabled={saving || !newName.trim()} className="btn-primary flex items-center gap-1.5 px-4">
            <Plus size={16} /> Add
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center"><FolderOpen size={40} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No categories yet</p></div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map(cat => (
              <li key={cat.id} className="flex items-center gap-3 px-4 py-3">
                <FolderOpen size={16} className="text-blue-400 flex-shrink-0" />
                {editId === cat.id ? (
                  <>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleEdit(cat.id); if (e.key === 'Escape') setEditId(null); }}
                      className="input-field flex-1" autoFocus />
                    <button onClick={() => handleEdit(cat.id)} className="text-green-600 hover:text-green-700 p-1"><Check size={16} /></button>
                    <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-gray-800 font-medium">{cat.name}</span>
                    <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(cat)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
