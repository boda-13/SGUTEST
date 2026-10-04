import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentGrades from './pages/student/Grades';
import StudentSchedule from './pages/student/Schedule';
import StudentAttendance from './pages/student/Attendance';
import StudentAssignments from './pages/student/Assignments';
import StudentExams from './pages/student/Exams';
import StudentNotifications from './pages/student/Notifications';
import StudentRequests from './pages/student/Requests';
import StudentAssistant from './pages/student/Assistant';
import StudentAnalytics from './pages/student/Analytics';
import StudentFees from './pages/student/Fees';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorCourses from './pages/doctor/Courses';
import DoctorCourseDetail from './pages/doctor/CourseDetail';

import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminDoctors from './pages/admin/Doctors';
import AdminCourses from './pages/admin/Courses';
import AdminRequests from './pages/admin/Requests';
import AdminPayments from './pages/admin/Payments';
import AdminLogs from './pages/admin/Logs';

const studentLinks = [
  { to: '/student', label: '📊 Dashboard' },
  { to: '/student/courses', label: '📚 Courses' },
  { to: '/student/schedule', label: '🗓️ Schedule' },
  { to: '/student/grades', label: '🎓 Grades' },
  { to: '/student/attendance', label: '✅ Attendance' },
  { to: '/student/assignments', label: '📝 Assignments' },
  { to: '/student/exams', label: '📋 Exams' },
  { to: '/student/analytics', label: '📈 Analytics' },
  { to: '/student/assistant', label: '🤖 AI Assistant' },
  { to: '/student/requests', label: '📩 Requests' },
  { to: '/student/fees', label: '💰 Fees' },
  { to: '/student/notifications', label: '🔔 Notifications' },
];

const doctorLinks = [
  { to: '/doctor', label: '📊 Dashboard' },
  { to: '/doctor/courses', label: '📚 My Courses' },
];

const adminLinks = [
  { to: '/admin', label: '📊 Dashboard' },
  { to: '/admin/students', label: '🎓 Students' },
  { to: '/admin/doctors', label: '👨‍🏫 Doctors' },
  { to: '/admin/courses', label: '📚 Courses' },
  { to: '/admin/requests', label: '📩 Requests' },
  { to: '/admin/payments', label: '💰 Payments' },
  { to: '/admin/logs', label: '📜 Logs' },
];

function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />

      {/* Student */}
      <Route element={<Protected role="student"><Layout links={studentLinks} title="🎓 Student Portal" /></Protected>}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/schedule" element={<StudentSchedule />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />
        <Route path="/student/exams" element={<StudentExams />} />
        <Route path="/student/analytics" element={<StudentAnalytics />} />
        <Route path="/student/assistant" element={<StudentAssistant />} />
        <Route path="/student/requests" element={<StudentRequests />} />
        <Route path="/student/fees" element={<StudentFees />} />
        <Route path="/student/notifications" element={<StudentNotifications />} />
      </Route>

      {/* Doctor */}
      <Route element={<Protected role="doctor"><Layout links={doctorLinks} title="👨‍🏫 Doctor Portal" /></Protected>}>
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/courses" element={<DoctorCourses />} />
        <Route path="/doctor/courses/:id" element={<DoctorCourseDetail />} />
      </Route>

      {/* Admin */}
      <Route element={<Protected role="admin"><Layout links={adminLinks} title="👨‍💼 Admin Dashboard" /></Protected>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}