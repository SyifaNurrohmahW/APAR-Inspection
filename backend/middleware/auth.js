const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Token tidak ditemukan'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Format token tidak valid'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token tidak valid atau sudah expired'
    });
  }
};

exports.isSuperadmin = (req, res, next) => {
  const role = String(req.user?.role || '').trim().toLowerCase();

  if (role !== 'superadmin') {
    return res.status(403).json({
      message: 'Akses hanya untuk superadmin'
    });
  }

  next();
};

exports.isAdminOrSuperadmin = (req, res, next) => {
  const role = String(req.user?.role || '').trim().toLowerCase();
  const allowedRoles = ['superadmin', 'admin', 'teknisi', 'petugas', 'user', ''];

  if (role && !allowedRoles.includes(role)) {
    return res.status(403).json({
      message: 'Akses hanya untuk pengguna terdaftar (admin, superadmin, atau teknisi)'
    });
  }

  next();
};
