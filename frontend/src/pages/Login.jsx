import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('student@uni.edu');
  const [password, setPassword] = useState('password123');
  const [err, setErr] = useState('');
  const { login, loading } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const user = await login(email, password);
      nav(`/${user.role}`);
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
    }
  };

  const quick = (e) => { setEmail(e); setPassword('password123'); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">🎓 University Portal</h1>
        <p className="text-slate-500 mb-6">Sign in to continue</p>

        {err && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm">{err}</div>}

        <form onSubmit={submit} className="space-y-4">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-slate-500 mb-2">Quick login (demo):</p>
          <div className="grid grid-cols-3 gap-2">
            <button className="btn btn-ghost text-xs" onClick={() => quick('student@uni.edu')}>🎓 Student</button>
            <button className="btn btn-ghost text-xs" onClick={() => quick('doctor@uni.edu')}>👨‍🏫 Doctor</button>
            <button className="btn btn-ghost text-xs" onClick={() => quick('admin@uni.edu')}>👨‍💼 Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}