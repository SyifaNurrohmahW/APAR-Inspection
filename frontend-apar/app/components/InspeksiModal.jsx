'use client';

import { useEffect, useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  CameraOff
} from 'lucide-react';
import { getAllDataApar } from '@/services/dataAparService';

const emptyForm = {
  id_apar: '',
  tanggal_inspeksi: '',
  kondisi_tekanan: '',
  hasil: '',
  catatan: '',
  foto: ''
};

const getInitialForm = (initialData) => {
  if (!initialData) {
    return emptyForm;
  }

  return {
    id_apar: String(initialData.id_apar || ''),
    tanggal_inspeksi: initialData.tanggal_inspeksi
      ? String(initialData.tanggal_inspeksi).slice(0, 16)
      : '',
    kondisi_tekanan: initialData.kondisi_tekanan || '',
    hasil: initialData.hasil || '',
    catatan: initialData.catatan || '',
    foto: initialData.foto || ''
  };
};

export default function InspeksiModal({
  isOpen,
  onClose,
  onSubmit,
  loadingSubmit = false,
  initialData = null
}) {
  const [aparList, setAparList] = useState([]);
  const [form, setForm] = useState(() => getInitialForm(initialData));
  const [fotoError, setFotoError] = useState('');

  // State untuk mode kamera webcam live
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraErrMessage, setCameraErrMessage] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const kondisiTekananOptions = ['Normal', 'Rendah', 'Tinggi'];
  const hasilOptions = ['Baik', 'Perlu Perhatian', 'Tidak Layak'];

  const resetForm = () => {
    setForm(getInitialForm(null));
    setFotoError('');
    stopCameraStream();
  };

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
    setCameraErrMessage('');
  };

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      return;
    }

    let isMounted = true;

    const loadApar = async () => {
      try {
        const data = await getAllDataApar();
        if (isMounted) {
          setAparList(data);
        }
      } catch (error) {
        alert(error.message);
      }
    };

    loadApar();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      setForm(getInitialForm(initialData));
      setFotoError('');
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen, initialData]);

  // Fungsi kompresi gambar menggunakan Canvas
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFotoError('File yang dipilih harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64Data = canvas.toDataURL('image/jpeg', 0.82);
        setForm((prev) => ({ ...prev, foto: base64Data }));
        setFotoError('');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Mulai streaming kamera live
  const startLiveCamera = async () => {
    setCameraErrMessage('');
    setCameraLoading(true);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung penangkapan kamera langsung.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraLoading(false);
    } catch (err) {
      console.warn('Gagal akses webcam langsung, fallback ke input kamera bawaan HP:', err);
      stopCameraStream();
      // Fallback ke trigger file input capture camera jika live stream ditolak/tidak tersedia
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  // Tangkap foto dari streaming video webcam
  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Data = canvas.toDataURL('image/jpeg', 0.82);
    setForm((prev) => ({ ...prev, foto: base64Data }));
    setFotoError('');
    stopCameraStream();
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, foto: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    if (!form.id_apar || !form.tanggal_inspeksi || !form.kondisi_tekanan || !form.hasil) {
      alert('Mohon lengkapi semua isian wajib: APAR, Tanggal Inspeksi, Kondisi Tekanan, dan Hasil.');
      hasError = true;
    }

    if (!form.foto) {
      setFotoError('Foto bukti inspeksi wajib diisi! Silakan upload file atau ambil foto dari kamera.');
      hasError = true;
    }

    if (hasError) return;

    await onSubmit({
      id_apar: form.id_apar,
      tanggal_inspeksi: form.tanggal_inspeksi,
      kondisi_tekanan: form.kondisi_tekanan,
      hasil: form.hasil,
      catatan: form.catatan,
      foto: form.foto
    });

    resetForm();
  };

  if (!isOpen) return null;

  const inputClass =
    'h-11 w-full rounded-xl border border-[#eadfdb] bg-white px-4 text-sm font-semibold text-[#151211] outline-none transition placeholder:text-[#8f817d] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]';
  const labelClass = 'mb-2 block text-sm font-bold text-[#151211]';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto backdrop-blur-xs">
      <div className="my-8 w-full max-w-[620px] rounded-3xl bg-white p-6 md:p-8 text-[#151211] shadow-2xl transition-all">
        {/* Header Modal */}
        <div className="mb-6 flex items-start justify-between border-b border-[#f0e8e4] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1f1b1a]">
              {initialData ? 'Edit Data Inspeksi' : 'Tambah Data Inspeksi'}
            </h2>
            <p className="mt-1 text-sm text-[#6f625f]">
              Isi detail inspeksi APAR dan sertakan foto bukti pengecekan fisik.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-[#6f625f] transition hover:bg-[#f5eeee] hover:text-[#e95345]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Input APAR & Tanggal */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  APAR <span className="text-[#e95345]">*</span>
                </label>
                <select
                  name="id_apar"
                  value={form.id_apar}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Pilih APAR</option>
                  {aparList.map((item) => (
                    <option key={item.id_apar} value={item.id_apar}>
                      {item.kode_apar}
                      {item.lokasi ? ` - ${item.lokasi}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Tanggal Inspeksi <span className="text-[#e95345]">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="tanggal_inspeksi"
                  value={form.tanggal_inspeksi}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Input Tekanan & Hasil */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Kondisi Tekanan <span className="text-[#e95345]">*</span>
                </label>
                <select
                  name="kondisi_tekanan"
                  value={form.kondisi_tekanan}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Pilih kondisi</option>
                  {kondisiTekananOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Hasil Pengecekan <span className="text-[#e95345]">*</span>
                </label>
                <select
                  name="hasil"
                  value={form.hasil}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Pilih hasil</option>
                  {hasilOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECTION UPLOAD / AMBIL FOTO GABUNGAN */}
            <div className="rounded-2xl border border-[#eadfdb] bg-[#faf8f7] p-4.5">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold text-[#151211] flex items-center gap-1.5">
                  <ImageIcon size={18} className="text-[#e95345]" />
                  Foto Bukti Inspeksi <span className="text-[#e95345]">* (Wajib)</span>
                </label>

                {form.foto && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00a862] bg-[#e7f8ef] px-2.5 py-1 rounded-full border border-[#00a862]/20">
                    <CheckCircle2 size={13} /> Foto Terlampir
                  </span>
                )}
              </div>

              {/* Hidden Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Mode Live Camera Preview */}
              {isCameraActive ? (
                <div className="relative overflow-hidden rounded-xl border border-[#eadfdb] bg-black text-white shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-56 object-cover"
                  />

                  {cameraLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-sm">
                      <RefreshCw size={24} className="animate-spin text-[#e95345] mb-2" />
                      Memuat Kamera...
                    </div>
                  )}

                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-black/60 backdrop-blur-md p-2 rounded-xl">
                    <button
                      type="button"
                      onClick={stopCameraStream}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition"
                    >
                      <CameraOff size={14} /> Batal
                    </button>

                    <button
                      type="button"
                      onClick={captureFromVideo}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#e95345] hover:bg-[#d9473a] px-4 py-2 rounded-lg shadow-md transition"
                    >
                      <Camera size={16} /> Ambil Foto Sekarang
                    </button>
                  </div>
                </div>
              ) : form.foto ? (
                /* Mode Preview Gambar Terlampir */
                <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-[#eadfdb] bg-white p-3 shadow-xs">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-[#eadfdb] bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.foto}
                      alt="Preview Inspeksi"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs font-bold text-[#151211]">Bukti Inspeksi Terpasang</p>
                    <p className="mt-0.5 text-xs text-[#6f625f]">
                      Gambar siap dikirim sebagai dokumentasi bukti pengecekan fisik.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#eadfdb] bg-white px-3 py-1.5 text-xs font-bold text-[#1f1b1a] shadow-2xs transition hover:bg-[#fff5f3] hover:text-[#e95345]"
                      >
                        <Upload size={14} /> Ganti File
                      </button>

                      <button
                        type="button"
                        onClick={startLiveCamera}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#eadfdb] bg-white px-3 py-1.5 text-xs font-bold text-[#1f1b1a] shadow-2xs transition hover:bg-[#fff5f3] hover:text-[#e95345]"
                      >
                        <Camera size={14} /> Ambil Ulang Kamera
                      </button>

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#fee9e6] px-3 py-1.5 text-xs font-bold text-[#e95345] transition hover:bg-[#fbd8d4]"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode Opsi Upload & Kamera */
                <div
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                    fotoError
                      ? 'border-[#e95345] bg-[#fff5f3]'
                      : 'border-[#dfd6d2] bg-white hover:border-[#e95345]/50'
                  }`}
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#fef2f1] text-[#e95345]">
                    <Camera size={24} />
                  </div>

                  <p className="text-sm font-bold text-[#151211]">
                    Unggah atau Ambil Foto Bukti APAR
                  </p>
                  <p className="mt-1 text-xs text-[#6f625f] max-w-sm">
                    Ambil foto langsung dari kamera HP/laptop saat inspeksi berlangsung, atau pilih file foto dari galeri.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#eadfdb] bg-white px-4 py-2.5 text-xs font-bold text-[#1f1b1a] shadow-sm transition hover:border-[#e95345] hover:text-[#e95345]"
                    >
                      <Upload size={15} /> Upload dari File
                    </button>

                    <button
                      type="button"
                      onClick={startLiveCamera}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#e95345] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#d9473a]"
                    >
                      <Camera size={15} /> Ambil Foto Kamera
                    </button>
                  </div>
                </div>
              )}

              {/* Pesan Kesalahan Validasi Foto */}
              {fotoError && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#e95345]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{fotoError}</span>
                </div>
              )}
            </div>

            {/* Input Catatan */}
            <div>
              <label className={labelClass}>Catatan Inspeksi</label>
              <textarea
                name="catatan"
                value={form.catatan}
                onChange={handleChange}
                placeholder="Contoh: Tekanan aman, kondisi fisik baik, segel pengaman terpasang rapi"
                rows={3}
                className="w-full resize-none rounded-xl border border-[#eadfdb] bg-white px-4 py-3 text-sm font-semibold text-[#151211] outline-none transition placeholder:text-[#8f817d] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end gap-3 border-t border-[#f0e8e4] pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-[#eadfdb] bg-white px-5 py-3 text-sm font-bold text-[#1f1b1a] transition hover:bg-[#fbf7f5]"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loadingSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e95345] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d9473a] disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
            >
              {loadingSubmit && <RefreshCw size={16} className="animate-spin" />}
              {loadingSubmit
                ? 'Menyimpan...'
                : initialData
                  ? 'Simpan Perubahan'
                  : 'Tambah Inspeksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
