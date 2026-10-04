import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Attendance() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/student/attendance').then((r) => setList(r.data)); }, []);

  const colors = { present: 'bg-emerald-100 text-emerald-700', absent: 'bg-red-100 text-red-700', late: 'bg-amber-100 text-amber-700', excused: 'bg-slate-100 text-slate-700' };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>
      <div className="card">
        <table className="w-full">
          <thead className="text-slate-500 text-sm text-left">
            <tr><th className="pb-3">Date</th><th>Course</th><th>Status</th><th>Note</th></tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="py-3">{new Date(a.date).toLocaleDateString()}</td>
                <td>{a.course.name}</td>
                <td><span className={`px-2 py-1 rounded-lg text-xs font-medium ${colors[a.status]}`}>{a.status}</span></td>
                <td className="text-slate-500">{a.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}