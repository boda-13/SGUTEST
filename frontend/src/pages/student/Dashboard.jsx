import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/student/dashboard').then((r) => setData(r.data));
  }, []);

  if (!data) return <div>Loading...</div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">{greeting}, {data.student.fullName} 👋</h1>
      <p className="text-slate-500 mb-6">{data.student.department} — Level {data.student.level}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat label="GPA" value={data.gpa} color="indigo" />
        <Stat label="Attendance" value={`${data.attendancePct}%`} color="emerald" />
        <Stat label="Completed Credits" value={data.completedCredits} color="amber" />
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Today's Classes</h2>
        {data.todayClasses.length === 0 ? (
          <p className="text-slate-500">No classes today 🎉</p>
        ) : (
          <table className="w-full text-left">
            <thead className="text-slate-500 text-sm">
              <tr><th className="pb-2">Time</th><th>Course</th><th>Room</th></tr>
            </thead>
            <tbody>
              {data.todayClasses.map((c, i) => (
                <tr key={i} className="border-t">
                  <td className="py-3 font-mono">{c.time}</td>
                  <td className="font-medium">{c.course}</td>
                  <td>{c.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="card">
      <div className={`text-${color}-600 text-sm mb-1`}>{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}