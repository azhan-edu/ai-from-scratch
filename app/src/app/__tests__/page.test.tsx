import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "../page";

describe("HomePage", () => {
	it("renders the updated heading text", () => {
		render(<HomePage />);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveTextContent("Hello, this is a new text");
	});

	it("applies the green color class to the heading", () => {
		render(<HomePage />);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveClass("text-green-500");
	});

	it("does not render the old heading text", () => {
		render(<HomePage />);
		expect(screen.queryByText("Hello World")).not.toBeInTheDocument();
	});

	it("renders the subtitle paragraph unchanged", () => {
		render(<HomePage />);
		expect(
			screen.getByText(
				/Virtual Pet Companion — Next\.js 15 · React 19 · Tailwind CSS 4 · TypeScript 5/,
			),
		).toBeInTheDocument();
	});
});
