import { useState } from "react";
import type { ExtractionResponse } from "@/types";
import { uploadPdf } from "@/api/client";

export function useExtraction() {
  const [result, setResult] = useState<ExtractionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function extract(file: File, clientId: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await uploadPdf(file, clientId);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return { result, loading, error, extract, reset };
}
