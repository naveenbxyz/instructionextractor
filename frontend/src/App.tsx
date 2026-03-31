import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ClientSelector } from "@/components/ClientSelector";
import { PdfUploader } from "@/components/PdfUploader";
import { ExtractionResult } from "@/components/ExtractionResult";
import { ChatPanel } from "@/components/ChatPanel";
import { useExtraction } from "@/hooks/useExtraction";

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
      <PdfUploader onUpload={handleUpload} disabled={loading || !clientId} />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
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
      ) : (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p className="text-sm">
            {loading
              ? "Extracting SSI data from PDF..."
              : "Select a client config and upload a PDF to begin"}
          </p>
        </div>
      )}
    </div>
  );

  return <Layout sidebar={sidebar} main={main} />;
}

export default App;
