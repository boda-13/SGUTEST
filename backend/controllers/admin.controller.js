const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/helpers');

// ============ STUDENTS ============
exports.listStudents = async (req, res, next) => {
  try {
    const { search, departmentId, level } = req.query;
    const where = {};
    if (departmentId) where.departmentId = +departmentId;
    if (level) where.level = +level;
    if (search) {
      where.OR = [
        { studentCode: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }
    const list = await prisma.student.findMany({
      where,
      include: { user: true, department: true },
      orderBy: { id: 'desc' },
    });
    res.json(list);
  } catch (e) { next(e); }
};

exports.createStudent = async (req, res, next) => {
  try {
    const { email, password, fullName, phone, studentCode, departmentId, level, enrollmentYear } = req.body;
    const user = await prisma.user.create({
      data: {
        email, passwordHash: await hashPassword(password), fullName, phone, role: 'student',
      },
    });
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentCode: studentCode || `S${Date.now()}`,
        departmentId: +departmentId,
        level: +level || 1,
        enrollmentYear: +enrollmentYear || new Date().getFullYear(),
      },
    });
    res.status(201).json({ user, student });
  } catch (e) { next(e); }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, level, departmentId, status } = req.body;
    const student = await prisma.student.update({
      where: { id: +id },
      data: {
        level: level ? +level : undefined,
        departmentId: departmentId ? +departmentId : undefined,
        status,
        user: fullName || phone ? { update: { fullName, phone } } : undefined,
      },
      include: { user: true },
    });
    res.json(student);
  } catch (e) { next(e); }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id: +id } });
    await prisma.user.delete({ where: { id: student.userId } });
    res.json({ ok: true });
  } catch (e) { next(e); }
};

// ============ FACULTY / DEPARTMENTS ============
exports.listFaculties = async (req, res, next) => {
  try {
    const list = await prisma.faculty.findMany({ include: { departments: true } });
    res.json(list);
  } catch (e) { next(e); }
};

exports.createFaculty = async (req, res, next) => {
  try {
    const f = await prisma.faculty.create({ data: req.body });
    res.status(201).json(f);
  } catch (e) { next(e); }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const d = await prisma.department.create({ data: req.body });
    res.status(201).json(d);
  } catch (e) { next(e); }
};

// ============ DOCTORS ============
exports.listDoctors = async (req, res, next) => {
  try {
    const list = await prisma.doctor.findMany({
      include: { user: true, department: true },
      orderBy: { id: 'desc' },
    });
    res.json(list);
  } catch (e) { next(e); }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const { email, password, fullName, phone, doctorCode, departmentId, title, officeRoom } = req.body;
    const user = await prisma.user.create({
      data: { email, passwordHash: await hashPassword(password), fullName, phone, role: 'doctor' },
    });
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        doctorCode: doctorCode || `D${Date.now()}`,
        departmentId: +departmentId,
        title: title || 'Lecturer',
        officeRoom,
      },
    });
    res.status(201).json({ user, doctor });
  } catch (e) { next(e); }
};

// ============ COURSES ============
exports.listCourses = async (req, res, next) => {
  try {
    const list = await prisma.course.findMany({
      include: { department: true, doctor: { include: { user: true } }, _count: { select: { enrollments: true } } },
    });
    res.json(list);
  } catch (e) { next(e); }
};

exports.createCourse = async (req, res, next) => {
  try {
    const c = await prisma.course.create({ data: req.body });
    res.status(201).json(c);
  } catch (e) { next(e); }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const c = await prisma.course.update({ where: { id: +req.params.id }, data: req.body });
    res.json(c);
  } catch (e) { next(e); }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    await prisma.course.delete({ where: { id: +req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
};

// ============ REQUESTS ============
exports.listRequests = async (req, res, next) => {
  try {
    const list = await prisma.request.findMany({
      include: { student: { include: { user: true } }, handler: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (e) { next(e); }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, responseNote } = req.body;
    const r = await prisma.request.update({
      where: { id: +req.params.id },
      data: { status, responseNote, handledBy: req.user.id },
    });

    await prisma.notification.create({
      data: {
        userId: (await prisma.student.findUnique({ where: { id: r.studentId } })).userId,
        title: 'Request Update',
        body: `Your request is now: ${status}`,
        type: status === 'approved' || status === 'ready' ? 'success' : 'info',
      },
    });

    res.json(r);
  } catch (e) { next(e); }
};

// ============ PAYMENTS ============
exports.listPayments = async (req, res, next) => {
  try {
    const list = await prisma.payment.findMany({
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (e) { next(e); }
};

exports.createPayment = async (req, res, next) => {
  try {
    const p = await prisma.payment.create({
      data: { ...req.body, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null },
    });
    res.status(201).json(p);
  } catch (e) { next(e); }
};

exports.markPaymentPaid = async (req, res, next) => {
  try {
    const p = await prisma.payment.update({
      where: { id: +req.params.id },
      data: { status: 'paid', paidAt: new Date() },
    });
    res.json(p);
  } catch (e) { next(e); }
};

// ============ SYSTEM ============
exports.listLogs = async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { user: true }, orderBy: { createdAt: 'desc' }, take: 200,
    });
    res.json(logs);
  } catch (e) { next(e); }
};

exports.listLoginHistory = async (req, res, next) => {
  try {
    const list = await prisma.loginHistory.findMany({
      include: { user: true }, orderBy: { createdAt: 'desc' }, take: 200,
    });
    res.json(list);
  } catch (e) { next(e); }
};

exports.stats = async (req, res, next) => {
  try {
    const [students, doctors, courses, requests, payments] = await Promise.all([
      prisma.student.count(),
      prisma.doctor.count(),
      prisma.course.count(),
      prisma.request.count({ where: { status: 'pending' } }),
      prisma.payment.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
    ]);
    res.json({
      students, doctors, courses,
      pendingRequests: requests,
      totalRevenue: payments._sum.amount || 0,
    });
  } catch (e) { next(e); }
};