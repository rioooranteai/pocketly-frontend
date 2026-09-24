import { delay, http, HttpResponse } from "msw";

import { API_BASE_URL } from "@/lib/constants";
import { mockDb } from "@/mocks/db";
import { buildTransaction, nextMockId, TEMPLATES } from "@/mocks/seed";
import type {
  AuthLoginRequest,
  AuthRegisterRequest,
  Category,
  CreateTransactionRequest,
  TransactionResponse,
} from "@/types/api";

const api = (path: string) => `${API_BASE_URL}/api/v1${path}`;

const MOCK_TOKEN = "mock-token";

/** Same envelope shapes the real backend uses: `{data}` / `{message, data}` / `{error}`. */
const fail = (status: number, error: string) =>
  HttpResponse.json({ error }, { status });

function isAuthorized(request: Request) {
  return request.headers.get("Authorization")?.startsWith("Bearer ") ?? false;
}

/** Stand-in for the backend's AI categorizer: keyword guess, else "uncategorized". */
const CATEGORY_KEYWORDS: [RegExp, Category][] = [
  [
    /indomaret|alfamart|kopi|warteg|makan|resto|bakso|gofood|superindo/i,
    "food",
  ],
  [/grab|gojek|krl|bensin|spbu|parkir|tol\b/i, "transportation"],
  [/uniqlo|tokopedia|shopee|ikea|baju/i, "shopping"],
  [/cgv|xxi|netflix|spotify|game/i, "entertainment"],
  [/pln|listrik|indihome|pdam|pulsa|telkomsel/i, "utilities"],
  [/apotek|guardian|klinik|dokter|obat/i, "health"],
  [/gramedia|buku|kursus|udemy/i, "education"],
];

function guessCategory(description: string): Category {
  return (
    CATEGORY_KEYWORDS.find(([pattern]) => pattern.test(description))?.[1] ??
    "uncategorized"
  );
}

function fromRequest(
  body: CreateTransactionRequest,
  base: Pick<TransactionResponse, "id" | "category" | "created_at">
): TransactionResponse {
  const items = body.items.map((item) => ({ id: nextMockId("item"), ...item }));
  return {
    ...base,
    description: body.description,
    date: body.date,
    items,
    total_amount: items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    ),
  };
}

function authResponse(name: string, email: string) {
  return HttpResponse.json({ data: { name, email, token: MOCK_TOKEN } });
}

// Multi-item receipts the fake scanner "reads" (not the edge-case ones).
const SCANNABLE = TEMPLATES.filter(
  (t) => t.items.length > 1 && t.category !== ""
);

export const handlers = [
  http.post(api("/login"), async ({ request }) => {
    await delay(400);
    const { email, password } = (await request.json()) as AuthLoginRequest;
    // Lets reviewers see the failed-login state.
    if (password === "salah") return fail(401, "Email atau password salah.");
    const name = email.split("@")[0].replace(/[._-]+/g, " ");
    return authResponse(
      name.replace(/\b\w/g, (c) => c.toUpperCase()),
      email
    );
  }),

  http.post(api("/register"), async ({ request }) => {
    await delay(400);
    const { name, email } = (await request.json()) as AuthRegisterRequest;
    if (email.startsWith("sudah@")) return fail(409, "Email sudah terdaftar.");
    return authResponse(name, email);
  }),

  http.get(api("/transactions"), async ({ request }) => {
    await delay(500); // long enough to see the loading skeleton
    if (!isAuthorized(request)) return fail(401, "Unauthorized");
    return HttpResponse.json({ data: mockDb.list() });
  }),

  http.get(api("/transactions/:id"), async ({ request, params }) => {
    await delay(300);
    if (!isAuthorized(request)) return fail(401, "Unauthorized");
    const tx = mockDb.find(String(params.id));
    return tx
      ? HttpResponse.json({ data: tx })
      : fail(404, "Transaksi tidak ditemukan.");
  }),

  http.post(api("/transactions"), async ({ request }) => {
    await delay(500);
    if (!isAuthorized(request)) return fail(401, "Unauthorized");
    const body = (await request.json()) as CreateTransactionRequest;
    const tx = fromRequest(body, {
      id: nextMockId("tx"),
      category: guessCategory(body.description),
      created_at: new Date().toISOString(),
    });
    return HttpResponse.json(
      { message: "Transaksi berhasil dibuat", data: mockDb.insert(tx) },
      { status: 201 }
    );
  }),

  http.put(api("/transactions/:id"), async ({ request, params }) => {
    await delay(500);
    if (!isAuthorized(request)) return fail(401, "Unauthorized");
    const existing = mockDb.find(String(params.id));
    if (!existing) return fail(404, "Transaksi tidak ditemukan.");
    const body = (await request.json()) as CreateTransactionRequest;
    // Category and created_at stay; items are replaced wholesale.
    const next = fromRequest(body, existing);
    return HttpResponse.json({
      message: "Transaksi berhasil diperbarui",
      data: mockDb.update(existing.id, next),
    });
  }),

  http.delete(api("/transactions/:id"), async ({ request, params }) => {
    await delay(400);
    if (!isAuthorized(request)) return fail(401, "Unauthorized");
    return mockDb.remove(String(params.id))
      ? HttpResponse.json({ message: "Transaksi berhasil dihapus" })
      : fail(404, "Transaksi tidak ditemukan.");
  }),

  http.post(api("/transactions/scan"), async ({ request }) => {
    if (!isAuthorized(request)) return fail(401, "Unauthorized");
    const receipt = (await request.formData()).get("receipt");
    if (!(receipt instanceof File))
      return fail(400, "File receipt wajib diupload.");

    await delay(2500); // OpenAI Vision is slow — show the processing step
    // Name the image "...gagal..." to see the scan-failure path.
    if (/gagal|error/i.test(receipt.name)) {
      return fail(422, "Struk tidak terbaca. Coba foto yang lebih jelas.");
    }

    const template = SCANNABLE[Math.floor(Math.random() * SCANNABLE.length)];
    const tx = buildTransaction(template, new Date());
    return HttpResponse.json(
      { message: "Struk berhasil diproses", data: mockDb.insert(tx) },
      { status: 201 }
    );
  }),
];
