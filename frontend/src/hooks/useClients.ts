import { useEffect, useState } from "react";
import type { ClientConfigSummary } from "@/types";
import { fetchClients } from "@/api/client";

export function useClients() {
  const [clients, setClients] = useState<ClientConfigSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients()
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { clients, loading, error };
}
