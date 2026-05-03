export default function HomePage() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
			{/* Card using --color-surface token */}
			<div
				className="w-full max-w-[430px] flex flex-col items-center gap-4 p-5 rounded-[20px]"
				style={{
					background: "var(--color-surface)",
					border: "1px solid var(--color-border)",
					animation: "fadeInUp 0.6s ease both",
				}}
			>
				{/* Hero heading — lavender → cyan gradient, demonstrating accent tokens */}
				<h1
					className="text-[40px] font-black leading-tight text-center"
					style={{
						background:
							"linear-gradient(90deg, var(--color-lavender), var(--color-cyan))",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						backgroundClip: "text",
						fontFamily: "var(--font-nunito)",
					}}
				>
					Pocket Pet
					<br />
					Companion
				</h1>

				{/* Subtitle using --color-sub token */}
				<p
					className="text-sm font-bold text-center"
					style={{
						color: "var(--color-sub)",
						fontFamily: "var(--font-nunito)",
					}}
				>
					Virtual Pet Companion — Next.js 15 · React 19 · Tailwind CSS 4 ·
					TypeScript 5
				</p>
			</div>
		</main>
	);
}
