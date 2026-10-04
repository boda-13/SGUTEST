const prisma = require('../config/prisma');
const { calcGPA } = require('../utils/helpers');

/**
 * Smart Academic Assistant — rule-based NLP للأسئلة الشائعة
 */
exports.ask = async (req, res, next) => {
  try {
    const q = (req.body.question || '').toLowerCase().trim();
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ answer: 'Student profile not found.' });

    // 1. GPA
    if (q.includes('gpa')) {
      const enrolls = await prisma.enrollment.findMany({
        where: { studentId: student.id },
        include: { course: true, grade: true },
      });
      const published = enrolls.filter((e) => e.grade?.isPublished);
      const gpa = calcGPA(published.map((e) => ({ letterGrade: e.grade.letterGrade, enrollment: e })));
      return res.json({ answer: `Your current GPA is ${gpa}. 🎓` });
    }

    // 2. Tomorrow classes
    if (q.includes('tomorrow') || q.includes('classes')) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = q.includes('tomorrow') ? days[(new Date().getDay() + 1) % 7] : days[new Date().getDay()];

      const courseIds = (await prisma.enrollment.findMany({
        where: { studentId: student.id }, select: { courseId: true },
      })).map((e) => e.courseId);

      const classes = await prisma.schedule.findMany({
        where: { courseId: { in: courseIds }, dayOfWeek: targetDay },
        include: { course: true },
        orderBy: { startTime: 'asc' },
      });

      if (!classes.length) return res.json({ answer: `You have no classes on ${targetDay}. 🎉` });
      const list = classes.map((c) => `• ${c.startTime} — ${c.course.name} (${c.room || 'TBA'})`).join('\n');
      return res.json({ answer: `Your ${targetDay} classes:\n${list}` });
    }

    // 3. Failing subjects
    if (q.includes('fail') || q.includes('weak') || q.includes('low')) {
      const enrolls = await prisma.enrollment.findMany({
        where: { studentId: student.id },
        include: { course: true, grade: true },
      });
      const weak = enrolls.filter((e) => e.grade?.isPublished && Number(e.grade.total) < 60);
      if (!weak.length) return res.json({ answer: 'Great news! You are not failing any subject. 💪' });
      const list = weak.map((e) => `• ${e.course.name}: ${e.grade.total}%`).join('\n');
      return res.json({ answer: `Subjects you are currently failing:\n${list}` });
    }

    // 4. Attendance
    if (q.includes('attendance')) {
      const total = await prisma.attendance.count({ where: { studentId: student.id } });
      const present = await prisma.attendance.count({
        where: { studentId: student.id, status: { in: ['present', 'late'] } },
      });
      const pct = total ? Math.round((present / total) * 100) : 0;
      return res.json({ answer: `Your overall attendance is ${pct}%. 📅` });
    }

    // 5. Fees
    if (q.includes('fee') || q.includes('payment') || q.includes('tuition')) {
      const pending = await prisma.payment.aggregate({
        where: { studentId: student.id, status: { in: ['pending', 'overdue'] } },
        _sum: { amount: true },
      });
      const amount = pending._sum.amount || 0;
      return res.json({
        answer: amount > 0
          ? `You have outstanding fees of ${amount} EGP. 💰`
          : 'You have no outstanding fees. ✅',
      });
    }

    // 6. Fallback
    return res.json({
      answer: "I can help you with: GPA, tomorrow's classes, failing subjects, attendance, and fees. Try asking 'What is my GPA?'",
    });
  } catch (e) { next(e); }
};

/**
 * Academic Analytics — returns performance per course
 */
exports.analytics = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    const enrolls = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: { course: true, grade: true },
    });

    const data = enrolls
      .filter((e) => e.grade?.isPublished)
      .map((e) => ({
        course: e.course.name,
        percent: Number(e.grade.total),
        letter: e.grade.letterGrade,
      }));

    const alerts = data
      .filter((d) => d.percent < 70)
      .map((d) => `⚠️ Your performance in ${d.course} is at ${d.percent}%.`);

    res.json({ data, alerts });
  } catch (e) { next(e); }
};