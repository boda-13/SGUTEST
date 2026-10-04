import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Exams() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/student/exams').then((r) => setList(r.data)); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Exams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((e) => (
          <div key={e.id} className="card">
            <div className="text-xs text-indigo-600 uppercase">{e.type}</div>
            <div className="font-bold text-lg">{e.title}</div>
            <div className="text-sm text-slate-600 mt-1">{e.course.name}</div>
            <div className="mt-3 flex justify-between text-sm">
              <span>📅 {new Date(e.examDate).toLocaleString()}</span>
              <span>⏱ {e.durationMin} min</span>
            </div>
            <div className="text-sm text-slate-500 mt-1">📍 {e.room}</div>
          </div>
        ))}
      </div>
    </div>
  );
}