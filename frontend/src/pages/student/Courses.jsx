import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Courses() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/student/courses').then((r) => setList(r.data)); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((e) => (
          <div key={e.id} className="card">
            <div className="text-xs text-indigo-600 font-medium">{e.course.code}</div>
            <div className="text-lg font-bold mb-2">{e.course.name}</div>
            <div className="text-sm text-slate-500">
              👨‍🏫 {e.course.doctor?.user.fullName || 'TBA'}
            </div>
            <div className="text-sm text-slate-500">
              🎯 {e.course.creditHours} credits
            </div>
            {e.grade?.isPublished && (
              <div className="mt-3 pt-3 border-t flex justify-between">
                <span className="text-sm">Grade</span>
                <span className="font-bold">{e.grade.letterGrade} ({e.grade.total}%)</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}