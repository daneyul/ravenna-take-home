import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Providers } from "./providers";

export const metadata: Metadata = {
	title: "Ravenna Take Home",
	description: "ITSM Ticketing System",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="bg-stone-100">
				<Providers>
					<div className="flex h-screen overflow-hidden">
						<Sidebar />
						<main className="flex-1 flex flex-col overflow-hidden my-2 mr-2 bg-stone-50/90 rounded-md border border-stone-200">
							{children}
						</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
