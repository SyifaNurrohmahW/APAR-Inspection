require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 7000;


app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:7000',
    'http://localhost:7001',
    'http://localhost:8080'
  ],
  credentials: true
}));
app.use(express.json());

//login route
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

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
const JenisBahanModel = require('./models/jenisBahan');
JenisBahanModel.initTable();

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}


module.exports = app;
