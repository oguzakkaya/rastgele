import { expect, test } from "@playwright/test";

test("full random challenge flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Rastgele" })).toBeVisible();

  await expect(page.getByRole("button", { name: /Kategori/ })).toContainText("Tümü");
  await page.getByRole("button", { name: "Rastgele Başla" }).click();

  // Topic reveal
  await expect(page.getByText("15 dakikan var.")).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/\/konu\?id=k-/);
  const title = await page.getByRole("heading", { level: 1 }).innerText();
  expect(title.length).toBeGreaterThan(3);

  // Research
  await page.getByRole("button", { name: "Araştırmaya Başla" }).click();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await page.getByRole("button", { name: /Hazırım/ }).click();

  // Transition hides notes
  await expect(page.getByText("Şimdi sıra sende.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Araştırma Notları" })).toHaveCount(0);

  // Speaking minute: countdown only, no writing controls
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("01:00")).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Değerlendir|Pas Geç|Baştan/ })).toHaveCount(0);
});
