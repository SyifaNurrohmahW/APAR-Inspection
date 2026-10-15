-- ===================================================
-- SCRIPT MIGRASI DATABASE: PENAMBAHAN FITUR PER-KAPAL
-- Eksekusi script ini di Query Editor (Railway / MySQL workbench / DBeaver)
-- ===================================================

-- 1. Buat Tabel Master Kapal (ms_kapal)
CREATE TABLE IF NOT EXISTS ms_kapal (
  id_kapal INT AUTO_INCREMENT PRIMARY KEY,
  nama_kapal VARCHAR(150) NOT NULL,
  kode_kapal VARCHAR(50) NOT NULL UNIQUE,
  keterangan TEXT,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tambahkan Data Kapal Default Pertama (KM Kelud) jika belum ada data
INSERT IGNORE INTO ms_kapal (id_kapal, nama_kapal, kode_kapal, keterangan, status, created_at, updated_at)
VALUES (1, 'KM Kelud', 'KPL-001', 'Kapal Utama Default', 'aktif', NOW(), NOW());

-- 3. Tambahkan Kolom id_kapal pada Tabel ms_users (Penugasan Admin ke Kapal)
ALTER TABLE ms_users 
ADD COLUMN id_kapal INT NULL DEFAULT NULL AFTER id_users;

-- 4. Tambahkan Kolom id_kapal pada Tabel ms_lokasi (Lokasi Deck per Kapal)
ALTER TABLE ms_lokasi 
ADD COLUMN id_kapal INT NULL DEFAULT NULL AFTER id_lokasi;

-- 5. Tambahkan Kolom id_kapal pada Tabel ms_apar (Data APAR per Kapal)
ALTER TABLE ms_apar 
ADD COLUMN id_kapal INT NULL DEFAULT NULL AFTER id_apar;

-- 6. (Opsional) Update Data Lama yang sudah ada agar terhubung ke Kapal Default (ID = 1)
UPDATE ms_lokasi SET id_kapal = 1 WHERE id_kapal IS NULL;
UPDATE ms_apar SET id_kapal = 1 WHERE id_kapal IS NULL;
