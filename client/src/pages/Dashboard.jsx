import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newLead, setNewLead] = useState({ name: '', email: '', company: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await API.get('/leads');
      setLeads(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to fetch leads.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await API.post('/leads', newLead);
      setLeads([response.data, ...leads]);
      setNewLead({ name: '', email: '', company: '', notes: '' });
    } catch (err) {
      setError('Failed to create lead.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await API.patch(`/leads/${id}`, { status });
      setLeads(leads.map((l) => (l._id === id ? response.data : l)));
    } catch (err) {
      setError('Failed to update lead status.');
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      await API.delete(`/leads/${id}`);
      setLeads(leads.filter((l) => l._id !== id));
    } catch (err) {
      setError('Failed to delete lead.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">✨ AI Sales Command Center</h1>
          <p className="text-sm text-gray-400">Automated Lead Intelligence</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-300">{user.name || 'User'}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition"
          >
            Logout
          </button>
        </div>
      </header>

      {error && <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">Add New Lead</h2>
          <form onSubmit={handleCreateLead} className="space-y-3">
            <input
              type="text"
              placeholder="Contact Name"
              required
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <input
              type="text"
              placeholder="Company"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <textarea
              placeholder="Notes / AI Context"
              value={newLead.notes}
              onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-24"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-semibold transition disabled:opacity-50"
            >
              {submitting ? 'Analyzing & Saving...' : 'Add Lead'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">Active Intelligence Pipeline</h2>
          {loading ? (
            <p className="text-gray-400">Loading leads...</p>
          ) : leads.length === 0 ? (
            <p className="text-gray-400">No leads recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-700 text-gray-300">
                  <tr>
                    <th className="p-3">Lead</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td className="p-3">
                        <div className="font-semibold">{lead.name}</div>
                        <div className="text-xs text-gray-400">{lead.email}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          lead.score >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {lead.score ?? 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={lead.status || 'New'}
                          onChange={(e) => handleUpdateStatus(lead._id, e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteLead(lead._id)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;