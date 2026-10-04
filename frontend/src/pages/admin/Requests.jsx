import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Requests() {
  const [list, setList] = useState([]);
  const load = () => api.get('/admin/requests').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    await api.patch(`/admin/requests/${id}`, { status });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📩 Requests</h1>
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="card flex justify-between items-center">
            <div>
              <div className="font-bold">{r.type.replace(/_/g, ' ')}</div>
              <div className="text-sm text-slate-500">{r.student.user.fullName} ({r.student.studentCode})</div>
              <div className="text-xs text-slate-400">{r.description || '-'}</div>
            </div>
            <select className="input max-w-[180px]" value={r.status} onChange={(e) => update(r.id, e.target.value)}>
              <option value="pending">pending</option>
              <option value="under_review">under_review</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="ready">ready</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}