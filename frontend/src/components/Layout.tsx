import type { ReactNode } from "react";
import { FileText } from "lucide-react";

interface Props {
  sidebar: ReactNode;
  main: ReactNode;
}

export function Layout({ sidebar, main }: Props) {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <FileText className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              SSI Extractor
            </h1>
            <p className="text-xs text-muted-foreground tracking-wide">
              Standard Settlement Instructions
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI-Powered
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
        <aside className="w-full lg:w-[340px] border-b lg:border-b-0 lg:border-r border-border/50 p-5 shrink-0 bg-card/40 backdrop-blur-sm">
          {sidebar}
        </aside>
        <main className="flex-1 p-5 lg:p-8 min-w-0">
          {main}
        </main>
      </div>
    </div>
  );
}
