import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/useChat";
import { MessageCircle, Send, Bot, User } from "lucide-react";

interface Props {
  sessionId: string;
}

export function ChatPanel({ sessionId }: Props) {
  const { messages, streaming, sendMessage } = useChat(sessionId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || streaming) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col border-border/40 bg-card/60 backdrop-blur-sm animate-fade-up" style={{ animationDelay: "200ms" }}>
      <CardHeader className="py-3 border-b border-border/30">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-foreground/80 font-medium">Ask about this document</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1 pt-4 pb-4">
        <ScrollArea className="h-72 rounded-lg bg-secondary/20 border border-border/30 p-3" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 ring-1 ring-primary/20">
                <Bot className="w-5 h-5 text-primary/60" />
              </div>
              <p className="text-sm text-muted-foreground">
                Ask a question about the extracted data
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                e.g. "What are the beneficiary account details?"
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "user"
                        ? "bg-primary/15 ring-1 ring-primary/25"
                        : "bg-secondary ring-1 ring-border/50"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3 h-3 text-primary" />
                    ) : (
                      <Bot className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary/15 text-foreground ring-1 ring-primary/20"
                        : "bg-secondary/60 text-foreground/90 ring-1 ring-border/30"
                    }`}
                  >
                    {msg.content}
                    {streaming &&
                      i === messages.length - 1 &&
                      msg.role === "assistant" && (
                        <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary/60 animate-pulse rounded-full align-middle" />
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input area */}
        <div className="flex gap-2 items-end">
          <Textarea
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="resize-none bg-secondary/30 border-border/40 focus-visible:border-primary/50 focus-visible:ring-primary/20 min-h-[44px]"
            disabled={streaming}
          />
          <Button
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            size="icon"
            className="h-10 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
