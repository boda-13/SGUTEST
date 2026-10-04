import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function DoctorDashboard() {
  const [courses, setCourses] = useState([]);
  useEffect(() => { api.get('/doctor/courses').then((r) => setCourses(r.data)); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👨‍🏫 My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <div key={c.id} className="card">
            <div className="text-xs text-indigo-600">{c.code}</div>
            <div className="text-lg font-bold">{c.name}</div>
            <div className="text-sm text-slate-500 mt-1">{c._count.enrollments} students</div>
          </div>
        ))}
      </div>
    </div>
  );
}