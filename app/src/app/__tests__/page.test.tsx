import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "../page";

describe("HomePage", () => {
	it("renders the hero heading text", () => {
		render(<HomePage />);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveTextContent(/Pocket Pet/i);
		expect(heading).toHaveTextContent(/Companion/i);
	});

	it("applies the lavender-to-cyan gradient via inline style on the heading", () => {
		render(<HomePage />);
		const heading = screen.getByRole("heading", { level: 1 });
		const style = heading.getAttribute("style") ?? "";
		// The gradient must reference the CSS variables, not raw hex values
		expect(style).toContain("var(--color-lavender)");
		expect(style).toContain("var(--color-cyan)");
	});

	it("applies WebkitBackgroundClip text on the heading for gradient clipping", () => {
		render(<HomePage />);
		const heading = screen.getByRole("heading", { level: 1 });
		const style = heading.getAttribute("style") ?? "";
		expect(style).toContain("background-clip: text");
	});

	it("renders the subtitle paragraph with the sub colour token", () => {
		render(<HomePage />);
		const subtitle = screen.getByText(
			/Virtual Pet Companion — Next\.js 15 · React 19 · Tailwind CSS 4 · TypeScript 5/,
		);
		expect(subtitle).toBeInTheDocument();
		const style = subtitle.getAttribute("style") ?? "";
		expect(style).toContain("var(--color-sub)");
	});

	it("renders the surface card container with surface token and border token", () => {
		render(<HomePage />);
		// The card is the closest ancestor div of the heading that has inline styles
		const heading = screen.getByRole("heading", { level: 1 });
		const card = heading.closest("div");
		expect(card).not.toBeNull();
		const style = card?.getAttribute("style") ?? "";
		expect(style).toContain("var(--color-surface)");
		expect(style).toContain("var(--color-border)");
	});

	it("does not use any raw hex colour values in the rendered output", () => {
		const { container } = render(<HomePage />);
		const html = container.innerHTML;
		// None of the palette hex values should appear directly in style attributes
		const forbiddenHex = [
			"#0d0c15",
			"#161428",
			"#a78bfa",
			"#22d3ee",
			"#7b72a8",
			"#ede9f8",
		];
		for (const hex of forbiddenHex) {
			expect(html).not.toContain(hex);
		}
	});

	it("does not render the old green-500 heading class", () => {
		render(<HomePage />);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).not.toHaveClass("text-green-500");
	});
});
