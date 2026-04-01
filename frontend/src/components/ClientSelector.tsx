import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";
import { Settings2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ClientSelector({ value, onChange, disabled }: Props) {
  const { clients, loading, error } = useClients();

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
        <p className="text-sm text-destructive">Failed to load client configs</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Configuration
        </label>
      </div>
      <Select value={value} onValueChange={(v) => { if (v) onChange(v); }} disabled={disabled || loading}>
        <SelectTrigger className="w-full h-10 bg-secondary/50 border-border/50 hover:bg-secondary/80 transition-colors">
          <SelectValue placeholder={loading ? "Loading configs..." : "Select a client config"} />
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
