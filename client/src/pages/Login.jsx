import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorDetails, setErrorDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorDetails('');
    setLoading(true);

    // Resolves to Vercel env var or defaults to your live Render backend URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://autonomous-sales-assistant.onrender.com';

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/');
      } else {
        setErrorDetails(`[STATUS: ${response.status}] MSG: ${data.message || 'Login failed'}`);
      }
    } catch (err) {
      setErrorDetails(`[FETCH ERROR] MSG: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-2">AI Sales Assistant</h2>
        <p className="text-slate-400 text-center mb-6">Sign in to access your AI-qualified lead pipeline</p>

        {errorDetails && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6 text-xs font-mono break-all">
            <strong>LOGIN ERROR:</strong>
            <br />
            {errorDetails}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition duration-200 mt-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;