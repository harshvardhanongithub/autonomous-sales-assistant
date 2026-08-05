import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for New Lead
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    notes: '',
    status: 'New',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');

  // Fetch leads from backend
  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/leads', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchLeads();
    }
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Handle Create Lead
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5001/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setLeads([data, ...leads]);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', company: '', notes: '', status: 'New' });
      } else {
        setErrorMsg(data.message || 'Failed to create lead');
      }
    } catch (err) {
      setErrorMsg(`[FETCH ERROR] ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Update (PATCH)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setLeads(
          leads.map((lead) =>
            lead._id === id ? { ...lead, status: newStatus } : lead
          )
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handle Delete Lead
  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/leads/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLeads(leads.filter((lead) => lead._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  // Dynamic Dashboard Metrics
  const totalLeads = leads.length;
  const highIntentLeads = leads.filter((l) => l.score >= 70).length;
  const avgScore = totalLeads > 0 
    ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / totalLeads) 
    : 0;

  // Filtered Leads
  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-blue-500">✨</span> AI Sales Command Center
          </h1>
          <p className="text-xs text-slate-400">Automated Lead Intelligence</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-sm">{user.name || 'Sales Rep'}</p>
            <p className="text-xs text-slate-400">{user.role || 'Rep Account'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">TOTAL INGESTED LEADS</p>
            <p className="text-3xl font-bold mt-1 text-white">{totalLeads}</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">👥</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">HIGH-INTENT LEADS (&ge; 70)</p>
            <p className="text-3xl font-bold mt-1 text-emerald-400">{highIntentLeads}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">🔥</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">AVERAGE AI QUALITY SCORE</p>
            <p className="text-3xl font-bold mt-1 text-blue-400">{avgScore} <span className="text-sm font-normal text-slate-500">/ 100</span></p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">📈</div>
        </div>
      </div>

      {/* Action Bar & Lead Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold">AI Prioritized Leads</h2>
            <p className="text-xs text-slate-400">Sorted by AI propensity to convert</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition whitespace-nowrap"
            >
              + Add Lead
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Lead Info</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">AI Quality Rank</th>
                <th className="py-3 px-4">AI Qualification Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    Loading leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No leads found. Click "+ Add Lead" to create your first lead!
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-800/40 transition duration-150">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{lead.name}</div>
                      <div className="text-xs text-slate-400">{lead.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{lead.company}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          lead.score >= 70
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : lead.score >= 40
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {lead.score} / 100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs max-w-xs truncate">
                      {lead.qualificationReason || 'Pending AI Analysis'}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-slate-900 transition"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteLead(lead._id)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Add New Lead</h3>
            <p className="text-xs text-slate-400 mb-4">Enter prospect details for AI evaluation</p>

            {errorMsg && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-xs font-mono mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@acme.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Interaction Notes</label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Interested in enterprise package, $25k budget approved..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;