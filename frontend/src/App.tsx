import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ClientSelector } from "@/components/ClientSelector";
import { PdfUploader } from "@/components/PdfUploader";
import { ExtractionResult } from "@/components/ExtractionResult";
import { ChatPanel } from "@/components/ChatPanel";
import { useExtraction } from "@/hooks/useExtraction";
import { FileSearch, ArrowRight } from "lucide-react";

function App() {
  const [clientId, setClientId] = useState("");
  const { result, loading, error, extract, reset } = useExtraction();

  const handleUpload = (file: File) => {
    if (!clientId) {
      alert("Please select a client configuration first");
      return;
    }
    extract(file, clientId);
  };

  const handleClientChange = (value: string) => {
    setClientId(value);
    reset();
  };

  const sidebar = (
    <div className="space-y-6">
      <ClientSelector
        value={clientId}
        onChange={handleClientChange}
        disabled={loading}
      />

      <div className="h-px bg-border/30" />

      <PdfUploader onUpload={handleUpload} disabled={loading || !clientId} />

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 animate-fade-up">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );

  const main = (
    <div className="space-y-6">
      {result ? (
        <>
          <ExtractionResult result={result} />
          <ChatPanel sessionId={result.session_id} />
        </>
      ) : loading ? (
        <LoadingState />
      ) : (
        <EmptyState hasClient={!!clientId} />
      )}
    </div>
  );

  return <Layout sidebar={sidebar} main={main} />;
}

function EmptyState({ hasClient }: { hasClient: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-up">
      <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center mb-5 ring-1 ring-border/50">
        <FileSearch className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="font-heading text-base font-medium text-foreground/80 mb-2">
        {hasClient ? "Upload a PDF to begin" : "Select a configuration"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {hasClient ? (
          <>
            Drop a settlement instruction PDF in the upload zone
            to extract structured data.
          </>
        ) : (
          <span className="flex items-center gap-1.5 justify-center">
            Choose a client config from the sidebar <ArrowRight className="w-3.5 h-3.5 inline" /> then upload a PDF
          </span>
        )}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary animate-spin-slow" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground/80">Extracting SSI data...</p>
          <p className="text-xs text-muted-foreground">This may take a moment</p>
        </div>
      </div>

      {/* Skeleton cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border/30 bg-card/40 p-5 space-y-3 animate-shimmer"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <div className="h-4 w-24 rounded-md bg-secondary/60" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-secondary/40" />
            <div className="h-3 w-3/4 rounded bg-secondary/40" />
            <div className="h-3 w-5/6 rounded bg-secondary/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
