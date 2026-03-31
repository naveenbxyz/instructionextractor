import type { ReactNode } from "react";

interface Props {
  sidebar: ReactNode;
  main: ReactNode;
}

export function Layout({ sidebar, main }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">SSI Extractor</h1>
        <p className="text-sm text-muted-foreground">
          Standard Settlement Instructions PDF extraction
        </p>
      </header>
      <div className="flex flex-col lg:flex-row">
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r p-4 shrink-0">
          {sidebar}
        </aside>
        <main className="flex-1 p-4 lg:p-6 min-w-0">{main}</main>
      </div>
    </div>
  );
}
