import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Students() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');

  const load = () => api.get('/admin/students', { params: { search } }).then((r) => setList(r.data));
  useEffect(() => { load(); }, [search]);

  const create = async () => {
    const fullName = prompt('Full name:'); if (!fullName) return;
    const email = prompt('Email:'); if (!email) return;
    await api.post('/admin/students', { fullName, email, password: 'password123', departmentId: 1, level: 1 });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this student?')) return;
    await api.delete(`/admin/students/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">🎓 Students</h1>
        <button onClick={create} className="btn btn-primary">+ Add Student</button>
      </div>
      <input className="input mb-4" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="card">
        <table className="w-full">
          <thead className="text-sm text-slate-500 text-left">
            <tr><th className="pb-3">Code</th><th>Name</th><th>Email</th><th>Level</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="py-3 font-mono">{s.studentCode}</td>
                <td>{s.user.fullName}</td>
                <td className="text-slate-500">{s.user.email}</td>
                <td>L{s.level}</td>
                <td>{s.status}</td>
                <td><button onClick={() => remove(s.id)} className="text-red-600 text-sm">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}