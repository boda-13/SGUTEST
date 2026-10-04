import { useEffect, useState } from 'react';
import api from '../../api/client';

const TYPES = ['certificate', 'enrollment_certificate', 'transcript', 'withdrawal', 'course_registration', 'complaint'];

export default function Requests() {
  const [list, setList] = useState([]);
  const [type, setType] = useState('certificate');
  const [description, setDescription] = useState('');

  const load = () => api.get('/student/requests').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/student/requests', { type, description });
    setDescription('');
    load();
  };

  const colors = {
    pending: 'bg-slate-100 text-slate-700',
    under_review: 'bg-blue-100 text-blue-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    ready: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Online Requests</h1>
      <form onSubmit={submit} className="card mb-6 flex gap-3">
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
        <input className="input" placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="btn btn-primary whitespace-nowrap">Submit</button>
      </form>

      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="card flex justify-between items-center">
            <div>
              <div className="font-bold">{r.type.replace(/_/g, ' ')}</div>
              <div className="text-sm text-slate-500">{r.description || '-'}</div>
              <div className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${colors[r.status]}`}>
              {r.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}