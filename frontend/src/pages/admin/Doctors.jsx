import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Doctors() {
  const [list, setList] = useState([]);
  const load = () => api.get('/admin/doctors').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    const fullName = prompt('Full name:'); if (!fullName) return;
    const email = prompt('Email:'); if (!email) return;
    await api.post('/admin/doctors', { fullName, email, password: 'password123', departmentId: 1, title: 'Lecturer' });
    load();
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">👨‍🏫 Doctors</h1>
        <button onClick={create} className="btn btn-primary">+ Add Doctor</button>
      </div>
      <div className="card">
        <table className="w-full">
          <thead className="text-sm text-slate-500 text-left">
            <tr><th className="pb-3">Code</th><th>Name</th><th>Title</th><th>Department</th></tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="py-3 font-mono">{d.doctorCode}</td>
                <td>{d.user.fullName}</td>
                <td>{d.title}</td>
                <td>{d.department.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}