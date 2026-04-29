import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Load Nunito via Next.js built-in font optimisation — avoids Lightning CSS
// rejecting external @import url() references in Tailwind CSS 4 builds.
const nunito = Nunito({
	subsets: ["latin"],
	weight: ["700", "800", "900"],
	variable: "--font-nunito",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Virtual Pet Companion",
	description: "A browser-based virtual pet — always with you.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${nunito.variable} h-full antialiased`}>
			<body
				className="min-h-full flex flex-col"
				style={{
					background: "var(--color-bg)",
					color: "var(--color-text)",
					fontFamily: "var(--font-nunito)",
				}}
			>
				{children}
			</body>
		</html>
	);
}
