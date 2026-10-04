import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Notifications() {
  const [list, setList] = useState([]);
  const load = () => api.get('/student/notifications').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const mark = async (id) => { await api.patch(`/student/notifications/${id}/read`); load(); };

  const colors = { info: 'border-blue-500', success: 'border-emerald-500', warning: 'border-amber-500', danger: 'border-red-500' };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="space-y-3">
        {list.map((n) => (
          <div key={n.id} onClick={() => !n.isRead && mark(n.id)}
               className={`card border-l-4 ${colors[n.type]} ${!n.isRead ? 'bg-indigo-50 cursor-pointer' : ''}`}>
            <div className="font-bold">{n.title}</div>
            <div className="text-sm text-slate-600">{n.body}</div>
            <div className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}