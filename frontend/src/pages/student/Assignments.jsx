import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Assignments() {
  const [list, setList] = useState([]);
  const load = () => api.get('/student/assignments').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (id) => {
    const fileUrl = prompt('Enter your file URL:');
    if (!fileUrl) return;
    await api.post(`/student/assignments/${id}/submit`, { fileUrl });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Assignments</h1>
      <div className="space-y-4">
        {list.map((a) => {
          const sub = a.submissions[0];
          const overdue = new Date(a.dueDate) < new Date();
          return (
            <div key={a.id} className="card flex justify-between items-center">
              <div>
                <div className="text-xs text-indigo-600">{a.course.name}</div>
                <div className="font-bold">{a.title}</div>
                <div className="text-sm text-slate-500">Due: {new Date(a.dueDate).toLocaleString()}</div>
              </div>
              <div className="text-right">
                {sub ? (
                  <div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">Submitted</span>
                    {sub.grade != null && <div className="font-bold mt-1">{sub.grade}/{a.maxGrade}</div>}
                  </div>
                ) : (
                  <button onClick={() => submit(a.id)} className={`btn ${overdue ? 'btn-ghost' : 'btn-primary'}`}>
                    Submit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}