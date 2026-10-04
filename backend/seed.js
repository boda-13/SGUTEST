require('dotenv').config();
const prisma = require('./src/config/prisma');
const { hashPassword } = require('./src/utils/helpers');

async function main() {
  console.log('🌱 Seeding...');

  // Clean (فقط في dev)
  await prisma.activityLog.deleteMany();
  await prisma.loginHistory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.request.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();

  const pwd = await hashPassword('password123');

  // Admin
  const admin = await prisma.user.create({
    data: { email: 'admin@uni.edu', passwordHash: pwd, fullName: 'System Admin', role: 'admin' },
  });

  // Faculty + Department
  const faculty = await prisma.faculty.create({
    data: { name: 'Faculty of Computers & AI', code: 'FCAI' },
  });
  const dept = await prisma.department.create({
    data: { facultyId: faculty.id, name: 'Computer Science', code: 'CS' },
  });

  // Doctor
  const doctorUser = await prisma.user.create({
    data: { email: 'doctor@uni.edu', passwordHash: pwd, fullName: 'Dr. Ahmed Hassan', role: 'doctor' },
  });
  const doctor = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      doctorCode: 'D001',
      departmentId: dept.id,
      title: 'Professor',
      officeRoom: 'B201',
    },
  });

  // Student
  const studentUser = await prisma.user.create({
    data: { email: 'student@uni.edu', passwordHash: pwd, fullName: 'Abdallah Mohamed', role: 'student' },
  });
  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      studentCode: 'S001',
      departmentId: dept.id,
      level: 3,
      semester: 1,
      enrollmentYear: 2023,
    },
  });

  // Course
  const course = await prisma.course.create({
    data: {
      code: 'CS301',
      name: 'Database Systems',
      description: 'Introduction to DBMS',
      departmentId: dept.id,
      doctorId: doctor.id,
      level: 3,
      semester: 1,
      creditHours: 3,
    },
  });

  // Schedule
  await prisma.schedule.createMany({
    data: [
      { courseId: course.id, dayOfWeek: 'Sunday', startTime: '10:00', endTime: '12:00', room: 'B204', type: 'lecture' },
      { courseId: course.id, dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '12:00', room: 'Lab 3', type: 'lab' },
    ],
  });

  // Enrollment + Grade
  const enrollment = await prisma.enrollment.create({
    data: { studentId: student.id, courseId: course.id, academicYear: '2025-2026', semester: 1 },
  });
  await prisma.grade.create({
    data: {
      enrollmentId: enrollment.id,
      midterm: 25, practical: 20, final: 40, total: 85,
      letterGrade: 'A-', gpaPoints: 3.7, isPublished: true, updatedBy: doctorUser.id,
    },
  });

  // Attendance
  await prisma.attendance.createMany({
    data: [
      { studentId: student.id, courseId: course.id, date: new Date('2025-10-01'), status: 'present', recordedBy: doctorUser.id },
      { studentId: student.id, courseId: course.id, date: new Date('2025-10-03'), status: 'present', recordedBy: doctorUser.id },
      { studentId: student.id, courseId: course.id, date: new Date('2025-10-05'), status: 'absent', recordedBy: doctorUser.id },
    ],
  });

  // Assignment
  await prisma.assignment.create({
    data: {
      courseId: course.id,
      title: 'ER Diagram Design',
      description: 'Design an ER diagram for a library system.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: doctorUser.id,
    },
  });

  // Exam
  await prisma.exam.create({
    data: {
      courseId: course.id,
      title: 'Database Midterm',
      examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      durationMin: 90,
      room: 'Hall A',
      type: 'midterm',
      createdBy: doctorUser.id,
    },
  });

  // Notification
  await prisma.notification.create({
    data: { userId: studentUser.id, title: 'Welcome!', body: 'Welcome to the portal 🎉', type: 'success' },
  });

  // Payment
  await prisma.payment.create({
    data: { studentId: student.id, amount: 5000, type: 'tuition', status: 'pending', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });

  console.log('✅ Seeded');
  console.log('Admin:    admin@uni.edu / password123');
  console.log('Doctor:   doctor@uni.edu / password123');
  console.log('Student:  student@uni.edu / password123');
}

main().finally(() => prisma.$disconnect());