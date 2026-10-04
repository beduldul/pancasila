[![shellcheck](https://github.com/beduldul/pancasila/actions/workflows/shellcheck.yml/badge.svg)](https://github.com/beduldul/pancasila/actions/workflows/shellcheck.yml)
# Proyek Pancasila

Web app dengan backend dan frontend modern, gaya Apple, fokus pada UX, performa, dan kemudahan kolaborasi.

Arsitektur singkat:
- Backend: Express + TypeScript, REST API untuk daftar dokumen PDF dan upload dokumen.
- Frontend: React + Vite, layout Apple-like, halaman Home dan halaman Docs untuk mengelola PDF.

- Cara menjalankan:
- Jalankan backend: cd backend, npm install, npm run dev
- Jalankan frontend: cd frontend, npm install, npm run start
- Opsi satu tombol setup: jalankan script setup-all.sh dari root proyek
- Contoh:
  - chmod +x setup-all.sh
  - ./setup-all.sh

Panduan verifikasi:
- Buka http://localhost:5173 untuk frontend
- Buka http://localhost:4000 untuk backend (atau akses lewat UI Docs di frontend)
- Pada halaman Docs, unggah PDF untuk melihat daftar dokumen
- Jalankan backend: cd backend, npm install, npm run dev
- Jalankan frontend: cd frontend, npm install, npm run start

Catatan: Model ini tidak bisa membaca isi PDF secara langsung. Untuk tugas tugas PDF, Anda bisa meng-upload PDF melalui UI Docs, dan backend akan menyimpan file tersebut secara lokal dan menampilkannya pada daftar dokumen.
