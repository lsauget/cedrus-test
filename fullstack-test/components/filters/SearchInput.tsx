"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useCallback, useRef } from "react";

export function SearchInput() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      history: "push",
      shallow: false
    })
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const clearSearch = useCallback(() => {
    setSearch(null);
    inputRef.current?.focus();
  }, [setSearch]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Search</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search by name, address, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value || null)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
