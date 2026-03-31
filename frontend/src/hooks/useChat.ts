import { useCallback, useState } from "react";
import type { ChatMessage } from "@/types";
import { streamChat } from "@/api/client";

export function useChat(sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!sessionId || !text.trim()) return;

      const userMsg: ChatMessage = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);

      let accumulated = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        await streamChat(sessionId, text, (chunk) => {
          accumulated += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: accumulated,
            };
            return updated;
          });
        });
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulated || "Error: Failed to get response.",
          };
          return updated;
        });
      } finally {
        setStreaming(false);
      }
    },
    [sessionId]
  );

  function clearChat() {
    setMessages([]);
  }

  return { messages, streaming, sendMessage, clearChat };
}
