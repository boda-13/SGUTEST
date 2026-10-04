import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Analytics() {
  const [data, setData] = useState({ data: [], alerts: [] });
  useEffect(() => { api.get('/student/analytics').then((r) => setData(r.data)); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Academic Analytics</h1>
      <div className="card mb-6">
        <h2 className="font-bold mb-4">Academic Performance</h2>
        {data.data.map((d) => (
          <div key={d.course} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{d.course}</span>
              <span>{d.percent}%</span>
            </div>
            <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  d.percent >= 85 ? 'bg-emerald-500' : d.percent >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${d.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {data.alerts.length > 0 && (
        <div className="card border-l-4 border-amber-500 bg-amber-50">
          <h2 className="font-bold mb-2">⚠️ Alerts</h2>
          {data.alerts.map((a, i) => <div key={i} className="text-sm text-amber-800">{a}</div>)}
        </div>
      )}
    </div>
  );
}