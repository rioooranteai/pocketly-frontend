import { expect, test, type Page } from "@playwright/test";

// The mock API accepts any credentials except the password "salah".
async function logIn(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("Alamat email kamu").fill("dewi@example.com");
  await page.getByPlaceholder("Kata sandi kamu").fill("rahasia123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("rejects a wrong password", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Alamat email kamu").fill("dewi@example.com");
  await page.getByPlaceholder("Kata sandi kamu").fill("salah");
  await page.getByRole("button", { name: "Masuk" }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "Email atau password salah." })
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("redirects signed-out visitors to login", async ({ page }) => {
  await page.goto("/transactions");
  await expect(page).toHaveURL(/\/login$/);
});

test("opens a transaction's details from the list", async ({ page }) => {
  // Guards the CSP in next.config.ts: a blocked script/style/request logs this.
  const cspViolations: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("Content Security Policy")) {
      cspViolations.push(message.text());
    }
  });

  await logIn(page);
  await page.goto("/transactions");
  await expect(page).toHaveTitle("Transaksi · Pocketly");

  const list = page.getByRole("region", { name: "Daftar transaksi" });
  const firstRow = list.getByRole("button").first();
  const description = await firstRow.locator("p").first().innerText();
  await firstRow.click();

  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("heading", { name: description })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  expect(cspViolations).toEqual([]);
});

test("filters the list by category", async ({ page }) => {
  await logIn(page);
  await page.goto("/transactions");

  await page.getByRole("button", { name: "Makanan" }).click();
  await expect(page.getByRole("button", { name: "Makanan" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  const list = page.getByRole("region", { name: "Daftar transaksi" });
  const rows = list.getByRole("button").filter({ hasText: "·" });
  await expect(rows.first()).toBeVisible();
  for (const text of await rows.allInnerTexts()) {
    expect(text).toContain("Makanan");
  }
});

test("shows the 404 page for unknown URLs", async ({ page }) => {
  const response = await page.goto("/tidak-ada");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Halaman tidak ditemukan" })
  ).toBeVisible();
});

test.describe("card height on desktop", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  // Bottom edges of the transactions card and the sidebar (main's sibling).
  async function bottoms(page: Page) {
    const card = page.getByRole("region", { name: "Daftar transaksi" });
    return card.evaluate((list) => {
      // The card is the view root's child that holds the list.
      const cardEl = list.closest("main > div > div")!;
      const sidebar = list.closest("main")!.previousElementSibling!;
      return {
        card: Math.round(cardEl.getBoundingClientRect().bottom),
        sidebar: Math.round(sidebar.getBoundingClientRect().bottom),
      };
    });
  }

  test("an empty month still fills down to the sidebar's bottom", async ({
    page,
  }) => {
    await logIn(page);
    await page.goto("/transactions");
    // Seed data never reaches into next month.
    await page.getByRole("button", { name: "Bulan berikutnya" }).click();
    await expect(
      page
        .getByRole("region", { name: "Daftar transaksi" })
        .getByText(/Belum ada transaksi di/)
    ).toBeVisible();

    const { card, sidebar } = await bottoms(page);
    expect(card).toBe(sidebar);
  });

  test("scrolling stops with the card level with the sidebar", async ({
    page,
  }) => {
    await logIn(page);
    await page.goto("/transactions");
    await expect(
      page
        .getByRole("region", { name: "Daftar transaksi" })
        .getByRole("button")
        .first()
    ).toBeVisible();

    await page.locator("main").evaluate((main) => {
      main.scrollTop = main.scrollHeight;
    });

    const { card, sidebar } = await bottoms(page);
    expect(card).toBe(sidebar);
  });
});
