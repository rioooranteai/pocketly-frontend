/**
 * Turns the backend's (English) error strings into what the UI shows.
 * Messages and status codes follow the backend's docs/api-contract.md;
 * anything not listed passes through unchanged.
 */

const EXACT_MESSAGES: Record<string, string> = {
  "invalid email or password": "Email atau password salah.",
  "email already registered": "Email sudah terdaftar.",
  "invalid email format": "Format email tidak valid.",
  "name must not be empty": "Nama wajib diisi.",
  "description must not be empty": "Deskripsi wajib diisi.",
  "invalid request body": "Data yang dikirim tidak valid.",
  "transaction total is too large": "Total transaksi terlalu besar.",
  "request body too large": "Data terlalu besar untuk dikirim.",
  "Transaction not found": "Transaksi tidak ditemukan. Mungkin sudah dihapus.",
  "Missing or invalid file field 'receipt'": "Pilih gambar struk dulu.",
  "image data is empty": "File gambar kosong. Pilih gambar lain.",
  "image size exceeds maximum allowed limit": "Ukuran gambar maksimal 5MB.",
  "receipt image too large": "Ukuran gambar maksimal 5MB.",
  "Failed to process receipt image":
    "Struk gagal diproses. Coba lagi, atau isi transaksinya manual.",
};

/** Every 422 from /transactions/scan starts with this. */
export const RECEIPT_UNREADABLE_PREFIX =
  "receipt could not be read as a valid transaction:";

const ITEM_ERROR = /^item (\d+): /;

export function toUserMessage(
  status: number,
  serverMessage: string | undefined,
  retryAfterSeconds?: number
): string {
  if (status === 429) {
    return retryAfterSeconds
      ? `Terlalu banyak percobaan. Coba lagi dalam ${retryAfterSeconds} detik.`
      : "Terlalu banyak percobaan. Coba lagi sebentar lagi.";
  }

  if (serverMessage) {
    if (serverMessage.startsWith(RECEIPT_UNREADABLE_PREFIX)) {
      return "Struk tidak bisa dibaca. Foto ulang dengan lebih jelas, atau isi manual.";
    }

    const exact = EXACT_MESSAGES[serverMessage];
    if (exact) return exact;

    const item = ITEM_ERROR.exec(serverMessage);
    if (item) {
      return `Item ke-${item[1]} tidak valid: nama wajib diisi, jumlah dan harga tidak boleh negatif atau terlalu besar.`;
    }
  }

  // Wrong login credentials were matched above; any other 401 is a
  // missing, malformed or expired token.
  if (status === 401) return "Sesi kamu sudah berakhir. Silakan masuk lagi.";

  if (status >= 500) return "Terjadi kesalahan di server. Coba lagi.";

  return serverMessage ?? `Permintaan gagal (HTTP ${status}).`;
}

/** `Retry-After` in seconds (the API always sends delta-seconds). */
export function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds >= 0
    ? Math.ceil(seconds)
    : undefined;
}
