/**
 * GOOGLE APPS SCRIPT (GAS) - TASYAKURAN AQIQAH IFEYA NAURA AZZAHRA
 * Spreadsheet ID: 1d4FmZhjZc4alvP60EVaSqtlVTUG-9JmoLE0FOn-5I3E
 * Sheet: Sheet1
 *
 * Kolom yang dihasilkan:
 * 1. Timestamp
 * 2. Nama Tamu
 * 3. Ucapan
 * 4. Konfirmasi Kehadiran
 * 5. Jumlah Tamu
 *
 * CARA DEPLOY:
 * 1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1d4FmZhjZc4alvP60EVaSqtlVTUG-9JmoLE0FOn-5I3E/edit
 * 2. Klik menu 'Extensions' (Ekstensi) -> 'Apps Script'.
 * 3. Hapus semua kode default, lalu tempel (paste) seluruh isi kode ini.
 * 4. Klik icon 'Save' (Simpan / Ctrl+S).
 * 5. Klik tombol biru 'Deploy' (Terapkan) di kanan atas -> pilih 'New deployment' (Penerapan baru).
 * 6. Klik icon gerigi di sebelah 'Select type' -> pilih 'Web app' (Aplikasi web).
 * 7. Isi keterangan:
 *    - Description: Ucapan Naura
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone (Siapa saja)  <-- PENTING! Harus 'Anyone' agar tamu bisa kirim & baca ucapan.
 * 8. Klik 'Deploy', lalu setujui perizinan akun Google jika diminta.
 * 9. Salin 'Web app URL' yang dihasilkan dan masukkan ke variabel GAS_URL di index.html.
 */

const SPREADSHEET_ID = "1d4FmZhjZc4alvP60EVaSqtlVTUG-9JmoLE0FOn-5I3E";
const SHEET_NAME = "Sheet1";

// GET: Mengambil daftar ucapan dari spreadsheet
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }
    
    const rows = sheet.getDataRange().getValues();
    const data = [];
    
    // Baris 0 adalah Header: Timestamp, Nama Tamu, Ucapan, Konfirmasi Kehadiran, Jumlah Tamu
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1] && row[1].toString().trim() !== "") {
        let tsStr = "";
        if (row[0]) {
          try {
            tsStr = Utilities.formatDate(new Date(row[0]), "Asia/Jakarta", "dd/MM/yyyy HH:mm");
          } catch (err) {
            tsStr = row[0].toString();
          }
        }
        data.push({
          timestamp: tsStr,
          nama: row[1] ? row[1].toString() : "",
          ucapan: row[2] ? row[2].toString() : "",
          kehadiran: row[3] ? row[3].toString() : "Hadir",
          jumlah: row[4] ? row[4].toString() : "1"
        });
      }
    }
    
    // Urutkan ucapan terbaru di paling atas
    data.reverse();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      total: data.length,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// POST: Menyimpan ucapan baru ke spreadsheet
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    
    // Buat header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Nama Tamu", "Ucapan", "Konfirmasi Kehadiran", "Jumlah Tamu"]);
    }
    
    let params = {};
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter || {};
      }
    } else if (e && e.parameter) {
      params = e.parameter;
    }
    
    const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
    const nama = params.nama || params.name || params["nama tamu"] || "Anonim";
    const ucapan = params.ucapan || params.comment || params.pesan || "-";
    const kehadiran = params.kehadiran || params.attendance || params["konfirmasi kehadiran"] || "Hadir";
    let jumlah = params.jumlah || params.guest_count || params["jumlah tamu"] || "1";
    
    // Jika tidak hadir, jumlah tamu otomatis 0
    if (kehadiran === "Tidak Hadir") {
      jumlah = "0";
    }
    
    sheet.appendRow([timestamp, nama, ucapan, kehadiran, jumlah]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Ucapan berhasil disimpan",
      data: {
        timestamp: timestamp,
        nama: nama,
        ucapan: ucapan,
        kehadiran: kehadiran,
        jumlah: jumlah
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
