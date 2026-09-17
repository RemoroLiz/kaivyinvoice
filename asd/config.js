/**
 * ============================================================
 *  CONFIG.gs — satu-satunya tempat untuk mengubah pengaturan
 * ============================================================
 * Semua file lain (Code.gs) membaca pengaturan dari sini.
 * Kalau ID spreadsheet, GID sheet, atau kolom berubah, cukup
 * ubah di file ini saja — tidak perlu menyentuh Code.gs.
 */

const CONFIG = {

  // ID spreadsheet DB_PENJUALAN & MASTER_SALES
  // (dua-duanya berada di spreadsheet yang sama, dibedakan lewat GID sheet)
  SPREADSHEET_ID: '1GBXhu2N-vcQiLE6X545fTmTKUWhoImL42OBnHgOU6T8',

  SHEETS: {
    PENJUALAN: {
      gid: 1924887221,          // gid sheet DB_PENJUALAN
      headerRow: 1               // baris judul kolom; data mulai baris setelah ini
    },
    MASTER_SALES: {
      gid: 0,                    // gid sheet MASTER_SALES
      headerRow: 1
    }
  },

  // Kolom-kolom di sheet DB_PENJUALAN (huruf kolom sesuai spreadsheet)
  COLUMNS_PENJUALAN: {
    KODE_SALES: 'K',
    BERAT: 'Q',
    RUPIAH: 'Y',
    TANGGAL: 'AA'
  },

  // Kolom-kolom di sheet MASTER_SALES
  COLUMNS_MASTER_SALES: {
    KODE: 'A',
    NAMA: 'B',
    JABATAN: 'E'
  },

  // Label jabatan yang dianggap "sales" (huruf besar/kecil diabaikan saat dibandingkan)
  JABATAN: {
    SPV: 'SPV',
    SALES: 'SALES'
  },

  // Label untuk baris gabungan kode sales yang TIDAK terdaftar sebagai SPV/SALES
  OTHER_CODE: 'OTHER',
  OTHER_LABEL: 'Other (belum terdaftar)',

  // Zona waktu untuk pengelompokan tanggal/minggu/bulan
  TIMEZONE: 'Asia/Jakarta',

  // Judul halaman
  APP_TITLE: 'Laporan Penjualan Sales'
};

/**
 * Mengubah huruf kolom (A, K, AA, dst) menjadi index array 0-based.
 * Contoh: 'A' -> 0, 'K' -> 10, 'AA' -> 26
 */
function columnLetterToIndex(letter) {
  let column = 0;
  const upper = String(letter).toUpperCase().trim();
  for (let i = 0; i < upper.length; i++) {
    column = column * 26 + (upper.charCodeAt(i) - 64);
  }
  return column - 1;
}

/**
 * Mengambil objek Sheet berdasarkan GID (bukan nama), supaya aman
 * meskipun nama sheet diganti-ganti oleh pengguna.
 */
function getSheetByGid(spreadsheet, gid) {
  const sheets = spreadsheet.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === gid) return sheets[i];
  }
  throw new Error('Sheet dengan GID ' + gid + ' tidak ditemukan. Cek kembali CONFIG.SHEETS di Config.gs.');
}
