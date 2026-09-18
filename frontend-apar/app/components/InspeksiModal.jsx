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
  CameraOff,
  SwitchCamera,
  FileCheck
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

  // State untuk mode kamera webcam/live stream
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (kamera belakang) atau 'user' (kamera depan)
  const [isDragging, setIsDragging] = useState(false);

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

  // Drag and Drop Handler
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Mulai streaming kamera live
  const startLiveCamera = async (overrideFacingMode) => {
    const targetFacing = overrideFacingMode || facingMode;
    stopCameraStream();
    setCameraLoading(true);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung kamera langsung.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: targetFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraLoading(false);
    } catch (err) {
      console.warn('Gagal akses live camera, fallback ke input kamera HP:', err);
      stopCameraStream();
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const toggleCameraFacing = () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    startLiveCamera(newFacing);
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
    'h-11 w-full rounded-xl border border-[#eadfdb] bg-white px-3.5 sm:px-4 text-sm font-semibold text-[#151211] outline-none transition placeholder:text-[#8f817d] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af] active:border-[#e95345]';
  const labelClass = 'mb-1.5 block text-xs sm:text-sm font-bold text-[#151211]';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55 p-3 sm:p-4 md:p-6 overflow-y-auto backdrop-blur-xs">
      <div className="relative my-auto w-full max-w-[640px] max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white text-[#151211] shadow-2xl transition-all">
        {/* Header Modal - Fixed Top */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#f0e8e4] px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1f1b1a]">
              {initialData ? 'Edit Data Inspeksi' : 'Tambah Data Inspeksi'}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#6f625f]">
              Lengkapi detail inspeksi APAR & bukti foto pengecekan.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-[#6f625f] transition hover:bg-[#f5eeee] hover:text-[#e95345] active:scale-95"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
          <div className="space-y-4 sm:space-y-5 p-5 sm:p-7">
            {/* Input APAR & Tanggal */}
            <div className="grid grid-cols-1 gap-3.5 sm:gap-4.5 sm:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-3.5 sm:gap-4.5 sm:grid-cols-2">
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

            {/* SECTION UPLOAD / AMBIL FOTO FLEKSIBEL */}
            <div className="rounded-2xl border border-[#eadfdb] bg-[#faf8f7] p-3.5 sm:p-4.5">
              <div className="mb-2.5 flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs sm:text-sm font-bold text-[#151211] flex items-center gap-1.5">
                  <ImageIcon size={18} className="text-[#e95345]" />
                  Foto Bukti Inspeksi <span className="text-[#e95345]">* (Wajib)</span>
                </label>

                {form.foto && (
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#00a862] bg-[#e7f8ef] px-2.5 py-1 rounded-full border border-[#00a862]/20">
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
                    className="w-full h-48 sm:h-64 object-cover"
                  />

                  {cameraLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-xs sm:text-sm">
                      <RefreshCw size={24} className="animate-spin text-[#e95345] mb-2" />
                      Memuat Kamera...
                    </div>
                  )}

                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between bg-black/60 backdrop-blur-md p-2 rounded-xl gap-2">
                    <button
                      type="button"
                      onClick={stopCameraStream}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition active:scale-95"
                    >
                      <CameraOff size={14} /> <span className="hidden sm:inline">Batal</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition active:scale-95"
                      title="Putar Kamera"
                    >
                      <SwitchCamera size={14} /> <span className="hidden sm:inline">Putar Kamera</span>
                    </button>

                    <button
                      type="button"
                      onClick={captureFromVideo}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#e95345] hover:bg-[#d9473a] px-3.5 py-2 rounded-lg shadow-md transition active:scale-95"
                    >
                      <Camera size={16} /> Ambil Foto
                    </button>
                  </div>
                </div>
              ) : form.foto ? (
                /* Mode Preview Gambar Terlampir */
                <div className="relative flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 rounded-xl border border-[#eadfdb] bg-white p-3 shadow-2xs">
                  <div className="relative h-32 w-full sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-lg border border-[#eadfdb] bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.foto}
                      alt="Preview Inspeksi"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left w-full">
                    <p className="text-xs font-bold text-[#151211] flex items-center justify-center sm:justify-start gap-1">
                      <FileCheck size={14} className="text-[#00a862]" /> Bukti Inspeksi Terpasang
                    </p>
                    <p className="mt-0.5 text-[11px] sm:text-xs text-[#6f625f]">
                      Gambar siap dikirim sebagai dokumentasi bukti pengecekan fisik.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#eadfdb] bg-white px-3 py-1.5 text-xs font-bold text-[#1f1b1a] shadow-2xs transition hover:bg-[#fff5f3] hover:text-[#e95345] active:scale-95"
                      >
                        <Upload size={14} /> Ganti File
                      </button>

                      <button
                        type="button"
                        onClick={() => startLiveCamera()}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#eadfdb] bg-white px-3 py-1.5 text-xs font-bold text-[#1f1b1a] shadow-2xs transition hover:bg-[#fff5f3] hover:text-[#e95345] active:scale-95"
                      >
                        <Camera size={14} /> Ambil Kamera
                      </button>

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#fee9e6] px-3 py-1.5 text-xs font-bold text-[#e95345] transition hover:bg-[#fbd8d4] active:scale-95"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode Dropzone Fleksibel untuk Desktop & Android */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 sm:p-6 text-center transition ${
                    isDragging
                      ? 'border-[#e95345] bg-[#fff5f3] scale-[1.01]'
                      : fotoError
                        ? 'border-[#e95345] bg-[#fff5f3]'
                        : 'border-[#dfd6d2] bg-white hover:border-[#e95345]/50'
                  }`}
                >
                  <div className="mb-2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#fef2f1] text-[#e95345]">
                    <Camera size={22} className="sm:w-6 sm:h-6" />
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-[#151211]">
                    Unggah atau Ambil Foto Bukti APAR
                  </p>
                  <p className="mt-1 text-[11px] sm:text-xs text-[#6f625f] max-w-sm">
                    Drag & drop foto di sini, pilih dari galeri, atau ambil foto langsung dari kamera HP/laptop.
                  </p>

                  <div className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#eadfdb] bg-white px-4 py-2.5 text-xs font-bold text-[#1f1b1a] shadow-xs transition hover:border-[#e95345] hover:text-[#e95345] active:scale-95"
                    >
                      <Upload size={15} /> Upload dari File
                    </button>

                    <button
                      type="button"
                      onClick={() => startLiveCamera()}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#e95345] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#d9473a] active:scale-95"
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
                className="w-full resize-none rounded-xl border border-[#eadfdb] bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#151211] outline-none transition placeholder:text-[#8f817d] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
              />
            </div>
          </div>

          {/* Footer Actions - Fixed Bottom inside scroll box */}
          <div className="shrink-0 flex items-center justify-end gap-2.5 sm:gap-3 border-t border-[#f0e8e4] bg-[#faf8f7] px-5 py-3.5 sm:px-7 sm:py-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-[#eadfdb] bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-[#1f1b1a] transition hover:bg-[#fbf7f5] active:scale-95"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loadingSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e95345] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-[#d9473a] disabled:cursor-not-allowed disabled:opacity-70 shadow-xs active:scale-95"
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

