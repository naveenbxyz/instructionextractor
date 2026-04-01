import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, FileCheck, AlertTriangle } from "lucide-react";
import type { ExtractionResponse } from "@/types";

interface Props {
  result: ExtractionResponse;
}

function AccuracyBadge({ score }: { score: number }) {
  const config =
    score >= 90
      ? { bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/20" }
      : score >= 70
        ? { bg: "bg-amber-500/10", text: "text-amber-400", ring: "ring-amber-500/20" }
        : { bg: "bg-red-500/10", text: "text-red-400", ring: "ring-red-500/20" };

  return (
    <span
      className={`inline-flex items-center ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ring-1 ${config.bg} ${config.text} ${config.ring}`}
    >
      {score}%
    </span>
  );
}

function JsonValue({
  value,
  accuracy,
  path,
}: {
  value: unknown;
  accuracy?: Record<string, Record<string, number>>;
  path?: string;
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground/50 italic text-xs">null</span>;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const score =
      path && accuracy ? findAccuracy(accuracy, path) : undefined;
    return (
      <span className="inline-flex items-center flex-wrap gap-1">
        <span className="text-foreground/90 text-sm">{String(value)}</span>
        {score !== undefined && <AccuracyBadge score={score} />}
      </span>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="ml-3 space-y-2 mt-1">
        {value.map((item, i) => (
          <div
            key={i}
            className="border-l-2 border-primary/15 pl-3 py-0.5"
          >
            <span className="text-[10px] font-mono text-primary/50 uppercase tracking-widest">
              #{i + 1}
            </span>
            <JsonValue value={item} accuracy={accuracy} path={path} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="ml-3 space-y-1.5 mt-1">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="flex flex-wrap items-start gap-2">
            <span className="text-xs font-medium text-muted-foreground min-w-[130px] pt-0.5">
              {k.replace(/_/g, " ")}
            </span>
            <div className="flex-1 min-w-0">
              <JsonValue
                value={v}
                accuracy={accuracy}
                path={path ? `${path}.${k}` : k}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-sm">{JSON.stringify(value)}</span>;
}

function findAccuracy(
  accuracy: Record<string, Record<string, number>>,
  path: string
): number | undefined {
  const parts = path.split(".");
  const section = parts[0];
  const field = parts[parts.length - 1];
  return accuracy[section]?.[field];
}

export function ExtractionResult({ result }: Props) {
  const [expandedPages, setExpandedPages] = useState<Set<number>>(
    new Set(result.pages.map((p) => p.page_number))
  );

  const togglePage = (pageNum: number) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Results header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <FileCheck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Extraction Results
            </h2>
            <p className="text-xs text-muted-foreground">{result.filename}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[11px] bg-secondary/50 border-border/50"
          >
            {result.pdf_type.replace("_", " ")}
          </Badge>
          <span className="text-xs text-muted-foreground tabular-nums">
            {result.total_pages} page{result.total_pages !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Page cards */}
      {result.pages.map((page, idx) => {
        const isExpanded = expandedPages.has(page.page_number);
        return (
          <Card
            key={page.page_number}
            className="border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden animate-fade-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <CardHeader
              className="cursor-pointer py-3 hover:bg-secondary/30 transition-colors duration-200"
              onClick={() => togglePage(page.page_number)}
            >
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-xs font-mono text-muted-foreground">
                    {page.page_number}
                  </span>
                  <span className="text-foreground/80 font-medium">
                    Page {page.page_number}
                  </span>
                </span>
                <span className="text-muted-foreground transition-transform duration-200">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
              </CardTitle>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 pb-4">
                {page.extracted.parse_error ? (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Parse Error</span>
                    </div>
                    <pre className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-md overflow-auto max-h-64 font-mono">
                      {page.extracted.raw_response as string}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(page.extracted).map(
                      ([sectionName, sectionData]) => (
                        <div key={sectionName} className="space-y-2">
                          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-primary/80 pb-1.5 border-b border-border/30">
                            {sectionName.replace(/_/g, " ")}
                          </h4>
                          <JsonValue
                            value={sectionData}
                            accuracy={page.accuracy ?? undefined}
                            path={sectionName}
                          />
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
