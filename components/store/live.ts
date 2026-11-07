"use client";

// Live Firestore hooks shared by Part B's pages and components.
// `key` must change whenever the query's inputs change (it encodes them);
// pass null to skip the subscription (e.g. until the user is known).

import { useEffect, useState } from "react";
import { onSnapshot, type DocumentReference, type Query } from "firebase/firestore";

type ListState<T> = { key: string | null; docs: T[]; error: string };

export function useLiveQuery<T extends { id: string }>(
  key: string | null,
  build: () => Query,
): { docs: T[]; loading: boolean; error: string } {
  const [state, setState] = useState<ListState<T>>({ key: null, docs: [], error: "" });

  useEffect(() => {
    if (key === null) return;
    return onSnapshot(
      build(),
      (snap) => setState({ key, docs: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T), error: "" }),
      (err) => setState({ key, docs: [], error: err.message }),
    );
    // `key` encodes every input to `build`, so it is the only dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = key !== null && state.key === key;
  return {
    docs: current ? state.docs : [],
    loading: key !== null && !current,
    error: current ? state.error : "",
  };
}

type DocState<T> = { key: string | null; data: T | null; error: string };

export function useLiveDoc<T extends { id: string }>(
  key: string | null,
  build: () => DocumentReference,
): { data: T | null; loading: boolean; error: string } {
  const [state, setState] = useState<DocState<T>>({ key: null, data: null, error: "" });

  useEffect(() => {
    if (key === null) return;
    return onSnapshot(
      build(),
      (snap) => setState({ key, data: snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null, error: "" }),
      (err) => setState({ key, data: null, error: err.message }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = key !== null && state.key === key;
  return {
    data: current ? state.data : null,
    loading: key !== null && !current,
    error: current ? state.error : "",
  };
}
