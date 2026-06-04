import { useMemo, useState } from "react";
import {
  duckEntries,
  type DuckEntry,
  type DuckEntryDraft,
} from "../data/duckEntries";

const STORAGE_KEY = "roadside-duckling-entries";

function readStoredEntries(): DuckEntry[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return duckEntries;
  }

  try {
    const parsed = JSON.parse(stored) as DuckEntry[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : duckEntries;
  } catch {
    return duckEntries;
  }
}

function saveEntries(entries: DuckEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function createId() {
  return `entry-${Date.now().toString(36)}`;
}

function sortEntries(entries: DuckEntry[]) {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

export function useDuckEntries() {
  const [entries, setEntries] = useState<DuckEntry[]>(readStoredEntries);

  function replaceEntries(nextEntries: DuckEntry[]) {
    const sortedEntries = sortEntries(nextEntries);
    setEntries(sortedEntries);
    saveEntries(sortedEntries);
  }

  function createEntry(draft: DuckEntryDraft) {
    const entry = {
      ...draft,
      id: createId(),
    };

    replaceEntries([...entries, entry]);
    return entry;
  }

  function updateEntry(id: string, draft: DuckEntryDraft) {
    const nextEntries = entries.map((entry) =>
      entry.id === id ? { ...draft, id } : entry,
    );

    replaceEntries(nextEntries);
  }

  return useMemo(
    () => ({
      entries,
      createEntry,
      updateEntry,
    }),
    [entries],
  );
}
