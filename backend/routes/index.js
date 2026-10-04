const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');

const auth = require('../controllers/auth.controller');
const student = require('../controllers/student.controller');
const doctor = require('../controllers/doctor.controller');
const admin = require('../controllers/admin.controller');
const smart = require('../controllers/smart.controller');

// ===== AUTH =====
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authenticate, auth.me);

// ===== STUDENT =====
const stu = require('express').Router();
stu.use(authenticate, authorize('student'));
stu.get('/dashboard', student.dashboard);
stu.get('/courses', student.myCourses);
stu.get('/grades', student.myGrades);
stu.get('/schedule', student.mySchedule);
stu.get('/attendance', student.myAttendance);
stu.get('/assignments', student.myAssignments);
stu.post('/assignments/:assignmentId/submit', student.submitAssignment);
stu.get('/exams', student.myExams);
stu.get('/notifications', student.myNotifications);
stu.patch('/notifications/:id/read', student.markNotificationRead);
stu.get('/requests', student.myRequests);
stu.post('/requests', student.createRequest);
stu.get('/fees', student.myFees);
stu.post('/assistant/ask', smart.ask);
stu.get('/analytics', smart.analytics);
router.use('/student', stu);

// ===== DOCTOR =====
const doc = require('express').Router();
doc.use(authenticate, authorize('doctor'));
doc.get('/courses', doctor.myCourses);
doc.get('/courses/:id/stats', doctor.courseStats);
doc.get('/courses/:id/students', doctor.courseStudents);
doc.post('/attendance', doctor.recordAttendance);
doc.post('/grades', doctor.enterGrade);
doc.post('/materials', doctor.uploadMaterial);
doc.post('/assignments', doctor.createAssignment);
doc.post('/exams', doctor.createExam);
doc.post('/announcements', doctor.publishAnnouncement);
router.use('/doctor', doc);

// ===== ADMIN =====
const adm = require('express').Router();
adm.use(authenticate, authorize('admin'));
adm.get('/stats', admin.stats);
adm.get('/students', admin.listStudents);
adm.post('/students', admin.createStudent);
adm.patch('/students/:id', admin.updateStudent);
adm.delete('/students/:id', admin.deleteStudent);
adm.get('/faculties', admin.listFaculties);
adm.post('/faculties', admin.createFaculty);
adm.post('/departments', admin.createDepartment);
adm.get('/doctors', admin.listDoctors);
adm.post('/doctors', admin.createDoctor);
adm.get('/courses', admin.listCourses);
adm.post('/courses', admin.createCourse);
adm.patch('/courses/:id', admin.updateCourse);
adm.delete('/courses/:id', admin.deleteCourse);
adm.get('/requests', admin.listRequests);
adm.patch('/requests/:id', admin.updateRequestStatus);
adm.get('/payments', admin.listPayments);
adm.post('/payments', admin.createPayment);
adm.patch('/payments/:id/paid', admin.markPaymentPaid);
adm.get('/logs', admin.listLogs);
adm.get('/login-history', admin.listLoginHistory);
router.use('/admin', adm);

module.exports = router;