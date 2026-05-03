import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Home page golden-path e2e suite.
 *
 * Every test navigates to "/" and asserts one specific user-visible
 * concern.  axe-core accessibility check runs at the end of the
 * describe block via a dedicated test so a failure is clearly attributed
 * to an a11y violation and not mixed with functional assertions.
 */
test.describe("Home page", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("loads without a JavaScript error", async ({ page }) => {
		const jsErrors: string[] = [];
		page.on("pageerror", (err) => jsErrors.push(err.message));

		// A second navigation ensures any deferred hydration errors are
		// also captured before we assert.
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		expect(jsErrors).toHaveLength(0);
	});

	test('hero heading "Pocket Pet Companion" is visible', async ({ page }) => {
		// The heading is split across two lines with a <br/> — match the
		// combined text content rather than inner HTML.
		const heading = page.locator("h1");
		await expect(heading).toBeVisible();
		await expect(heading).toContainText("Pocket Pet");
		await expect(heading).toContainText("Companion");
	});

	test("heading has the lavender→cyan gradient style applied", async ({
		page,
	}) => {
		const heading = page.locator("h1");

		// Chromium normalises the background shorthand so element.style.background
		// and element.style.backgroundImage both return "" — the raw var() tokens
		// are only accessible via getAttribute("style").  We assert the token names
		// to verify design intent; getComputedStyle asserts the resolved values.
		const styleAttr = await heading.getAttribute("style");
		expect(styleAttr).toContain("var(--color-lavender)");
		expect(styleAttr).toContain("var(--color-cyan)");

		// Confirm CSS resolves the tokens to the expected accent colours from the
		// design token registry (CLAUDE.md §8).
		// rgb(167, 139, 250) = #a78bfa = --color-lavender
		// rgb(34, 211, 238)  = #22d3ee = --color-cyan
		const computedBgImage = await heading.evaluate(
			(el) => window.getComputedStyle(el).backgroundImage,
		);
		expect(computedBgImage).toContain("rgb(167, 139, 250)");
		expect(computedBgImage).toContain("rgb(34, 211, 238)");

		// The text must be transparent so the gradient shows through.
		const fillColor = await heading.evaluate(
			(el) => (el as HTMLElement).style.webkitTextFillColor,
		);
		expect(fillColor).toBe("transparent");
	});

	test("subtitle text is visible", async ({ page }) => {
		const subtitle = page.locator("p");
		await expect(subtitle).toBeVisible();
		// Verify key technology stack terms from the subtitle copy in page.tsx
		await expect(subtitle).toContainText("Next.js");
		await expect(subtitle).toContainText("React");
	});

	test("surface card container is rendered", async ({ page }) => {
		// The card wraps the hero content.  It is the only element that
		// carries the --color-surface background, which we can inspect via
		// computed styles.
		const card = page.locator("main > div").first();
		await expect(card).toBeVisible();

		const bg = await card.evaluate((el) => {
			// getComputedStyle resolves CSS custom properties to their actual value
			return window.getComputedStyle(el).backgroundColor;
		});
		// rgb(22, 20, 40) == #161428 == --color-surface
		expect(bg).toBe("rgb(22, 20, 40)");
	});

	test("dark background colour is applied to the body", async ({ page }) => {
		const bodyBg = await page.evaluate(() => {
			return window.getComputedStyle(document.body).backgroundColor;
		});
		// rgb(13, 12, 21) == #0d0c15 == --color-bg
		expect(bodyBg).toBe("rgb(13, 12, 21)");
	});

	test("page has no critical accessibility violations", async ({ page }) => {
		const results = await new AxeBuilder({ page }).analyze();
		const criticalViolations = results.violations.filter(
			(v) => v.impact === "critical",
		);
		expect(
			criticalViolations,
			`Critical a11y violations found:\n${JSON.stringify(criticalViolations, null, 2)}`,
		).toHaveLength(0);
	});
});
