import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  useEffect(() => { api.get('/doctor/courses').then((r) => setCourses(r.data)); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>
      <div className="space-y-3">
        {courses.map((c) => (
          <div key={c.id} className="card flex justify-between items-center">
            <div>
              <div className="text-xs text-indigo-600">{c.code}</div>
              <div className="font-bold">{c.name}</div>
              <div className="text-sm text-slate-500">{c._count.enrollments} students enrolled</div>
            </div>
            <Link to={`/doctor/courses/${c.id}`} className="btn btn-primary">Manage →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}