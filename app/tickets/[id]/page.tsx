"use client";

import { useAtomValue } from "jotai";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ticketsAtom } from "@/atoms";
import { TicketDetailView } from "@/components/tickets/TicketDetailView";

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const tickets = useAtomValue(ticketsAtom);
  const ticketId = params.id as string;

  const ticket = tickets.find((t) => t.id === ticketId);

  useEffect(() => {
    if (!ticket) {
      router.push("/tickets");
    }
  }, [ticket, router]);

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-sm opacity-60">Ticket not found</p>
        </div>
      </div>
    );
  }

  return <TicketDetailView ticket={ticket} />;
}
