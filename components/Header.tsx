"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import Button from "./Button";
import { FilterButton } from "./FilterButton";
import { GroupButton } from "./GroupButton";
import { NewTicketDialog } from "./NewTicketDialog";

export function Header() {
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-2 border-b border-black/5">
      <h1 className="font-medium">Tickets</h1>
      <div className="flex items-center gap-3">
        <GroupButton />
        <FilterButton />
        <Button
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => setIsNewTicketOpen(true)}
        >
          New Ticket
        </Button>
      </div>
      <NewTicketDialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen} />
    </header>
  );
}
