require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 7000;


app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Id-Kapal',
    'x-id-kapal',
    'Accept'
  ]
}));
app.use(express.json());

// login route
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Kapal routes
const kapalRoutes = require('./routes/kapal');
app.use('/api/kapal', kapalRoutes);

// Data APAR routes
const dataAparRoutes = require('./routes/dataApar');
app.use('/api/data-apar', dataAparRoutes);

// Lokasi routes
const lokasiRoutes = require('./routes/lokasi');
app.use('/api/lokasi', lokasiRoutes);

// Inspeksi routes
const inspeksiRoutes = require('./routes/inspeksi');
app.use('/api/inspeksi', inspeksiRoutes);

// Pengisian Ulang routes
const pengisianUlangRoutes = require('./routes/pengisianUlang');
app.use('/api/pengisian-ulang', pengisianUlangRoutes);

// Riwayat routes
const riwayatRoutes = require('./routes/riwayat');
app.use('/api/riwayat', riwayatRoutes);

// Notifikasi routes
const notifikasiRoutes = require('./routes/notifikasi');
app.use('/api/notifikasi', notifikasiRoutes);

// WhatsApp service routes
const whatsappRoutes = require('./routes/whatsapp');
app.use('/api/whatsapp', whatsappRoutes);

// Data Pengguna routes
const dataPenggunaRoutes = require('./routes/dataPengguna');
app.use('/api/data-pengguna', dataPenggunaRoutes);

// Master Jenis Bahan routes
const jenisBahanRoutes = require('./routes/jenisBahan');
app.use('/api/jenis-bahan', jenisBahanRoutes);

// Profile routes
const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

// Init DB Tables if needed
const KapalModel = require('./models/kapal');
const DataPenggunaModel = require('./models/dataPengguna');
const LokasiModel = require('./models/lokasi');
const DataAparModel = require('./models/dataApar');
const JenisBahanModel = require('./models/jenisBahan');
const InspeksiModel = require('./models/inspeksi');

KapalModel.initTable();
DataPenggunaModel.initTable();
LokasiModel.initTable();
DataAparModel.initTable();
JenisBahanModel.initTable();
InspeksiModel.initTable();

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend listening on 0.0.0.0:${port}`);
  });
}

module.exports = app;
