"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import Button from "./Button";
import { FilterButton } from "./FilterButton";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-2 border-b border-black/5">
        <h1 className="text-sm font-medium">Tickets</h1>
      <div className="flex items-center gap-3">
        <FilterButton />{" "}
        <Button icon={<PlusIcon className="w-4 h-4" />} onClick={() => {}}>
          New Ticket
        </Button>
      </div>
    </header>
  );
}
