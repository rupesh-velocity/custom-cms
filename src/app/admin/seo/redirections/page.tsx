'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

type Redirection = {
  id: number;
  sourceUrl: string;
  ignoreCase: boolean;
  destinationUrl: string;
  redirectType: string;
  status: boolean;
};

export default function RedirectionsPage() {
  const [redirections, setRedirections] = useState<Redirection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [sourceUrl, setSourceUrl] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [destinationUrl, setDestinationUrl] = useState('');
  const [redirectType, setRedirectType] = useState('301');
  const [status, setStatus] = useState(true);

  useEffect(() => {
    fetchRedirections();
  }, []);

  const fetchRedirections = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/redirections');
      const data = await res.json();
      setRedirections(data);
    } catch (err) {
      toast.error('Failed to load redirections');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSourceUrl('');
    setIgnoreCase(false);
    setDestinationUrl('');
    setRedirectType('301');
    setStatus(true);
  };

  const openModal = (redirection?: Redirection) => {
    if (redirection) {
      setEditingId(redirection.id);
      setSourceUrl(redirection.sourceUrl);
      setIgnoreCase(redirection.ignoreCase);
      setDestinationUrl(redirection.destinationUrl);
      setRedirectType(redirection.redirectType);
      setStatus(redirection.status);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceUrl || !destinationUrl) {
      toast.error('Source and Destination URLs are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/redirections/${editingId}` : '/api/redirections';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl,
          ignoreCase,
          destinationUrl,
          redirectType,
          status
        })
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      toast.success(editingId ? 'Redirection updated' : 'Redirection added');
      setIsModalOpen(false);
      fetchRedirections();
    } catch (err) {
      toast.error('Failed to save redirection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this redirection?')) return;
    
    try {
      const res = await fetch(`/api/redirections/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Redirection deleted');
      fetchRedirections();
    } catch (err) {
      toast.error('Failed to delete redirection');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redirections</h1>
          <p className="text-gray-500 mt-2">Manage your 301 and 302 redirects</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Add New
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading redirections...</div>
        ) : redirections.length === 0 ? (
          <div className="p-16 text-center">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <ExternalLink size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No redirections found</h3>
            <p className="text-gray-500 mb-6">Create your first redirection to forward traffic.</p>
            <button
              onClick={() => openModal()}
              className="text-blue-600 font-medium hover:underline"
            >
              + Add Redirection
            </button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900 text-sm">Source URL</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-sm">Destination URL</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-sm">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {redirections.map((redir) => (
                <tr key={redir.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{redir.sourceUrl}</td>
                  <td className="px-6 py-4 text-gray-600">{redir.destinationUrl}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {redir.redirectType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      redir.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {redir.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openModal(redir)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(redir.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Redirection' : 'Add Redirection'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Source URLs */}
              <div className="grid grid-cols-12 gap-4 items-start">
                <div className="col-span-3 pt-2">
                  <label className="text-sm font-semibold text-gray-900">Source URLs</label>
                </div>
                <div className="col-span-9 space-y-3">
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={e => setSourceUrl(e.target.value)}
                    placeholder="e.g. /old-page"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input 
                      type="checkbox" 
                      checked={ignoreCase}
                      onChange={e => setIgnoreCase(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    Ignore Case
                  </label>
                </div>
              </div>

              {/* Destination URL */}
              <div className="grid grid-cols-12 gap-4 items-start border-t border-gray-100 pt-6">
                <div className="col-span-3 pt-2">
                  <label className="text-sm font-semibold text-gray-900">Destination URL</label>
                </div>
                <div className="col-span-9">
                  <input
                    type="text"
                    value={destinationUrl}
                    onChange={e => setDestinationUrl(e.target.value)}
                    placeholder="e.g. /new-page"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Redirection Type */}
              <div className="grid grid-cols-12 gap-4 items-start border-t border-gray-100 pt-6">
                <div className="col-span-3 pt-2">
                  <label className="text-sm font-semibold text-gray-900">Redirection Type</label>
                </div>
                <div className="col-span-9 flex flex-wrap gap-2">
                  {[
                    { val: '301', label: '301 Permanent Move' },
                    { val: '302', label: '302 Temporary Move' },
                    { val: '307', label: '307 Temporary Redirect' },
                    { val: '410', label: '410 Content Deleted' },
                    { val: '451', label: '451 Unavailable for Legal Reasons' }
                  ].map(type => (
                    <button
                      key={type.val}
                      type="button"
                      onClick={() => setRedirectType(type.val)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        redirectType === type.val
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-12 gap-4 items-start border-t border-gray-100 pt-6">
                <div className="col-span-3 pt-2">
                  <label className="text-sm font-semibold text-gray-900">Status</label>
                </div>
                <div className="col-span-9 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      status
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      !status
                        ? 'bg-gray-800 border-gray-800 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Deactivate
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Redirection' : 'Add Redirection')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
