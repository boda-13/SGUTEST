const prisma = require('../config/prisma');
const { hashPassword, comparePassword, signToken } = require('../utils/helpers');

exports.register = async (req, res, next) => {
  try {
    const { email, password, fullName, role = 'student', phone } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        fullName,
        role,
        phone,
      },
    });

    // لو طالب: ينشئ سجل student
    if (role === 'student') {
      const dept = await prisma.department.findFirst();
      if (dept) {
        await prisma.student.create({
          data: {
            userId: user.id,
            studentCode: `S${Date.now()}`,
            departmentId: dept.id,
            enrollmentYear: new Date().getFullYear(),
          },
        });
      }
    }

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await comparePassword(password, user.passwordHash);
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: ok ? 'success' : 'failed',
      },
    });
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { student: { include: { department: true } }, doctor: { include: { department: true } } },
    });
    delete user.passwordHash;
    res.json(user);
  } catch (e) { next(e); }
};