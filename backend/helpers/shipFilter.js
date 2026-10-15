/**
 * Helper untuk menentukan filter id_kapal berdasarkan role user dan query parameter / header.
 * - Jika user adalah 'superadmin', bisa memfilter via req.query.id_kapal atau req.headers['x-id-kapal'] (jika 'all' atau kosong, akan melihat seluruh kapal / null).
 * - Jika user adalah 'admin' / 'teknisi', otomatis terkunci ketat ke req.user.id_kapal.
 * - Jika bukan superadmin dan belum di-assign ke kapal manapun, return 0 agar tidak membocorkan semua data kapal.
 */
const getShipFilter = (req) => {
  if (!req.user) return null;
  const role = String(req.user.role || '').trim().toLowerCase();

  if (role === 'superadmin') {
    const rawShip = req.query?.id_kapal || req.headers?.['x-id-kapal'];
    if (rawShip && rawShip !== 'all' && rawShip !== 'null' && rawShip !== 'undefined') {
      const parsed = Number(rawShip);
      return !isNaN(parsed) && parsed > 0 ? parsed : null;
    }
    return null; // Null artinya melihat semua kapal
  }

  // Jika bukan superadmin, gunakan id_kapal milik user secara ketat
  if (req.user.id_kapal) {
    const parsed = Number(req.user.id_kapal);
    return !isNaN(parsed) && parsed > 0 ? parsed : 0;
  }

  // Jika user belum ditugaskan ke kapal manapun, return 0 (tidak ada data kapal yang bocor)
  return 0;
};

module.exports = getShipFilter;

