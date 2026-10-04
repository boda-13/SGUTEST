const prisma = require('../config/prisma');
const { toLetterGrade } = require('../utils/helpers');

exports.myCourses = async (req, res, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    const courses = await prisma.course.findMany({
      where: { doctorId: doctor.id },
      include: { _count: { select: { enrollments: true } } },
    });
    res.json(courses);
  } catch (e) { next(e); }
};

exports.courseStats = async (req, res, next) => {
  try {
    const courseId = +req.params.id;
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: { grade: true, student: true },
    });
    const publishedGrades = enrollments.filter((e) => e.grade?.isPublished);
    const avg = publishedGrades.length
      ? publishedGrades.reduce((s, e) => s + Number(e.grade.total), 0) / publishedGrades.length
      : 0;

    const totalAtt = await prisma.attendance.count({ where: { courseId } });
    const presentAtt = await prisma.attendance.count({ where: { courseId, status: { in: ['present', 'late'] } } });
    const attPct = totalAtt ? Math.round((presentAtt / totalAtt) * 100) : 0;

    res.json({
      students: enrollments.length,
      averageGrade: Math.round(avg),
      attendance: attPct,
    });
  } catch (e) { next(e); }
};

exports.courseStudents = async (req, res, next) => {
  try {
    const courseId = +req.params.id;
    const list = await prisma.enrollment.findMany({
      where: { courseId },
      include: { student: { include: { user: true } }, grade: true },
    });
    res.json(list);
  } catch (e) { next(e); }
};

exports.recordAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body; // records: [{studentId, status, note}]
    const d = new Date(date);
    const ops = records.map((r) =>
      prisma.attendance.upsert({
        where: { studentId_courseId_date: { studentId: r.studentId, courseId, date: d } },
        update: { status: r.status, note: r.note, recordedBy: req.user.id },
        create: { studentId: r.studentId, courseId, date: d, status: r.status, note: r.note, recordedBy: req.user.id },
      })
    );
    await prisma.$transaction(ops);
    res.json({ ok: true, count: records.length });
  } catch (e) { next(e); }
};

exports.enterGrade = async (req, res, next) => {
  try {
    const { enrollmentId, midterm, practical, final } = req.body;
    const total = Number(midterm || 0) + Number(practical || 0) + Number(final || 0);
    const letter = toLetterGrade(total);
    const gpaMap = { 'A+': 4.0, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7,
                     'C+': 2.3, C: 2.0, 'C-': 1.7, 'D+': 1.3, D: 1.0, F: 0.0 };

    const g = await prisma.grade.upsert({
      where: { enrollmentId },
      update: {
        midterm, practical, final, total, letterGrade: letter,
        gpaPoints: gpaMap[letter], isPublished: true, updatedBy: req.user.id,
      },
      create: {
        enrollmentId, midterm, practical, final, total, letterGrade: letter,
        gpaPoints: gpaMap[letter], isPublished: true, updatedBy: req.user.id,
      },
    });

    // notification للطالب
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { student: { include: { user: true } }, course: true },
    });
    await prisma.notification.create({
      data: {
        userId: enrollment.student.userId,
        title: 'Grade Published',
        body: `Your ${enrollment.course.name} grade is available.`,
        type: 'info',
      },
    });

    res.json(g);
  } catch (e) { next(e); }
};

exports.uploadMaterial = async (req, res, next) => {
  try {
    const { courseId, title, description, fileUrl } = req.body;
    const ann = await prisma.announcement.create({
      data: { courseId, title, body: description || '', createdBy: req.user.id },
    });
    res.status(201).json({ ...ann, fileUrl });
  } catch (e) { next(e); }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const { courseId, title, description, dueDate, maxGrade, fileUrl } = req.body;
    const a = await prisma.assignment.create({
      data: {
        courseId, title, description, fileUrl,
        dueDate: new Date(dueDate),
        maxGrade: maxGrade || 100,
        createdBy: req.user.id,
      },
    });
    res.status(201).json(a);
  } catch (e) { next(e); }
};

exports.createExam = async (req, res, next) => {
  try {
    const { courseId, title, examDate, durationMin, room, type, maxGrade } = req.body;
    const e = await prisma.exam.create({
      data: {
        courseId, title, examDate: new Date(examDate),
        durationMin, room, type, maxGrade: maxGrade || 100,
        createdBy: req.user.id,
      },
    });

    // Notify all enrolled students
    const students = await prisma.enrollment.findMany({
      where: { courseId }, include: { student: true },
    });
    await prisma.notification.createMany({
      data: students.map((s) => ({
        userId: s.student.userId,
        title: 'Exam Scheduled',
        body: `${title} starts on ${new Date(examDate).toLocaleString()}`,
        type: 'warning',
      })),
    });

    res.status(201).json(e);
  } catch (e) { next(e); }
};

exports.publishAnnouncement = async (req, res, next) => {
  try {
    const { courseId, title, body, priority } = req.body;
    const a = await prisma.announcement.create({
      data: { courseId, title, body, priority: priority || 'normal', createdBy: req.user.id },
    });
    res.status(201).json(a);
  } catch (e) { next(e); }
};