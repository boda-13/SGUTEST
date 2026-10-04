const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.hashPassword = (pwd) => bcrypt.hash(pwd, 10);
exports.comparePassword = (pwd, hash) => bcrypt.compare(pwd, hash);

exports.signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.calcGPA = (grades) => {
  const map = { 'A+': 4.0, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7,
                'C+': 2.3, C: 2.0, 'C-': 1.7, 'D+': 1.3, D: 1.0, F: 0.0 };
  if (!grades.length) return 0;
  let totalPoints = 0, totalCredits = 0;
  for (const g of grades) {
    const pts = map[g.letterGrade] ?? 0;
    totalPoints += pts * g.enrollment.course.creditHours;
    totalCredits += g.enrollment.course.creditHours;
  }
  return totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0;
};

exports.toLetterGrade = (total) => {
  if (total >= 95) return 'A+';
  if (total >= 90) return 'A';
  if (total >= 85) return 'A-';
  if (total >= 80) return 'B+';
  if (total >= 75) return 'B';
  if (total >= 70) return 'B-';
  if (total >= 65) return 'C+';
  if (total >= 60) return 'C';
  if (total >= 55) return 'C-';
  if (total >= 50) return 'D';
  return 'F';
};