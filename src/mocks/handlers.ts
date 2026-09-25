import { delay, http, HttpResponse } from "msw";

import { API_BASE_URL, VALIDATION } from "@/lib/constants";
import { mockDb } from "@/mocks/db";
import { buildTransaction, TEMPLATES } from "@/mocks/seed";
import type {
  AuthLoginRequest,
  AuthRegisterRequest,
  Category,
  CreateTransactionRequest,
  TransactionResponse,
} from "@/types/api";

/**
 * Dummy API mirroring the backend's docs/api-contract.md: same URLs,
 * envelopes, status codes and (English) error strings.
 *
 * Triggers for the failure paths:
 * - login with password "salah"            → 401 invalid email or password
 * - register an email starting "sudah@"    → 409 email already registered
 * - scan a file named "...gagal..."        → 422 receipt unreadable
 * - scan a file named "...limit..."        → 429 with Retry-After
 */

const api = (path: string) => `${API_BASE_URL}/api/v1${path}`;

const MOCK_TOKEN = "mock-token";
const SCAN_RETRY_AFTER_SECONDS = 15;

const fail = (status: number, error: string, init: ResponseInit = {}) =>
  HttpResponse.json({ error }, { ...init, status });

/** 401 exactly as the backend's auth middleware words it. */
function authError(request: Request) {
  const header = request.headers.get("Authorization");
  if (!header) return fail(401, "missing authorization header");
  if (!/^bearer \S+$/i.test(header)) {
    return fail(
      401,
      "authorization header must be in the format: Bearer <token>"
    );
  }
  return null;
}

/** Stand-in for the backend's AI categorizer: keyword guess, else "uncategorized". */
const CATEGORY_KEYWORDS: [RegExp, Category][] = [
  [
    /indomaret|alfamart|kopi|warteg|makan|resto|bakso|gofood|superindo|nasi/i,
    "food",
  ],
  [
    /grab|gojek|krl|bensin|spbu|parkir|tol\b|pertalite|pertamax/i,
    "transportation",
  ],
  [/uniqlo|tokopedia|shopee|ikea|baju|gramedia/i, "shopping"],
  [/pln|listrik|indihome|pdam|pulsa|telkomsel|tagihan/i, "bills"],
  [/cgv|xxi|netflix|spotify|game/i, "entertainment"],
  [/apotek|guardian|klinik|dokter|obat/i, "health"],
  [/sewa|kos|laundry|donasi|transfer/i, "others"],
];

/** Like the backend: decided from the description AND every item name. */
function guessCategory(body: CreateTransactionRequest): Category {
  const text = [body.description, ...body.items.map((i) => i.name)].join(" ");
  return (
    CATEGORY_KEYWORDS.find(([pattern]) => pattern.test(text))?.[1] ??
    "uncategorized"
  );
}

const RFC3339 =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/** The subset of the backend's body validation the UI can actually hit. */
function validate(body: Partial<CreateTransactionRequest>): string | null {
  const missing = (["description", "date", "items"] as const).filter(
    (field) => body[field] === undefined
  );
  if (missing.length) {
    return missing.map((field) => `${field} is required`).join("; ");
  }
  if (!RFC3339.test(String(body.date))) return "invalid request body";
  if (!body.items?.length) return "items must be at least 1 items";
  if (!body.description?.trim()) return "description must not be empty";
  const bad = body.items.findIndex(
    (item) =>
      !item.name?.trim() ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 0 ||
      item.price < 0
  );
  if (bad !== -1) {
    return `item ${bad + 1}: item needs a name and a non-negative quantity and price within range`;
  }
  return null;
}

function fromRequest(
  body: CreateTransactionRequest,
  id: string
): TransactionResponse {
  const items = body.items.map(({ name, quantity, price }) => ({
    name: name.trim(),
    quantity,
    price,
  }));
  return {
    id,
    description: body.description.trim(),
    category: guessCategory(body),
    date: body.date,
    items,
    total_amount: items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    ),
  };
}

/** Auth responses are NOT wrapped in `data`. */
function authResponse(name: string, email: string, status = 200) {
  return HttpResponse.json(
    { name: name.trim(), email: email.trim().toLowerCase(), token: MOCK_TOKEN },
    { status }
  );
}

// Multi-item receipts the fake scanner "reads".
const SCANNABLE = TEMPLATES.filter(
  (t) => t.items.length > 1 && t.category !== "uncategorized"
);

export const handlers = [
  http.post(api("/login"), async ({ request }) => {
    await delay(400);
    const { email, password } = (await request.json()) as AuthLoginRequest;
    if (!email) return fail(400, "email is required");
    if (password === "salah") return fail(401, "invalid email or password");
    const name = email.split("@")[0].replace(/[._-]+/g, " ");
    return authResponse(
      name.replace(/\b\w/g, (c) => c.toUpperCase()),
      email
    );
  }),

  http.post(api("/register"), async ({ request }) => {
    await delay(400);
    const { name, email } = (await request.json()) as AuthRegisterRequest;
    if (!name?.trim()) return fail(400, "name must not be empty");
    if (email.trim().toLowerCase().startsWith("sudah@")) {
      return fail(409, "email already registered");
    }
    return authResponse(name, email, 201);
  }),

  http.get(api("/transactions"), async ({ request }) => {
    await delay(500); // long enough to see the loading skeleton
    const unauthorized = authError(request);
    if (unauthorized) return unauthorized;
    // Newest first, like the backend.
    const data = [...mockDb.list()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return HttpResponse.json({ data });
  }),

  http.get(api("/transactions/:id"), async ({ request, params }) => {
    await delay(300);
    const unauthorized = authError(request);
    if (unauthorized) return unauthorized;
    const tx = mockDb.find(String(params.id));
    return tx
      ? HttpResponse.json({ data: tx })
      : fail(404, "Transaction not found");
  }),

  http.post(api("/transactions"), async ({ request }) => {
    await delay(500);
    const unauthorized = authError(request);
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as CreateTransactionRequest;
    const invalid = validate(body);
    if (invalid) return fail(400, invalid);
    const tx = fromRequest(body, crypto.randomUUID());
    return HttpResponse.json(
      { message: "Transaction created successfully", data: mockDb.insert(tx) },
      { status: 201 }
    );
  }),

  http.put(api("/transactions/:id"), async ({ request, params }) => {
    await delay(500);
    const unauthorized = authError(request);
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as CreateTransactionRequest;
    const invalid = validate(body);
    if (invalid) return fail(400, invalid);
    const existing = mockDb.find(String(params.id));
    if (!existing) return fail(404, "Transaction not found");
    // Items replaced wholesale; category and total recomputed.
    return HttpResponse.json({
      message: "Transaction updated successfully",
      data: mockDb.update(existing.id, fromRequest(body, existing.id)),
    });
  }),

  http.delete(api("/transactions/:id"), async ({ request, params }) => {
    await delay(400);
    const unauthorized = authError(request);
    if (unauthorized) return unauthorized;
    return mockDb.remove(String(params.id))
      ? new HttpResponse(null, { status: 204 })
      : fail(404, "Transaction not found");
  }),

  http.post(api("/transactions/scan"), async ({ request }) => {
    const unauthorized = authError(request);
    if (unauthorized) return unauthorized;
    const receipt = (await request.formData()).get("receipt");
    if (!(receipt instanceof File)) {
      return fail(400, "Missing or invalid file field 'receipt'");
    }
    if (receipt.size === 0) return fail(400, "image data is empty");
    if (receipt.size > VALIDATION.MAX_FILE_SIZE) {
      return fail(413, "receipt image too large");
    }
    if (/limit/i.test(receipt.name)) {
      return fail(429, "too many requests, please try again later", {
        headers: { "Retry-After": String(SCAN_RETRY_AFTER_SECONDS) },
      });
    }

    await delay(2500); // the AI read is slow — show the processing step
    if (/gagal|error/i.test(receipt.name)) {
      return fail(
        422,
        "receipt could not be read as a valid transaction: transaction must have at least one item"
      );
    }

    const template = SCANNABLE[Math.floor(Math.random() * SCANNABLE.length)];
    // Scans are dated at scan time, in UTC, without milliseconds.
    const scannedAt = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    const tx = {
      ...buildTransaction(template, new Date()),
      id: crypto.randomUUID(),
      date: scannedAt,
    };
    return HttpResponse.json(
      {
        message: "Transaction created successfully from receipt",
        data: mockDb.insert(tx),
      },
      { status: 201 }
    );
  }),
];
