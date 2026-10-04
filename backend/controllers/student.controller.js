const prisma = require('../config/prisma');
const { calcGPA } = require('../utils/helpers');

exports.dashboard = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: { department: true },
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: { course: true, grade: true },
    });

    const totalCredits = enrollments
      .filter((e) => e.status === 'passed')
      .reduce((s, e) => s + e.course.creditHours, 0);

    const grades = enrollments.filter((e) => e.grade && e.grade.isPublished);
    const gpa = calcGPA(grades.map((e) => ({ letterGrade: e.grade.letterGrade, enrollment: e })));

    // attendance %
    const total = await prisma.attendance.count({ where: { studentId: student.id } });
    const present = await prisma.attendance.count({ where: { studentId: student.id, status: { in: ['present', 'late'] } } });
    const attendancePct = total ? Math.round((present / total) * 100) : 0;

    // today's classes
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const schedules = await prisma.schedule.findMany({
      where: { courseId: { in: enrollments.map((e) => e.courseId) }, dayOfWeek: today },
      include: { course: true },
      orderBy: { startTime: 'asc' },
    });

    res.json({
      student: { fullName: req.user.fullName, level: student.level, department: student.department.name },
      gpa, attendancePct, completedCredits: totalCredits,
      todayClasses: schedules.map((s) => ({
        time: s.startTime, course: s.course.name, room: s.room, type: s.type,
      })),
    });
  } catch (e) { next(e); }
};

exports.myCourses = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const courses = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: { course: { include: { doctor: { include: { user: true } } } }, grade: true },
    });
    res.json(courses);
  } catch (e) { next(e); }
};

exports.myGrades = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const grades = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: { course: true, grade: true },
    });
    res.json(grades.filter((e) => e.grade && e.grade.isPublished));
  } catch (e) { next(e); }
};

exports.mySchedule = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const courseIds = (await prisma.enrollment.findMany({
      where: { studentId: student.id }, select: { courseId: true },
    })).map((e) => e.courseId);

    const schedule = await prisma.schedule.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    res.json(schedule);
  } catch (e) { next(e); }
};

exports.myAttendance = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const records = await prisma.attendance.findMany({
      where: { studentId: student.id },
      include: { course: true },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (e) { next(e); }
};

exports.myAssignments = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const courseIds = (await prisma.enrollment.findMany({
      where: { studentId: student.id }, select: { courseId: true },
    })).map((e) => e.courseId);

    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: true,
        submissions: { where: { studentId: student.id } },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(assignments);
  } catch (e) { next(e); }
};

exports.submitAssignment = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const { assignmentId } = req.params;
    const { fileUrl } = req.body;
    const sub = await prisma.submission.upsert({
      where: { assignmentId_studentId: { assignmentId: +assignmentId, studentId: student.id } },
      update: { fileUrl, submittedAt: new Date() },
      create: { assignmentId: +assignmentId, studentId: student.id, fileUrl },
    });
    res.json(sub);
  } catch (e) { next(e); }
};

exports.myExams = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const courseIds = (await prisma.enrollment.findMany({
      where: { studentId: student.id }, select: { courseId: true },
    })).map((e) => e.courseId);

    const exams = await prisma.exam.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: true },
      orderBy: { examDate: 'asc' },
    });
    res.json(exams);
  } catch (e) { next(e); }
};

exports.myNotifications = async (req, res, next) => {
  try {
    const list = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(list);
  } catch (e) { next(e); }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: +req.params.id },
      data: { isRead: true },
    });
    res.json({ ok: true });
  } catch (e) { next(e); }
};

exports.myRequests = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const list = await prisma.request.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (e) { next(e); }
};

exports.createRequest = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const reqDoc = await prisma.request.create({
      data: { studentId: student.id, type: req.body.type, description: req.body.description },
    });
    res.status(201).json(reqDoc);
  } catch (e) { next(e); }
};

exports.myFees = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const list = await prisma.payment.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (e) { next(e); }
};