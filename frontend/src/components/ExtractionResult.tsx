import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExtractionResponse } from "@/types";

interface Props {
  result: ExtractionResponse;
}

function AccuracyBadge({ score }: { score: number }) {
  const variant =
    score >= 90 ? "default" : score >= 70 ? "secondary" : "destructive";
  return (
    <Badge variant={variant} className="ml-2 text-xs">
      {score}%
    </Badge>
  );
}

function JsonValue({ value, accuracy, path }: {
  value: unknown;
  accuracy?: Record<string, Record<string, number>>;
  path?: string;
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">null</span>;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const score = path && accuracy
      ? findAccuracy(accuracy, path)
      : undefined;
    return (
      <span>
        <span className="text-foreground">{String(value)}</span>
        {score !== undefined && <AccuracyBadge score={score} />}
      </span>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="ml-4 space-y-2">
        {value.map((item, i) => (
          <div key={i} className="border-l-2 border-muted pl-3">
            <span className="text-xs text-muted-foreground">#{i + 1}</span>
            <JsonValue value={item} accuracy={accuracy} path={path} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="ml-4 space-y-1">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="flex flex-wrap items-start gap-1">
            <span className="text-sm font-medium text-muted-foreground min-w-[140px]">
              {k.replace(/_/g, " ")}:
            </span>
            <div className="flex-1">
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

  return <span>{JSON.stringify(value)}</span>;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Extraction Results</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{result.pdf_type.replace("_", " ")}</Badge>
          <span>{result.total_pages} page(s)</span>
        </div>
      </div>

      {result.pages.map((page) => (
        <Card key={page.page_number}>
          <CardHeader
            className="cursor-pointer py-3"
            onClick={() => togglePage(page.page_number)}
          >
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Page {page.page_number}</span>
              <span className="text-muted-foreground">
                {expandedPages.has(page.page_number) ? "▾" : "▸"}
              </span>
            </CardTitle>
          </CardHeader>
          {expandedPages.has(page.page_number) && (
            <CardContent className="pt-0">
              {page.extracted.parse_error ? (
                <div className="text-sm">
                  <Badge variant="destructive">Parse Error</Badge>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                    {page.extracted.raw_response as string}
                  </pre>
                </div>
              ) : (
                Object.entries(page.extracted).map(([sectionName, sectionData]) => (
                  <div key={sectionName} className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-primary border-b pb-1">
                      {sectionName.replace(/_/g, " ").toUpperCase()}
                    </h4>
                    <JsonValue
                      value={sectionData}
                      accuracy={page.accuracy ?? undefined}
                      path={sectionName}
                    />
                  </div>
                ))
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
