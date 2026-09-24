import type { TransactionItemResponse, TransactionResponse } from "@/types/api";

/**
 * Dummy transactions for API mocking. Deterministic (seeded PRNG) so
 * every reload looks the same, but dated relative to today so the
 * "Hari ini" / "Kemarin" groups and the current month always have data.
 */

type ItemTemplate = [name: string, quantity: number, price: number];

export interface ReceiptTemplate {
  description: string;
  /** Free text like the backend's AI output — "" and unknown values on purpose. */
  category: string;
  items: ItemTemplate[];
}

export const TEMPLATES: ReceiptTemplate[] = [
  {
    description: "Indomaret Kemang Raya",
    category: "food",
    items: [
      ["Aqua 1500ml", 2, 7500],
      ["Sari Roti Tawar", 1, 18500],
      ["Telur ayam 10 butir", 1, 29000],
      ["Pisang Cavendish", 1, 24000],
    ],
  },
  {
    description: "Kopi Kenangan Senopati",
    category: "food",
    items: [
      ["Kopi Kenangan Mantan", 2, 24000],
      ["Croissant", 1, 19000],
    ],
  },
  {
    description: "Warteg Bahari",
    category: "food",
    items: [
      ["Nasi + 2 lauk", 1, 22000],
      ["Es teh manis", 1, 5000],
    ],
  },
  {
    description: "GoFood — Sate Khas Senayan",
    category: "food",
    items: [
      ["Sate ayam 10 tusuk", 1, 48000],
      ["Lontong", 2, 8000],
      ["Ongkir", 1, 12000],
    ],
  },
  {
    description: "Superindo Tebet",
    category: "food",
    items: [
      ["Beras 5kg", 1, 72000],
      ["Minyak goreng 2L", 1, 38000],
      ["Bayam", 2, 6000],
      ["Tahu putih", 1, 9000],
    ],
  },
  {
    description: "Hokben Blok M",
    category: "food",
    items: [
      ["Bento Special 1", 1, 58000],
      ["Ocha", 1, 12000],
    ],
  },
  {
    description: "Grab ke kantor",
    category: "transportation",
    items: [["GrabCar", 1, 38000]],
  },
  {
    description: "Gojek ke stasiun",
    category: "transportation",
    items: [["GoRide", 1, 14000]],
  },
  {
    description: "KRL Commuter Line",
    category: "transportation",
    items: [["Top up KMT", 1, 50000]],
  },
  {
    description: "SPBU Pertamina",
    category: "transportation",
    items: [["Pertamax", 10, 12900]],
  },
  {
    description: "Uniqlo Senayan City",
    category: "shopping",
    items: [
      ["Kaos AIRism", 1, 199000],
      ["Celana Chino", 1, 399000],
    ],
  },
  {
    description: "Tokopedia",
    category: "shopping",
    items: [
      ["Casing HP", 1, 45000],
      ["Kabel USB-C", 1, 59000],
    ],
  },
  {
    description: "IKEA Alam Sutera",
    category: "shopping",
    items: [
      ["Rak buku", 1, 499000],
      ["Lampu meja", 1, 149000],
    ],
  },
  {
    description: "CGV Grand Indonesia",
    category: "entertainment",
    items: [
      ["Tiket film", 2, 60000],
      ["Popcorn caramel", 1, 55000],
    ],
  },
  {
    description: "Spotify Premium",
    category: "entertainment",
    items: [["Langganan 1 bulan", 1, 54990]],
  },
  {
    description: "Token listrik PLN",
    category: "utilities",
    items: [["Token 200rb", 1, 200000]],
  },
  {
    description: "IndiHome",
    category: "utilities",
    items: [["Internet bulanan", 1, 385000]],
  },
  {
    description: "Telkomsel",
    category: "utilities",
    items: [["Paket data 25GB", 1, 105000]],
  },
  {
    description: "Guardian Pondok Indah Mall",
    category: "health",
    items: [
      ["Vitamin C", 1, 55000],
      ["Masker 1 box", 1, 42300],
      ["Plester", 1, 45000],
    ],
  },
  {
    description: "Apotek K-24",
    category: "health",
    items: [
      ["Paracetamol", 1, 12000],
      ["OBH Combi", 1, 28000],
    ],
  },
  {
    description: "Gramedia Matraman",
    category: "education",
    items: [
      ["Buku Atomic Habits", 1, 108000],
      ["Pulpen", 3, 8000],
      ["Buku tulis", 4, 11000],
    ],
  },
  {
    description: "Udemy",
    category: "education",
    items: [["Kursus React lanjutan", 1, 179000]],
  },
  {
    description: "Laundry Kiloan Bersih",
    category: "other",
    items: [["Cuci setrika 5kg", 1, 45000]],
  },
  // Edge cases: categorization failed / returned an unknown value.
  {
    description: "Toko Sumber Rejeki",
    category: "uncategorized",
    items: [
      ["Gula pasir 1kg", 1, 17500],
      ["Kopi bubuk", 2, 12500],
      ["Sabun batang", 3, 5100],
    ],
  },
  {
    description: "Warung Bu Tini",
    category: "",
    items: [
      ["Gorengan", 5, 2000],
      ["Kopi hitam", 1, 5000],
    ],
  },
  {
    description: "Lotte Mart Gandaria",
    category: "groceries",
    items: [
      ["Susu UHT 1L", 2, 19500],
      ["Sereal", 1, 52000],
    ],
  },
];

/** mulberry32 — tiny deterministic PRNG. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let idSequence = 0;
// Time-based prefix keeps ids unique across reloads (the db outlives the
// module when it's restored from sessionStorage).
const idEpoch = Date.now().toString(36);
export function nextMockId(prefix: string): string {
  idSequence += 1;
  return `${prefix}-${idEpoch}-${idSequence}`;
}

export function buildTransaction(
  template: ReceiptTemplate,
  date: Date
): TransactionResponse {
  const items: TransactionItemResponse[] = template.items.map(
    ([name, quantity, price]) => ({
      id: nextMockId("item"),
      name,
      quantity,
      price,
    })
  );
  return {
    id: nextMockId("tx"),
    description: template.description,
    category: template.category,
    total_amount: items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    ),
    date: date.toISOString(),
    items,
    // Recorded a few minutes after the purchase, like a real scan would be.
    created_at: new Date(date.getTime() + 7 * 60_000).toISOString(),
  };
}

/** ~90 days of transactions ending today; today and yesterday are never empty. */
export function createSeedTransactions(
  now: Date = new Date()
): TransactionResponse[] {
  const random = createRandom(20260924);
  const pick = () => TEMPLATES[Math.floor(random() * TEMPLATES.length)];
  const transactions: TransactionResponse[] = [];

  for (let daysAgo = 0; daysAgo < 90; daysAgo += 1) {
    const count = daysAgo < 2 ? 3 : Math.floor(random() * 3); // 0–2 per day
    for (let i = 0; i < count; i += 1) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysAgo
      );
      date.setHours(7 + Math.floor(random() * 14), Math.floor(random() * 60));
      // Never in the future relative to "now".
      if (date > now) date.setTime(now.getTime() - (i + 1) * 20 * 60_000);
      transactions.push(buildTransaction(pick(), date));
    }
  }

  // Make sure every edge-case template shows up at least once, recently.
  TEMPLATES.slice(-3).forEach((template, i) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - (i + 2),
      12
    );
    transactions.push(buildTransaction(template, date));
  });

  return transactions;
}
