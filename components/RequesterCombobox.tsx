"use client";

import { PersonIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { BORDER_STYLES } from "@/lib/styles";
import type { Requester } from "@/types/ticket";

interface RequesterComboboxProps {
  requesters: Requester[];
  value: string;
  onChange: (value: string, requester?: Requester) => void;
  placeholder?: string;
  type?: "name" | "email";
}

export function RequesterCombobox({
  requesters,
  value,
  onChange,
  placeholder = "Enter name",
  type = "name",
}: RequesterComboboxProps) {
  const [open, setOpen] = useState(false);
  const [filteredRequesters, setFilteredRequesters] = useState<Requester[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!value) {
      setFilteredRequesters([]);
      setOpen(false);
      return;
    }

    const searchValue = value.toLowerCase();
    const filtered = requesters.filter((requester) => {
      if (type === "name") {
        return requester.name.toLowerCase().includes(searchValue);
      } else {
        return requester.email.toLowerCase().includes(searchValue);
      }
    });

    setFilteredRequesters(filtered);
    // Only open if user is actively typing
    if (isTypingRef.current) {
      setOpen(filtered.length > 0);
    }
    setSelectedIndex(0);
  }, [value, requesters, type]);

  const handleSelect = (requester: Requester) => {
    isTypingRef.current = false;
    if (type === "name") {
      onChange(requester.name, requester);
    } else {
      onChange(requester.email, requester);
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filteredRequesters.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredRequesters.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredRequesters[selectedIndex]) {
          handleSelect(filteredRequesters[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          isTypingRef.current = true;
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          isTypingRef.current = false;
          setTimeout(() => setOpen(false), 200);
        }}
        className={clsx(
          "w-full px-3 py-2 rounded-md text-sm bg-white",
          BORDER_STYLES.input
        )}
        placeholder={placeholder}
      />

      {open && filteredRequesters.length > 0 && (
        <div
          className={clsx(
            "absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50",
            BORDER_STYLES.base
          )}
        >
          <div className="p-2">
            <div className="max-h-60 overflow-y-auto">
              {filteredRequesters.map((requester, index) => (
                <button
                  key={requester.email}
                  type="button"
                  onClick={() => handleSelect(requester)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={clsx(
                    "w-full px-3 py-2 text-sm text-left rounded flex items-center gap-2 transition-colors duration-150",
                    index === selectedIndex ? "bg-stone-100" : "hover:bg-stone-50"
                  )}
                >
                  <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                    <PersonIcon className="w-3 h-3 opacity-70" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{requester.name}</span>
                    <span className="text-xs opacity-70 truncate">{requester.email}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
