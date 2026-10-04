import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Grades() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/student/grades').then((r) => setList(r.data)); }, []);

  const getColor = (letter) => letter?.startsWith('A') ? 'text-emerald-600' :
    letter?.startsWith('B') ? 'text-blue-600' :
    letter?.startsWith('C') ? 'text-amber-600' : 'text-red-600';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Grades</h1>
      <div className="card">
        <table className="w-full">
          <thead className="text-slate-500 text-sm text-left">
            <tr>
              <th className="pb-3">Course</th>
              <th>Credits</th>
              <th>Midterm</th>
              <th>Practical</th>
              <th>Final</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="py-3 font-medium">{e.course.name}</td>
                <td>{e.course.creditHours}</td>
                <td>{e.grade.midterm}</td>
                <td>{e.grade.practical}</td>
                <td>{e.grade.final}</td>
                <td>{e.grade.total}</td>
                <td className={`font-bold ${getColor(e.grade.letterGrade)}`}>{e.grade.letterGrade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}