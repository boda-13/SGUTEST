import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setStats(r.data)); }, []);
  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 System Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card label="Students" value={stats.students} />
        <Card label="Doctors" value={stats.doctors} />
        <Card label="Courses" value={stats.courses} />
        <Card label="Pending Requests" value={stats.pendingRequests} />
        <Card label="Revenue (EGP)" value={Number(stats.totalRevenue).toLocaleString()} />
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="card">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}