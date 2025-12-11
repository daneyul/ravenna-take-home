import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Provider } from "jotai";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/Sidebar";

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
        <Provider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden my-2 mr-2 ml-2 md:ml-0 bg-stone-50/90 rounded-md border border-stone-200">
              {children}
              <Analytics />
            </main>
          </div>
          <Toaster position="bottom-right" />
        </Provider>
      </body>
    </html>
  );
}
