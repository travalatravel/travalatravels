"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);

    // After a deploy the browser may hold old HTML referencing JS chunks
    // that no longer exist — reload once to pick up the new build.
    const isStaleChunk =
      error.name === "ChunkLoadError" ||
      /Loading chunk|chunk failed|dynamically imported module/i.test(error.message || "");
    if (isStaleChunk && !sessionStorage.getItem("search-chunk-reload")) {
      sessionStorage.setItem("search-chunk-reload", "1");
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-[#1a1a1a]">Flugsuche konnte nicht geladen werden</h1>
      <p className="mt-3 text-sm text-gray-600">
        Bitte erneut versuchen. Wenn das Problem bleibt, Route und Datum prüfen oder die Seite neu laden.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-[#2D83C2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5f94]"
        >
          Erneut versuchen
        </button>
        <Link
          href="/flights"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Zur Flugsuche
        </Link>
      </div>
    </div>
  );
}
