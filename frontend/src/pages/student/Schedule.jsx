import { useEffect, useState } from 'react';
import api from '../../api/client';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export default function Schedule() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/student/schedule').then((r) => setList(r.data)); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Weekly Schedule</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {DAYS.map((d) => (
          <div key={d} className="card">
            <h3 className="font-bold mb-3">{d}</h3>
            <div className="space-y-2">
              {list.filter((s) => s.dayOfWeek === d).map((s) => (
                <div key={s.id} className="bg-indigo-50 rounded-lg p-2 text-sm">
                  <div className="font-mono text-xs text-indigo-600">{s.startTime} - {s.endTime}</div>
                  <div className="font-medium">{s.course.name}</div>
                  <div className="text-xs text-slate-500">{s.room}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}