import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';

export default function CourseDetail() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState('students');

  useEffect(() => {
    api.get(`/doctor/courses/${id}/stats`).then((r) => setStats(r.data));
    api.get(`/doctor/courses/${id}/students`).then((r) => setStudents(r.data));
  }, [id]);

  const enterGrade = async (enrollmentId) => {
    const midterm = prompt('Midterm:'); if (!midterm) return;
    const practical = prompt('Practical:'); if (!practical) return;
    const final = prompt('Final:'); if (!final) return;
    await api.post('/doctor/grades', { enrollmentId, midterm: +midterm, practical: +practical, final: +final });
    alert('Grade saved & student notified!');
    location.reload();
  };

  const recordAttendance = async () => {
    const date = prompt('Date (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
    if (!date) return;
    const records = students.map((s) => {
      const status = prompt(`${s.student.user.fullName} (present/absent/late/excused):`, 'present');
      return { studentId: s.studentId, status: status || 'present' };
    });
    await api.post('/doctor/attendance', { courseId: +id, date, records });
    alert('Attendance recorded!');
  };

  const createAssignment = async () => {
    const title = prompt('Assignment title:'); if (!title) return;
    const dueDate = prompt('Due date (YYYY-MM-DD):'); if (!dueDate) return;
    await api.post('/doctor/assignments', { courseId: +id, title, dueDate });
    alert('Assignment created!');
  };

  const createExam = async () => {
    const title = prompt('Exam title:'); if (!title) return;
    const examDate = prompt('Exam date (YYYY-MM-DDTHH:mm):'); if (!examDate) return;
    await api.post('/doctor/exams', { courseId: +id, title, examDate, durationMin: 90, type: 'midterm' });
    alert('Exam created & students notified!');
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Course Management</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card"><div className="text-sm text-slate-500">Students</div><div className="text-3xl font-bold">{stats.students}</div></div>
        <div className="card"><div className="text-sm text-slate-500">Average Grade</div><div className="text-3xl font-bold">{stats.averageGrade}%</div></div>
        <div className="card"><div className="text-sm text-slate-500">Attendance</div><div className="text-3xl font-bold">{stats.attendance}%</div></div>
      </div>

      <div className="card mb-6">
        <div className="flex gap-2 mb-4">
          <button onClick={recordAttendance} className="btn btn-primary">✅ Record Attendance</button>
          <button onClick={createAssignment} className="btn btn-primary">📝 New Assignment</button>
          <button onClick={createExam} className="btn btn-primary">📋 New Exam</button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold mb-4">Students</h2>
        <table className="w-full">
          <thead className="text-sm text-slate-500 text-left">
            <tr><th className="pb-3">Student</th><th>Code</th><th>Grade</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="py-3">{s.student.user.fullName}</td>
                <td>{s.student.studentCode}</td>
                <td>{s.grade?.isPublished ? `${s.grade.total}% (${s.grade.letterGrade})` : '-'}</td>
                <td>
                  <button onClick={() => enterGrade(s.id)} className="text-indigo-600 text-sm">Enter Grade</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}