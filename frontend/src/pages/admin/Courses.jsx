import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Courses() {
  const [list, setList] = useState([]);
  const load = () => api.get('/admin/courses').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    const name = prompt('Course name:'); if (!name) return;
    const code = prompt('Code:'); if (!code) return;
    await api.post('/admin/courses', { name, code, departmentId: 1, level: 1, semester: 1, creditHours: 3 });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete?')) return;
    await api.delete(`/admin/courses/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">📚 Courses</h1>
        <button onClick={create} className="btn btn-primary">+ Add Course</button>
      </div>
      <div className="card">
        <table className="w-full">
          <thead className="text-sm text-slate-500 text-left">
            <tr><th className="pb-3">Code</th><th>Name</th><th>Doctor</th><th>Students</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-3 font-mono">{c.code}</td>
                <td>{c.name}</td>
                <td>{c.doctor?.user.fullName || '-'}</td>
                <td>{c._count.enrollments}</td>
                <td><button onClick={() => remove(c.id)} className="text-red-600 text-sm">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}