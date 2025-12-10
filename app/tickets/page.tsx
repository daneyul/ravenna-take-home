"use client";

import { Board } from "@/components/Board";
import { Header } from "@/components/Header";

export default function TicketsPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <Board />
    </div>
  );
}
