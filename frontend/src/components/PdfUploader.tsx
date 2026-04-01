import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, CheckCircle2 } from "lucide-react";

interface Props {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export function PdfUploader({ onUpload, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a PDF file");
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Upload className="w-3.5 h-3.5 text-muted-foreground" />
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Upload Document
        </label>
      </div>

      <div
        className={`
          group relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : selectedFile
              ? "border-primary/30 bg-primary/5"
              : "border-border/60 hover:border-primary/40 hover:bg-secondary/30"
          }
          ${disabled ? "opacity-40 pointer-events-none" : ""}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          {selectedFile ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 ring-1 ring-primary/20">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground truncate max-w-full">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatSize(selectedFile.size)}
              </p>
              <p className="text-xs text-primary/70 mt-2">Click to change file</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center mb-3 ring-1 ring-border/50 group-hover:bg-primary/10 group-hover:ring-primary/20 transition-colors duration-300">
                <FileUp className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
              <p className="text-sm text-muted-foreground">
                Drop a PDF here or <span className="text-primary font-medium">browse</span>
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                PDF documents only
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>

      {selectedFile && (
        <Button
          className="w-full h-10 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 glow-teal"
          onClick={() => onUpload(selectedFile)}
          disabled={disabled}
          size="lg"
        >
          {disabled ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Extracting...
            </span>
          ) : (
            "Extract SSI Data"
          )}
        </Button>
      )}
    </div>
  );
}
