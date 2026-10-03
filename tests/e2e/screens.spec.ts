import { test } from "@playwright/test";

// Manual visual review helper; run with SCREENS=1.
test.skip(!process.env.SCREENS, "visual review only");

test("capture screens", async ({ page }, info) => {
  const dir = `/tmp/rastgele-screens/${info.project.name}`;
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${dir}/1-home.png`, fullPage: true });

  await page.goto("/konu?id=yeni");
  await page.getByRole("button", { name: "Araştırmaya Başla" }).click({ timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/2-research.png` });
  await page.getByRole("button", { name: /Hazırım/ }).click();
  await page.getByText("01:00").waitFor({ timeout: 10000 });
  await page.screenshot({ path: `${dir}/3-explain.png` });

  await page.emulateMedia({ colorScheme: "dark" });
  await page.evaluate(() => localStorage.removeItem("rastgele:theme"));
  await page.goto("/gecmis");
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${dir}/5-history-dark.png` });
});
