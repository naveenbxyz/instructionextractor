export interface ClientConfigSummary {
  id: string;
  name: string;
}

export interface SectionDef {
  name: string;
  description?: string;
  fields: string[];
}

export interface ClientConfig {
  id: string;
  name: string;
  prompt: string;
  sections: SectionDef[];
}

export interface PageResult {
  page_number: number;
  extracted: Record<string, unknown>;
  accuracy?: Record<string, Record<string, number>>;
}

export interface ExtractionResponse {
  filename: string;
  total_pages: number;
  pdf_type: string;
  pages: PageResult[];
  session_id: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
